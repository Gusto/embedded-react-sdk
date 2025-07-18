import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useBankAccountsVerifyMutation } from '@gusto/embedded-api/react-query/bankAccountsVerify'
import { Head } from './Head'
import { BankAccountVerifyProvider } from './context'
import type { BankAccountVerifyInputs } from './Form'
import { BankAccountVerifySchema, Form } from './Form'
import { Actions } from './Actions'
import { Form as HtmlForm } from '@/components/Common/Form'
import type { BaseComponentInterface, CommonComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { useI18n } from '@/i18n/I18n'
import { Flex } from '@/components/Common/Flex/Flex'
import { componentEvents } from '@/shared/constants'

interface BankAccountVerifyProps extends CommonComponentInterface {
  companyId: string
  bankAccountId: string
}

export function BankAccountVerify(props: BankAccountVerifyProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}
function Root({ companyId, bankAccountId, className, children }: BankAccountVerifyProps) {
  useI18n('Company.BankAccount')
  const { onEvent, baseSubmitHandler } = useBase()
  const { mutateAsync: verifyBankAccount, isPending } = useBankAccountsVerifyMutation()

  const { control, ...methods } = useForm<BankAccountVerifyInputs>({
    resolver: zodResolver(BankAccountVerifySchema),
    defaultValues: { deposit1: 0, deposit2: 0 },
  })

  const onSubmit = async (data: BankAccountVerifyInputs) => {
    await baseSubmitHandler(data, async payload => {
      const { companyBankAccount } = await verifyBankAccount({
        request: { companyId, bankAccountUuid: bankAccountId, requestBody: payload },
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
        <HtmlForm onSubmit={methods.handleSubmit(onSubmit)}>
          <BankAccountVerifyProvider
            value={{
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
        </HtmlForm>
      </FormProvider>
    </section>
  )
}
