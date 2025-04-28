import { useTranslation } from 'react-i18next'
import { useStateTaxesList } from './context'
import { ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function Actions() {
  const { t } = useTranslation('Company.StateTaxes')
  const Components = useComponentContext()
  const { handleContinue } = useStateTaxesList()
  return (
    <ActionsLayout>
      <Components.Button variant="primary" onClick={handleContinue}>
        {t('list.continueCta')}
      </Components.Button>
    </ActionsLayout>
  )
}
