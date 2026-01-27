import type { PayrollSubmissionBlockerType } from '@gusto/embedded-api/models/components/payrollsubmissionblockertype'
import { useTranslation } from 'react-i18next'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

interface GenericBlockerProps {
  blocker: PayrollSubmissionBlockerType
}

export const GenericBlocker = ({ blocker }: GenericBlockerProps) => {
  const { Banner, Text } = useComponentContext()
  const { t } = useTranslation('Payroll.PayrollOverview')

  return (
    <Banner
      status="error"
      title={blocker.blockerName || t('submissionBlockers.genericBlockerTitle')}
    >
      <Text>{t('submissionBlockers.genericBlockerMessage')}</Text>
    </Banner>
  )
}
