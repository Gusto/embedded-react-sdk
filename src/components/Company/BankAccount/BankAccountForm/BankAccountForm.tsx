import { Form as AriaForm } from 'react-aria-components'
import type { CompanyBankAccount } from '@gusto/embedded-api/models/components/companybankaccount'
import { useBankAccountsCreateMutation } from '@gusto/embedded-api/react-query/bankAccountsCreate'
import { FormProvider, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { Head } from './Head'
import type { BankAccountFormInputs } from './Form'
import { BankAccountFormSchema, Form } from './Form'
import { Actions } from './Actions'
import { BankAccountFormProvider } from './context'
import type { BaseComponentInterface, CommonComponentInterface } from '@/components/Base/Base'
import { BaseComponent, useBase } from '@/components/Base/Base'
import { useI18n } from '@/i18n/I18n'
import { Flex } from '@/components/Common/Flex/Flex'
import { componentEvents } from '@/shared/constants'

interface BankAccountFormProps extends CommonComponentInterface {
  companyId: string
  bankAccount?: CompanyBankAccount
}

export function BankAccountForm({
  companyId,
  className,
  children,
  ...props
}: BankAccountFormProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root companyId={companyId} className={className}>
        {children}
      </Root>
    </BaseComponent>
  )
}
function Root({ companyId, className, children }: BankAccountFormProps) {
  useI18n('Company.BankAccount')
  const { onEvent, baseSubmitHandler } = useBase()

  const { mutateAsync: createBankAccount, isPending: isPendingCreate } =
    useBankAccountsCreateMutation()

  const { control, ...methods } = useForm<BankAccountFormInputs>({
    resolver: valibotResolver(BankAccountFormSchema),
    defaultValues: { accountNumber: '', routingNumber: '' },
  })

  const onSubmit = async (data: BankAccountFormInputs) => {
    await baseSubmitHandler(data, async payload => {
      const { companyBankAccount } = await createBankAccount({
        //Account type is always checking for company bank accounts
        request: { companyId, requestBody: { ...payload, accountType: 'Checking' } },
      })
      onEvent(componentEvents.COMPANY_BANK_ACCOUNT_CREATED, companyBankAccount)
    })
  }
  return (
    <section className={className}>
      <FormProvider {...methods} control={control}>
        <AriaForm onSubmit={methods.handleSubmit(onSubmit)}>
          <BankAccountFormProvider value={{ bankAccount: null, isPending: isPendingCreate }}>
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
          </BankAccountFormProvider>
        </AriaForm>
      </FormProvider>
    </section>
  )
}
BankAccountForm.Head = Head
BankAccountForm.Form = Form
BankAccountForm.Actions = Actions
