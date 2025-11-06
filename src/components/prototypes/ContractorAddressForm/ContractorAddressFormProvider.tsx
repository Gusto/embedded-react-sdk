import type { ReactNode } from 'react'
import { useContractorsGetSuspense } from '@gusto/embedded-api/react-query/contractorsGet'
import { useContractorsGetAddressSuspense } from '@gusto/embedded-api/react-query/contractorsGetAddress'
import { useContractorsUpdateAddressMutation } from '@gusto/embedded-api/react-query/contractorsUpdateAddress'
import type { PutV1ContractorsContractorUuidAddressResponse } from '@gusto/embedded-api/models/operations/putv1contractorscontractoruuidaddress'
import type { ContractorAddressFormValues } from './useContractorAddressForm'
import { ContractorAddressFormPropsProvider } from './useContractorAddressForm'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponentProvider } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'

export interface ComposedContractorAddressFormProviderProps extends BaseComponentInterface {
  contractorId: string
  children?: ReactNode
}

function ComposedContractorAddressFormProvider(props: ComposedContractorAddressFormProviderProps) {
  return (
    <BaseComponentProvider {...props}>
      <ContractorAddressFormProvider {...props}>{props.children}</ContractorAddressFormProvider>
    </BaseComponentProvider>
  )
}

function ContractorAddressFormProvider({
  contractorId,
  children,
}: ComposedContractorAddressFormProviderProps) {
  const { baseSubmitHandler } = useBase()

  const { data: contractorData } = useContractorsGetSuspense({ contractorUuid: contractorId })
  const { data: addressData } = useContractorsGetAddressSuspense({ contractorUuid: contractorId })

  const { mutateAsync: updateAddress, isPending: isUpdatingAddressPending } =
    useContractorsUpdateAddressMutation()

  const address = addressData.contractorAddress

  const formDefaultValues = {
    street1: address?.street1 || '',
    street2: address?.street2 || '',
    city: address?.city || '',
    state: address?.state || '',
    zip: address?.zip || '',
  }

  const onSubmit = async (data: ContractorAddressFormValues) => {
    let response: PutV1ContractorsContractorUuidAddressResponse | undefined

    await baseSubmitHandler(data, async payload => {
      response = await updateAddress({
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
    })

    return { updatedContractorAddressResponse: response }
  }

  return (
    <ContractorAddressFormPropsProvider
      value={{
        contractor: contractorData.contractor,
        address: address,
        isUpdating: isUpdatingAddressPending,
        onSubmit,
        defaultValues: formDefaultValues,
      }}
    >
      {children}
    </ContractorAddressFormPropsProvider>
  )
}

export { ComposedContractorAddressFormProvider as ContractorAddressFormProvider }
