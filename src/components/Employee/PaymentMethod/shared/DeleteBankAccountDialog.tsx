import { useTranslation } from 'react-i18next'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function DeleteBankAccountDialog({
  pendingDeleteAccount,
  isPrimaryActionLoading,
  onClose,
  onConfirm,
}: {
  pendingDeleteAccount: { uuid: string; hiddenAccountNumber: string | undefined } | null
  isPrimaryActionLoading: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  const { t } = useTranslation('Employee.PaymentMethod')
  const Components = useComponentContext()
  return (
    <Components.Dialog
      isOpen={pendingDeleteAccount !== null}
      onClose={onClose}
      onPrimaryActionClick={onConfirm}
      isPrimaryActionLoading={isPrimaryActionLoading}
      isDestructive
      title={t('deleteBankAccountDialog.title')}
      primaryActionLabel={t('deleteBankAccountDialog.confirmCta')}
      closeActionLabel={t('deleteBankAccountDialog.cancelCta')}
    >
      {pendingDeleteAccount &&
        t('deleteBankAccountDialog.description', {
          account: pendingDeleteAccount.hiddenAccountNumber ?? '',
        })}
    </Components.Dialog>
  )
}
