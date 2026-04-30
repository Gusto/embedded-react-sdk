import { useMemo, useState } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import z from 'zod'
import {
  useContractorPaymentMethodGetSuspense,
  buildContractorPaymentMethodGetQuery,
} from '@gusto/embedded-api/react-query/contractorPaymentMethodGet'
import { useContractorPaymentMethodGetBankAccountsSuspense } from '@gusto/embedded-api/react-query/contractorPaymentMethodGetBankAccounts'
import { useContractorPaymentMethodsCreateBankAccountMutation } from '@gusto/embedded-api/react-query/contractorPaymentMethodsCreateBankAccount'
import { useContractorPaymentMethodUpdateMutation } from '@gusto/embedded-api/react-query/contractorPaymentMethodUpdate'
import { useGustoEmbeddedContext } from '@gusto/embedded-api/react-query/_context'
import { useQueryClient } from '@tanstack/react-query'
import { useBase } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Form } from '@/components/Common/Form'
import { ActionsLayout } from '@/components/Common/ActionsLayout'
import { Flex, RadioGroupField, TextInputField } from '@/components/Common'
import { componentEvents, PAYMENT_METHODS } from '@/shared/constants'
import { accountNumberValidation, routingNumberValidation } from '@/helpers/validations'

const PaymentMethodSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('Direct Deposit'),
    name: z.string().min(1),
    routingNumber: routingNumberValidation,
    accountNumber: z.any(),
    accountType: z.enum(['Checking', 'Savings']),
  }),
  z.object({
    type: z.literal('Check'),
  }),
])

type PaymentMethodInputs = z.input<typeof PaymentMethodSchema>

interface PaymentMethodFormProps {
  contractorId: string
  heading?: string
  description?: string
  doneEvent?: string
  donePayload?: Record<string, unknown>
}

export function PaymentMethodForm({
  contractorId,
  heading = 'Payment method',
  description,
  doneEvent = componentEvents.CONTRACTOR_PAYMENT_METHOD_DONE,
  donePayload,
}: PaymentMethodFormProps) {
  const { onEvent, baseSubmitHandler } = useBase()
  const Components = useComponentContext()
  const queryClient = useQueryClient()
  const gustoClient = useGustoEmbeddedContext()
  const [isPaymentMethodPending, setIsPaymentMethodPending] = useState(false)

  const contractorPaymentMethod = useContractorPaymentMethodGetSuspense({
    contractorUuid: contractorId,
  })

  const getPaymentMethodQuery = buildContractorPaymentMethodGetQuery(gustoClient, {
    contractorUuid: contractorId,
  })

  const paymentMethod = contractorPaymentMethod.data.contractorPaymentMethod!

  const {
    data: { contractorBankAccountList },
  } = useContractorPaymentMethodGetBankAccountsSuspense({
    contractorUuid: contractorId,
  })
  const bankAccount = contractorBankAccountList?.[0] || undefined

  const { mutateAsync: updatePaymentMethod, isPending: paymentMethodPending } =
    useContractorPaymentMethodUpdateMutation()
  const { mutateAsync: createBankAccount, isPending: bankAccountPending } =
    useContractorPaymentMethodsCreateBankAccountMutation()

  const defaultValues = useMemo(
    () => ({
      type: paymentMethod.type || PAYMENT_METHODS.check,
      name: bankAccount?.name || '',
      routingNumber: bankAccount?.routingNumber || '',
      accountNumber: bankAccount?.hiddenAccountNumber || '',
      accountType: bankAccount?.accountType || 'Checking',
    }),
    [paymentMethod, bankAccount],
  )

  const formMethods = useForm({
    resolver: zodResolver(PaymentMethodSchema),
    defaultValues,
  })

  const watchedType = useWatch({ control: formMethods.control, name: 'type' })

  const onSubmit = async (data: PaymentMethodInputs) => {
    await baseSubmitHandler(data, async payload => {
      let updatedPaymentMethodVersion: string | undefined

      if (payload.type === PAYMENT_METHODS.directDeposit) {
        const { name, accountNumber, routingNumber, accountType } = payload
        const hasChanged =
          !bankAccount ||
          name !== bankAccount.name ||
          routingNumber !== bankAccount.routingNumber ||
          accountType !== bankAccount.accountType ||
          accountNumber !== bankAccount.hiddenAccountNumber

        if (hasChanged) {
          const res = accountNumberValidation.safeParse(payload.accountNumber)
          if (!res.success) {
            formMethods.setError('accountNumber', { type: 'validate' })
            return
          }

          const bankAccountResponse = await createBankAccount({
            request: {
              contractorUuid: contractorId,
              requestBody: { name, routingNumber, accountNumber, accountType },
            },
          })

          onEvent(componentEvents.CONTRACTOR_BANK_ACCOUNT_CREATED, bankAccountResponse)
        }

        setIsPaymentMethodPending(true)
        const updatedPaymentMethodResponse = await queryClient.fetchQuery(getPaymentMethodQuery)
        const updatedPaymentMethod = updatedPaymentMethodResponse.contractorPaymentMethod!
        setIsPaymentMethodPending(false)

        updatedPaymentMethodVersion = updatedPaymentMethod.version as string
      }

      const paymentMethodResponse = await updatePaymentMethod({
        request: {
          contractorUuid: contractorId,
          requestBody: {
            type: payload.type,
            version: updatedPaymentMethodVersion || (paymentMethod.version as string),
          },
        },
      })
      onEvent(componentEvents.CONTRACTOR_PAYMENT_METHOD_UPDATED, paymentMethodResponse)
      onEvent(doneEvent, donePayload)
    })
  }

  const showBankAccountForm = watchedType === PAYMENT_METHODS.directDeposit
  const isDisabled = paymentMethodPending || bankAccountPending || isPaymentMethodPending

  return (
    <FormProvider {...formMethods}>
      <Form onSubmit={formMethods.handleSubmit(onSubmit)}>
        <Flex flexDirection="column" gap={24}>
          <Flex flexDirection="column" gap={4}>
            <Components.Heading as="h2">{heading}</Components.Heading>
            {description && <Components.Text variant="supporting">{description}</Components.Text>}
          </Flex>

          <Flex flexDirection="column" gap={20}>
            <RadioGroupField
              name="type"
              label="Payment method"
              shouldVisuallyHideLabel
              options={[
                {
                  value: PAYMENT_METHODS.directDeposit,
                  label: 'Direct deposit',
                  description: 'Get paid directly to your bank account.',
                },
                {
                  value: PAYMENT_METHODS.check,
                  label: 'Check',
                  description: 'Receive a paper check from your employer.',
                },
              ]}
            />

            {showBankAccountForm && (
              <>
                <TextInputField
                  name="name"
                  isRequired
                  label="Account nickname"
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
                  errorMessage="Enter a valid account number"
                  isRequired
                />
                <RadioGroupField
                  name="accountType"
                  isRequired
                  label="Account type"
                  options={[
                    { value: 'Checking', label: 'Checking' },
                    { value: 'Savings', label: 'Savings' },
                  ]}
                />
              </>
            )}
          </Flex>

          <ActionsLayout>
            <Components.Button type="submit" variant="primary" isDisabled={isDisabled}>
              {isDisabled ? 'Saving...' : 'Continue'}
            </Components.Button>
          </ActionsLayout>
        </Flex>
      </Form>
    </FormProvider>
  )
}
