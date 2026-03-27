const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sissep_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.message || 'Error de API');
  return json.data as T;
}

export const api = {
  post:  <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  get:   <T>(path: string) => request<T>(path),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
};

// Multipart (para subir archivos)
export async function uploadFile(path: string, formData: FormData) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    method:  'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body:    formData,
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.message);
  return json.data;
}
