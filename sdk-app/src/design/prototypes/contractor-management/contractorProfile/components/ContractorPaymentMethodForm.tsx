import type { ContractorBankAccount } from '@gusto/embedded-api/models/components/contractorbankaccount'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TextInputField, RadioGroupField, Flex } from '@/components/Common'
import { ActionsLayout } from '@/components/Common/ActionsLayout/ActionsLayout'
import { useBase } from '@/components/Base/useBase'
import { Form as HtmlForm } from '@/components/Common/Form/Form'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { accountNumberValidation, routingNumberValidation } from '@/helpers/validations'

const PaymentMethodFormSchema = z.discriminatedUnion('type', [
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

type PaymentMethodFormValues = z.input<typeof PaymentMethodFormSchema>

interface ContractorPaymentMethodFormProps {
  variant: 'add' | 'edit'
  bankAccount?: ContractorBankAccount
  paymentMethodType: 'Check' | 'Direct Deposit'
  isPending?: boolean
  onCancel?: () => void
  onSave?: (data: PaymentMethodFormValues) => void | Promise<void>
}

export function ContractorPaymentMethodForm({
  variant,
  bankAccount,
  paymentMethodType,
  isPending,
  onCancel,
  onSave,
}: ContractorPaymentMethodFormProps) {
  const Components = useComponentContext()
  const { baseSubmitHandler } = useBase()

  const formMethods = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(PaymentMethodFormSchema),
    defaultValues: {
      type: paymentMethodType,
      name: bankAccount?.name ?? '',
      routingNumber: bankAccount?.routingNumber ?? '',
      accountNumber: bankAccount?.hiddenAccountNumber ?? '',
      accountType: bankAccount?.accountType ?? 'Checking',
    },
  })

  const watchedType = useWatch({ control: formMethods.control, name: 'type' })

  const handleSubmit = async (data: PaymentMethodFormValues) => {
    await baseSubmitHandler(data, async payload => {
      if (payload.type === 'Direct Deposit') {
        const { name, accountNumber, routingNumber, accountType } = payload
        const hasChanged =
          !bankAccount ||
          name !== bankAccount.name ||
          routingNumber !== bankAccount.routingNumber ||
          accountType !== bankAccount.accountType ||
          accountNumber !== bankAccount.hiddenAccountNumber
        if (hasChanged) {
          const result = accountNumberValidation.safeParse(accountNumber)
          if (!result.success) {
            formMethods.setError('accountNumber', { type: 'validate' })
            return
          }
        }
      }
      await onSave?.(payload)
    })
  }

  return (
    <FormProvider {...formMethods}>
      <HtmlForm onSubmit={formMethods.handleSubmit(handleSubmit)}>
        <Flex flexDirection="column" gap={24}>
          <Flex flexDirection="column" gap={4}>
            <Components.Heading as="h2">
              {variant === 'add'
                ? 'Add contractor payment method'
                : 'Edit contractor payment method'}
            </Components.Heading>
            <Components.Text variant="supporting">
              Choose how this contractor gets paid.
            </Components.Text>
          </Flex>

          <RadioGroupField
            name="type"
            label="Payment method"
            shouldVisuallyHideLabel
            options={[
              {
                value: 'Direct Deposit',
                label: 'Direct deposit',
                description: 'Deposit the payment directly into their bank account.',
              },
              {
                value: 'Check',
                label: 'Check',
                description: 'Pay by physical check.',
              },
            ]}
          />

          {watchedType === 'Direct Deposit' && (
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
          )}

          <ActionsLayout>
            <Components.Button variant="secondary" onClick={onCancel}>
              Cancel
            </Components.Button>
            <Components.Button type="submit" isLoading={isPending}>
              Save
            </Components.Button>
          </ActionsLayout>
        </Flex>
      </HtmlForm>
    </FormProvider>
  )
}
