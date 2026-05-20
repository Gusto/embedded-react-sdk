import { useTranslation } from 'react-i18next'
import type { Garnishment } from '@gusto/embedded-api/models/components/garnishment'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function DeleteDeductionDialog({
  pendingDeleteDeduction,
  isPrimaryActionLoading,
  onClose,
  onConfirm,
}: {
  pendingDeleteDeduction: Garnishment | null
  isPrimaryActionLoading: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  const { t } = useTranslation('Employee.Deductions')
  const Components = useComponentContext()
  return (
    <Components.Dialog
      isOpen={pendingDeleteDeduction !== null}
      onClose={onClose}
      onPrimaryActionClick={onConfirm}
      isPrimaryActionLoading={isPrimaryActionLoading}
      isDestructive
      title={t('deleteDeductionDialog.title')}
      primaryActionLabel={t('deleteDeductionDialog.confirmCta')}
      closeActionLabel={t('deleteDeductionDialog.cancelCta')}
    >
      {pendingDeleteDeduction &&
        t('deleteDeductionDialog.description', {
          deduction: pendingDeleteDeduction.description ?? '',
        })}
    </Components.Dialog>
  )
}
