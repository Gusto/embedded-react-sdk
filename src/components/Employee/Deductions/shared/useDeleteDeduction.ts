import { useState } from 'react'
import type { Garnishment } from '@gusto/embedded-api/models/components/garnishment'

/**
 * Pending-state + confirm-handler companion for `DeleteDeductionDialog`.
 * Mirrors `useDeleteBankAccount` — the contract is: a row's menu calls
 * `setPendingDeleteDeduction(...)` to open the dialog, and the dialog's
 * confirm calls `handleConfirmDelete`, which in turn invokes the
 * caller-supplied `handleDelete(garnishment)`.
 *
 * @internal
 */
export function useDeleteDeduction(handleDelete: (garnishment: Garnishment) => Promise<void>) {
  const [pendingDeleteDeduction, setPendingDeleteDeduction] = useState<Garnishment | null>(null)

  const handleConfirmDelete = async () => {
    if (!pendingDeleteDeduction) return
    const target = pendingDeleteDeduction
    setPendingDeleteDeduction(null)
    await handleDelete(target)
  }

  return {
    pendingDeleteDeduction,
    setPendingDeleteDeduction,
    handleConfirmDelete,
  }
}
