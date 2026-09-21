const PRODUCTION_API_BY_HOST: Record<string, string> = {
  'app.remoconecta.com': 'https://api.remoconecta.com',
};

const RAILWAY_API_FALLBACK = 'https://api-production-af34e.up.railway.app';

function getApiUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, '');
  if (fromEnv) return fromEnv;

  if (typeof window !== 'undefined') {
    const mapped = PRODUCTION_API_BY_HOST[window.location.hostname];
    if (mapped) return mapped;
    if (window.location.hostname.endsWith('.up.railway.app')) {
      return RAILWAY_API_FALLBACK;
    }
  }

  return 'http://localhost:3001';
}

function connectionErrorMessage() {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return 'No se pudo conectar con el servidor. Intenta de nuevo en unos minutos.';
  }
  return 'No se pudo conectar con el servidor. Verifica que la API esté corriendo en el puerto 3001.';
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('eventos_token');
}

export function setToken(token: string) {
  localStorage.setItem('eventos_token', token);
}

export function clearToken() {
  localStorage.removeItem('eventos_token');
  localStorage.removeItem('eventos_user');
}

export function getStoredUser<T>() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('eventos_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    localStorage.removeItem('eventos_user');
    localStorage.removeItem('eventos_token');
    return null;
  }
}

export function setStoredUser(user: unknown) {
  localStorage.setItem('eventos_user', JSON.stringify(user));
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${getApiUrl()}/api${path}`, {
    ...options,
    headers,
  }).catch(() => {
    throw new ApiError(connectionErrorMessage(), 0);
  });

  if (!response.ok) {
    let message = 'Error en la solicitud';
    try {
      const data = await response.json();
      message = data.message ?? message;
      if (Array.isArray(message)) message = message.join(', ');
    } catch {
      /* ignore */
    }
    if (response.status === 0 || message === 'Error en la solicitud') {
      message = connectionErrorMessage();
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function apiDownload(path: string, filename: string): Promise<void> {
  const token = getToken();
  const headers = new Headers();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${getApiUrl()}/api${path}`, { headers });
  if (!response.ok) {
    throw new ApiError('No se pudo descargar el archivo', response.status);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function apiUploadForm<T>(path: string, formData: FormData): Promise<T> {
  const token = getToken();
  const headers = new Headers();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${getApiUrl()}/api${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    let message = 'Error al subir el archivo';
    try {
      const data = await response.json();
      message = data.message ?? message;
      if (Array.isArray(message)) message = message.join(', ');
    } catch {
      /* ignore */
    }
    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<T>;
}
