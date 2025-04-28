import { useTranslation } from 'react-i18next'
import { useStateTaxesForm } from './context'
import { ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function Actions() {
  const { t } = useTranslation('Company.StateTaxes', { keyPrefix: 'form' })
  const { handleCancel } = useStateTaxesForm()
  const Components = useComponentContext()

  return (
    <ActionsLayout>
      <Components.Button variant="secondary" onClick={handleCancel}>
        {t('cancelCta')}
      </Components.Button>
      <Components.Button variant="primary" type="submit">
        {t('saveCta')}
      </Components.Button>
    </ActionsLayout>
  )
}
