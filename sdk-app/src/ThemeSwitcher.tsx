import { useThemeModeContext } from './useThemeModeContext'
import type { ThemeMode } from './useThemeMode'
import styles from './ThemeSwitcher.module.scss'
import MonitorIcon from './assets/icons/icon-monitor.svg?react'
import SunIcon from './assets/icons/icon-sun.svg?react'
import MoonIcon from './assets/icons/icon-moon.svg?react'

const options: { mode: ThemeMode; icon: React.FC<React.SVGProps<SVGSVGElement>>; label: string }[] =
  [
    { mode: 'system', icon: MonitorIcon, label: 'System' },
    { mode: 'light', icon: SunIcon, label: 'Light' },
    { mode: 'dark', icon: MoonIcon, label: 'Dark' },
  ]

export function ThemeSwitcher() {
  const { mode, setMode } = useThemeModeContext()

  return (
    <div className={styles.root}>
      {options.map(({ mode: optionMode, icon: Icon, label }) => (
        <button
          key={optionMode}
          type="button"
          className={`${styles.option} ${mode === optionMode ? styles.active : ''}`}
          onClick={() => { setMode(optionMode); }}
          title={label}
        >
          <Icon />
        </button>
      ))}
    </div>
  )
}
