import { useEffect, useRef, type ReactNode } from 'react'
import classNames from 'classnames'
import type { AlertProps } from '@gusto/embedded-react-sdk'
import styles from './Alert.module.scss'

const defaultIcons: Record<NonNullable<AlertProps['status']>, ReactNode> = {
  info: (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3C7.04 3 3 7.04 3 12C3 16.96 7.04 21 12 21C16.96 21 21 16.96 21 12C21 7.04 16.96 3 12 3ZM12 19C8.14 19 5 15.86 5 12C5 8.14 8.14 5 12 5C15.86 5 19 8.14 19 12C19 15.86 15.86 19 12 19ZM11 10.5V17H13V10.5H11ZM13.25 8.25C13.25 8.94036 12.6904 9.5 12 9.5C11.3096 9.5 10.75 8.94036 10.75 8.25C10.75 7.55964 11.3096 7 12 7C12.6904 7 13.25 7.55964 13.25 8.25Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  ),
  warning: (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11 9.00005H13V14.5H11V9.00005Z" fill="currentColor" />
      <path
        d="M12 18C12.6904 18 13.25 17.4404 13.25 16.75C13.25 16.0596 12.6904 15.5 12 15.5C11.3096 15.5 10.75 16.0596 10.75 16.75C10.75 17.4404 11.3096 18 12 18Z"
        fill="currentColor"
      />
      <path
        d="M12.866 2.17944C12.6874 1.87004 12.3573 1.67944 12 1.67944C11.6427 1.67944 11.3126 1.87004 11.134 2.17944L1.13397 19.5C0.955342 19.8094 0.955342 20.1905 1.13397 20.5C1.31261 20.8094 1.64273 21 2 21H22C22.3573 21 22.6874 20.8094 22.866 20.5C23.0447 20.1905 23.0447 19.8094 22.866 19.5L12.866 2.17944ZM12 4.67944L20.268 19H3.73205L12 4.67944Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  ),
  error: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="15" r="1" fill="currentColor" />
    </svg>
  ),
  success: (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12ZM5 12C5 15.86 8.14 19 12 19C15.86 19 19 15.86 19 12C19 8.14 15.86 5 12 5C8.14 5 5 8.14 5 12ZM8.71005 10.8L11 13.09L15.3101 8.80005L16.72 10.21L11.72 15.21L11.52 15.4 11.27 15.5 11.01 15.5C10.75 15.5 10.5 15.41 10.3 15.21L7.30005 12.21L8.71005 10.8Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
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
