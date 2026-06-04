import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import z from 'zod'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Form } from '@/components/Common/Form'
import { ActionsLayout } from '@/components/Common/ActionsLayout'
import { Flex, RadioGroupField, TextInputField } from '@/components/Common'
import { PAYMENT_METHODS } from '@/shared/constants'
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

export type PaymentMethodFormValues = z.input<typeof PaymentMethodSchema>

export interface PaymentMethodFormDefaults {
  type: 'Direct Deposit' | 'Check'
  name: string
  routingNumber: string
  accountNumber: string
  accountType: 'Checking' | 'Savings'
}

interface PaymentMethodFormProps {
  heading?: string
  description?: string
  defaultValues: PaymentMethodFormDefaults
  isPending?: boolean
  onSubmit: (data: PaymentMethodFormValues) => void | Promise<void>
}

export function PaymentMethodForm({
  heading = 'Payment method',
  description,
  defaultValues,
  isPending,
  onSubmit,
}: PaymentMethodFormProps) {
  const Components = useComponentContext()

  const formMethods = useForm({
    resolver: zodResolver(PaymentMethodSchema),
    defaultValues,
  })

  const watchedType = useWatch({ control: formMethods.control, name: 'type' })
  const showBankAccountForm = watchedType === PAYMENT_METHODS.directDeposit

  const handleSubmit = async (data: PaymentMethodFormValues) => {
    if (data.type === PAYMENT_METHODS.directDeposit) {
      // The schema accepts any string so the masked default value passes through.
      // Validate only when the user actually edited the field.
      const accountNumberChanged = data.accountNumber !== defaultValues.accountNumber
      if (accountNumberChanged) {
        const res = accountNumberValidation.safeParse(data.accountNumber)
        if (!res.success) {
          formMethods.setError('accountNumber', { type: 'validate' })
          return
        }
      }
    }
    await onSubmit(data)
  }

  return (
    <FormProvider {...formMethods}>
      <Form onSubmit={formMethods.handleSubmit(handleSubmit)}>
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
            <Components.Button type="submit" variant="primary" isDisabled={isPending}>
              {isPending ? 'Saving...' : 'Continue'}
            </Components.Button>
          </ActionsLayout>
        </Flex>
      </Form>
    </FormProvider>
  )
}
