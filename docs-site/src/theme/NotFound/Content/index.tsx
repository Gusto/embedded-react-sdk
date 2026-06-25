import Link from '@docusaurus/Link'
import useBaseUrl from '@docusaurus/useBaseUrl'
import Heading from '@theme/Heading'
import type { ReactNode } from 'react'
import styles from './styles.module.css'

export default function NotFoundContent(): ReactNode {
  const homeUrl = useBaseUrl('/')

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <Heading as="h1" className={styles.title}>
          Page Not Found
        </Heading>
        <p className={styles.subtitle}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
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
              <Link to="/docs/getting-started">Getting Started</Link>
            </li>
            <li>
              <Link to="/docs/integration-guide">Integration Guide</Link>
            </li>
            <li>
              <Link to="/docs/component-adapter">Component Adapter</Link>
            </li>
            <li>
              <Link to="/docs/workflows-overview">Workflows</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
