import { useBankAccountsCreateMutation } from '@gusto/embedded-api/react-query/bankAccountsCreate'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Head } from './Head'
import type { BankAccountFormInputs } from './Form'
import { BankAccountFormSchema, Form } from './Form'
import { Actions } from './Actions'
import { BankAccountFormProvider } from './context'
import { Form as HtmlForm } from '@/components/Common/Form'
import type { BaseComponentInterface, CommonComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { useI18n } from '@/i18n/I18n'
import { Flex } from '@/components/Common/Flex/Flex'
import { componentEvents } from '@/shared/constants'

interface BankAccountFormProps extends CommonComponentInterface {
  companyId: string
  isEditing?: boolean
}

export function BankAccountForm(props: BankAccountFormProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}
function Root({ companyId, className, children, isEditing = false }: BankAccountFormProps) {
  useI18n('Company.BankAccount')
  const { onEvent, baseSubmitHandler } = useBase()

  const { mutateAsync: createBankAccount, isPending: isPendingCreate } =
    useBankAccountsCreateMutation()

  const { control, ...methods } = useForm<BankAccountFormInputs>({
    resolver: zodResolver(BankAccountFormSchema),
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
        <HtmlForm onSubmit={methods.handleSubmit(onSubmit)}>
          <BankAccountFormProvider value={{ isPending: isPendingCreate, isEditing, onEvent }}>
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
        </HtmlForm>
      </FormProvider>
    </section>
  )
}
BankAccountForm.Head = Head
BankAccountForm.Form = Form
BankAccountForm.Actions = Actions
