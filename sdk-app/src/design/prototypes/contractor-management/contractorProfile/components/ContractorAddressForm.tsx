import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { TextInputField, SelectField, Grid, Flex } from '@/components/Common'
import { ActionsLayout } from '@/components/Common/ActionsLayout/ActionsLayout'
import { useBase } from '@/components/Base/useBase'
import { Form as HtmlForm } from '@/components/Common/Form/Form'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { STATES_ABBR } from '@/shared/constants'

const AddressFormSchema = z.object({
  street1: z.string().min(1),
  street2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
})

type AddressFormValues = z.infer<typeof AddressFormSchema>

interface ContractorAddressFormProps {
  contractor: Contractor
  isPending?: boolean
  onCancel?: () => void
  onSave?: (data: AddressFormValues) => void | Promise<void>
}

export function ContractorAddressForm({
  contractor,
  isPending,
  onCancel,
  onSave,
}: ContractorAddressFormProps) {
  const Components = useComponentContext()
  const { t } = useTranslation('common')
  const { baseSubmitHandler } = useBase()

  const formMethods = useForm<AddressFormValues>({
    resolver: zodResolver(AddressFormSchema),
    defaultValues: {
      street1: contractor.address?.street1 ?? '',
      street2: contractor.address?.street2 ?? '',
      city: contractor.address?.city ?? '',
      state: contractor.address?.state ?? '',
      zip: contractor.address?.zip ?? '',
    },
  })

  const handleSubmit = async (data: AddressFormValues) => {
    await baseSubmitHandler(data, async payload => {
      await onSave?.(payload)
    })
  }

  return (
    <FormProvider {...formMethods}>
      <HtmlForm onSubmit={formMethods.handleSubmit(handleSubmit)}>
        <Flex flexDirection="column" gap={24}>
          <Flex flexDirection="column" gap={4}>
            <Components.Heading as="h2">Edit address</Components.Heading>
            <Components.Text variant="supporting">
              Update the contractor&apos;s home address.
            </Components.Text>
          </Flex>

          <Flex flexDirection="column" gap={20}>
            <TextInputField name="street1" label="Street 1" isRequired />
            <TextInputField name="street2" label="Street 2 (optional)" />
            <TextInputField name="city" label="City" isRequired />
            <SelectField
              name="state"
              label="State"
              isRequired
              options={STATES_ABBR.map(stateAbbr => ({
                label: t(`statesHash.${stateAbbr}`, { defaultValue: stateAbbr }),
                value: stateAbbr,
              }))}
            />
            <TextInputField name="zip" label="Zip code" isRequired />
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
