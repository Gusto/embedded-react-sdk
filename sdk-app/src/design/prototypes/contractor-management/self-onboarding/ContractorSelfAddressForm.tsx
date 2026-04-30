import { useContractorsGetSuspense } from '@gusto/embedded-api/react-query/contractorsGet'
import { useContractorsGetAddressSuspense } from '@gusto/embedded-api/react-query/contractorsGetAddress'
import { useContractorsUpdateAddressMutation } from '@gusto/embedded-api/react-query/contractorsUpdateAddress'
import { AddressForm, type AddressFormValues } from '../common/AddressForm'
import { BaseComponent, useBase } from '@/components/Base'
import { componentEvents } from '@/shared/constants'

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
  const { onEvent, baseSubmitHandler } = useBase()

  const {
    data: { contractor },
  } = useContractorsGetSuspense({ contractorUuid: contractorId })

  const {
    data: { contractorAddress: address },
  } = useContractorsGetAddressSuspense({ contractorUuid: contractorId })

  const { mutateAsync: updateAddress, isPending } = useContractorsUpdateAddressMutation()

  const isBusiness = contractor?.type === 'Business'

  const handleSubmit = async (data: AddressFormValues) => {
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
    <AddressForm
      heading={isBusiness ? 'Your business address' : 'Your home address'}
      description="Please provide your current mailing address."
      defaultValues={{
        street1: address?.street1 ?? contractor?.address?.street1 ?? '',
        street2: address?.street2 ?? contractor?.address?.street2 ?? '',
        city: address?.city ?? contractor?.address?.city ?? '',
        state: address?.state ?? contractor?.address?.state ?? '',
        zip: address?.zip ?? contractor?.address?.zip ?? '',
      }}
      isPending={isPending}
      onSubmit={handleSubmit}
    />
  )
}
