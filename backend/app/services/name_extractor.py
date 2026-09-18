import re
from typing import Dict, Optional, Tuple

PREFIX_PATTERNS = [
    r"^the\s+law\s+offices?\s+of\s+",
    r"^law\s+offices?\s+of\s+",
    r"^offices?\s+of\s+",
    r"^the\s+law\s+firm\s+of\s+",
    r"^law\s+firm\s+of\s+",
    r"^the\s+office\s+of\s+",
    r"^office\s+of\s+",
    r"^dr\.?\s+",
    r"^doctor\s+",
    r"^attorney\s+",
    r"^advocate\s+",
]

SUFFIX_PATTERNS = [
    r"\s*,?\s*p\.?c\.?$",
    r"\s*,?\s*l\.?l\.?p\.?$",
    r"\s*,?\s*l\.?l\.?c\.?$",
    r"\s*,?\s*inc\.?$",
    r"\s*,?\s*corp\.?(oration)?$",
    r"\s*,?\s*ltd\.?(ited)?$",
    r"\s+law\s+firm.*$",
    r"\s+law\s+offices?.*$",
    r"\s+legal\s+group.*$",
    r"\s+legal\s+services.*$",
    r"\s+law\s+associates.*$",
    r"\s+associates.*$",
    r"\s+&amp;\s+associates.*$",
    r"\s+&\s+associates.*$",
    r"\s+and\s+associates.*$",
    r"\s+partners.*$",
    r"\s+&amp;\s+partners.*$",
    r"\s+&\s+partners.*$",
    r"\s+and\s+partners.*$",
    r"\s+group$",
    r"\s+practice$",
    r"\s+clinic$",
    r"\s+center$",
    r"\s+centre$",
    r"\s*-\s*.*$",
]

GENERIC_EMAIL_PREFIXES = {
    "info", "contact", "admin", "support", "sales", "hello", "help", "office",
    "service", "mail", "inquiry", "inquiries", "billing", "general", "team"
}


def extract_name_from_email(email: Optional[str]) -> Optional[Tuple[str, str, str]]:
    if not email or "@" not in email or email == "Not Available":
        return None
    local = email.split("@")[0].lower().strip()
    if local in GENERIC_EMAIL_PREFIXES or len(local) < 3:
        return None

    clean = re.sub(r"[._-]+", " ", local)
    clean = re.sub(r"\d+", "", clean).strip()
    words = [w.capitalize() for w in clean.split() if len(w) > 1]

    if len(words) == 1:
        first = words[0]
        return f"{first} Client", first, "Client"
    elif len(words) >= 2:
        first = words[0]
        last = " ".join(words[1:])
        return f"{first} {last}", first, last
    return None


def derive_client_name(
    company_name: str,
    email: Optional[str] = None,
    existing_full: Optional[str] = None,
    existing_first: Optional[str] = None,
    existing_last: Optional[str] = None
) -> Dict[str, str]:
    """
    Derives appropriate client/contact names for business leads so N/A is never displayed.
    """
    if existing_full and existing_full not in ("N/A", "Not Available"):
        first = existing_first or existing_full.split()[0]
        last = existing_last or (" ".join(existing_full.split()[1:]) if len(existing_full.split()) > 1 else "")
        return {"full_name": existing_full, "first_name": first, "last_name": last}

    # 1. Try email extraction if non-generic
    email_res = extract_name_from_email(email)
    if email_res:
        return {"full_name": email_res[0], "first_name": email_res[1], "last_name": email_res[2]}

    # 2. Extract from company_name
    if not company_name or company_name in ("Not Available", "N/A"):
        return {"full_name": "Client Lead", "first_name": "Client", "last_name": "Lead"}

    cleaned = company_name.strip()

    # Strip prefixes
    for pat in PREFIX_PATTERNS:
        cleaned = re.sub(pat, "", cleaned, flags=re.IGNORECASE).strip()

    # Strip suffixes
    for pat in SUFFIX_PATTERNS:
        cleaned = re.sub(pat, "", cleaned, flags=re.IGNORECASE).strip()

    if not cleaned:
        cleaned = company_name.strip()

    parts = [p.capitalize() for p in cleaned.split() if p.strip()]

    if "&" in cleaned or "and" in [p.lower() for p in parts]:
        full = cleaned
        first = parts[0] if parts else cleaned
        last = parts[-1] if len(parts) > 1 else "Partner"
        return {"full_name": full, "first_name": first, "last_name": last}
    elif len(parts) >= 2:
        first = parts[0]
        last = " ".join(parts[1:])
        full = f"{first} {last}"
        return {"full_name": full, "first_name": first, "last_name": last}
    elif len(parts) == 1:
        first = parts[0]
        last = "Representative"
        full = f"{first} Representative"
        return {"full_name": full, "first_name": first, "last_name": last}

    return {"full_name": company_name, "first_name": company_name.split()[0], "last_name": "Client"}
