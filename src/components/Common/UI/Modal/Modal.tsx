import { useLayoutEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import { type ModalProps, ModalDefaults } from './ModalTypes'
import styles from './Modal.module.scss'
import { applyMissingDefaults } from '@/helpers/applyMissingDefaults'
import { useContainerBreakpoints } from '@/hooks/useContainerBreakpoints/useContainerBreakpoints'
import { useOverflowDetection } from '@/hooks/useOverflowDetection/useOverflowDetection'
import { useForkRef } from '@/hooks/useForkRef/useForkRef'
import { transitionDuration } from '@/contexts/ThemeProvider/theme'

export function Modal(rawProps: ModalProps) {
  const resolvedProps = applyMissingDefaults(rawProps, ModalDefaults)
  const { isOpen, onClose, shouldCloseOnBackdropClick, children, footer, containerRef } =
    resolvedProps

  const dialogRef = useRef<HTMLDialogElement>(null)
  const internalBackdropRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Use callback ref to sync both internal and external refs
  const backdropCallbackRef = useForkRef(internalBackdropRef, containerRef)

  const breakpoints = useContainerBreakpoints({
    ref: internalBackdropRef,
  })

  const isOverflowing = useOverflowDetection({
    ref: contentRef,
  })

  const [isExiting, setIsExiting] = useState(false)
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isSmallOrLarger = breakpoints.includes('small')

  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current)
    }

    if (isOpen && !dialog.open) {
      dialog.showModal()
      requestAnimationFrame(() => {
        dialog.setAttribute('data-show', 'true')
      })
    } else if (!isOpen && dialog.open) {
      setIsExiting(true)
      transitionTimeoutRef.current = setTimeout(() => {
        dialog.close()
        dialog.removeAttribute('data-show')
        setIsExiting(false)
      }, transitionDuration)
    }

    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
      }
    }
  }, [isOpen])

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && shouldCloseOnBackdropClick) {
      onClose?.()
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      onClose?.()
    }
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClose={handleClose}
      data-exiting={isExiting || undefined}
    >
      <div
        ref={backdropCallbackRef}
        className={classNames(styles.backdrop, {
          [styles.backdropSmall as string]: isSmallOrLarger,
        })}
        onClick={handleBackdropClick}
        onKeyDown={handleKeyDown}
        role="presentation"
      >
        <div
          ref={modalRef}
          className={classNames(styles.modal, {
            [styles.modalSmall as string]: isSmallOrLarger,
            [styles.modalOverflowing as string]: isOverflowing,
          })}
        >
          {children && (
            <div
              ref={contentRef}
              className={classNames(styles.content, {
                [styles.contentScrollable as string]: isOverflowing,
              })}
            >
              {children}
            </div>
          )}
          {footer && (
            <div
              className={classNames(styles.footer, {
                [styles.footerFixed as string]: isOverflowing,
              })}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </dialog>
  )
}
