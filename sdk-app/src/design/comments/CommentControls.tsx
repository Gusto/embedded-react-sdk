import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './comments.module.scss'
import { useComments } from './CommentsContext'
import { relativeTime } from './format'
import type { CommentToast } from './CommentsContext'
import type { SandboxComment } from './types'

/** Splits a recorded route into its pathname and viewport token for display. */
function splitRoute(path: string): { pathname: string; vw: string | null } {
  const [pathname = path, query = ''] = path.split('?')
  return { pathname, vw: new URLSearchParams(query).get('vw') }
}

/** Human label for a non-default viewport, or null when it's the default/full. */
function viewportLabel(vw: string | null): string | null {
  if (!vw || vw === 'large' || vw === 'full') return null
  return vw.charAt(0).toUpperCase() + vw.slice(1)
}

function TrayRow({ comment }: { comment: SandboxComment }) {
  const { selectedId, openComment, threadHasUnread, routePath } = useComments()
  const replyCount = comment.replies?.length ?? 0
  const onCurrentRoute = comment.route.path === routePath
  const route = splitRoute(comment.route.path)
  const vwLabel = viewportLabel(route.vw)

  return (
    <button
      type="button"
      className={`${styles.trayRow} ${comment.id === selectedId ? styles.trayRowSelected : ''}`}
      onClick={() => {
        openComment(comment)
      }}
    >
      {threadHasUnread(comment) ? <span className={styles.unreadDot} /> : null}
      <div className={styles.trayRowText}>
        <span
          className={`${styles.trayRowRoute} ${onCurrentRoute ? styles.trayRowRouteCurrent : ''}`}
          title={comment.route.path}
        >
          📍 {route.pathname}
          {vwLabel ? <span className={styles.trayRowVw}>{vwLabel}</span> : null}
        </span>
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
    allComments,
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

  const open = allComments.filter(comment => !comment.resolved)
  const resolved = allComments.filter(comment => comment.resolved)

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
        {me?.avatar_url ? <img className={styles.avatar} src={me.avatar_url} alt="" /> : null}
        <span>
          {canWrite ? 'Commenting as ' : 'Read-only — '}
          {me?.name.split('@')[0]}
        </span>
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
        {loading && allComments.length === 0 ? <div className={styles.empty}>Loading…</div> : null}
        {!loading && allComments.length === 0 && !error ? (
          <div className={styles.empty}>
            No comments yet.
            {canWrite ? ' Click “+ Add comment” to leave the first one.' : ''}
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

      {allComments.length > 0 ? (
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
    const timer = setTimeout(() => {
      dismissToast(toast.key)
    }, 8000)
    return () => {
      clearTimeout(timer)
    }
  }, [toast.key, dismissToast])

  return (
    <button
      type="button"
      className={styles.toast}
      onClick={() => {
        void navigate(toast.routePath)
        setActive(true)
        setTrayOpen(true)
        dismissToast(toast.key)
      }}
    >
      <div className={styles.toastTitle}>💬 {toast.authorName} commented</div>
      <div className={styles.toastRoute}>
        {splitRoute(toast.routePath).pathname}
        {viewportLabel(splitRoute(toast.routePath).vw)
          ? ` · ${viewportLabel(splitRoute(toast.routePath).vw)}`
          : ''}
      </div>
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
  const { authorized, active, trayOpen, setActive, setTrayOpen, unreadCount } = useComments()

  const toggle = () => {
    const next = !trayOpen
    setTrayOpen(next)
    setActive(next)
  }

  // Hidden entirely unless signed in as a Gusto employee.
  if (!authorized) return null

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
