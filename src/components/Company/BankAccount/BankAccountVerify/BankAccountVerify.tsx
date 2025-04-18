import { Form as AriaForm } from 'react-aria-components'
import type { CompanyBankAccount } from '@gusto/embedded-api/models/components/companybankaccount'
import { FormProvider, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useBankAccountsVerifyMutation } from '@gusto/embedded-api/react-query/bankAccountsVerify'
import { Head } from './Head'
import { BankAccountVerifyProvider } from './context'
import type { BankAccountVerifyInputs } from './Form'
import { BankAccountVerifySchema, Form } from './Form'
import { Actions } from './Actions'
import type { BaseComponentInterface, CommonComponentInterface } from '@/components/Base/Base'
import { BaseComponent, useBase } from '@/components/Base/Base'
import { useI18n } from '@/i18n/I18n'
import { Flex } from '@/components/Common/Flex/Flex'
import { componentEvents } from '@/shared/constants'

interface BankAccountVerifyProps extends CommonComponentInterface {
  bankAccount: CompanyBankAccount
  companyId: string
}

export function BankAccountVerify(props: BankAccountVerifyProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}
function Root({ companyId, className, children, bankAccount }: BankAccountVerifyProps) {
  useI18n('Company.BankAccount')
  const { onEvent, baseSubmitHandler } = useBase()

  const { mutateAsync: verifyBankAccount, isPending } = useBankAccountsVerifyMutation()

  const { control, ...methods } = useForm<BankAccountVerifyInputs>({
    resolver: valibotResolver(BankAccountVerifySchema),
    defaultValues: {},
  })

  const onSubmit = async (data: BankAccountVerifyInputs) => {
    await baseSubmitHandler(data, async payload => {
      const { companyBankAccount } = await verifyBankAccount({
        request: { companyId, bankAccountUuid: bankAccount.uuid, requestBody: payload },
      })
      onEvent(componentEvents.COMPANY_BANK_ACCOUNT_VERIFIED, companyBankAccount)
    })
  }
  const handleCancel = () => {
    onEvent(componentEvents.CANCEL)
  }

  return (
    <section className={className}>
      <FormProvider {...methods} control={control}>
        <AriaForm onSubmit={methods.handleSubmit(onSubmit)}>
          <BankAccountVerifyProvider
            value={{
              bankAccount,
              isPending,
              handleCancel,
            }}
          >
            <Flex flexDirection="column" gap={32}>
              {children ? (
                children
              ) : (
                <>
                  <Head />
                  <Form />
                  <Actions />
                </>
              )}
            </Flex>
          </BankAccountVerifyProvider>
        </AriaForm>
      </FormProvider>
    </section>
  )
}
BankAccountVerify.Head = Head
BankAccountVerify.Form = Form
BankAccountVerify.Actions = Actions
