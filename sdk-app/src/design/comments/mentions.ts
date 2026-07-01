import type { SandboxComment } from './types'

export interface Participant {
  id: number
  name: string
  email: string
  avatar_url: string | null
  handle: string
}

/** A mention handle is the email local-part (stable, space-free, unambiguous). */
export function handleFor(email: string, name: string): string {
  const local = email.includes('@') ? email.split('@')[0]! : name
  return local.replace(/\s+/g, '.').toLowerCase()
}

/** Builds a unique, sorted participant directory from a set of comments. */
export function participantsFrom(comments: SandboxComment[]): Participant[] {
  const byId = new Map<number, Participant>()
  for (const comment of comments) {
    for (const item of [comment, ...(comment.replies ?? [])]) {
      if (!byId.has(item.user.id)) {
        byId.set(item.user.id, {
          id: item.user.id,
          name: item.user.name,
          email: item.user.email,
          avatar_url: item.user.avatar_url,
          handle: handleFor(item.user.email, item.user.name),
        })
      }
    }
  }
  return [...byId.values()].sort((a, b) => a.handle.localeCompare(b.handle))
}

const MENTION_PATTERN = /@[\w.-]+/g

/** Splits text into plain segments and mention tokens for highlighted rendering. */
export function splitMentions(text: string): Array<{ text: string; mention: boolean }> {
  const segments: Array<{ text: string; mention: boolean }> = []
  let lastIndex = 0
  for (const match of text.matchAll(MENTION_PATTERN)) {
    const start = match.index
    if (start > lastIndex) segments.push({ text: text.slice(lastIndex, start), mention: false })
    segments.push({ text: match[0], mention: true })
    lastIndex = start + match[0].length
  }
  if (lastIndex < text.length) segments.push({ text: text.slice(lastIndex), mention: false })
  return segments
}
