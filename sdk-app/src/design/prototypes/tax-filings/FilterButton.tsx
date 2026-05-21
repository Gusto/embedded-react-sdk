import type { Ref, ReactNode } from 'react'
import classNames from 'classnames'
import styles from './TaxFilingsFlow.module.scss'
import CaretDownIcon from '@/assets/icons/caret-down.svg?react'

interface FilterButtonProps {
  label: string
  summary: string
  isActive: boolean
  onClick: () => void
  buttonRef?: Ref<HTMLButtonElement>
  className?: string
  icon?: ReactNode
  hideCaret?: boolean
  ariaExpanded?: boolean
}

export function FilterButton({
  label,
  summary,
  isActive,
  onClick,
  buttonRef,
  className,
  icon,
  hideCaret,
  ariaExpanded,
}: FilterButtonProps) {
  return (
    <button
      ref={buttonRef}
      type="button"
      className={classNames(styles.filterButton, className)}
      data-active={isActive || undefined}
      onClick={onClick}
      aria-expanded={ariaExpanded}
    >
      {icon && <span className={styles.filterButtonIcon}>{icon}</span>}
      <span className={styles.filterButtonText}>
        <span className={styles.filterButtonLabel}>{label}:</span>{' '}
        <span className={styles.filterButtonSummary}>{summary}</span>
      </span>
      {!hideCaret && <CaretDownIcon aria-hidden className={styles.filterButtonCaret} />}
    </button>
  )
}
