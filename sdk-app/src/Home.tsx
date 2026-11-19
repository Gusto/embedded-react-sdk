import { Link } from 'react-router-dom'
import styles from './Home.module.scss'

export function Home() {
  const env = typeof __SDK_APP_ENV__ !== 'undefined' ? __SDK_APP_ENV__ : 'demo'
  const proxyMode = typeof __SDK_APP_PROXY_MODE__ !== 'undefined' ? __SDK_APP_PROXY_MODE__ : 'none'

  return (
    <div className={styles.root}>
      <div className={styles.bodyContent}>
        <h1>SDK Dev App</h1>
        <p>
          Select a component from the sidebar to render it with live API data. Use the Settings
          panel to manage your demo environment and entity IDs.
        </p>

        {proxyMode === 'none' && (
          <div className={styles.warning}>
            <strong>No environment configured.</strong>
            <p>
              Run <code>npm run sdk-app:setup --env=demo</code> to set up the demo environment, or
              copy <code>sdk-app/env/.env.local.example</code> to{' '}
              <code>sdk-app/env/.env.local</code> for local development.
            </p>
          </div>
        )}

        <h3 className={styles.sectionTitle}>Quick Info</h3>
        <ul>
          <li>
            Environment: <code>{env}</code>
          </li>
          <li>
            Proxy mode: <code>{proxyMode}</code>
          </li>
          <li>Components are rendered with live API calls through the proxy</li>
          <li>Entity IDs can be changed in the Settings panel (gear icon)</li>
          <li>Events from components are logged in the Events panel below each component</li>
          <li>URLs are shareable -- send a link to a specific component to a teammate</li>
          <li>
            Need to hit an endpoint not in the generated SDK? Try the{' '}
            <Link to="/tools/api-explorer">API Explorer</Link>
          </li>
          <li>
            Fetching shifts for a pay period? See the{' '}
            <Link to="/tools/pay-period-shifts">Pay Period Shifts</Link> query walkthrough
          </li>
          <li>
            Reviewing timesheets on real data? Open the{' '}
            <Link to="/tools/time-tracking-review">Time Tracking Review</Link> prototype (read-only)
          </li>
        </ul>
      </div>
    </div>
  )
}
