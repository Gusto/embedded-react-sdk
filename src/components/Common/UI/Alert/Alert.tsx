import { useEffect, useId, useRef } from 'react'
import classNames from 'classnames'
import { ButtonIcon } from '../Button/ButtonIcon'
import { type AlertProps } from './AlertTypes'
import styles from './Alert.module.scss'
import InfoIcon from '@/assets/icons/info.svg?react'
import SuccessIcon from '@/assets/icons/success_check.svg?react'
import WarningIcon from '@/assets/icons/warning.svg?react'
import ErrorIcon from '@/assets/icons/error.svg?react'
import CloseIcon from '@/assets/icons/close.svg?react'

export function Alert({
  label,
  children,
  status = 'info',
  icon,
  className,
  onDismiss,
}: AlertProps) {
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
        <div className={styles.contentWrapper}>
          <h6 id={id}>{label}</h6>
          <div className={styles.content}>{children}</div>
        </div>
        {onDismiss && (
          <div className={styles.dismiss}>
            <ButtonIcon variant="tertiary" onClick={onDismiss} aria-label="Dismiss alert">
              <CloseIcon width={36} height={36} />
            </ButtonIcon>
          </div>
        )}
      </div>
    </div>
  )
}
