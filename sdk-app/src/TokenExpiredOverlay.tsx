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
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className={styles.title}>Demo Token Expired</h2>
        <p className={styles.description}>
          Your demo session has expired. This will create a fresh demo environment with a new token
          and reload the page. It typically takes 1–2 minutes.
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
              Creating New Demo…
            </>
          ) : (
            'Refresh Demo'
          )}
        </button>
        {isRefreshing && (
          <p className={styles.progress}>
            Provisioning a new demo environment. The page will reload automatically.
          </p>
        )}
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  )
}
