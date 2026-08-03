import socket
import ipaddress
from urllib.parse import urlparse
import logging

logger = logging.getLogger(__name__)

DISALLOWED_SCHEMES = {"file", "ftp", "gopher", "dict", "sftp", "tftp", "ldap", "data"}
DISALLOWED_HOSTNAMES = {"localhost", "loopback", "broadcasthost"}


def is_safe_url(url: str) -> bool:
    """
    Validates a URL to prevent Server-Side Request Forgery (SSRF).
    Checks scheme, hostname, DNS resolution, and IP range safety.
    """
    if not url or not isinstance(url, str):
        return False

    url = url.strip()
    if not (url.startswith("http://") or url.startswith("https://")):
        return False

    try:
        parsed = urlparse(url)
        scheme = parsed.scheme.lower()
        if scheme not in ("http", "https"):
            return False

        hostname = parsed.hostname
        if not hostname:
            return False

        hostname_lower = hostname.lower()
        if hostname_lower in DISALLOWED_HOSTNAMES or hostname_lower.endswith(".local") or hostname_lower.endswith(".internal") or hostname_lower.endswith(".lan"):
            logger.warning(f"SSRF Blocked: Hostname '{hostname}' is an internal domain.")
            return False

        # Attempt to parse direct IP address
        try:
            ip = ipaddress.ip_address(hostname)
            if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_multicast or ip.is_reserved or ip.is_unspecified:
                logger.warning(f"SSRF Blocked: Direct IP '{ip}' is in a restricted range.")
                return False
        except ValueError:
            # Not a raw IP, resolve via DNS
            try:
                ip_list = socket.getaddrinfo(hostname, None)
                for item in ip_list:
                    ip_str = item[4][0]
                    resolved_ip = ipaddress.ip_address(ip_str)
                    if (
                        resolved_ip.is_private
                        or resolved_ip.is_loopback
                        or resolved_ip.is_link_local
                        or resolved_ip.is_multicast
                        or resolved_ip.is_reserved
                        or resolved_ip.is_unspecified
                    ):
                        logger.warning(f"SSRF Blocked: Hostname '{hostname}' resolved to restricted IP '{resolved_ip}'.")
                        return False
            except socket.gaierror:
                logger.warning(f"SSRF Check: Could not resolve hostname '{hostname}'.")
                return False

        return True

    except Exception as e:
        logger.error(f"Error during SSRF check for '{url}': {e}")
        return False
