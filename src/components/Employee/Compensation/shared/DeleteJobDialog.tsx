import { useTranslation } from 'react-i18next'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export interface PendingDeleteJob {
  jobId: string
  jobTitle: string
}

export interface DeleteJobDialogProps {
  pendingDeleteJob: PendingDeleteJob | null
  isPrimaryActionLoading: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeleteJobDialog({
  pendingDeleteJob,
  isPrimaryActionLoading,
  onClose,
  onConfirm,
}: DeleteJobDialogProps) {
  const { t } = useTranslation('Employee.Compensation')
  const Components = useComponentContext()

  return (
    <Components.Dialog
      isOpen={pendingDeleteJob !== null}
      onClose={onClose}
      onPrimaryActionClick={onConfirm}
      isPrimaryActionLoading={isPrimaryActionLoading}
      isDestructive
      title={t('management.deleteJobDialog.title')}
      primaryActionLabel={t('management.deleteJobDialog.confirmCta')}
      closeActionLabel={t('management.deleteJobDialog.closeCta')}
    >
      {pendingDeleteJob &&
        t('management.deleteJobDialog.description', { jobTitle: pendingDeleteJob.jobTitle })}
    </Components.Dialog>
  )
}
