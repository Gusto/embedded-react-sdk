import styles from './Loading.module.scss'

export interface LoadingProps {
  children?: React.ReactNode
}

export function Loading(_props: LoadingProps) {
  return (
    <div className={styles.root} role="status" aria-label="Loading">
      <span className={styles.spinner} aria-hidden="true" />
    </div>
  )
}
