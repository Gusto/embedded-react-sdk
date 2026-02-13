import { useFederalTaxDetailsUpdateMutation } from '@gusto/embedded-api/react-query/federalTaxDetailsUpdate'
import { useFederalTaxDetailsGetSuspense } from '@gusto/embedded-api/react-query/federalTaxDetailsGet'
import type {
  FilingForm,
  TaxPayerType,
} from '@gusto/embedded-api/models/operations/putv1companiescompanyidfederaltaxdetails'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  type FederalTaxFormInputs,
  FederalTaxFormSchema,
  type FederalTaxesDefaultValues,
} from './useFederalTaxes'
import { useBase } from '@/components/Base/useBase'
import { companyEvents } from '@/shared/constants'

interface UseCompanyFederalTaxesProps {
  companyId: string
  defaultValues?: FederalTaxesDefaultValues
}

export function useCompanyFederalTaxes({ companyId, defaultValues }: UseCompanyFederalTaxesProps) {
  const { onEvent, baseSubmitHandler } = useBase()

  const { data } = useFederalTaxDetailsGetSuspense({ companyId })
  const federalTaxDetails = data.federalTaxDetails!

  const { mutateAsync: updateFederalTaxDetails, isPending } = useFederalTaxDetailsUpdateMutation()

  const formMethods = useForm<FederalTaxFormInputs>({
    resolver: zodResolver(FederalTaxFormSchema),
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

  return {
    data: {
      federalTaxDetails,
    },
    actions: {
      handleSubmit,
    },
    meta: {
      isPending,
    },
    form: {
      formMethods,
    },
  }
}
