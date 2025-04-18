import { useTranslation } from 'react-i18next'
import { useBankAccount } from './context'

export function AccountView() {
  const { bankAccount } = useBankAccount()
  const { t } = useTranslation('Company.BankAccount')

  return (
    <dl>
      <div>
        <dt>{t('routingNumberLabel')}</dt>
        <dd>{bankAccount?.routingNumber}</dd>
      </div>
      <div>
        <dt>{t('accountNumberLabel')}</dt>
        <dd>{bankAccount?.hiddenAccountNumber}</dd>
      </div>
    </dl>
  )
}
