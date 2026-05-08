import { useEffect, useRef, type ReactNode } from 'react'
import classNames from 'classnames'
import type { AlertProps } from '@gusto/embedded-react-sdk'
import styles from './Alert.module.scss'

const defaultIcons: Record<NonNullable<AlertProps['status']>, ReactNode> = {
  info: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 9v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="6" r="1" fill="currentColor" />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 2.5L18.5 17.5H1.5L10 2.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M10 8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10" cy="14.5" r="1" fill="currentColor" />
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="14" r="1" fill="currentColor" />
    </svg>
  ),
  success: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6 10.5l2.5 2.5L14 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
}

export function Alert({
  status = 'info',
  label,
  children,
  icon,
  className,
  onDismiss,
  disableScrollIntoView = false,
}: AlertProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (disableScrollIntoView) return
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    ref.current?.focus()
  }, [disableScrollIntoView])

  return (
    <div
      ref={ref}
      role="region"
      aria-label={label}
      tabIndex={-1}
      data-status={status}
      className={classNames(styles.root, className)}
    >
      <span className={styles.icon}>{icon ?? defaultIcons[status]}</span>
      <div className={styles.body}>
        <p className={styles.label}>{label}</p>
        {children && <div className={styles.content}>{children}</div>}
      </div>
      {onDismiss && (
        <button type="button" aria-label="Dismiss" onClick={onDismiss} className={styles.dismiss}>
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path
              d="M2 2l10 10M12 2L2 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
