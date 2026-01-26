import { useEffect, useId, useRef } from 'react'
import classNames from 'classnames'
import { ButtonIcon } from '../Button/ButtonIcon'
import { type AlertProps, AlertDefaults } from './AlertTypes'
import styles from './Alert.module.scss'
import { applyMissingDefaults } from '@/helpers/applyMissingDefaults'
import InfoIcon from '@/assets/icons/info.svg?react'
import SuccessIcon from '@/assets/icons/success_check.svg?react'
import WarningIcon from '@/assets/icons/warning.svg?react'
import ErrorIcon from '@/assets/icons/error.svg?react'
import CloseIcon from '@/assets/icons/close.svg?react'

export function Alert(rawProps: AlertProps) {
  const resolvedProps = applyMissingDefaults(rawProps, AlertDefaults)
  const {
    label,
    children,
    status,
    icon,
    className,
    onDismiss,
    disableScrollIntoView,
    alertConfig,
  } = resolvedProps

  const effectiveStatus = alertConfig?.status ?? status
  const effectiveLabel = alertConfig?.content ?? label ?? ''
  const effectiveChildren = alertConfig?.description ?? children
  const effectiveIcon = alertConfig?.icon ?? icon

  const id = useId()
  const alertRef = useRef<HTMLDivElement>(null)
  const defaultIcon =
    effectiveStatus === 'info' ? (
      <InfoIcon aria-hidden />
    ) : effectiveStatus === 'success' ? (
      <SuccessIcon aria-hidden />
    ) : effectiveStatus === 'warning' ? (
      <WarningIcon aria-hidden />
    ) : (
      <ErrorIcon aria-hidden />
    )

  useEffect(() => {
    if (!disableScrollIntoView && alertRef.current) {
      alertRef.current.scrollIntoView({ behavior: 'smooth' })
      alertRef.current.focus()
    }
  }, [disableScrollIntoView])

  return (
    <div className={classNames(styles.root, className)}>
      <div
        className={styles.alert}
        role="alert"
        aria-labelledby={id}
        data-variant={effectiveStatus}
        ref={alertRef}
        tabIndex={-1}
      >
        <div className={styles.header}>
          <div className={styles.iconLabelContainer}>
            <div className={styles.icon}>{effectiveIcon || defaultIcon}</div>
            <h6 id={id}>{effectiveLabel}</h6>
            {onDismiss && (
              <div className={styles.dismiss}>
                <ButtonIcon variant="tertiary" onClick={onDismiss} aria-label="Dismiss alert">
                  <CloseIcon width={36} height={36} />
                </ButtonIcon>
              </div>
            )}
          </div>
        </div>
        <div className={styles.content}>{effectiveChildren}</div>
      </div>
    </div>
  )
}
