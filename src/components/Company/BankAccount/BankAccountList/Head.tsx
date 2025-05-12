import { useTranslation } from 'react-i18next'
import { useBankAccount } from './context'
import VerificationPendingIcon from '@/assets/icons/verification_pending.svg?react'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function Head() {
  const { bankAccount, showVerifiedMessage, handleVerification } = useBankAccount()
  const { t } = useTranslation('Company.BankAccount')
  const Components = useComponentContext()

  return (
    <header>
      <Components.Heading as="h2">{t('addBankAccountTitle')}</Components.Heading>
      <Components.Text>{t('addBankAccountDescription')}</Components.Text>
      {bankAccount?.verificationStatus != 'verified' && (
        <Components.Alert
          //@ts-expect-error: typescript limitation
          label={t(`verificationAlert.${bankAccount?.verificationStatus}.label`)}
          icon={<VerificationPendingIcon />}
        >
          <Components.Text>
            {/*@ts-expect-error: typescript limitation */}
            {t(`verificationAlert.${bankAccount?.verificationStatus}.description`, {
              number: bankAccount?.hiddenAccountNumber,
            })}
          </Components.Text>
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
