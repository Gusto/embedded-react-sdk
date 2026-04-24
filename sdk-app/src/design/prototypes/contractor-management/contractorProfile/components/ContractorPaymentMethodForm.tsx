import type { ContractorBankAccount } from '@gusto/embedded-api/models/components/contractorbankaccount'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TextInputField, RadioGroupField, Flex } from '@/components/Common'
import { ActionsLayout } from '@/components/Common/ActionsLayout/ActionsLayout'
import { useBase } from '@/components/Base/useBase'
import { Form as HtmlForm } from '@/components/Common/Form/Form'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { accountNumberValidation, routingNumberValidation } from '@/helpers/validations'

const BankAccountFormSchema = z.object({
  name: z.string().min(1),
  routingNumber: routingNumberValidation,
  accountNumber: z.any(),
  accountType: z.enum(['Checking', 'Savings']),
})

type BankAccountFormValues = z.input<typeof BankAccountFormSchema>

interface ContractorPaymentMethodFormProps {
  variant: 'add' | 'edit'
  bankAccount?: ContractorBankAccount
  isPending?: boolean
  onCancel?: () => void
  onSave?: (data: BankAccountFormValues) => void | Promise<void>
}

export function ContractorPaymentMethodForm({
  variant,
  bankAccount,
  isPending,
  onCancel,
  onSave,
}: ContractorPaymentMethodFormProps) {
  const Components = useComponentContext()
  const { baseSubmitHandler } = useBase()

  const formMethods = useForm<BankAccountFormValues>({
    resolver: zodResolver(BankAccountFormSchema),
    defaultValues: {
      name: bankAccount?.name ?? '',
      routingNumber: bankAccount?.routingNumber ?? '',
      accountNumber: bankAccount?.hiddenAccountNumber ?? '',
      accountType: bankAccount?.accountType ?? 'Checking',
    },
  })

  const handleSubmit = async (data: BankAccountFormValues) => {
    await baseSubmitHandler(data, async payload => {
      const hasChanged =
        !bankAccount ||
        payload.name !== bankAccount.name ||
        payload.routingNumber !== bankAccount.routingNumber ||
        payload.accountType !== bankAccount.accountType ||
        payload.accountNumber !== bankAccount.hiddenAccountNumber
      if (hasChanged) {
        const result = accountNumberValidation.safeParse(payload.accountNumber)
        if (!result.success) {
          formMethods.setError('accountNumber', { type: 'validate' })
          return
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
              {variant === 'add' ? 'Add bank account' : 'Edit bank account'}
            </Components.Heading>
            <Components.Text variant="supporting">
              Enter the bank account details for direct deposit.
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
