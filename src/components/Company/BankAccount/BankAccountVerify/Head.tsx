import { useTranslation } from 'react-i18next'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function Head() {
  const { t } = useTranslation('Company.BankAccount')
  const Components = useComponentContext()

  return (
    <header>
      <Components.Heading as="h2">{t('verifyBankAccountTitle')}</Components.Heading>
      <p>{t('verifyBankAccountDescription')}</p>
    </header>
  )
}
