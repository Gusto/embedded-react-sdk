import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TextInputField, RadioGroupField, Flex } from '@/components/Common'
import { ActionsLayout } from '@/components/Common/ActionsLayout/ActionsLayout'
import { useBase } from '@/components/Base/useBase'
import { Form as HtmlForm } from '@/components/Common/Form/Form'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

const ContractorPayFormSchema = z.discriminatedUnion('wageType', [
  z.object({
    wageType: z.literal('Hourly'),
    hourlyRate: z
      .string()
      .min(1)
      .refine(val => !isNaN(Number(val)) && Number(val) > 0),
  }),
  z.object({
    wageType: z.literal('Fixed'),
  }),
])

type ContractorPayFormValues = z.input<typeof ContractorPayFormSchema>

interface ContractorPayFormProps {
  contractor: Contractor
  isPending?: boolean
  onCancel?: () => void
  onSave?: (data: ContractorPayFormValues) => void | Promise<void>
}

export function ContractorPayForm({
  contractor,
  isPending,
  onCancel,
  onSave,
}: ContractorPayFormProps) {
  const Components = useComponentContext()
  const { baseSubmitHandler } = useBase()

  const formMethods = useForm<ContractorPayFormValues>({
    resolver: zodResolver(ContractorPayFormSchema),
    defaultValues: {
      wageType: contractor.wageType ?? 'Fixed',
      hourlyRate: contractor.hourlyRate ?? '',
    },
  })

  const watchedWageType = useWatch({ control: formMethods.control, name: 'wageType' })

  const handleSubmit = async (data: ContractorPayFormValues) => {
    await baseSubmitHandler(data, async payload => {
      await onSave?.(payload)
    })
  }

  return (
    <FormProvider {...formMethods}>
      <HtmlForm onSubmit={formMethods.handleSubmit(handleSubmit)}>
        <Flex flexDirection="column" gap={24}>
          <Flex flexDirection="column" gap={4}>
            <Components.Heading as="h2">Edit compensation</Components.Heading>
            <Components.Text variant="supporting">
              Update the contractor&apos;s compensation type and rate.
            </Components.Text>
          </Flex>

          <RadioGroupField
            name="wageType"
            label="Compensation type"
            options={[
              {
                value: 'Fixed',
                label: 'Fixed',
                description: 'Pay a fixed amount each pay period.',
              },
              {
                value: 'Hourly',
                label: 'Hourly',
                description: 'Pay based on hours worked.',
              },
            ]}
          />

          {watchedWageType === 'Hourly' && (
            <TextInputField
              name="hourlyRate"
              label="Hourly rate"
              isRequired
              description="Enter the amount per hour (e.g. 50.00)"
              errorMessage="Enter a valid hourly rate"
            />
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
