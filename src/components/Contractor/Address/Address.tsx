import type { ReactNode } from 'react'
import { FormProvider } from 'react-hook-form'
import { useContractorAddress } from './useContractorAddress'
import { AddressProvider } from './useAddress'
import type { AddressDefaultValues } from './useAddress'
import { Head } from './Head'
import { Form } from './Form'
import { Actions } from './Actions'
import { Form as HtmlForm } from '@/components/Common/Form/Form'
import { useI18n, useComponentDictionary } from '@/i18n'
import { Flex } from '@/components/Common'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'

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

  const {
    data: { contractor, contractorType, address },
    actions: { onSubmit },
    meta: { isPending },
    form: { formMethods },
  } = useContractorAddress({ contractorId, defaultValues })

  return (
    <section className={className}>
      <AddressProvider
        value={{
          contractor,
          contractorType,
          address,
          isPending,
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
