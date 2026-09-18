export const deriveClientName = (lead) => {
  if (!lead) return { fullName: 'N/A', firstName: 'N/A', lastName: 'N/A' };

  // If lead already has valid full_name and first_name set
  if (lead.full_name && lead.full_name !== 'N/A' && lead.full_name !== 'Not Available') {
    const parts = lead.full_name.trim().split(/\s+/);
    return {
      fullName: lead.full_name,
      firstName: lead.first_name && lead.first_name !== 'N/A' ? lead.first_name : (parts[0] || 'N/A'),
      lastName: lead.last_name && lead.last_name !== 'N/A' ? lead.last_name : (parts.length > 1 ? parts.slice(1).join(' ') : '')
    };
  }

  const company = lead.company_name || '';
  const email = lead.email || '';

  // 1. Try email extraction if available and non-generic
  if (email && email.includes('@') && email !== 'Not Available') {
    const local = email.split('@')[0].toLowerCase();
    const genericPrefixes = ['info', 'contact', 'admin', 'support', 'sales', 'hello', 'help', 'office', 'service', 'mail', 'inquiry', 'billing', 'team'];
    if (!genericPrefixes.includes(local) && local.length >= 3) {
      const clean = local.replace(/[._-]+/g, ' ').replace(/\d+/g, '').trim();
      const words = clean.split(/\s+/).filter(w => w.length > 1).map(w => w.charAt(0).toUpperCase() + w.slice(1));
      if (words.length >= 2) {
        return {
          fullName: words.join(' '),
          firstName: words[0],
          lastName: words.slice(1).join(' ')
        };
      } else if (words.length === 1) {
        return {
          fullName: `${words[0]} Client`,
          firstName: words[0],
          lastName: 'Client'
        };
      }
    }
  }

  if (!company || company === 'Not Available') {
    return { fullName: 'Client Lead', firstName: 'Client', lastName: 'Lead' };
  }

  // 2. Clean company name
  let cleaned = company.trim();

  // Strip common prefixes
  cleaned = cleaned.replace(/^(the\s+)?(law\s+offices?|offices?|law\s+firm|office|dr\.?|doctor|attorney|advocate)\s+of\s+/i, '');
  cleaned = cleaned.replace(/^(the\s+)?(law\s+offices?|offices?|law\s+firm|office|dr\.?|doctor|attorney|advocate)\s+/i, '');

  // Strip common suffixes
  cleaned = cleaned.replace(/,?\s*(p\.?c\.?|l\.?l\.?p\.?|l\.?l\.?c\.?|inc\.?|corp(oration)?|ltd(imited)?)$/i, '');
  cleaned = cleaned.replace(/\s+(law\s+firm|law\s+offices?|legal\s+group|legal\s+services|law\s+associates|associates|&amp;\s+associates|&\s+associates|and\s+associates|partners|&amp;\s+partners|&\s+partners|and\s+partners|group|practice|clinic|center|centre).*/i, '');
  cleaned = cleaned.replace(/\s*-\s*.*$/i, ''); // e.g. - New York

  cleaned = cleaned.trim();
  if (!cleaned) cleaned = company.trim();

  const words = cleaned.split(/\s+/).filter(Boolean);

  if (cleaned.includes('&') || cleaned.toLowerCase().includes('and')) {
    const firstWord = words[0] || cleaned;
    const lastWord = words[words.length - 1] !== firstWord ? words[words.length - 1] : 'Partner';
    return {
      fullName: cleaned,
      firstName: firstWord,
      lastName: lastWord
    };
  } else if (words.length >= 2) {
    const first = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    const last = words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return {
      fullName: `${first} ${last}`,
      firstName: first,
      lastName: last
    };
  } else if (words.length === 1) {
    const first = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    return {
      fullName: `${first} Representative`,
      firstName: first,
      lastName: 'Representative'
    };
  }

  return {
    fullName: company,
    firstName: company.split(' ')[0],
    lastName: 'Client'
  };
};
