import React, { type ReactNode } from 'react'
import clsx from 'clsx'
import { useColorMode, useThemeConfig } from '@docusaurus/theme-common'
import { translate } from '@docusaurus/Translate'
import type { Props } from '@theme/Navbar/ColorModeToggle'
import styles from './styles.module.css'

function SunIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  )
}

function MonitorIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  )
}

const OPTIONS = [
  { value: null, label: 'System', Icon: MonitorIcon },
  { value: 'dark' as const, label: 'Dark', Icon: MoonIcon },
  { value: 'light' as const, label: 'Light', Icon: SunIcon },
]

export default function NavbarColorModeToggle({ className }: Props): ReactNode {
  const { disableSwitch } = useThemeConfig().colorMode
  const { colorModeChoice, setColorMode } = useColorMode()

  if (disableSwitch) {
    return null
  }

  return (
    <div
      className={clsx(styles.themeSwitcher, className)}
      role="radiogroup"
      aria-label={translate({
        id: 'theme.navbar.colorModeToggle.label',
        message: 'Theme',
      })}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const isActive = colorModeChoice === value
        return (
          <button
            key={label}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={label}
            title={label}
            className={clsx(styles.themeOption, isActive && styles.themeOptionActive)}
            onClick={() => setColorMode(value)}
          >
            <Icon />
          </button>
        )
      })}
    </div>
  )
}
