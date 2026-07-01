import type { CommentTarget, ElementMetadata, SandboxComment } from './types'

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

// React Aria / Radix / React's useId generate ids with a per-page-load random
// seed, so they change on every refresh and can't be used to re-find an element.
// Anchoring to them silently detaches the pin after a reload.
const GENERATED_ID = /^react-aria|^radix-|^:r|^«r|_r_/

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
  let current: Element = element

  while (current !== document.body && current.nodeType === Node.ELEMENT_NODE) {
    const el = current
    if (el.id && !GENERATED_ID.test(el.id)) {
      segments.unshift(`#${CSS.escape(el.id)}`)
      break
    }

    const tag = el.tagName.toLowerCase()
    const parent = el.parentElement
    if (!parent) {
      segments.unshift(tag)
      break
    }

    const sameTagSiblings = Array.from(parent.children).filter(
      child => child.tagName === el.tagName,
    )
    const index = sameTagSiblings.indexOf(el) + 1
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
  const element = document.elementFromPoint(clientX, clientY) ?? document.body
  const rect = element.getBoundingClientRect()
  const width = rect.width || 1
  const height = rect.height || 1

  return {
    selector: buildSelector(element),
    offset_x: clamp01((clientX - rect.left) / width),
    offset_y: clamp01((clientY - rect.top) / height),
    element_metadata: {
      tag: element.tagName.toLowerCase(),
      text: element.textContent.trim().slice(0, 40),
    },
  }
}

function querySelectorSafe(selector: string | null): Element | null {
  if (!selector) return null
  try {
    return document.querySelector(selector)
  } catch {
    return null
  }
}

/**
 * Re-finds an element by its captured tag + text when the stored selector no
 * longer matches (e.g. it was built from a React Aria id that changes on every
 * reload). Best-effort: returns the first tag match with identical text.
 */
function findByMetadata(metadata: ElementMetadata | null): Element | null {
  if (!metadata?.text) return null
  for (const el of Array.from(document.getElementsByTagName(metadata.tag))) {
    if (el.textContent.trim().slice(0, 40) === metadata.text) return el
  }
  return null
}

/**
 * Resolves a comment's on-screen position relative to a container. Prefers the
 * live DOM anchor (selector, then a tag+text re-match); falls back to the stored
 * container-relative coordinates when the anchored element can't be found.
 */
export function resolveCommentPosition(
  comment: SandboxComment,
  containerRect: DOMRect,
): { x: number; y: number } | null {
  const { selector, offset_x, offset_y, element_metadata } = comment.anchor
  const ox = toNumber(offset_x)
  const oy = toNumber(offset_y)

  if (ox !== null && oy !== null) {
    const anchored = querySelectorSafe(selector) ?? findByMetadata(element_metadata)
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
