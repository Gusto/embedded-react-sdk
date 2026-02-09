import { useTranslation } from 'react-i18next'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

interface CreateOffCyclePayrollPresentationProps {
  onContinue: () => void
}

export function CreateOffCyclePayrollPresentation({
  onContinue,
}: CreateOffCyclePayrollPresentationProps) {
  const { t } = useTranslation('Payroll.CreateOffCyclePayroll')
  const { Heading, Button } = useComponentContext()

  return (
    <div>
      <Heading as="h2">{t('pageTitle')}</Heading>
      <Button variant="primary" onClick={onContinue}>
        {t('continueButton')}
      </Button>
    </div>
  )
}
