import { useTranslation } from 'react-i18next'
import { useBankAccount } from './context'
import VerificationPendingIcon from '@/assets/icons/verification_pending.svg?react'
import { useComponentContext } from '@/contexts/ComponentAdapter/ComponentsProvider'

export function Head() {
  const { bankAccount, showVerifiedMessage, handleVerification } = useBankAccount()
  const { t } = useTranslation('Company.BankAccount')
  const Components = useComponentContext()

  return (
    <header>
      <h2>{t('addBankAccountTitle')}</h2>
      <p>{t('addBankAccountDescription')}</p>
      {bankAccount?.verificationStatus != 'verified' && (
        <Components.Alert
          //@ts-expect-error: typescript limitation
          label={t(`verificationAlert.${bankAccount?.verificationStatus}.label`)}
          icon={<VerificationPendingIcon />}
        >
          <p>
            {/*@ts-expect-error: typescript limitation */}
            {t(`verificationAlert.${bankAccount?.verificationStatus}.description`, {
              number: bankAccount?.hiddenAccountNumber,
            })}
          </p>
          <Components.Button
            variant="secondary"
            onClick={handleVerification}
            isDisabled={bankAccount?.verificationStatus !== 'ready_for_verification'}
          >
            {t('verifyBankAccountCta')}
          </Components.Button>
        </Components.Alert>
      )}
      {showVerifiedMessage && (
        <Components.Alert
          label={t('verificationAlert.verified.label')}
          status="success"
        ></Components.Alert>
      )}
    </header>
  )
}
