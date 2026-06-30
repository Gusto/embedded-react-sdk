import type { ReactNode } from 'react'
import { useContractorsGetSuspense } from '@gusto/embedded-api-v-2026-06-15/react-query/contractorsGet'
import { useContractorsGetAddressSuspense } from '@gusto/embedded-api-v-2026-06-15/react-query/contractorsGetAddress'
import { useContractorsUpdateAddressMutation } from '@gusto/embedded-api-v-2026-06-15/react-query/contractorsUpdateAddress'
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

/**
 * Props for {@link Address}.
 *
 * @public
 */
export interface AddressProps extends BaseComponentInterface<'Contractor.Address'> {
  /** The associated contractor identifier. */
  contractorId: string
  /** Pre-fill values for address fields. Server data takes precedence when the contractor already has an address on file. */
  defaultValues?: AddressDefaultValues
  /** Custom composition slot. When provided, replaces the default Head, Form, and Actions layout — use the bundled subcomponents alongside {@link useAddress} to read form context. */
  children?: ReactNode
  /** Optional class applied to the wrapping `<section>`. */
  className?: string
}

/**
 * Form for collecting and updating a contractor's mailing address. Renders a business or home address title based on the contractor type.
 *
 * @remarks
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/address/updated` | Fired after the address is saved | The updated `ContractorAddress` entity |
 * | `contractor/address/done` | Fired after a successful save so the parent flow can advance | — |
 *
 * @param props - See {@link AddressProps}.
 * @returns The contractor address form.
 * @public
 *
 * @example
 * ```tsx
 * import { ContractorOnboarding } from '@gusto/embedded-react-sdk'
 *
 * function MyComponent() {
 *   return (
 *     <ContractorOnboarding.Address
 *       contractorId="contractor-uuid"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
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
          contractorAddressUpdateBody: {
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
            <Flex flexDirection="column" gap={32} alignItems="stretch">
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
