import { useTranslation } from 'react-i18next'
import { useBankAccount } from './context'
import { ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/ComponentsProvider'

export function Actions() {
  const { handleContinue, handleChange } = useBankAccount()
  const { t } = useTranslation('Company.BankAccount')
  const Components = useComponentContext()

  return (
    <ActionsLayout>
      <Components.ButtonSecondary onClick={handleChange}>
        {t('changeBankAccountCta')}
      </Components.ButtonSecondary>
      <Components.Button onClick={handleContinue}>{t('continueCta')}</Components.Button>
    </ActionsLayout>
  )
}
