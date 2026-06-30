import type { ReactNode } from 'react'
import type { Garnishment } from '@gusto/embedded-api-v-2026-06-15/models/components/garnishment'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

/**
 * Presentational confirm dialog for deleting a deduction. All copy is
 * passed in by the caller so each consumer owns its own translation strings
 * — partner overrides on one flow's namespace won't leak into another.
 *
 * @internal
 */
export function DeleteDeductionDialog({
  pendingDeleteDeduction,
  isPrimaryActionLoading,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
}: {
  pendingDeleteDeduction: Garnishment | null
  isPrimaryActionLoading: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: ReactNode
  confirmLabel: string
  cancelLabel: string
}) {
  const Components = useComponentContext()
  return (
    <Components.Dialog
      isOpen={pendingDeleteDeduction !== null}
      onClose={onClose}
      onPrimaryActionClick={onConfirm}
      isPrimaryActionLoading={isPrimaryActionLoading}
      isDestructive
      title={title}
      primaryActionLabel={confirmLabel}
      closeActionLabel={cancelLabel}
    >
      {pendingDeleteDeduction && description}
    </Components.Dialog>
  )
}
