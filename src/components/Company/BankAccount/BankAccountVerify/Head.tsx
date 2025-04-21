import { useTranslation } from 'react-i18next'

export function Head() {
  const { t } = useTranslation('Company.BankAccount')

  return (
    <header>
      <h2>{t('verifyBankAccountTitle')}</h2>
      <p>{t('verifyBankAccountDescription')}</p>
    </header>
  )
}
