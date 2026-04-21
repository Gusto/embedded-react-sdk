import styles from './BreakpointSwitcher.module.scss'
import { SWITCHER_OPTIONS, getWidthLabel } from './breakpointConstants'
import type { BreakpointOption } from './breakpointConstants'

interface BreakpointSwitcherProps {
  value: BreakpointOption
  onChange: (key: BreakpointOption) => void
}

export function BreakpointSwitcher({ value, onChange }: BreakpointSwitcherProps) {
  return (
    <div className={styles.root}>
      {SWITCHER_OPTIONS.map(({ label, key }) => (
        <button
          key={label}
          className={`${styles.option} ${value === key ? styles.active : ''}`}
          onClick={() => {
            onChange(key)
          }}
        >
          <span className={styles.label}>{label}</span>
          <span className={styles.width}>{getWidthLabel(key)}</span>
        </button>
      ))}
    </div>
  )
}
