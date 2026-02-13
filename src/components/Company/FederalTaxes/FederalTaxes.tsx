import { FormProvider } from 'react-hook-form'
import { useCompanyFederalTaxes } from './useCompanyFederalTaxes'
import { FederalTaxesProvider, type FederalTaxesDefaultValues } from './useFederalTaxes'
import { Form as HtmlForm } from '@/components/Common/Form'
import { Form } from '@/components/Company/FederalTaxes/Form'
import { Actions } from '@/components/Company/FederalTaxes/Actions'
import { Head } from '@/components/Company/FederalTaxes/Head'
import { useI18n } from '@/i18n'
import type { BaseComponentInterface, CommonComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { Flex } from '@/components/Common'
import { useComponentDictionary } from '@/i18n'

interface FederalTaxesProps extends CommonComponentInterface<'Company.FederalTaxes'> {
  companyId: string
  defaultValues?: FederalTaxesDefaultValues
}

export function FederalTaxes(props: FederalTaxesProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ companyId, children, className, defaultValues, dictionary }: FederalTaxesProps) {
  useI18n('Company.FederalTaxes')
  useComponentDictionary('Company.FederalTaxes', dictionary)

  const {
    data: { federalTaxDetails },
    actions: { handleSubmit },
    meta: { isPending },
    form: { formMethods },
  } = useCompanyFederalTaxes({ companyId, defaultValues })

  return (
    <section className={className}>
      <FederalTaxesProvider
        value={{
          isPending,
          federalTaxDetails,
        }}
      >
        <FormProvider {...formMethods}>
          <HtmlForm onSubmit={formMethods.handleSubmit(handleSubmit)}>
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
      </FederalTaxesProvider>
    </section>
  )
}
