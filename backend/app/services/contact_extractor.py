import re
from typing import List

# Strict email regex to capture standard emails
EMAIL_REGEX = re.compile(
    r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",
    re.IGNORECASE
)

# Phone regex matching international & local format phone numbers
# Matches formats like +91 44 28151234, +91-9840012345, (044) 24329900, 0471-2700980
PHONE_REGEX = re.compile(
    r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,5}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}"
)

ROLE_EMAIL_PREFIXES = {
    "info", "contact", "hello", "sales", "support", "business",
    "enquiry", "enquiries", "office", "admin", "help", "care",
    "leads", "marketing", "connect", "queries", "team", "billing"
}

IGNORED_DOMAINS_AND_PATTERNS = {
    "example.com", "domain.com", "yoursite.com", "email.com",
    "schema.org", "w3.org", "sentry.io", "github.com", "facebook.com",
    "twitter.com", "instagram.com", "linkedin.com", "youtube.com",
    "google.com", "g.co", "fontawesome.com", "cloudflare.com",
    "npm.js", "bootstrap.com", "gravatar.com", "wordpress.org"
}

INVALID_EMAIL_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".svg", ".css", ".js", ".webp", ".ico", ".woff", ".ttf"
}

JUNK_PHONE_PATTERNS = [
    r"^20[12]\d",        # Years like 2024, 2025, 2026
    r"^(1024|1920|1280|768|800|600|480|320)", # Screen dimensions or standard HTTP ports
    r"^(\d)\1{7,}$",    # Repeated numbers like 00000000 or 11111111
    r"12345678",        # Sequential test numbers
]


def normalize_email(email: str) -> str:
    """Clean and lower-case an email address."""
    if not email:
        return ""
    email = email.strip().lower()
    if email.endswith('.'):
        email = email[:-1]
    return email


def is_valid_business_email(email: str) -> bool:
    """Validate email structure and filter out junk or placeholder emails."""
    if not email or len(email) > 254:
        return False

    email = normalize_email(email)

    for ext in INVALID_EMAIL_EXTENSIONS:
        if email.endswith(ext):
            return False

    parts = email.split("@")
    if len(parts) != 2:
        return False

    username, domain = parts
    if not username or not domain:
        return False

    if domain in IGNORED_DOMAINS_AND_PATTERNS:
        return False

    # Avoid image file false positives like "logo@2x.png" or asset hashes
    if any(pattern in username for pattern in ["2x", "3x", "logo", "bg", "node_modules", "webpack", "asset"]):
        return False

    return True


def extract_emails(text: str) -> List[str]:
    """
    Extracts, validates, normalizes, and prioritizes role emails from text.
    Role emails (info@, contact@, sales@, etc.) are sorted first.
    """
    if not text:
        return []

    raw_matches = EMAIL_REGEX.findall(text)
    valid_emails = set()

    for raw in raw_matches:
        normalized = normalize_email(raw)
        if is_valid_business_email(normalized):
            valid_emails.add(normalized)

    # Sort with role emails prioritized
    def email_priority(e: str) -> int:
        username = e.split("@")[0]
        return 0 if username in ROLE_EMAIL_PREFIXES else 1

    sorted_emails = sorted(list(valid_emails), key=email_priority)
    return sorted_emails


def format_phone_number(phone: str) -> str:
    """Formats phone numbers into clean presentation format."""
    digits = re.sub(r"\D", "", phone)
    
    # Format Indian 10-digit mobile/landline numbers
    if len(digits) == 10 and digits.startswith(("6", "7", "8", "9")):
        return f"+91 {digits[:5]} {digits[5:]}"
    elif len(digits) == 12 and digits.startswith("91"):
        return f"+91 {digits[2:7]} {digits[7:]}"
    elif len(digits) == 11 and digits.startswith("0"):
        return f"+91 {digits[1:5]} {digits[5:]}"

    return phone.strip()


def extract_phones(text: str) -> List[str]:
    """Extract and strictly validate candidate phone numbers from text."""
    if not text:
        return []

    raw_matches = PHONE_REGEX.findall(text)
    cleaned_phones = []
    seen = set()

    for p in raw_matches:
        cleaned = re.sub(r"\s+", " ", p.strip())
        digits_only = re.sub(r"\D", "", cleaned)

        # Phone numbers must have between 8 and 14 digits
        if not (8 <= len(digits_only) <= 14):
            continue

        # Check junk patterns
        is_junk = False
        for junk_pat in JUNK_PHONE_PATTERNS:
            if re.search(junk_pat, digits_only):
                is_junk = True
                break

        if is_junk:
            continue

        formatted = format_phone_number(cleaned)
        if digits_only not in seen:
            seen.add(digits_only)
            cleaned_phones.append(formatted)

    return cleaned_phones
