import { useState } from 'react'
import styles from './comments.module.scss'
import { useComments } from './CommentsContext'
import { CommentComposer } from './CommentComposer'
import { relativeTime } from './format'
import { splitMentions } from './mentions'
import type { SandboxComment } from './types'

function CommentBody({ text }: { text: string }) {
  return (
    <div className={styles.entryText}>
      {splitMentions(text).map((segment, index) =>
        segment.mention ? (
          <span key={index} className={styles.mentionToken}>
            {segment.text}
          </span>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </div>
  )
}

function CommentEntry({ comment }: { comment: SandboxComment }) {
  return (
    <div className={styles.entry}>
      {comment.user.avatar_url ? (
        <img className={styles.avatar} src={comment.user.avatar_url} alt="" />
      ) : (
        <span className={styles.avatar} />
      )}
      <div className={styles.entryBody}>
        <div className={styles.entryHead}>
          <span className={styles.authorName}>{comment.user.name}</span>
          <span className={styles.timestamp}>{relativeTime(comment.created_at)}</span>
        </div>
        <CommentBody text={comment.body} />
        {comment.category ? <span className={styles.categoryBadge}>{comment.category}</span> : null}
      </div>
    </div>
  )
}

export function CommentThread({ comment }: { comment: SandboxComment }) {
  const { canWrite, submitReply, toggleResolve, removeComment, me } = useComments()
  const [replying, setReplying] = useState(false)

  const isAuthor = me?.id === comment.user.id

  return (
    <div>
      <div className={styles.threadScroll}>
        <CommentEntry comment={comment} />
        {(comment.replies ?? []).map(reply => (
          <CommentEntry key={reply.id} comment={reply} />
        ))}
      </div>

      <div className={styles.footer}>
        {comment.resolved ? (
          <span className={styles.resolvedTag}>
            Resolved{comment.resolved_by ? ` by ${comment.resolved_by.name}` : ''}
          </span>
        ) : null}

        {replying ? (
          <CommentComposer
            submitLabel="Reply"
            placeholder="Reply…"
            onCancel={() => {
              setReplying(false)
            }}
            onSubmit={async body => {
              await submitReply(comment.id, body)
              setReplying(false)
            }}
          />
        ) : (
          canWrite && (
            <div className={styles.formRow}>
              <button
                type="button"
                className={`${styles.button} ${styles.buttonGhost}`}
                onClick={() => {
                  setReplying(true)
                }}
              >
                Reply
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.buttonGhost}`}
                onClick={() => void toggleResolve(comment)}
              >
                {comment.resolved ? 'Reopen' : 'Resolve'}
              </button>
              <span className={styles.spacer} />
              {isAuthor ? (
                <button
                  type="button"
                  className={`${styles.button} ${styles.buttonDanger}`}
                  onClick={() => void removeComment(comment)}
                >
                  Delete
                </button>
              ) : null}
            </div>
          )
        )}

        {!canWrite ? (
          <span className={styles.timestamp}>
            Read-only — Gusto WARP sign-in required to reply.
          </span>
        ) : null}
      </div>
    </div>
  )
}
