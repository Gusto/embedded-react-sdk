import { useFederalTaxDetailsUpdateMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/federalTaxDetailsUpdate'
import { useFederalTaxDetailsGetSuspense } from '@gusto/embedded-api-v-2025-11-15/react-query/federalTaxDetailsGet'
import type {
  FilingForm,
  TaxPayerType,
} from '@gusto/embedded-api-v-2025-11-15/models/components/federaltaxdetails'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { Flex } from '@/components/Common'
import { companyEvents } from '@/shared/constants'
import { useComponentDictionary } from '@/i18n'

/**
 * Props for the {@link FederalTaxes} component.
 *
 * @public
 */
export interface FederalTaxesProps extends BaseComponentInterface<'Company.FederalTaxes'> {
  /** Identifier of the company whose federal tax details are being collected. */
  companyId: string
  /**
   * Pre-populated values for the federal tax form. At least one of `taxPayerType`,
   * `filingForm`, or `legalName` must be provided — see {@link FederalTaxesDefaultValues}.
   */
  defaultValues?: FederalTaxesDefaultValues
}

/**
 * Collects company federal tax information including EIN, tax payer type, filing form, and legal name.
 *
 * @remarks
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `company/federalTaxes/updated` | Federal tax details were successfully updated | {@link FederalTaxDetails} |
 * | `company/federalTaxes/done` | The federal tax update step is complete | — |
 *
 * @param props - Component props including `companyId` and optional `defaultValues`.
 * @returns The rendered federal taxes form.
 * @public
 */
export function FederalTaxes(props: FederalTaxesProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ companyId, children, className, defaultValues, dictionary }: FederalTaxesProps) {
  useI18n('Company.FederalTaxes')
  useComponentDictionary('Company.FederalTaxes', dictionary)
  const { onEvent, baseSubmitHandler } = useBase()

  const { data } = useFederalTaxDetailsGetSuspense({ companyId })
  const federalTaxDetails = data.federalTaxDetails!

  const { mutateAsync: updateFederalTaxDetails, isPending } = useFederalTaxDetailsUpdateMutation()

  const formMethods = useForm<FederalTaxFormInputs>({
    resolver: zodResolver(FederalTaxFormSchema),
    defaultValues: {
      federalEin: federalTaxDetails.hasEin ? undefined : '',
      taxPayerType: federalTaxDetails.taxPayerType
        ? federalTaxDetails.taxPayerType
        : defaultValues?.taxPayerType,
      filingForm: federalTaxDetails.filingForm
        ? federalTaxDetails.filingForm
        : defaultValues?.filingForm,
      legalName: federalTaxDetails.legalName ?? defaultValues?.legalName,
    },
  })

  const handleSubmit = async (data: FederalTaxFormInputs) => {
    await baseSubmitHandler(data, async payload => {
      const updateFederalTaxDetailsResponse = await updateFederalTaxDetails({
        request: {
          companyId: companyId,
          federalTaxDetailsUpdate: {
            ein: payload.federalEin,
            taxPayerType: payload.taxPayerType as TaxPayerType | undefined,
            filingForm: payload.filingForm as FilingForm | undefined,
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
      </FederalTaxesProvider>
    </section>
  )
}
