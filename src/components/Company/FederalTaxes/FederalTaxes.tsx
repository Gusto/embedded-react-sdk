import { ReactNode } from 'react'
import { useFederalTaxDetailsUpdateMutation } from '@gusto/embedded-api/react-query/federalTaxDetailsUpdate'
import { useFederalTaxDetailsGetSuspense } from '@gusto/embedded-api/react-query/federalTaxDetailsGet'
import { FormProvider, useForm } from 'react-hook-form'
import { Form as AriaForm } from 'react-aria-components'
import { valibotResolver } from '@hookform/resolvers/valibot'
import * as v from 'valibot'
import {
  TaxPayerType,
  FilingForm,
} from '@gusto/embedded-api/models/operations/putv1companiescompanyidfederaltaxdetails'
import { FederalTaxDetails } from '@gusto/embedded-api/models/components/federaltaxdetails'
import { Form } from '@/components/Company/FederalTaxes/Form'
import { Actions } from '@/components/Company/FederalTaxes/Actions'
import { Head } from '@/components/Company/FederalTaxes/Head'
import { useI18n } from '@/i18n'
import {
  BaseComponent,
  BaseComponentInterface,
  CommonComponentInterface,
  createCompoundContext,
  useBase,
} from '@/components/Base/Base'
import { Flex } from '@/components/Common'
import { companyEvents } from '@/shared/constants'
import { RequireAtLeastOne } from '@/types/Helpers'

export const FederalTaxFormSchema = v.object({
  federalEin: v.optional(v.string()),
  taxPayerType: v.optional(
    v.union(Object.values(TaxPayerType).map(taxPayerType => v.literal(taxPayerType))),
  ),
  filingForm: v.optional(
    v.union(Object.values(FilingForm).map(filingForm => v.literal(filingForm))),
  ),
  legalName: v.pipe(v.string(), v.nonEmpty()),
})

export type FederalTaxFormInputs = v.InferInput<typeof FederalTaxFormSchema>

export type FederalTaxesDefaultValues = RequireAtLeastOne<{
  taxPayerType?: FederalTaxFormInputs['taxPayerType']
  filingForm?: FederalTaxFormInputs['filingForm']
  legalName?: FederalTaxFormInputs['legalName']
}>

type FederalTaxesContextType = {
  isPending: boolean
  federalTaxDetails?: FederalTaxDetails
}

const [useFederalTaxes, FederalTaxesProvider] = createCompoundContext<FederalTaxesContextType>(
  'CompanyFederalTaxesContext',
)

export { useFederalTaxes }

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

  const {
    data: { federalTaxDetails },
  } = useFederalTaxDetailsGetSuspense({ companyId })
  const { mutateAsync: updateFederalTaxDetails, isPending } = useFederalTaxDetailsUpdateMutation()

  const formMethods = useForm<FederalTaxFormInputs>({
    resolver: valibotResolver(FederalTaxFormSchema),
    defaultValues: {
      federalEin: federalTaxDetails?.hasEin ? undefined : '',
      taxPayerType: federalTaxDetails?.taxPayerType
        ? (federalTaxDetails.taxPayerType as TaxPayerType)
        : defaultValues?.taxPayerType,
      filingForm: federalTaxDetails?.filingForm
        ? (federalTaxDetails.filingForm as FilingForm)
        : defaultValues?.filingForm,
      legalName: federalTaxDetails?.legalName ?? defaultValues?.legalName,
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
            version: federalTaxDetails?.version as string,
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
          <AriaForm onSubmit={formMethods.handleSubmit(handleSubmit)}>
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
          </AriaForm>
        </FormProvider>
      </FederalTaxesProvider>
    </section>
  )
}
