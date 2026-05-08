import { useEffect, useRef } from 'react'
import styles from './ShortcutHelper.module.scss'

interface Shortcut {
  keys: string[]
  label: string
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform)
const MOD = isMac ? '⌘' : 'Ctrl'

const SHORTCUTS: Shortcut[] = [
  { keys: ['?'], label: 'Show keyboard shortcuts' },
  { keys: ['\\'], label: 'Hide chrome' },
  { keys: ['Esc'], label: 'Restore chrome (when hidden)' },
  { keys: [MOD, ','], label: 'Open settings' },
  { keys: [MOD, '.'], label: 'Toggle design / development' },
  { keys: [MOD, ';'], label: 'Cycle theme (system → light → dark)' },
]

interface ShortcutHelperProps {
  isOpen: boolean
  onClose: () => void
}

export function ShortcutHelper({ isOpen, onClose }: ShortcutHelperProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) closeButtonRef.current?.focus()
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className={styles.overlay}>
      <button
        type="button"
        className={styles.backdrop}
        onClick={onClose}
        aria-label="Close keyboard shortcuts"
      />
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcut-helper-title"
      >
        <div className={styles.header}>
          <h2 id="shortcut-helper-title" className={styles.title}>
            Keyboard shortcuts
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close shortcuts"
          >
            ×
          </button>
        </div>
        <ul className={styles.list}>
          {SHORTCUTS.map(({ keys, label }) => (
            <li key={label} className={styles.row}>
              <span className={styles.keys}>
                {keys.map(k => (
                  <kbd key={k} className={styles.key}>
                    {k}
                  </kbd>
                ))}
              </span>
              <span className={styles.label}>{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
