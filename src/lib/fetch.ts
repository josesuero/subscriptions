export type FetchJsonOptions = RequestInit & {
  parseAsText?: boolean;
};

export async function fetchJson<T>(url: string, options: FetchJsonOptions = {}): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    },
    ...options
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (options.parseAsText) {
    return (await response.text()) as T;
  }

  return (await response.json()) as T;
}
