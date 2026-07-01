import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './comments.module.scss'
import { useComments } from './CommentsContext'
import { relativeTime } from './format'
import type { CommentToast } from './CommentsContext'
import type { SandboxComment } from './types'

function TrayRow({ comment }: { comment: SandboxComment }) {
  const { selectedId, select, threadHasUnread } = useComments()
  const replyCount = comment.replies?.length ?? 0
  return (
    <button
      type="button"
      className={`${styles.trayRow} ${comment.id === selectedId ? styles.trayRowSelected : ''}`}
      onClick={() => select(comment.id)}
    >
      {threadHasUnread(comment) ? <span className={styles.unreadDot} /> : null}
      <div className={styles.trayRowText}>
        <div className={styles.trayRowPreview}>{comment.body}</div>
        <div className={styles.trayRowMeta}>
          <span>{comment.user.name.split('@')[0]}</span>
          <span>·</span>
          <span>{relativeTime(comment.created_at)}</span>
          {replyCount > 0 ? (
            <span className={styles.replyCount}>
              {replyCount} repl{replyCount === 1 ? 'y' : 'ies'}
            </span>
          ) : null}
          {comment.category ? (
            <span className={styles.categoryBadge}>{comment.category}</span>
          ) : null}
        </div>
      </div>
    </button>
  )
}

function Tray() {
  const {
    me,
    canWrite,
    comments,
    loading,
    error,
    refresh,
    placing,
    startPlacing,
    cancelPlacing,
    setActive,
    setTrayOpen,
    markAllRead,
    subscribed,
    toggleSubscription,
    notificationsEnabled,
    toggleNotifications,
  } = useComments()

  const open = comments.filter(comment => !comment.resolved)
  const resolved = comments.filter(comment => comment.resolved)

  return (
    <div className={styles.tray}>
      <div className={styles.trayHeader}>
        <span className={styles.trayTitle}>Comments</span>
        <div className={styles.trayActions}>
          {canWrite ? (
            <button
              type="button"
              className={`${styles.iconButton} ${subscribed ? styles.iconButtonActive : ''}`}
              title={
                subscribed
                  ? 'Watching — you get a Slack DM on new comments. Click to stop.'
                  : 'Watch — get a Slack DM when anyone comments'
              }
              aria-label={subscribed ? 'Stop watching' : 'Watch for new comments'}
              aria-pressed={subscribed}
              onClick={() => void toggleSubscription()}
            >
              {subscribed ? '🔔' : '🔕'}
            </button>
          ) : null}
          <button
            type="button"
            className={styles.iconButton}
            title="Refresh comments"
            aria-label="Refresh comments"
            onClick={() => void refresh()}
          >
            ↻
          </button>
          <button
            type="button"
            className={styles.iconButton}
            title="Close comments"
            aria-label="Close comments"
            onClick={() => {
              setActive(false)
              setTrayOpen(false)
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {canWrite ? (
        <button
          type="button"
          className={`${styles.button} ${placing ? styles.buttonGhost : styles.buttonPrimary} ${styles.addButton}`}
          onClick={placing ? cancelPlacing : startPlacing}
        >
          {placing ? 'Cancel placement' : '+ Add comment'}
        </button>
      ) : null}

      <div className={`${styles.authStatus} ${!canWrite ? styles.authBad : ''}`}>
        {me ? (
          <>
            {me.avatar_url ? <img className={styles.avatar} src={me.avatar_url} alt="" /> : null}
            <span>
              {canWrite ? 'Commenting as ' : 'Read-only — '}
              {me.name.split('@')[0]}
            </span>
          </>
        ) : (
          <span>Not signed in — connect to WARP to comment.</span>
        )}
      </div>

      <button
        type="button"
        className={styles.notifyRow}
        onClick={toggleNotifications}
        aria-pressed={notificationsEnabled}
      >
        <span>Toast notifications for new comments</span>
        <span className={`${styles.switch} ${notificationsEnabled ? styles.switchOn : ''}`}>
          <span className={styles.switchKnob} />
        </span>
      </button>

      <div className={styles.trayList}>
        {error ? <div className={styles.empty}>Error: {error}</div> : null}
        {loading && comments.length === 0 ? <div className={styles.empty}>Loading…</div> : null}
        {!loading && comments.length === 0 && !error ? (
          <div className={styles.empty}>
            No comments on this design yet.
            {canWrite ? ' Click “+ Add” to leave the first one.' : ''}
          </div>
        ) : null}

        {open.length > 0 ? (
          <>
            <div className={styles.sectionLabel}>Open ({open.length})</div>
            {open.map(comment => (
              <TrayRow key={comment.id} comment={comment} />
            ))}
          </>
        ) : null}

        {resolved.length > 0 ? (
          <>
            <div className={styles.sectionLabel}>Resolved ({resolved.length})</div>
            {resolved.map(comment => (
              <TrayRow key={comment.id} comment={comment} />
            ))}
          </>
        ) : null}
      </div>

      {comments.length > 0 ? (
        <div className={styles.trayHeader}>
          <span className={styles.spacer} />
          <button
            type="button"
            className={`${styles.button} ${styles.buttonGhost}`}
            onClick={markAllRead}
          >
            Mark all read
          </button>
        </div>
      ) : null}
    </div>
  )
}

function ToastCard({ toast }: { toast: CommentToast }) {
  const { dismissToast, setActive, setTrayOpen } = useComments()
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => dismissToast(toast.key), 8000)
    return () => clearTimeout(timer)
  }, [toast.key, dismissToast])

  return (
    <button
      type="button"
      className={styles.toast}
      onClick={() => {
        navigate(toast.routePath)
        setActive(true)
        setTrayOpen(true)
        dismissToast(toast.key)
      }}
    >
      <div className={styles.toastTitle}>💬 {toast.authorName} commented</div>
      <div className={styles.toastRoute}>{toast.routePath}</div>
      <div className={styles.toastBody}>{toast.body}</div>
    </button>
  )
}

function Toasts() {
  const { toasts } = useComments()
  if (toasts.length === 0) return null
  return (
    <div className={styles.toastStack}>
      {toasts.map(toast => (
        <ToastCard key={toast.key} toast={toast} />
      ))}
    </div>
  )
}

export function CommentControls() {
  const { active, trayOpen, setActive, setTrayOpen, unreadCount } = useComments()

  const toggle = () => {
    const next = !trayOpen
    setTrayOpen(next)
    setActive(next)
  }

  return (
    <>
      <button
        type="button"
        className={`${styles.toggle} ${active ? styles.toggleActive : ''}`}
        onClick={toggle}
      >
        💬 Comments
        {unreadCount > 0 ? <span className={styles.toggleBadge}>{unreadCount}</span> : null}
      </button>
      {trayOpen ? (
        <div className={styles.trayDrawer}>
          <Tray />
        </div>
      ) : null}
      <Toasts />
    </>
  )
}
