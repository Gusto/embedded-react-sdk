import type { TokenStatus } from './useDemoManager'
import styles from './TokenBanner.module.scss'

interface TokenBannerProps {
  tokenStatus: TokenStatus
}

export function TokenBanner({ tokenStatus }: TokenBannerProps) {
  if (tokenStatus !== 'expired' && tokenStatus !== 'none') return null

  const message =
    tokenStatus === 'none'
      ? 'No API token configured. Restart the dev server to auto-provision: npm run prototype-app'
      : 'API token has expired. Restart the dev server to get a new one: npm run prototype-app'

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <span className={styles.message}>{message}</span>
      </div>
    </div>
  )
}
