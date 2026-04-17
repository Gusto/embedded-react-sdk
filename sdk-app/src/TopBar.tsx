import { ModeSwitcher } from './ModeSwitcher'
import { useAppMode } from './useAppMode'
import styles from './TopBar.module.scss'

export function TopBar() {
  const mode = useAppMode()

  return (
    <header className={styles.root}>
      <span className={styles.title}>
        SDK Dev App{mode === 'design' && <span className={styles.designTitle}>/ Design</span>}
      </span>

      <div className={styles.spacer} />
      <ModeSwitcher />
    </header>
  )
}
