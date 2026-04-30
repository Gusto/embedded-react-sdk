import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Form as HtmlForm } from '@/components/Common/Form/Form'
import { ActionsLayout } from '@/components/Common/ActionsLayout/ActionsLayout'
import { Flex, TextInputField, SelectField } from '@/components/Common'
import { STATES_ABBR } from '@/shared/constants'

const AddressFormSchema = z.object({
  street1: z.string().min(1),
  street2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
})

export type AddressFormValues = z.infer<typeof AddressFormSchema>

interface AddressFormProps {
  heading: string
  description: string
  defaultValues?: Partial<AddressFormValues>
  isPending?: boolean
  onSubmit: (data: AddressFormValues) => void | Promise<void>
  onCancel?: () => void
}

export function AddressForm({
  heading,
  description,
  defaultValues,
  isPending,
  onSubmit,
  onCancel,
}: AddressFormProps) {
  const Components = useComponentContext()

  const formMethods = useForm<AddressFormValues>({
    resolver: zodResolver(AddressFormSchema),
    defaultValues: {
      street1: defaultValues?.street1 ?? '',
      street2: defaultValues?.street2 ?? '',
      city: defaultValues?.city ?? '',
      state: defaultValues?.state ?? '',
      zip: defaultValues?.zip ?? '',
    },
  })

  return (
    <FormProvider {...formMethods}>
      <HtmlForm onSubmit={formMethods.handleSubmit(onSubmit)}>
        <Flex flexDirection="column" gap={24}>
          <Flex flexDirection="column" gap={4}>
            <Components.Heading as="h2">{heading}</Components.Heading>
            <Components.Text variant="supporting">{description}</Components.Text>
          </Flex>

          <Flex flexDirection="column" gap={20}>
            <TextInputField name="street1" label="Street 1" isRequired />
            <TextInputField name="street2" label="Street 2 (optional)" />
            <TextInputField name="city" label="City" isRequired />
            <SelectField
              name="state"
              label="State"
              isRequired
              options={STATES_ABBR.map(s => ({ label: s, value: s }))}
            />
            <TextInputField name="zip" label="Zip code" isRequired />
          </Flex>

          <ActionsLayout>
            {onCancel && (
              <Components.Button variant="secondary" onClick={onCancel}>
                Cancel
              </Components.Button>
            )}
            <Components.Button type="submit" isLoading={isPending}>
              {onCancel ? 'Save' : 'Continue'}
            </Components.Button>
          </ActionsLayout>
        </Flex>
      </HtmlForm>
    </FormProvider>
  )
}
