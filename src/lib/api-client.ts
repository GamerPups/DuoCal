export async function fetchJsonArray<T>(url: string, init?: RequestInit): Promise<T[]> {
  try {
    const res = await fetch(url, init);
    const data = await res.json();
    if (!res.ok || !Array.isArray(data)) return [];
    return data as T[];
  } catch {
    return [];
  }
}

export async function fetchJsonObject<T>(
  url: string,
  init?: RequestInit
): Promise<T | null> {
  try {
    const res = await fetch(url, init);
    const data = await res.json();
    if (!res.ok || data === null || typeof data !== "object" || Array.isArray(data)) {
      return null;
    }
    return data as T;
  } catch {
    return null;
  }
}
