const SEARCH_HOSTS = [
  'google.com',
  'google.com.mx',
  'bing.com',
  'duckduckgo.com',
  'yahoo.com',
  'search.yahoo.com',
];

export function normalizeFotoUrl(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  let url = trimmed;
  if (!/^https?:\/\//i.test(url)) {
    if (/^www\./i.test(url) || /^[\w.-]+\.[a-z]{2,}/i.test(url)) {
      url = `https://${url.replace(/^\/\//, '')}`;
    } else {
      return undefined;
    }
  }
  return url;
}

export function fotoUrlError(value: string): string | null {
  if (!value.trim()) return null;
  const url = normalizeFotoUrl(value);
  if (!url) return 'URL inválida — use http:// o https://';

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return 'URL inválida';
  }

  const host = parsed.hostname.replace(/^www\./i, '').toLowerCase();
  if (SEARCH_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
    return 'Use un enlace directo a la imagen, no una búsqueda de Google';
  }

  if (parsed.pathname.includes('/search') || parsed.searchParams.has('q')) {
    return 'Use un enlace directo a la imagen, no una página de búsqueda';
  }

  return null;
}
