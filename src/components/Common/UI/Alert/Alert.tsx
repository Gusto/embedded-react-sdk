import { useEffect, useId, useRef } from 'react'
import classNames from 'classnames'
import { type AlertProps } from './AlertTypes'
import styles from './Alert.module.scss'
import InfoIcon from '@/assets/icons/info.svg?react'
import SuccessIcon from '@/assets/icons/success_check.svg?react'
import WarningIcon from '@/assets/icons/warning.svg?react'
import ErrorIcon from '@/assets/icons/error.svg?react'

export function Alert({ label, children, status = 'info', icon, className }: AlertProps) {
  const id = useId()
  const alertRef = useRef<HTMLDivElement>(null)
  const defaultIcon =
    status === 'info' ? (
      <InfoIcon aria-hidden />
    ) : status === 'success' ? (
      <SuccessIcon aria-hidden />
    ) : status === 'warning' ? (
      <WarningIcon aria-hidden />
    ) : (
      <ErrorIcon aria-hidden />
    )

  useEffect(() => {
    if (alertRef.current) alertRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <div className={classNames(styles.root, className)}>
      <div
        className={styles.alert}
        role="alert"
        aria-labelledby={id}
        data-variant={status}
        ref={alertRef}
      >
        <div className={styles.icon}>{icon || defaultIcon}</div>
        <h6 id={id}>{label}</h6>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  )
}
