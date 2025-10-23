import { useTranslation } from 'react-i18next'
import { useBankAccount } from './context'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function AccountView() {
  const { bankAccount } = useBankAccount()
  const { t } = useTranslation('Company.BankAccount')
  const Components = useComponentContext()

  return (
    <Components.DescriptionList
      items={[
        {
          term: <Components.Text>{t('routingNumberLabel')}</Components.Text>,
          description: <Components.Text>{bankAccount?.routingNumber}</Components.Text>,
        },
        {
          term: <Components.Text>{t('accountNumberLabel')}</Components.Text>,
          description: <Components.Text>{bankAccount?.hiddenAccountNumber}</Components.Text>,
        },
      ]}
    />
  )
}
