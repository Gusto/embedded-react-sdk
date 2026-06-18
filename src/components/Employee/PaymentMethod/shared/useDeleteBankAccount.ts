import { useState } from 'react'

/** @internal */
export function useDeleteBankAccount(handleDelete: (uuid: string) => Promise<void>) {
  const [pendingDeleteAccount, setPendingDeleteAccount] = useState<{
    uuid: string
    hiddenAccountNumber: string | undefined
  } | null>(null)
  const [deletedAccountNumber, setDeletedAccountNumber] = useState<string | null>(null)

  const handleConfirmDelete = async () => {
    if (!pendingDeleteAccount) return
    const { uuid, hiddenAccountNumber } = pendingDeleteAccount
    setPendingDeleteAccount(null)
    await handleDelete(uuid)
    setDeletedAccountNumber(hiddenAccountNumber ?? '')
  }

  return {
    pendingDeleteAccount,
    setPendingDeleteAccount,
    deletedAccountNumber,
    setDeletedAccountNumber,
    handleConfirmDelete,
  }
}
