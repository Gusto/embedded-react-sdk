import { useEffect, type MouseEvent } from 'react'
import classNames from 'classnames'
import type { DialogProps } from '@gusto/embedded-react-sdk'
import styles from './Dialog.module.scss'

export function Dialog({
  isOpen = false,
  onClose,
  onPrimaryActionClick,
  isDestructive = false,
  isPrimaryActionLoading = false,
  primaryActionLabel,
  closeActionLabel,
  title,
  children,
  shouldCloseOnBackdropClick = false,
}: DialogProps) {
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('keydown', handleKey)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && shouldCloseOnBackdropClick) {
      onClose?.()
    }
  }

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div role="alertdialog" aria-modal="true" className={styles.dialog}>
        {title && <h2 className={styles.title}>{title}</h2>}
        {children && <div className={styles.body}>{children}</div>}
        <div className={styles.actions}>
          <button type="button" onClick={onClose} className={styles.secondaryButton}>
            {closeActionLabel}
          </button>
          <button
            type="button"
            onClick={onPrimaryActionClick}
            disabled={isPrimaryActionLoading}
            className={classNames(styles.primaryButton, {
              [styles.primaryButtonDestructive as string]: isDestructive,
            })}
          >
            {isPrimaryActionLoading ? '…' : primaryActionLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
