import { useEffect, useId, useRef } from 'react'
import classNames from 'classnames'
import { Button } from '../Button/Button'
import { ButtonIcon } from '../Button/ButtonIcon'
import { type BannerProps, BannerDefaults } from './BannerTypes'
import styles from './Banner.module.scss'
import { applyMissingDefaults } from '@/helpers/applyMissingDefaults'
import InfoIcon from '@/assets/icons/info.svg?react'
import SuccessIcon from '@/assets/icons/success_check.svg?react'
import WarningIcon from '@/assets/icons/warning.svg?react'
import ErrorIcon from '@/assets/icons/error.svg?react'
import CloseIcon from '@/assets/icons/close.svg?react'

export function Banner(rawProps: BannerProps) {
  const resolvedProps = applyMissingDefaults(rawProps, BannerDefaults)
  const {
    label,
    description,
    status,
    icon,
    className,
    onDismiss,
    componentSlot,
    primaryAction,
    secondaryAction,
  } = resolvedProps
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
      <div className={styles.banner} role="alert" aria-labelledby={id} data-variant={status}>
        <div className={styles.header}>
          <div className={styles.labelContainer}>
            <div className={styles.icon}>{icon || defaultIcon}</div>
            <div className={styles.label}>{label}</div>
          </div>
          {onDismiss && (
            <div className={styles.dismiss}>
              <ButtonIcon variant="tertiary" onClick={onDismiss} aria-label="Dismiss alert">
                <CloseIcon width={36} height={36} />
              </ButtonIcon>
            </div>
          )}
        </div>
        <div className={styles.contentContainer}>
          <div className={styles.content}>
            {description}
            {componentSlot ? <div>{componentSlot}</div> : null}
            {(primaryAction || secondaryAction) && (
              <div className={styles.actions}>
                {primaryAction && (
                  <Button variant="secondary" onClick={primaryAction.onClick}>
                    {primaryAction.label}
                  </Button>
                )}
                {secondaryAction && (
                  <Button variant="tertiary" onClick={secondaryAction.onClick}>
                    {secondaryAction.label}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
