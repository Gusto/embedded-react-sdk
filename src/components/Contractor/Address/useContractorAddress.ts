import { useContractorsGetSuspense } from '@gusto/embedded-api/react-query/contractorsGet'
import { useContractorsGetAddressSuspense } from '@gusto/embedded-api/react-query/contractorsGetAddress'
import { useContractorsUpdateAddressMutation } from '@gusto/embedded-api/react-query/contractorsUpdateAddress'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AddressFormSchema } from './useAddress'
import type { AddressDefaultValues, AddressFormValues } from './useAddress'
import { useBase } from '@/components/Base/useBase'
import type { OnEventType } from '@/components/Base/useBase'
import { type EventType, contractorEvents } from '@/shared/constants'

export interface UseContractorAddressProps {
  contractorId: string
  defaultValues?: AddressDefaultValues
  onEvent?: OnEventType<EventType, unknown>
}

export function useContractorAddress({ contractorId, defaultValues }: UseContractorAddressProps) {
  const { onEvent, baseSubmitHandler } = useBase()

  const { data: contractorData } = useContractorsGetSuspense({ contractorUuid: contractorId })
  const { data: addressData } = useContractorsGetAddressSuspense({ contractorUuid: contractorId })

  const { mutateAsync: updateAddress, isPending: isUpdatingAddressPending } =
    useContractorsUpdateAddressMutation()

  const contractor = contractorData.contractor
  const contractorType = contractorData.contractor?.type
  const address = addressData.contractorAddress

  const formDefaultValues = {
    street1: address?.street1 || defaultValues?.street1 || '',
    street2: address?.street2 || defaultValues?.street2 || '',
    city: address?.city || defaultValues?.city || '',
    state: address?.state || defaultValues?.state || '',
    zip: address?.zip || defaultValues?.zip || '',
  }

  const formMethods = useForm<AddressFormValues>({
    resolver: zodResolver(AddressFormSchema),
    defaultValues: formDefaultValues,
  })

  const onSubmit = async (data: AddressFormValues) => {
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

      onEvent(contractorEvents.CONTRACTOR_ADDRESS_UPDATED, contractorAddress)
      onEvent(contractorEvents.CONTRACTOR_ADDRESS_DONE)
    })
  }

  return {
    data: {
      contractor,
      contractorType,
      address,
      formDefaultValues,
    },
    actions: {
      onSubmit,
    },
    meta: {
      isPending: isUpdatingAddressPending,
    },
    form: {
      formMethods,
    },
  }
}
