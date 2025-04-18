import type { CompanyBankAccount } from '@gusto/embedded-api/models/components/companybankaccount'
import { Head } from './Head'
import { AccountView } from './AccountView'
import { BankAccountProvider } from './context'
import { Actions } from './Actions'
import type { BaseComponentInterface, CommonComponentInterface } from '@/components/Base/Base'
import { BaseComponent, useBase } from '@/components/Base/Base'
import { useI18n } from '@/i18n/I18n'
import { Flex } from '@/components/Common/Flex/Flex'
import { componentEvents } from '@/shared/constants'

interface BankAccountListProps extends CommonComponentInterface {
  bankAccount: CompanyBankAccount | null
  showVerifiedMessage?: boolean
}

export function BankAccountList(props: BankAccountListProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}
function Root({
  className,
  children,
  bankAccount = null,
  showVerifiedMessage = false,
}: BankAccountListProps) {
  useI18n('Company.BankAccount')
  const { onEvent } = useBase()

  const handleVerification = () => {
    onEvent(componentEvents.COMPANY_BANK_ACCOUNT_VERIFY, bankAccount)
  }
  const handleContinue = () => {
    onEvent(componentEvents.COMPANY_BANK_ACCOUNT_DONE)
  }
  const handleChange = () => {
    onEvent(componentEvents.COMPANY_BANK_ACCOUNT_CHANGE)
  }

  return (
    <section className={className}>
      <BankAccountProvider
        value={{
          bankAccount,
          showVerifiedMessage,
          handleVerification,
          handleContinue,
          handleChange,
        }}
      >
        <Flex flexDirection="column" gap={32}>
          {children ? (
            children
          ) : (
            <>
              <Head />
              <AccountView />
              <Actions />
            </>
          )}
        </Flex>
      </BankAccountProvider>
    </section>
  )
}
BankAccountList.Head = Head
BankAccountList.AccountView = AccountView
BankAccountList.Actions = Actions
