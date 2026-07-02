import {
  SANDBOX_API_PREFIX,
  SANDBOX_PREVIEW_URL,
  SANDBOX_PULL_REQUEST_NUMBER,
  SANDBOX_REPOSITORY,
} from './config'
import type { CreateCommentInput, SandboxComment, SandboxPrototype, SandboxUser } from './types'

class SandboxApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'SandboxApiError'
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  // The destination is a fixed internal dev-proxy prefix plus static, module-local
  // path strings and numeric IDs — no user input controls it, so the SSRF scan is a
  // false positive.
  const url = `${SANDBOX_API_PREFIX}${path}`
  const options: RequestInit = { ...init, headers: { 'Content-Type': 'application/json' } }
  const res = await fetch(url, options) // noboost

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new SandboxApiError(res.status, detail || res.statusText)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

/** Returns the current authenticated user, or null when unauthenticated. */
export async function fetchMe(): Promise<SandboxUser | null> {
  try {
    return await request<SandboxUser>('/me')
  } catch (err) {
    if (err instanceof SandboxApiError && (err.status === 401 || err.status === 403)) {
      return null
    }
    throw err
  }
}

/** Idempotently creates (or finds) the shared sdk-app design prototype. */
export async function ensurePrototype(): Promise<SandboxPrototype> {
  return request<SandboxPrototype>('/prototypes', {
    method: 'POST',
    body: JSON.stringify({
      prototype: {
        repository: SANDBOX_REPOSITORY,
        pull_request_number: SANDBOX_PULL_REQUEST_NUMBER,
        preview_url: SANDBOX_PREVIEW_URL,
      },
    }),
  })
}

/**
 * Lists top-level comments (with nested replies). Scopes to a single design
 * route when `routePath` is provided; otherwise returns every comment on the
 * prototype (used to build the cross-design participant directory).
 */
export async function listComments(
  prototypeId: number,
  routePath?: string,
): Promise<SandboxComment[]> {
  const query = routePath ? `?${new URLSearchParams({ route_path: routePath }).toString()}` : ''
  return request<SandboxComment[]>(`/prototypes/${prototypeId}/comments${query}`)
}

export async function getSubscription(prototypeId: number): Promise<boolean> {
  try {
    const result = await request<{ subscribed: boolean }>(`/prototypes/${prototypeId}/subscription`)
    return result.subscribed
  } catch {
    return false
  }
}

export async function subscribe(prototypeId: number): Promise<void> {
  await request(`/prototypes/${prototypeId}/subscription`, { method: 'POST' })
}

export async function unsubscribe(prototypeId: number): Promise<void> {
  await request<undefined>(`/prototypes/${prototypeId}/subscription`, { method: 'DELETE' })
}

export async function createComment(
  prototypeId: number,
  input: CreateCommentInput,
): Promise<SandboxComment> {
  return request<SandboxComment>(`/prototypes/${prototypeId}/comments`, {
    method: 'POST',
    body: JSON.stringify({
      comment: {
        body: input.body,
        route_path: input.routePath,
        category: input.category ?? null,
        x_position: input.xPosition,
        y_position: input.yPosition,
        target: input.target,
      },
    }),
  })
}

export async function createReply(
  prototypeId: number,
  parentCommentId: number,
  body: string,
): Promise<SandboxComment> {
  return request<SandboxComment>(`/prototypes/${prototypeId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ comment: { body, parent_comment_id: parentCommentId } }),
  })
}

export async function resolveComment(
  prototypeId: number,
  commentId: number,
): Promise<SandboxComment> {
  return request<SandboxComment>(`/prototypes/${prototypeId}/comments/${commentId}/resolve`, {
    method: 'POST',
  })
}

export async function unresolveComment(
  prototypeId: number,
  commentId: number,
): Promise<SandboxComment> {
  return request<SandboxComment>(`/prototypes/${prototypeId}/comments/${commentId}/unresolve`, {
    method: 'POST',
  })
}

export async function deleteComment(prototypeId: number, commentId: number): Promise<void> {
  await request<undefined>(`/prototypes/${prototypeId}/comments/${commentId}`, { method: 'DELETE' })
}
