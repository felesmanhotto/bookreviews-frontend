export const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

export async function apiFetch(
  path: string,
  options?: RequestInit,
  token?: string | null
): Promise<void>;
export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
  token?: string | null
): Promise<T>;


export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T | void> {
  const headers = new Headers(options.headers);
  // só seta JSON se houver body
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    // tenta extrair mensagem do backend antes de lançar
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed: ${res.status}`);
  }

  // 204 (No Content)
  if (res.status === 204) return;

  // cheque content-type e/ou content-length
  const ct = res.headers.get('content-type') || '';
  const cl = res.headers.get('content-length');

  if (!ct.includes('application/json') || cl === '0') {
    // Sem JSON válido: devolve "void" (quem pediu <void> fica feliz)
    return;
  }

  return (await res.json()) as T;
}
