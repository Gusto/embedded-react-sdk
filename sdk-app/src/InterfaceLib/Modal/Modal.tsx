import { useLayoutEffect, useRef, type KeyboardEvent, type MouseEvent } from 'react'
import type { ModalProps } from '@gusto/embedded-react-sdk'
import styles from './Modal.module.scss'

export function Modal({
  isOpen = false,
  onClose,
  shouldCloseOnBackdropClick = false,
  children,
  footer,
  containerRef,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen && !dialog.open) {
      dialog.showModal()
    } else if (!isOpen && dialog.open) {
      dialog.close()
    }
  }, [isOpen])

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && shouldCloseOnBackdropClick) {
      onClose?.()
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') onClose?.()
  }

  return (
    <dialog ref={dialogRef} className={styles.dialog} onClose={onClose}>
      <div
        ref={containerRef}
        role="presentation"
        className={styles.backdrop}
        onClick={handleBackdropClick}
        onKeyDown={handleKeyDown}
      >
        <div className={styles.modal}>
          {children && <div className={styles.body}>{children}</div>}
          {footer && <div className={styles.footer}>{footer}</div>}
        </div>
      </div>
    </dialog>
  )
}
