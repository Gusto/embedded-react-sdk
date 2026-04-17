import { ModeSwitcher } from './ModeSwitcher'
import styles from './TopBar.module.scss'

export function TopBar() {
  return (
    <header className={styles.root}>
      <span className={styles.title}>SDK Dev App</span>
      <div className={styles.spacer} />
      <ModeSwitcher />
    </header>
  )
}
