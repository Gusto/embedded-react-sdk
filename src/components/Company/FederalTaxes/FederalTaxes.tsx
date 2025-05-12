import type { ReactNode } from 'react'
import { useFederalTaxDetailsUpdateMutation } from '@gusto/embedded-api/react-query/federalTaxDetailsUpdate'
import { useFederalTaxDetailsGetSuspense } from '@gusto/embedded-api/react-query/federalTaxDetailsGet'
import type {
  FilingForm,
  TaxPayerType,
} from '@gusto/embedded-api/models/operations/putv1companiescompanyidfederaltaxdetails'
import { FormProvider, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import {
  FederalTaxesProvider,
  type FederalTaxFormInputs,
  FederalTaxFormSchema,
  type FederalTaxesDefaultValues,
} from './useFederalTaxes'
import { Form as HtmlForm } from '@/components/Common/Form'
import { Form } from '@/components/Company/FederalTaxes/Form'
import { Actions } from '@/components/Company/FederalTaxes/Actions'
import { Head } from '@/components/Company/FederalTaxes/Head'
import { useI18n } from '@/i18n'
import type { BaseComponentInterface, CommonComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { Flex } from '@/components/Common'
import { companyEvents } from '@/shared/constants'

interface FederalTaxesProps extends CommonComponentInterface {
  companyId: string
  children?: ReactNode
  className?: string
  defaultValues?: FederalTaxesDefaultValues
}

export function FederalTaxes(props: FederalTaxesProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ companyId, children, className, defaultValues }: FederalTaxesProps) {
  useI18n('Company.FederalTaxes')
  const { onEvent, baseSubmitHandler } = useBase()

  const { data } = useFederalTaxDetailsGetSuspense({ companyId })
  const federalTaxDetails = data.federalTaxDetails!

  const { mutateAsync: updateFederalTaxDetails, isPending } = useFederalTaxDetailsUpdateMutation()

  const formMethods = useForm<FederalTaxFormInputs>({
    resolver: valibotResolver(FederalTaxFormSchema),
    defaultValues: {
      federalEin: federalTaxDetails.hasEin ? undefined : '',
      taxPayerType: federalTaxDetails.taxPayerType
        ? (federalTaxDetails.taxPayerType as TaxPayerType)
        : defaultValues?.taxPayerType,
      filingForm: federalTaxDetails.filingForm
        ? (federalTaxDetails.filingForm as FilingForm)
        : defaultValues?.filingForm,
      legalName: federalTaxDetails.legalName ?? defaultValues?.legalName,
    },
  })

  const handleSubmit = async (data: FederalTaxFormInputs) => {
    await baseSubmitHandler(data, async payload => {
      const updateFederalTaxDetailsResponse = await updateFederalTaxDetails({
        request: {
          companyId: companyId,
          requestBody: {
            ein: payload.federalEin,
            taxPayerType: payload.taxPayerType,
            filingForm: payload.filingForm,
            legalName: payload.legalName,
            version: federalTaxDetails.version as string,
          },
        },
      })

      onEvent(
        companyEvents.COMPANY_FEDERAL_TAXES_UPDATED,
        updateFederalTaxDetailsResponse.federalTaxDetails,
      )
      onEvent(companyEvents.COMPANY_FEDERAL_TAXES_DONE)
    })
  }

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
