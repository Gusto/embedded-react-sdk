import type { ReactNode } from 'react'
import styles from './styles.module.css'

function Node({
  label,
  title,
  detail,
  accent = false,
}: {
  label: string
  title: string
  detail: string
  accent?: boolean
}): ReactNode {
  return (
    <div className={`${styles.node} ${accent ? styles.nodeAccent : ''}`}>
      <span className={styles.label}>{label}</span>
      <span className={styles.title}>{title}</span>
      <span className={styles.detail}>{detail}</span>
    </div>
  )
}

function Connector({ caption }: { caption: string }): ReactNode {
  return (
    <div className={styles.connector}>
      <span className={styles.connectorCaption}>{caption}</span>
      <div className={styles.arrow} />
    </div>
  )
}

export function AuthFlowDiagram(): ReactNode {
  return (
    <div className={styles.diagram} role="img" aria-label="Authentication flow diagram">
      <Node
        label="Client"
        title="Partner App"
        detail="Renders SDK components and calls the proxy"
      />
      <Connector caption="SDK request" />
      <Node
        label="Backend"
        title="Partner Proxy"
        detail="Authenticates, fetches OAuth2 token, forwards"
        accent
      />
      <Connector caption="OAuth2 token" />
      <Node label="API" title="Gusto Embedded API" detail="Returns payroll data and resources" />
    </div>
  )
}
