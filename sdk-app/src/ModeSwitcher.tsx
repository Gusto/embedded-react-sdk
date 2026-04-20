import { Link } from 'react-router-dom'
import { useAppMode } from './useAppMode'
import styles from './ModeSwitcher.module.scss'
import BrushIcon from './assets/icons/icon-brush.svg?react'
import TerminalIcon from './assets/icons/icon-terminal.svg?react'

export function ModeSwitcher() {
  const mode = useAppMode()

  return (
    <div className={styles.root}>
      <Link to="/" className={`${styles.option} ${mode === 'preview' ? styles.active : ''}`}>
        <TerminalIcon />
        Development
      </Link>
      <Link to="/design" className={`${styles.option} ${mode === 'design' ? styles.active : ''}`}>
        <BrushIcon />
        Design
      </Link>
    </div>
  )
}
