const API_BASE = "https://api.clinicaexperts.com.br/api/v1";

export async function apiFetch<T>(
  path: string,
  params?: Record<string, string>,
  init?: RequestInit & { next?: { revalidate?: number } }
): Promise<T> {
  const key = process.env.CLINICA_API_KEY;
  if (!key) throw new Error("CLINICA_API_KEY not configured");

  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const requestInit: RequestInit & { next?: { revalidate?: number } } = {
    headers: {
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
    },
  };

  if (init?.cache) {
    requestInit.cache = init.cache;
  } else {
    requestInit.next = { revalidate: 300, ...init?.next };
  }

  const res = await fetch(url.toString(), requestInit);

  if (!res.ok) {
    const text = await res.text();
    let details = text;

    try {
      const parsed = JSON.parse(text) as { message?: string; error?: string };
      details = parsed.message || parsed.error || text;
    } catch {}

    throw new Error(`API ${res.status}: ${res.statusText}${details ? ` - ${details}` : ""}`);
  }

  return res.json();
}
