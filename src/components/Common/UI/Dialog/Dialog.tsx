import { useLayoutEffect, useRef, useState } from 'react'
import { Button } from '../Button/Button'
import { Grid } from '../../Grid/Grid'
import { type DialogProps, DialogDefaults } from './DialogTypes'
import styles from './Dialog.module.scss'
import { applyMissingDefaults } from '@/helpers/applyMissingDefaults'
import { useContainerBreakpoints } from '@/hooks/useContainerBreakpoints/useContainerBreakpoints'
import { transitionDuration } from '@/contexts/ThemeProvider/theme'

export function Dialog(rawProps: DialogProps) {
  const resolvedProps = applyMissingDefaults(rawProps, DialogDefaults)
  const {
    isOpen,
    onClose,
    onPrimaryActionClick,
    isDestructive,
    isPrimaryActionLoading,
    primaryActionLabel,
    closeActionLabel,
    title,
    children,
    shouldCloseOnBackdropClick,
  } = resolvedProps

  const dialogRef = useRef<HTMLDialogElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const breakpoints = useContainerBreakpoints({
    ref: backdropRef,
  })

  const [isExiting, setIsExiting] = useState(false)
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const gridColumns = breakpoints.includes('small') ? ['1fr', '1fr'] : '1fr'

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

  const handlePrimaryAction = () => {
    if (onPrimaryActionClick) {
      onPrimaryActionClick()
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
        ref={backdropRef}
        className={styles.backdrop}
        onClick={handleBackdropClick}
        onKeyDown={handleKeyDown}
        role="presentation"
      >
        <div className={styles.content}>
          {title && <div className={styles.title}>{title}</div>}
          {children && <div className={styles.body}>{children}</div>}
          <Grid gridTemplateColumns={gridColumns} gap={12} className={styles.actions}>
            <Button variant="secondary" onClick={handleClose}>
              {closeActionLabel}
            </Button>
            <Button
              variant={isDestructive ? 'error' : 'primary'}
              onClick={handlePrimaryAction}
              isLoading={isPrimaryActionLoading}
            >
              {primaryActionLabel}
            </Button>
          </Grid>
        </div>
      </div>
    </dialog>
  )
}
