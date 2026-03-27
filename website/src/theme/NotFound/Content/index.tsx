import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import clsx from 'clsx';
import styles from './styles.module.css';

export default function NotFoundContent(): JSX.Element {
  return (
    <main className={styles.root}>
      <div className={styles.container}>
        <Heading as="h1" className={styles.title}>
          Page Not Found
        </Heading>
        <p className={styles.subtitle}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className={styles.links}>
          <Link to="/" className={styles.homeLink}>
            Go to Home
          </Link>
          <Link to="/docs/what-is-the-gep-react-sdk" className={styles.docsLink}>
            Browse Docs
          </Link>
        </div>
        <div className={styles.suggestions}>
          <p className={styles.suggestionsLabel}>Popular pages:</p>
          <ul className={styles.suggestionsList}>
            <li>
              <Link to="/docs/getting-started/getting-started">Getting Started</Link>
            </li>
            <li>
              <Link to="/docs/integration-guide/integration-guide">Integration Guide</Link>
            </li>
            <li>
              <Link to="/docs/api/companies">API Reference</Link>
            </li>
            <li>
              <Link to="/docs/workflows-overview/workflows-overview">Workflows</Link>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
