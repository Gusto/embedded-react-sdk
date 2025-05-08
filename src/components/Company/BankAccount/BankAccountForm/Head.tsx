import { useTranslation } from 'react-i18next'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function Head() {
  const { t } = useTranslation('Company.BankAccount')
  const Components = useComponentContext()

  return (
    <header>
      <Components.Heading as="h2">{t('addBankAccountTitle')}</Components.Heading>
      <p>{t('addBankAccountDescription')}</p>
    </header>
  )
}
