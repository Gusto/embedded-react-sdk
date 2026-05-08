import styles from './TokenExpiredOverlay.module.scss'

interface TokenExpiredOverlayProps {
  onRefresh: () => Promise<unknown>
  isRefreshing: boolean
  error: string | null
}

export function TokenExpiredOverlay({ onRefresh, isRefreshing, error }: TokenExpiredOverlayProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.icon}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className={styles.title}>Time for a New Company!</h2>
        <p className={styles.description}>
          Your demo token has expired — the perfect excuse for a fresh start. We&apos;ll spin up a
          brand new demo company and reload the page. It typically takes 1–2 minutes.
        </p>
        <button
          className={styles.refreshBtn}
          onClick={() => onRefresh()}
          disabled={isRefreshing}
          type="button"
        >
          {isRefreshing ? (
            <>
              <span className={styles.spinner} />
              Building Your New Company…
            </>
          ) : (
            'New Demo Company!'
          )}
        </button>
        {isRefreshing && (
          <p className={styles.progress}>
            Your new demo company is being set up. The page will reload when it&apos;s ready.
          </p>
        )}
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  )
}
