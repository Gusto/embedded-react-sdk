import { useTranslation } from 'react-i18next'
import { useBankAccount } from './context'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function AccountView() {
  const { bankAccount } = useBankAccount()
  const { t } = useTranslation('Company.BankAccount')
  const Components = useComponentContext()

  return (
    <dl>
      <div>
        <dt>
          <Components.Text>{t('routingNumberLabel')}</Components.Text>
        </dt>
        <dd>
          <Components.Text>{bankAccount?.routingNumber}</Components.Text>
        </dd>
      </div>
      <div>
        <dt>
          <Components.Text>{t('accountNumberLabel')}</Components.Text>
        </dt>
        <dd>
          <Components.Text>{bankAccount?.hiddenAccountNumber}</Components.Text>
        </dd>
      </div>
    </dl>
  )
}
