import type { CommentTarget, SandboxComment } from './types'

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

const toNumber = (value: number | string | null | undefined): number | null => {
  if (value === null || value === undefined) return null
  const parsed = typeof value === 'string' ? parseFloat(value) : value
  return Number.isFinite(parsed) ? parsed : null
}

/**
 * Builds a best-effort CSS selector path from an element up to <body>. Prefers
 * element ids as anchors (they short-circuit the path); otherwise uses
 * tag + :nth-of-type so the path is stable across re-renders of the same tree.
 */
function buildSelector(element: Element): string {
  const segments: string[] = []
  let current: Element | null = element

  while (current && current !== document.body && current.nodeType === Node.ELEMENT_NODE) {
    if (current.id) {
      segments.unshift(`#${CSS.escape(current.id)}`)
      break
    }

    const tag = current.tagName.toLowerCase()
    const parent: Element | null = current.parentElement
    if (!parent) {
      segments.unshift(tag)
      break
    }

    const sameTagSiblings = Array.from(parent.children).filter(
      child => child.tagName === current!.tagName,
    )
    const index = sameTagSiblings.indexOf(current) + 1
    segments.unshift(sameTagSiblings.length > 1 ? `${tag}:nth-of-type(${index})` : tag)
    current = parent
  }

  return segments.join(' > ')
}

/**
 * Captures a DOM-anchored target from a click. The offset is stored as a
 * fraction of the element's box so the pin re-anchors correctly when the layout
 * reflows (responsive breakpoints, scrolling, content changes).
 */
export function buildTarget(clientX: number, clientY: number): CommentTarget {
  const element = (document.elementFromPoint(clientX, clientY) as Element | null) ?? document.body
  const rect = element.getBoundingClientRect()
  const width = rect.width || 1
  const height = rect.height || 1

  return {
    selector: buildSelector(element),
    offset_x: clamp01((clientX - rect.left) / width),
    offset_y: clamp01((clientY - rect.top) / height),
    element_metadata: {
      tag: element.tagName.toLowerCase(),
      text: (element.textContent ?? '').trim().slice(0, 40),
    },
  }
}

/**
 * Resolves a comment's on-screen position relative to a container. Prefers the
 * live DOM anchor (re-querying the selector); falls back to the stored
 * container-relative coordinates when the anchored element no longer exists.
 */
export function resolveCommentPosition(
  comment: SandboxComment,
  containerRect: DOMRect,
): { x: number; y: number } | null {
  const { selector, offset_x, offset_y } = comment.anchor
  const ox = toNumber(offset_x)
  const oy = toNumber(offset_y)

  if (selector && ox !== null && oy !== null) {
    let anchored: Element | null = null
    try {
      anchored = document.querySelector(selector)
    } catch {
      anchored = null
    }
    if (anchored) {
      const rect = anchored.getBoundingClientRect()
      return {
        x: rect.left + ox * rect.width - containerRect.left,
        y: rect.top + oy * rect.height - containerRect.top,
      }
    }
  }

  const fallbackX = toNumber(comment.x_position)
  const fallbackY = toNumber(comment.y_position)
  if (fallbackX !== null && fallbackY !== null) {
    return { x: fallbackX, y: fallbackY }
  }

  return null
}
