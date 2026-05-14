import { useState } from 'react'

export function useDeleteBankAccount(handleDelete: (uuid: string) => Promise<void>) {
  const [pendingDeleteAccount, setPendingDeleteAccount] = useState<{
    uuid: string
    hiddenAccountNumber: string | undefined
  } | null>(null)
  const [deletedAccountNumber, setDeletedAccountNumber] = useState<string | null>(null)

  const handleConfirmDelete = async () => {
    if (!pendingDeleteAccount) return
    const { uuid, hiddenAccountNumber } = pendingDeleteAccount
    await handleDelete(uuid)
    setPendingDeleteAccount(null)
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
