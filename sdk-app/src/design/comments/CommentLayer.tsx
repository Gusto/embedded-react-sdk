/*
 * This overlay is a pointer-driven canvas: the container captures placement
 * clicks and the popovers stop propagation. These are not keyboard-focusable
 * controls (the pins themselves are <button>s), so the static-interaction a11y
 * rules don't apply here.
 */
/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import { useEffect } from 'react'
import type { RefObject } from 'react'
import styles from './comments.module.scss'
import { useComments } from './CommentsContext'
import { useCommentPinPositions } from './useCommentPinPositions'
import { CommentThread } from './CommentThread'
import { CommentComposer } from './CommentComposer'

export function CommentLayer({ containerRef }: { containerRef: RefObject<HTMLElement | null> }) {
  const {
    authorized,
    active,
    placing,
    comments,
    draft,
    clearDraft,
    setDraftAt,
    selectedId,
    select,
    submitComment,
    threadHasUnread,
  } = useComments()

  const positions = useCommentPinPositions(active ? comments : [], containerRef)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (draft) clearDraft()
      else if (selectedId !== null) select(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [draft, selectedId, clearDraft, select])

  if (!authorized || !active) return null

  const selected = comments.find(comment => comment.id === selectedId) ?? null
  const selectedPosition = selectedId !== null ? positions.get(selectedId) : undefined

  const handlePlaceClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!placing) return
    const container = containerRef.current
    if (!container) return
    const overlay = event.currentTarget
    // Hide the overlay for the hit-test so elementFromPoint sees the design.
    overlay.style.pointerEvents = 'none'
    setDraftAt(event.clientX, event.clientY, container)
    overlay.style.pointerEvents = ''
  }

  return (
    <div
      className={`${styles.overlay} ${placing ? styles.overlayPlacing : ''}`}
      onClick={handlePlaceClick}
    >
      {placing ? (
        <div className={styles.placingHint}>Click anywhere to place your comment</div>
      ) : null}

      {comments.map(comment => {
        const position = positions.get(comment.id)
        if (!position) return null
        const classes = [
          styles.pin,
          comment.resolved ? styles.pinResolved : '',
          comment.id === selectedId ? styles.pinSelected : '',
          threadHasUnread(comment) ? styles.pinUnread : '',
        ]
          .filter(Boolean)
          .join(' ')
        return (
          <button
            key={comment.id}
            type="button"
            className={classes}
            style={{ left: position.x, top: position.y }}
            onClick={event => {
              event.stopPropagation()
              select(comment.id === selectedId ? null : comment.id)
            }}
          >
            {(comment.replies?.length ?? 0) + 1}
          </button>
        )
      })}

      {selected && selectedPosition ? (
        <div
          className={styles.popover}
          style={{ left: selectedPosition.x, top: selectedPosition.y }}
          onClick={event => {
            event.stopPropagation()
          }}
        >
          <CommentThread comment={selected} />
        </div>
      ) : null}

      {draft ? (
        <div
          className={styles.popover}
          style={{ left: draft.x, top: draft.y }}
          onClick={event => {
            event.stopPropagation()
          }}
        >
          <div className={styles.threadScroll}>
            <CommentComposer
              withCategory
              submitLabel="Comment"
              onCancel={clearDraft}
              onSubmit={(body, category) => submitComment(body, category)}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
