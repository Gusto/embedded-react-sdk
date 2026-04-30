import { useContractorsGetSuspense } from '@gusto/embedded-api/react-query/contractorsGet'
import { useContractorsGetAddressSuspense } from '@gusto/embedded-api/react-query/contractorsGetAddress'
import { useContractorsUpdateAddressMutation } from '@gusto/embedded-api/react-query/contractorsUpdateAddress'
import { AddressForm, type AddressFormValues } from '../../common/AddressForm'
import { BaseComponent, useBase } from '@/components/Base'
import { componentEvents } from '@/shared/constants'

interface ContractorAddressProps {
  contractorId: string
  onEvent: (eventType: string, data?: unknown) => void
}

export function ContractorAddress(props: ContractorAddressProps) {
  return (
    <BaseComponent onEvent={props.onEvent}>
      <Root contractorId={props.contractorId} />
    </BaseComponent>
  )
}

function Root({ contractorId }: { contractorId: string }) {
  const { onEvent, baseSubmitHandler } = useBase()

  const { data: contractorData } = useContractorsGetSuspense({ contractorUuid: contractorId })
  const { data: addressData } = useContractorsGetAddressSuspense({ contractorUuid: contractorId })

  const contractor = contractorData.contractor
  const address = addressData.contractorAddress

  const { mutateAsync: updateAddress, isPending } = useContractorsUpdateAddressMutation()

  const handleSubmit = async (data: AddressFormValues) => {
    await baseSubmitHandler(data, async payload => {
      const { contractorAddress } = await updateAddress({
        request: {
          contractorUuid: contractorId,
          requestBody: {
            version: address?.version as string,
            street1: payload.street1,
            street2: payload.street2,
            city: payload.city,
            state: payload.state,
            zip: payload.zip,
          },
        },
      })

      onEvent(componentEvents.CONTRACTOR_ADDRESS_UPDATED, contractorAddress)
      onEvent(componentEvents.CONTRACTOR_ADDRESS_DONE)
    })
  }

  return (
    <AddressForm
      heading={contractor?.type === 'Business' ? 'Business address' : 'Home address'}
      description={
        contractor?.type === 'Business'
          ? "Enter the contractor's business address."
          : "Enter the contractor's home address."
      }
      defaultValues={{
        street1: address?.street1 || '',
        street2: address?.street2 || '',
        city: address?.city || '',
        state: address?.state || '',
        zip: address?.zip || '',
      }}
      isPending={isPending}
      onSubmit={handleSubmit}
    />
  )
}
