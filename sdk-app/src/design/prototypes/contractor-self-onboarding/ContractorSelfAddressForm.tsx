import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { useContractorsGetSuspense } from '@gusto/embedded-api/react-query/contractorsGet'
import { useContractorsGetAddressSuspense } from '@gusto/embedded-api/react-query/contractorsGetAddress'
import { useContractorsUpdateAddressMutation } from '@gusto/embedded-api/react-query/contractorsUpdateAddress'
import { BaseComponent, useBase } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { TextInputField } from '@/components/Common/Fields/TextInputField'
import { SelectField } from '@/components/Common/Fields/SelectField'
import { ActionsLayout } from '@/components/Common/ActionsLayout/ActionsLayout'
import { componentEvents, STATES_ABBR } from '@/shared/constants'

const AddressFormSchema = z.object({
  street1: z.string().min(1),
  street2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
})

type AddressFormValues = z.infer<typeof AddressFormSchema>

interface ContractorSelfAddressFormProps {
  contractorId: string
  onEvent: (...args: unknown[]) => void
}

export function ContractorSelfAddressForm(props: ContractorSelfAddressFormProps) {
  return (
    <BaseComponent onEvent={props.onEvent}>
      <Root contractorId={props.contractorId} />
    </BaseComponent>
  )
}

function Root({ contractorId }: { contractorId: string }) {
  const Components = useComponentContext()
  const { onEvent, baseSubmitHandler } = useBase()
  const { t } = useTranslation('common')

  const {
    data: { contractor },
  } = useContractorsGetSuspense({ contractorUuid: contractorId })

  const {
    data: { contractorAddress: address },
  } = useContractorsGetAddressSuspense({ contractorUuid: contractorId })

  const { mutateAsync: updateAddress } = useContractorsUpdateAddressMutation()

  const formMethods = useForm<AddressFormValues>({
    resolver: zodResolver(AddressFormSchema),
    defaultValues: {
      street1: address?.street1 ?? contractor?.address?.street1 ?? '',
      street2: address?.street2 ?? contractor?.address?.street2 ?? '',
      city: address?.city ?? contractor?.address?.city ?? '',
      state: address?.state ?? contractor?.address?.state ?? '',
      zip: address?.zip ?? contractor?.address?.zip ?? '',
    },
  })

  const { handleSubmit, formState } = formMethods

  const onSubmit = async (data: AddressFormValues) => {
    await baseSubmitHandler(data, async payload => {
      await updateAddress({
        request: {
          contractorUuid: contractorId,
          requestBody: {
            version: address?.version ?? '',
            street1: payload.street1,
            street2: payload.street2,
            city: payload.city,
            state: payload.state,
            zip: payload.zip,
          },
        },
      })

      onEvent(componentEvents.CONTRACTOR_ADDRESS_DONE, {
        contractorId,
        selfOnboarding: true,
      })
    })
  }

  return (
    <FormProvider {...formMethods}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Flex flexDirection="column" gap={24}>
          <Flex flexDirection="column" gap={4}>
            <Components.Heading as="h2">Your home address</Components.Heading>
            <Components.Text variant="supporting">
              Please provide your current mailing address.
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
            <Components.Button type="submit" variant="primary" isDisabled={formState.isSubmitting}>
              {formState.isSubmitting ? 'Saving...' : 'Continue'}
            </Components.Button>
          </ActionsLayout>
        </Flex>
      </Form>
    </FormProvider>
  )
}
