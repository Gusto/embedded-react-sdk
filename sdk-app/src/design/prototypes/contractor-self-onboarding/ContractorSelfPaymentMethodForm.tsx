import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { buildContractorPaymentMethodGetQuery } from '@gusto/embedded-api/react-query/contractorPaymentMethodGet'
import { useContractorPaymentMethodGetBankAccountsSuspense } from '@gusto/embedded-api/react-query/contractorPaymentMethodGetBankAccounts'
import { useContractorPaymentMethodUpdateMutation } from '@gusto/embedded-api/react-query/contractorPaymentMethodUpdate'
import { useContractorPaymentMethodsCreateBankAccountMutation } from '@gusto/embedded-api/react-query/contractorPaymentMethodsCreateBankAccount'
import { useGustoEmbeddedContext } from '@gusto/embedded-api/react-query/_context'
import { useQueryClient } from '@tanstack/react-query'
import { BaseComponent, useBase } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { TextInputField } from '@/components/Common/Fields/TextInputField'
import { RadioGroupField } from '@/components/Common/Fields/RadioGroupField'
import { ActionsLayout } from '@/components/Common/ActionsLayout/ActionsLayout'
import { componentEvents } from '@/shared/constants'
import { routingNumberValidation, accountNumberValidation } from '@/helpers/validations'

const BankAccountFormSchema = z.object({
  name: z.string().min(1),
  routingNumber: routingNumberValidation,
  accountNumber: z.string().min(1),
  accountType: z.enum(['Checking', 'Savings']),
})

type BankAccountFormValues = z.input<typeof BankAccountFormSchema>

interface ContractorSelfPaymentMethodFormProps {
  contractorId: string
  onEvent: (...args: unknown[]) => void
}

export function ContractorSelfPaymentMethodForm(props: ContractorSelfPaymentMethodFormProps) {
  return (
    <BaseComponent onEvent={props.onEvent}>
      <Root contractorId={props.contractorId} />
    </BaseComponent>
  )
}

function Root({ contractorId }: { contractorId: string }) {
  const Components = useComponentContext()
  const { onEvent, baseSubmitHandler } = useBase()
  const queryClient = useQueryClient()
  const gustoClient = useGustoEmbeddedContext()

  const {
    data: { contractorBankAccountList: bankAccounts },
  } = useContractorPaymentMethodGetBankAccountsSuspense({ contractorUuid: contractorId })

  const { mutateAsync: createBankAccount } = useContractorPaymentMethodsCreateBankAccountMutation()
  const { mutateAsync: updatePaymentMethod } = useContractorPaymentMethodUpdateMutation()

  const existingAccount = bankAccounts?.[0]

  const formMethods = useForm<BankAccountFormValues>({
    resolver: zodResolver(BankAccountFormSchema),
    defaultValues: {
      name: existingAccount?.name ?? '',
      routingNumber: existingAccount?.routingNumber ?? '',
      accountNumber: existingAccount?.hiddenAccountNumber ?? '',
      accountType: existingAccount?.accountType ?? 'Checking',
    },
  })

  const { handleSubmit, formState } = formMethods

  const onSubmit = async (data: BankAccountFormValues) => {
    await baseSubmitHandler(data, async payload => {
      const accountNumberChanged =
        !existingAccount || payload.accountNumber !== existingAccount.hiddenAccountNumber

      if (accountNumberChanged) {
        const accountResult = accountNumberValidation.safeParse(payload.accountNumber)
        if (!accountResult.success) {
          formMethods.setError('accountNumber', { type: 'validate' })
          return
        }
      }

      const hasChanged =
        !existingAccount ||
        accountNumberChanged ||
        payload.name !== existingAccount.name ||
        payload.routingNumber !== existingAccount.routingNumber ||
        payload.accountType !== existingAccount.accountType

      if (hasChanged) {
        await createBankAccount({
          request: {
            contractorUuid: contractorId,
            requestBody: {
              name: payload.name,
              routingNumber: payload.routingNumber,
              accountNumber: payload.accountNumber,
              accountType: payload.accountType,
            },
          },
        })

        const getPaymentMethodQuery = buildContractorPaymentMethodGetQuery(gustoClient, {
          contractorUuid: contractorId,
        })
        const updatedPaymentMethod = await queryClient.fetchQuery(getPaymentMethodQuery)
        const version = updatedPaymentMethod.contractorPaymentMethod?.version ?? ''

        await updatePaymentMethod({
          request: {
            contractorUuid: contractorId,
            requestBody: {
              version,
              type: 'Direct Deposit',
            },
          },
        })
      }

      onEvent(componentEvents.CONTRACTOR_PAYMENT_METHOD_DONE, {
        contractorId,
        selfOnboarding: true,
      })
    })
  }

  return (
    <FormProvider {...formMethods}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Flex flexDirection="column" gap={24}>
          <Flex flexDirection="column" gap={4}>
            <Components.Heading as="h2">Set up your payment method</Components.Heading>
            <Components.Text variant="supporting">
              Enter your bank account details so you can get paid via direct deposit.
            </Components.Text>
          </Flex>

          <Flex flexDirection="column" gap={20}>
            <TextInputField
              name="name"
              label="Account nickname"
              isRequired
              errorMessage="Account nickname is required"
            />
            <TextInputField
              name="routingNumber"
              label="Routing number"
              isRequired
              description="9 digits, on the bottom left of a check"
              errorMessage="Enter a valid 9-digit routing number"
            />
            <TextInputField
              name="accountNumber"
              label="Account number"
              isRequired
              errorMessage="Enter a valid account number"
            />
            <RadioGroupField
              name="accountType"
              label="Account type"
              isRequired
              options={[
                { value: 'Checking', label: 'Checking' },
                { value: 'Savings', label: 'Savings' },
              ]}
            />
          </Flex>

          <ActionsLayout>
            <Components.Button type="submit" variant="primary" isDisabled={formState.isSubmitting}>
              {formState.isSubmitting ? 'Saving...' : 'Continue'}
            </Components.Button>
          </ActionsLayout>
        </Flex>
      </Form>
    </FormProvider>
  )
}
