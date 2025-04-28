import { useTranslation } from 'react-i18next'
import { useBankAccount } from './context'
import { ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function Actions() {
  const { handleContinue, handleChange } = useBankAccount()
  const { t } = useTranslation('Company.BankAccount')
  const Components = useComponentContext()

  return (
    <ActionsLayout>
      <Components.Button variant="secondary" onClick={handleChange}>
        {t('changeBankAccountCta')}
      </Components.Button>
      <Components.Button onClick={handleContinue}>{t('continueCta')}</Components.Button>
    </ActionsLayout>
  )
}
