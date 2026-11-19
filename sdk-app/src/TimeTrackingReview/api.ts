export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly path: string,
    readonly body: unknown,
  ) {
    super(`GET ${path} returned HTTP ${status}`)
  }
}

export async function getJson(
  path: string,
  signal?: AbortSignal,
): Promise<{ body: unknown; headers: Headers }> {
  const res = await fetch(`/api${path}`, { signal })
  const text = await res.text()
  let body: unknown = text
  try {
    body = JSON.parse(text)
  } catch {
    body = text
  }
  if (!res.ok) throw new ApiError(res.status, path, body)
  return { body, headers: res.headers }
}

/** Follows `x-total-pages`, because list endpoints cap `per` and silently truncate. */
export async function getAllPages<T>(
  path: string,
  per: number,
  signal?: AbortSignal,
): Promise<T[]> {
  const join = path.includes('?') ? '&' : '?'
  const all: T[] = []
  let page = 1
  let totalPages = 1
  do {
    const { body, headers } = await getJson(`${path}${join}per=${per}&page=${page}`, signal)
    all.push(...(body as T[]))
    totalPages = Number(headers.get('x-total-pages') ?? '1') || 1
    page += 1
  } while (page <= totalPages)
  return all
}

export function withQuery(path: string, params: Record<string, string | string[] | undefined>) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue
    if (Array.isArray(value)) for (const item of value) search.append(`${key}[]`, item)
    else search.set(key, value)
  }
  const query = search.toString()
  return query ? `${path}?${query}` : path
}
