import os
import asyncio
import httpx
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import logging
from typing import Dict, Optional, Tuple

from app.services.ssrf_guard import is_safe_url
from app.services.contact_extractor import extract_emails, extract_phones

logger = logging.getLogger(__name__)

WEBSITE_TIMEOUT_SECONDS = int(os.getenv("WEBSITE_TIMEOUT_SECONDS", "4"))
MAX_CONCURRENT_ENRICHMENTS = int(os.getenv("MAX_CONCURRENT_ENRICHMENTS", "15"))

SEMAPHORE = asyncio.Semaphore(MAX_CONCURRENT_ENRICHMENTS)

TARGET_PATHS = ["", "/contact", "/contact-us", "/about", "/about-us"]

DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}


async def fetch_page(client: httpx.AsyncClient, url: str) -> Optional[Tuple[str, str]]:
    """Fetch HTML content from a URL safely with SSRF protection."""
    if not is_safe_url(url):
        return None

    try:
        response = await client.get(url, headers=DEFAULT_HEADERS, timeout=WEBSITE_TIMEOUT_SECONDS, follow_redirects=True)
        if response.status_code == 200 and "text/html" in response.headers.get("content-type", "").lower():
            if is_safe_url(str(response.url)):
                return response.text, str(response.url)
    except Exception:
        pass
    
    return None


async def enrich_lead_from_website(website_url: str) -> Dict[str, Optional[str]]:
    """
    Visits official public website returned by Google Places API.
    Extracts published business email and phone, and records exact source URLs.
    Does NOT fabricate or guess email addresses.
    """
    result = {
        "email": "Not Available",
        "phone": "Not Available",
        "website_source_url": website_url if (website_url and website_url != "Not Available") else None,
        "email_source_url": None,
        "contact_page_url": None
    }

    if not website_url or website_url == "Not Available" or not website_url.startswith(("http://", "https://")):
        return result

    async with SEMAPHORE:
        try:
            parsed = urlparse(website_url)
            base_domain_url = f"{parsed.scheme}://{parsed.netloc}"

            found_emails_with_source = []
            found_phones = []
            contact_page = None

            async with httpx.AsyncClient(verify=False, timeout=WEBSITE_TIMEOUT_SECONDS) as client:
                tasks = [fetch_page(client, urljoin(base_domain_url, path)) for path in TARGET_PATHS]
                responses = await asyncio.gather(*tasks, return_exceptions=True)

                for res in responses:
                    if isinstance(res, tuple) and res[0]:
                        html_text, final_url = res
                        soup = BeautifulSoup(html_text, "lxml")

                        mailto_links = [
                            a.get("href").replace("mailto:", "").split("?")[0]
                            for a in soup.find_all("a", href=True)
                            if a.get("href", "").startswith("mailto:")
                        ]
                        
                        page_emails = extract_emails(html_text + " " + " ".join(mailto_links))
                        page_phones = extract_phones(html_text)

                        for e in page_emails:
                            # Strict verification: email must physically exist in page HTML text or mailto links
                            if e.lower() in html_text.lower() or any(e.lower() in m.lower() for m in mailto_links):
                                found_emails_with_source.append((e, final_url))

                        if page_phones:
                            found_phones.extend(page_phones)

                        if ("contact" in final_url.lower()) and not contact_page:
                            contact_page = final_url

            if found_emails_with_source:
                # Store exact email and verified source URL
                best_email, source_url = found_emails_with_source[0]
                result["email"] = best_email
                result["email_source_url"] = source_url

            if found_phones:
                result["phone"] = found_phones[0]

            if contact_page:
                result["contact_page_url"] = contact_page

        except Exception as e:
            logger.debug(f"Website enrichment error for {website_url}: {e}")

        return result
