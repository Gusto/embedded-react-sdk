import { useRef } from 'react'
import { Grid } from '../../Grid/Grid'
import { type DialogProps, DialogDefaults } from './DialogTypes'
import styles from './Dialog.module.scss'
import { applyMissingDefaults } from '@/helpers/applyMissingDefaults'
import { useContainerBreakpoints } from '@/hooks/useContainerBreakpoints/useContainerBreakpoints'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

/**
 * Modal dialog with a title, body, primary action, and close action.
 *
 * @remarks
 * Renders through the ComponentsContext adapter, so partners can override the
 * underlying `Modal` and `Button` primitives with their own design system.
 *
 * @param rawProps - Dialog configuration including labels, open state, and action callbacks.
 * @returns The rendered dialog element.
 * @internal
 */
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
      <Components.Button variant="secondary" onClick={handleClose}>
        {closeActionLabel}
      </Components.Button>
      <Components.Button
        variant={isDestructive ? 'error' : 'primary'}
        onClick={handlePrimaryAction}
        isLoading={isPrimaryActionLoading}
      >
        {primaryActionLabel}
      </Components.Button>
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
