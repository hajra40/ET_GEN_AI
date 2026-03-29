interface FetchOptions {
  timeoutMs?: number;
  retries?: number;
  headers?: HeadersInit;
}

async function fetchWithTimeout(url: string, options: FetchOptions = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 6000);

  try {
    return await fetch(url, {
      headers: options.headers,
      cache: "no-store",
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchText(url: string, options: FetchOptions = {}) {
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= (options.retries ?? 1); attempt += 1) {
    try {
      const response = await fetchWithTimeout(url, options);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Unable to fetch text response.");
}

export async function fetchJson<T>(url: string, options: FetchOptions = {}) {
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= (options.retries ?? 1); attempt += 1) {
    try {
      const response = await fetchWithTimeout(url, options);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Unable to fetch JSON response.");
}
