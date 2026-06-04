import type { ReactNode } from 'react'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

/**
 * Presentational confirm dialog for deleting a bank account. All copy is
 * passed in by the caller so each consumer owns its own translation strings
 * — partner overrides on one flow's namespace won't leak into another.
 */
export function DeleteBankAccountDialog({
  pendingDeleteAccount,
  isPrimaryActionLoading,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
}: {
  pendingDeleteAccount: { uuid: string; hiddenAccountNumber: string | undefined } | null
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
      isOpen={pendingDeleteAccount !== null}
      onClose={onClose}
      onPrimaryActionClick={onConfirm}
      isPrimaryActionLoading={isPrimaryActionLoading}
      isDestructive
      title={title}
      primaryActionLabel={confirmLabel}
      closeActionLabel={cancelLabel}
    >
      {pendingDeleteAccount && description}
    </Components.Dialog>
  )
}
