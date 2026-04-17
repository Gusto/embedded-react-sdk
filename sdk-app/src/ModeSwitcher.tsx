import { Link } from 'react-router-dom'
import { useAppMode } from './useAppMode'
import styles from './ModeSwitcher.module.scss'

export function ModeSwitcher() {
  const mode = useAppMode()

  return (
    <div className={styles.root}>
      <Link to="/" className={`${styles.option} ${mode === 'preview' ? styles.active : ''}`}>
        Development
      </Link>
      <Link to="/design" className={`${styles.option} ${mode === 'design' ? styles.active : ''}`}>
        Design
      </Link>
    </div>
  )
}
