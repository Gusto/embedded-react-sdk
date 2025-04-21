import { useTranslation } from 'react-i18next'

export function Head() {
  const { t } = useTranslation('Company.BankAccount')

  return (
    <header>
      <h2>{t('addBankAccountTitle')}</h2>
      <p>{t('addBankAccountDescription')}</p>
    </header>
  )
}
