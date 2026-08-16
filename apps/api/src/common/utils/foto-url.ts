const SEARCH_HOSTS = [
  'google.com',
  'google.com.mx',
  'bing.com',
  'duckduckgo.com',
  'yahoo.com',
  'search.yahoo.com',
];

export function normalizeFotoUrl(value: unknown): string | undefined {
  if (value == null || value === '') return undefined;
  let url = String(value).trim();
  if (!url) return undefined;
  if (!/^https?:\/\//i.test(url)) {
    if (/^www\./i.test(url) || /^[\w.-]+\.[a-z]{2,}/i.test(url)) {
      url = `https://${url.replace(/^\/\//, '')}`;
    } else {
      return undefined;
    }
  }
  return url;
}

export function fotoUrlError(value: unknown): string | null {
  const url = normalizeFotoUrl(value);
  if (!url) {
    if (value != null && String(value).trim()) {
      return 'URL de foto inválida — use http:// o https://';
    }
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return 'URL de foto inválida';
  }

  const host = parsed.hostname.replace(/^www\./i, '').toLowerCase();
  if (SEARCH_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
    return 'Use un enlace directo a la imagen (.jpg, .png, etc.), no una búsqueda de Google u otro buscador';
  }

  if (parsed.pathname.includes('/search') || parsed.searchParams.has('q')) {
    return 'Use un enlace directo a la imagen, no una página de búsqueda';
  }

  return null;
}

export function assertFotoUrl(value: unknown): string | undefined {
  const err = fotoUrlError(value);
  if (err) throw new Error(err);
  return normalizeFotoUrl(value);
}
