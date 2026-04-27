import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TextInputField, DatePickerField, Flex } from '@/components/Common'
import { ActionsLayout } from '@/components/Common/ActionsLayout/ActionsLayout'
import { useBase } from '@/components/Base/useBase'
import { Form as HtmlForm } from '@/components/Common/Form/Form'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

const BasicDetailsFormSchema = z.object({
  firstName: z.string().min(1),
  middleInitial: z.string().optional(),
  lastName: z.string().min(1),
  startDate: z.string().optional(),
  ssn: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
})

type BasicDetailsFormValues = z.infer<typeof BasicDetailsFormSchema>

interface ContractorDetailsFormProps {
  contractor: Contractor
  isPending?: boolean
  onCancel?: () => void
  onSave?: (data: BasicDetailsFormValues) => void | Promise<void>
}

export function ContractorDetailsForm({
  contractor,
  isPending,
  onCancel,
  onSave,
}: ContractorDetailsFormProps) {
  const Components = useComponentContext()
  const { baseSubmitHandler } = useBase()

  const formMethods = useForm<BasicDetailsFormValues>({
    resolver: zodResolver(BasicDetailsFormSchema),
    defaultValues: {
      firstName: contractor.firstName ?? '',
      middleInitial: contractor.middleInitial ?? '',
      lastName: contractor.lastName ?? '',
      startDate: contractor.startDate ?? '',
      ssn: '',
      email: contractor.email ?? '',
    },
  })

  const handleSubmit = async (data: BasicDetailsFormValues) => {
    await baseSubmitHandler(data, async payload => {
      await onSave?.(payload)
    })
  }

  return (
    <FormProvider {...formMethods}>
      <HtmlForm onSubmit={formMethods.handleSubmit(handleSubmit)}>
        <Flex flexDirection="column" gap={24}>
          <Flex flexDirection="column" gap={4}>
            <Components.Heading as="h2">Edit basic details</Components.Heading>
            <Components.Text variant="supporting">
              Update the contractor&apos;s personal information.
            </Components.Text>
          </Flex>

          <Flex flexDirection="column" gap={20}>
            <TextInputField name="firstName" label="First name" isRequired />
            <TextInputField name="middleInitial" label="Middle initial" />
            <TextInputField name="lastName" label="Last name" isRequired />
            <DatePickerField<string> name="startDate" label="Start date" />
            <TextInputField
              name="ssn"
              label="Social security number"
              description={
                contractor.hasSsn ? 'Already on file. Leave blank to keep current.' : undefined
              }
            />
            <TextInputField name="email" label="Email address" />
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
