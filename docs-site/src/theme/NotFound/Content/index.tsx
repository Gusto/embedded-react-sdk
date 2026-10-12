import Link from '@docusaurus/Link'
import { useLocation } from '@docusaurus/router'
import useBaseUrl from '@docusaurus/useBaseUrl'
import Heading from '@theme/Heading'
import type { ReactNode } from 'react'
import styles from './styles.module.css'

// Only the most recent minors are built into the live site (SDK-1344); older
// /docs/<X.Y>/ paths 404 here. Point readers at the git tag with the same
// content instead of leaving them stranded.
const OLD_VERSION_PATH = /^\/docs\/(\d+\.\d+)\//

export default function NotFoundContent(): ReactNode {
  const homeUrl = useBaseUrl('/')
  const { pathname } = useLocation()
  const oldVersionMatch = OLD_VERSION_PATH.exec(pathname)

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <Heading as="h1" className={styles.title}>
          Page Not Found
        </Heading>
        <p className={styles.subtitle}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        {oldVersionMatch && (
          <p className={styles.subtitle}>
            Looking for SDK {oldVersionMatch[1]} docs? Older versions aren&apos;t published on this
            site, but the source is preserved at{' '}
            <a
              href={`https://github.com/Gusto/embedded-react-sdk/tree/v${oldVersionMatch[1]}.0/docs`}
            >
              v{oldVersionMatch[1]}.0/docs
            </a>{' '}
            in Gusto/embedded-react-sdk.
          </p>
        )}
        <div className={styles.links}>
          <Link to={homeUrl} className={styles.homeLink}>
            Go to Home
          </Link>
          <Link to="/docs/" className={styles.docsLink}>
            Browse Docs
          </Link>
        </div>
        <div className={styles.suggestions}>
          <p className={styles.suggestionsLabel}>Popular pages:</p>
          <ul className={styles.suggestionsList}>
            <li>
              <Link to="/docs/getting-started">Getting started</Link>
            </li>
            <li>
              <Link to="/docs/guides/integration-guide">Integration guide</Link>
            </li>
            <li>
              <Link to="/docs/guides/component-adapter">Component Adapter</Link>
            </li>
            <li>
              <Link to="/docs/guides/workflows-overview">Workflows</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
