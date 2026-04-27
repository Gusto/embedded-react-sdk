import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DatePickerField, Flex } from '@/components/Common'
import { ActionsLayout } from '@/components/Common/ActionsLayout/ActionsLayout'
import { useBase } from '@/components/Base/useBase'
import { Form as HtmlForm } from '@/components/Common/Form/Form'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

const RehireFormSchema = z.object({
  startDate: z.string().min(1),
})

type RehireFormValues = z.infer<typeof RehireFormSchema>

interface ContractorRehireFormProps {
  contractor: Contractor
  isPending?: boolean
  onCancel?: () => void
  onRehire?: (data: { startDate: string }) => void | Promise<void>
}

export function ContractorRehireForm({
  contractor,
  isPending,
  onCancel,
  onRehire,
}: ContractorRehireFormProps) {
  const Components = useComponentContext()
  const { baseSubmitHandler } = useBase()

  const formMethods = useForm<RehireFormValues>({
    resolver: zodResolver(RehireFormSchema),
    defaultValues: {
      startDate: '',
    },
  })

  const handleSubmit = async (data: RehireFormValues) => {
    await baseSubmitHandler(data, async payload => {
      await onRehire?.(payload)
    })
  }

  const contractorName = [contractor.firstName, contractor.lastName].filter(Boolean).join(' ')

  return (
    <FormProvider {...formMethods}>
      <HtmlForm onSubmit={formMethods.handleSubmit(handleSubmit)}>
        <Flex flexDirection="column" gap={24}>
          <Flex flexDirection="column" gap={4}>
            <Components.Heading as="h2">Rehire {contractorName}</Components.Heading>
            <Components.Text variant="supporting">
              {contractorName} will be reactivated and will be able to start receiving payments
              again. You can cancel this anytime before their start date.
            </Components.Text>
          </Flex>

          <DatePickerField<string> name="startDate" label="Start date" isRequired />

          <ActionsLayout>
            <Components.Button variant="secondary" onClick={onCancel}>
              Cancel
            </Components.Button>
            <Components.Button type="submit" isLoading={isPending} variant="primary">
              Rehire contractor
            </Components.Button>
          </ActionsLayout>
        </Flex>
      </HtmlForm>
    </FormProvider>
  )
}
