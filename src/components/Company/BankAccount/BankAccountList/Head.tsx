import { useTranslation } from 'react-i18next'
import { Alert } from '@/components/Common/Alert/Alert'
import VerificationPendingIcon from '@/assets/icons/verification_pending.svg?react'
import { Button } from '@/components/Common'

export function Head() {
  const { t } = useTranslation('Company.BankAccount')

  return (
    <header>
      <h2>{t('addBankAccountTitle')}</h2>
      <p>{t('addBankAccountDescription')}</p>
      <Alert label={t('verificationPendingTitle')} icon={VerificationPendingIcon}>
        <p>{t('verificationPendingDescription')}</p>
        <Button variant="secondary" onPress={() => {}} isDisabled>
          {t('verifyBankAccountCta')}
        </Button>
      </Alert>
    </header>
  )
}
