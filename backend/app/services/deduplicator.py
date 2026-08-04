import re
from typing import List, Dict, Any
from urllib.parse import urlparse
import logging

logger = logging.getLogger(__name__)


def normalize_text(text: str) -> str:
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r"[^\w\s]", "", text)
    return re.sub(r"\s+", " ", text).strip()


def extract_domain(website_url: str) -> str:
    if not website_url or website_url == "Not Available":
        return ""
    try:
        if not website_url.startswith("http"):
            website_url = f"http://{website_url}"
        parsed = urlparse(website_url)
        domain = parsed.netloc.lower()
        if domain.startswith("www."):
            domain = domain[4:]
        return domain
    except Exception:
        return ""


def deduplicate_leads(raw_leads: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Deduplicates leads using multi-criteria matching:
    1. Provider Place ID
    2. Website Domain
    3. Phone Number
    4. Business Email
    5. Normalized Name + Address
    """
    seen_place_ids = set()
    seen_domains = set()
    seen_phones = set()
    seen_emails = set()
    seen_name_addresses = set()

    unique_leads = []

    for lead in raw_leads:
        place_id = lead.get("provider_place_id")
        website = lead.get("website", "")
        phone = lead.get("phone", "")
        email = lead.get("email", "")
        company_name = lead.get("company_name", "")
        address = lead.get("address", "")

        domain = extract_domain(website)
        norm_phone = re.sub(r"\D", "", phone) if phone != "Not Available" else ""
        norm_email = email.strip().lower() if email != "Not Available" else ""
        name_addr_key = f"{normalize_text(company_name)}_{normalize_text(address)}"

        # Check Place ID
        if place_id and place_id in seen_place_ids:
            logger.info(f"Duplicate skipped by Place ID: {company_name}")
            continue

        # Check Domain
        if domain and domain in seen_domains:
            logger.info(f"Duplicate skipped by Domain ({domain}): {company_name}")
            continue

        # Check Phone
        if norm_phone and len(norm_phone) >= 7 and norm_phone in seen_phones:
            logger.info(f"Duplicate skipped by Phone ({norm_phone}): {company_name}")
            continue

        # Check Email
        if norm_email and norm_email in seen_emails:
            logger.info(f"Duplicate skipped by Email ({norm_email}): {company_name}")
            continue

        # Check Name + Address
        if name_addr_key and name_addr_key in seen_name_addresses:
            logger.info(f"Duplicate skipped by Name+Address key: {company_name}")
            continue

        # Register lead keys
        if place_id:
            seen_place_ids.add(place_id)
        if domain:
            seen_domains.add(domain)
        if norm_phone and len(norm_phone) >= 7:
            seen_phones.add(norm_phone)
        if norm_email:
            seen_emails.add(norm_email)
        if name_addr_key:
            seen_name_addresses.add(name_addr_key)

        unique_leads.append(lead)

    return unique_leads


def deduplicate_by_place_id(raw_leads: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    STRICTLY deduplicates leads by Google Place ID (provider_place_id).
    One unique Google Place ID = one business.
    Do NOT filter by domain, phone, email or name.
    """
    seen_place_ids = set()
    unique_leads = []

    for lead in raw_leads:
        place_id = lead.get("provider_place_id")
        if not place_id:
            # Fallback if no place_id: use company name + location
            fallback_key = f"{lead.get('company_name', '')}_{lead.get('address', '')}"
            if fallback_key in seen_place_ids:
                continue
            seen_place_ids.add(fallback_key)
            unique_leads.append(lead)
            continue

        if place_id in seen_place_ids:
            continue

        seen_place_ids.add(place_id)
        unique_leads.append(lead)

    return unique_leads

