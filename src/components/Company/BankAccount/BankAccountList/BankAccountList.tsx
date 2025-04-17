import type { CompanyBankAccount } from '@gusto/embedded-api/models/components/companybankaccount'
import { Head } from './Head'
import { AccountView } from './AccountView'
import { BankAccountProvider } from './BankAccountListContext'
import { Actions } from './Actions'
import type { BaseComponentInterface, CommonComponentInterface } from '@/components/Base/Base'
import { BaseComponent, useBase } from '@/components/Base/Base'
import { useI18n } from '@/i18n/I18n'
import { Flex } from '@/components/Common/Flex/Flex'

interface BankAccountListProps extends CommonComponentInterface {
  companyId: string
  bankAccount: CompanyBankAccount | null
}

export function BankAccountList(props: BankAccountListProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}
function Root({ companyId, className, children, bankAccount = null }: BankAccountListProps) {
  useI18n('Company.BankAccount')
  const { onEvent } = useBase()

  return (
    <section className={className}>
      <BankAccountProvider
        value={{
          bankAccount,
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
