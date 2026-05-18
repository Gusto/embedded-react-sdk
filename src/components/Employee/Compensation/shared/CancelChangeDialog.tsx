import { useTranslation } from 'react-i18next'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { formatDateLongWithYear } from '@/helpers/dateFormatting'

export interface PendingCompensationChange {
  compensationId: string
  effectiveDate: string
  jobTitle: string
}

export interface CancelChangeDialogProps {
  pendingChange: PendingCompensationChange | null
  isPrimaryActionLoading: boolean
  onClose: () => void
  onConfirm: () => void
}

export function CancelChangeDialog({
  pendingChange,
  isPrimaryActionLoading,
  onClose,
  onConfirm,
}: CancelChangeDialogProps) {
  const { t } = useTranslation('Employee.Compensation')
  const Components = useComponentContext()

  return (
    <Components.Dialog
      isOpen={pendingChange !== null}
      onClose={onClose}
      onPrimaryActionClick={onConfirm}
      isPrimaryActionLoading={isPrimaryActionLoading}
      isDestructive
      title={t('management.cancelChangeDialog.title')}
      primaryActionLabel={t('management.cancelChangeDialog.confirmCta')}
      closeActionLabel={t('management.cancelChangeDialog.closeCta')}
    >
      {pendingChange &&
        t('management.cancelChangeDialog.description', {
          date: formatDateLongWithYear(pendingChange.effectiveDate) || pendingChange.effectiveDate,
        })}
    </Components.Dialog>
  )
}
