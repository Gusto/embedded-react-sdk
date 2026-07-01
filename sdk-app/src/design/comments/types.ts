export const COMMENT_CATEGORIES = ['blocker', 'concern', 'question', 'suggestion'] as const

export type CommentCategory = (typeof COMMENT_CATEGORIES)[number]

export interface SandboxUser {
  id: number
  name: string
  email: string
  avatar_url: string | null
  can_write?: boolean
  builder?: boolean
}

export interface CommentAnchor {
  selector: string | null
  offset_x: number | string | null
  offset_y: number | string | null
  element_metadata: Record<string, unknown> | null
}

export interface SandboxComment {
  id: number
  prototype_id: number
  route: { id: number; path: string }
  user: Pick<SandboxUser, 'id' | 'name' | 'email' | 'avatar_url'>
  parent_comment_id: number | null
  commit_sha: string | null
  body: string
  x_position: number | string | null
  y_position: number | string | null
  category: CommentCategory | null
  anchor: CommentAnchor
  resolved: boolean
  resolved_by: { id: number; name: string } | null
  resolved_at: string | null
  created_at: string
  updated_at: string
  replies?: SandboxComment[]
}

export interface SandboxPrototype {
  id: number
  repository: string
  pull_request_number: number
  preview_url: string
}

/** The DOM-anchoring payload sent when creating a positioned comment. */
export interface CommentTarget {
  selector: string
  offset_x: number
  offset_y: number
  element_metadata: Record<string, unknown>
}

export interface CreateCommentInput {
  routePath: string
  body: string
  category?: CommentCategory | null
  xPosition: number
  yPosition: number
  target: CommentTarget
}
