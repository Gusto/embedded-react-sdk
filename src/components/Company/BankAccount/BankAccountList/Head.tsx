import { useTranslation } from 'react-i18next'
import { useBankAccount } from './context'
import VerificationPendingIcon from '@/assets/icons/verification_pending.svg?react'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common/Flex/Flex'

export function Head() {
  const { bankAccount, showVerifiedMessage, handleVerification } = useBankAccount()
  const { t } = useTranslation('Company.BankAccount')
  const Components = useComponentContext()

  return (
    <>
      <Flex flexDirection="column" gap={4}>
        <Components.Heading as="h2">{t('addBankAccountTitle')}</Components.Heading>
        <Components.Text variant="supporting">{t('addBankAccountDescription')}</Components.Text>
      </Flex>
      <Flex flexDirection="column" gap={16}>
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
      </Flex>
    </>
  )
}
