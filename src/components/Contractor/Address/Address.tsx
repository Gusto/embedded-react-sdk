import type { ReactNode } from 'react'
import { useContractorsGetSuspense } from '@gusto/embedded-api/react-query/contractorsGet'
import { useContractorsGetAddressSuspense } from '@gusto/embedded-api/react-query/contractorsGetAddress'
import { useContractorsUpdateAddressMutation } from '@gusto/embedded-api/react-query/contractorsUpdateAddress'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AddressFormSchema, AddressProvider } from './useAddress'
import { Head } from './Head'
import { Form } from './Form'
import { Actions } from './Actions'
import type { AddressDefaultValues, AddressFormValues } from './useAddress'
import { Form as HtmlForm } from '@/components/Common/Form/Form'
import { useI18n, useComponentDictionary } from '@/i18n'
import { Flex } from '@/components/Common'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { contractorEvents } from '@/shared/constants'

export interface AddressProps extends BaseComponentInterface<'Contractor.Address'> {
  contractorId: string
  defaultValues?: AddressDefaultValues
  children?: ReactNode
  className?: string
}

export function Address(props: AddressProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ contractorId, defaultValues, children, className, dictionary }: AddressProps) {
  useComponentDictionary('Contractor.Address', dictionary)
  useI18n('Contractor.Address')

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

  return (
    <section className={className}>
      <AddressProvider
        value={{
          contractor,
          contractorType,
          address,
          isPending: isUpdatingAddressPending,
        }}
      >
        <FormProvider {...formMethods}>
          <HtmlForm onSubmit={formMethods.handleSubmit(onSubmit)}>
            <Flex flexDirection="column" gap={32}>
              {children ? (
                children
              ) : (
                <>
                  <Head />
                  <Form />
                  <Actions />
                </>
              )}
            </Flex>
          </HtmlForm>
        </FormProvider>
      </AddressProvider>
    </section>
  )
}

export default Address
