import { useTranslation } from 'react-i18next'
import { useStateTaxesForm } from './context'
import { Button, ActionsLayout } from '@/components/Common'

export function Actions() {
  const { t } = useTranslation('Company.StateTaxes', { keyPrefix: 'form' })
  const { handleCancel } = useStateTaxesForm()

  return (
    <ActionsLayout>
      <Button variant="secondary" onClick={handleCancel}>
        {t('cancelCta')}
      </Button>
      <Button variant="primary" type="submit">
        {t('saveCta')}
      </Button>
    </ActionsLayout>
  )
}
