import { useEffect, useId, useRef } from 'react'
import { type AlertProps } from './AlertTypes'
import styles from './Alert.module.scss'
import InfoIcon from '@/assets/icons/info.svg?react'
import SuccessIcon from '@/assets/icons/success_check.svg?react'
import WarningIcon from '@/assets/icons/warning.svg?react'
import ErrorIcon from '@/assets/icons/error.svg?react'

export function Alert({ label, children, variant = 'info', icon }: AlertProps) {
  const id = useId()
  const alertRef = useRef<HTMLDivElement>(null)
  const IconComponent = icon
    ? icon
    : variant === 'info'
      ? InfoIcon
      : variant === 'success'
        ? SuccessIcon
        : variant === 'warning'
          ? WarningIcon
          : ErrorIcon

  useEffect(() => {
    if (alertRef.current) alertRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <div className={styles.root}>
      <div
        className={styles.alert}
        role="alert"
        aria-labelledby={id}
        data-variant={variant}
        ref={alertRef}
      >
        <div className={styles.icon}>
          <IconComponent aria-hidden />
        </div>
        <h6 id={id}>{label}</h6>
        {children}
      </div>
    </div>
  )
}
