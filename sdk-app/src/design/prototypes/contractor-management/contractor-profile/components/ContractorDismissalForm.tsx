import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { contractorName } from './contractorName'
import { DatePickerField, Flex } from '@/components/Common'
import { ActionsLayout } from '@/components/Common/ActionsLayout/ActionsLayout'
import { useBase } from '@/components/Base/useBase'
import { Form as HtmlForm } from '@/components/Common/Form/Form'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

const DismissalFormSchema = z.object({
  endDate: z.string().min(1),
})

type DismissalFormValues = z.infer<typeof DismissalFormSchema>

interface ContractorDismissalFormProps {
  contractor: Contractor
  isPending?: boolean
  onCancel?: () => void
  onDismiss?: (data: { endDate: string }) => void | Promise<void>
}

export function ContractorDismissalForm({
  contractor,
  isPending,
  onCancel,
  onDismiss,
}: ContractorDismissalFormProps) {
  const Components = useComponentContext()
  const { baseSubmitHandler } = useBase()

  const formMethods = useForm<DismissalFormValues>({
    resolver: zodResolver(DismissalFormSchema),
    defaultValues: {
      endDate: '',
    },
  })

  const handleSubmit = async (data: DismissalFormValues) => {
    await baseSubmitHandler(data, async payload => {
      await onDismiss?.(payload)
    })
  }

  const name = contractorName(contractor)

  const minDate = (() => {
    if (contractor.startDate) {
      const day = new Date(contractor.startDate + 'T00:00:00')
      day.setDate(day.getDate() + 1)
      return day
    }
    return undefined
  })()

  return (
    <FormProvider {...formMethods}>
      <HtmlForm onSubmit={formMethods.handleSubmit(handleSubmit)}>
        <Flex flexDirection="column" gap={24}>
          <Flex flexDirection="column" gap={4}>
            <Components.Heading as="h2">Dismiss {name}</Components.Heading>
            <Components.Text variant="supporting">
              Schedule a dismissal date for this contractor. This action can be cancelled before the
              dismissal date takes effect.
            </Components.Text>
          </Flex>

          <DatePickerField<string>
            name="endDate"
            label="Dismissal date"
            isRequired
            minDate={minDate}
          />

          <ActionsLayout>
            <Components.Button variant="secondary" onClick={onCancel}>
              Cancel
            </Components.Button>
            <Components.Button type="submit" isLoading={isPending} variant="primary">
              Dismiss contractor
            </Components.Button>
          </ActionsLayout>
        </Flex>
      </HtmlForm>
    </FormProvider>
  )
}
