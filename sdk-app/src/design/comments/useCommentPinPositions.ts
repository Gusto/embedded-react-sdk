import { useCallback, useEffect, useState } from 'react'
import type { RefObject } from 'react'
import { resolveCommentPosition } from './anchor'
import type { SandboxComment } from './types'

export interface PinPosition {
  x: number
  y: number
}

/**
 * Computes container-relative screen positions for each comment pin, kept in
 * sync as the page scrolls, resizes, or the anchored content reflows.
 */
export function useCommentPinPositions(
  comments: SandboxComment[],
  containerRef: RefObject<HTMLElement | null>,
): Map<number, PinPosition> {
  const [positions, setPositions] = useState<Map<number, PinPosition>>(new Map())

  const recompute = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const containerRect = container.getBoundingClientRect()
    const next = new Map<number, PinPosition>()
    for (const comment of comments) {
      const position = resolveCommentPosition(comment, containerRect)
      if (position) next.set(comment.id, position)
    }
    setPositions(next)
  }, [comments, containerRef])

  useEffect(() => {
    let frame = 0
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(recompute)
    }

    schedule()

    window.addEventListener('scroll', schedule, true)
    window.addEventListener('resize', schedule)

    const container = containerRef.current
    const resizeObserver = new ResizeObserver(schedule)
    if (container) resizeObserver.observe(container)

    // Async-loaded content (e.g. React Query table rows) appears after the first
    // paint without changing the container's size, so the ResizeObserver never
    // fires. Watch the subtree so pins re-anchor once their target node mounts.
    const mutationObserver = new MutationObserver(schedule)
    if (container) mutationObserver.observe(container, { childList: true, subtree: true })

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule, true)
      window.removeEventListener('resize', schedule)
      resizeObserver.disconnect()
      mutationObserver.disconnect()
    }
  }, [recompute, containerRef])

  return positions
}
