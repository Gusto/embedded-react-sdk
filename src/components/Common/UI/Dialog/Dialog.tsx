import { useRef } from 'react'
import { Button } from '../Button/Button'
import { Grid } from '../../Grid/Grid'
import { type DialogProps, DialogDefaults } from './DialogTypes'
import styles from './Dialog.module.scss'
import { applyMissingDefaults } from '@/helpers/applyMissingDefaults'
import { useContainerBreakpoints } from '@/hooks/useContainerBreakpoints/useContainerBreakpoints'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

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

  const Components = useComponentContext()

  const modalContainerRef = useRef<HTMLDivElement>(null)
  const breakpoints = useContainerBreakpoints({
    ref: modalContainerRef,
  })

  const gridColumns = breakpoints.includes('small') ? ['1fr', '1fr'] : '1fr'

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

  const dialogContent = (
    <>
      {title && <div className={styles.title}>{title}</div>}
      {children && <div className={styles.body}>{children}</div>}
    </>
  )

  const dialogFooter = (
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
  )

  return (
    <Components.Modal
      isOpen={isOpen}
      onClose={onClose}
      shouldCloseOnBackdropClick={shouldCloseOnBackdropClick}
      containerRef={modalContainerRef}
      footer={dialogFooter}
    >
      {dialogContent}
    </Components.Modal>
  )
}
