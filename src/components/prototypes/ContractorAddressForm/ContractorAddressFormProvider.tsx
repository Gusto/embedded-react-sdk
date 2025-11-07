import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { useContractorsGetSuspense } from '@gusto/embedded-api/react-query/contractorsGet'
import { useContractorsGetAddressSuspense } from '@gusto/embedded-api/react-query/contractorsGetAddress'
import { useContractorsUpdateAddressMutation } from '@gusto/embedded-api/react-query/contractorsUpdateAddress'
import type { PutV1ContractorsContractorUuidAddressResponse } from '@gusto/embedded-api/models/operations/putv1contractorscontractoruuidaddress'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type {
  ContractorAddressFormDefaultValues,
  ContractorAddressFormValues,
} from './useContractorAddressForm'
import {
  ContractorAddressFormPropsProvider,
  ContractorAddressFormSchema,
} from './useContractorAddressForm'
import { Street1, Street2, City, State, Zip } from './ContractorAddressFormFields'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponentProvider } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'

export interface ComposedContractorAddressFormProviderProps extends BaseComponentInterface {
  contractorId: string
  children?: ReactNode
  defaultValues?: ContractorAddressFormDefaultValues
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
  defaultValues,
}: ComposedContractorAddressFormProviderProps) {
  const { baseSubmitHandler } = useBase()

  const { data: contractorData } = useContractorsGetSuspense({ contractorUuid: contractorId })
  const { data: addressData } = useContractorsGetAddressSuspense({ contractorUuid: contractorId })

  const { mutateAsync: updateAddress, isPending: isUpdatingAddressPending } =
    useContractorsUpdateAddressMutation()

  const address = addressData.contractorAddress

  const formDefaultValues = {
    street1: address?.street1 || defaultValues?.street1 || '',
    street2: address?.street2 || defaultValues?.street2 || '',
    city: address?.city || defaultValues?.city || '',
    state: address?.state || defaultValues?.state || '',
    zip: address?.zip || defaultValues?.zip || '',
  }

  const formMethods = useForm<ContractorAddressFormValues>({
    resolver: zodResolver(ContractorAddressFormSchema),
    defaultValues: formDefaultValues,
  })

  // TODO: This is not super elegant, we need to return the API responses from the onSubmit
  // so that we can use those in the onEvent for the parent component but hook form does not
  // allow doing that through the submit handler. This provides a workaround.
  const onSubmit = async () => {
    return new Promise<{
      updatedContractorAddressResponse: PutV1ContractorsContractorUuidAddressResponse | undefined
    }>((resolve, reject) => {
      formMethods
        .handleSubmit(
          async (data: ContractorAddressFormValues) => {
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

            resolve({ updatedContractorAddressResponse: response })
          },
          () => {
            resolve({ updatedContractorAddressResponse: undefined })
          },
        )()
        .catch(reject)
    })
  }

  const Fields = useMemo(
    () => ({
      Street1,
      Street2,
      City,
      State,
      Zip,
    }),
    [],
  )

  return (
    <ContractorAddressFormPropsProvider
      value={{
        contractor: contractorData.contractor,
        address: address,
        isUpdating: isUpdatingAddressPending,
        onSubmit,
        Fields,
      }}
    >
      <FormProvider {...formMethods}>{children}</FormProvider>
    </ContractorAddressFormPropsProvider>
  )
}

export { ComposedContractorAddressFormProvider as ContractorAddressFormProvider }
