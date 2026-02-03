import type { PayrollSubmissionBlockerType } from '@gusto/embedded-api/models/components/payrollsubmissionblockertype'
import { useTranslation } from 'react-i18next'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

interface GenericBlockerProps {
  blocker: PayrollSubmissionBlockerType
}

export const GenericBlocker = ({ blocker }: GenericBlockerProps) => {
  const { Banner, Text } = useComponentContext()
  const { t } = useTranslation('Contractor.Payments.CreatePayment')

  return (
    <Banner
      status="error"
      title={blocker.blockerName || t('previewPresentation.submissionBlockers.genericBlockerTitle')}
    >
      <Text>{t('previewPresentation.submissionBlockers.genericBlockerMessage')}</Text>
    </Banner>
  )
}
