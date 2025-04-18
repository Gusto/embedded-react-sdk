import { useTranslation } from 'react-i18next'
import { useBankAccount } from './context'
import { Alert } from '@/components/Common/Alert/Alert'
import VerificationPendingIcon from '@/assets/icons/verification_pending.svg?react'
import { Button } from '@/components/Common'

export function Head() {
  const { bankAccount, showVerifiedMessage, handleVerification } = useBankAccount()
  const { t } = useTranslation('Company.BankAccount')

  return (
    <header>
      <h2>{t('addBankAccountTitle')}</h2>
      <p>{t('addBankAccountDescription')}</p>
      {bankAccount?.verificationStatus != 'verified' && (
        <Alert
          //@ts-expect-error: typescript limitation
          label={t(`verificationAlert.${bankAccount?.verificationStatus}.label`)}
          icon={VerificationPendingIcon}
        >
          <p>
            {/*@ts-expect-error: typescript limitation */}
            {t(`verificationAlert.${bankAccount?.verificationStatus}.description`, {
              number: bankAccount?.hiddenAccountNumber,
            })}
          </p>
          <Button
            variant="secondary"
            onPress={handleVerification}
            isDisabled={bankAccount?.verificationStatus !== 'ready_for_verification'}
          >
            {t('verifyBankAccountCta')}
          </Button>
        </Alert>
      )}
      {showVerifiedMessage && (
        <Alert label={t('verificationAlert.verified.label')} variant="success"></Alert>
      )}
    </header>
  )
}
