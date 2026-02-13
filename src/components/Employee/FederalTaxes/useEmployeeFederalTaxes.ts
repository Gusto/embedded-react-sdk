import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { useEffect } from 'react'
import { useEmployeeTaxSetupGetFederalTaxesSuspense } from '@gusto/embedded-api/react-query/employeeTaxSetupGetFederalTaxes'
import { useEmployeeTaxSetupUpdateFederalTaxesMutation } from '@gusto/embedded-api/react-query/employeeTaxSetupUpdateFederalTaxes'
import { FederalFormSchema, type FederalFormInputs, type FederalFormPayload } from './FederalForm'
import { useBase } from '@/components/Base'
import { componentEvents } from '@/shared/constants'

interface UseEmployeeFederalTaxesProps {
  employeeId: string
}

export function useEmployeeFederalTaxes({ employeeId }: UseEmployeeFederalTaxesProps) {
  const { onEvent, fieldErrors, baseSubmitHandler } = useBase()

  const { data: fedData } = useEmployeeTaxSetupGetFederalTaxesSuspense({
    employeeUuid: employeeId,
  })
  const employeeFederalTax = fedData.employeeFederalTax!

  const { mutateAsync: updateFederalTaxes, isPending } =
    useEmployeeTaxSetupUpdateFederalTaxesMutation()

  const isRev2020 = employeeFederalTax.w4DataType === 'rev_2020_w4'

  const defaultValues: FederalFormInputs = isRev2020
    ? {
        w4DataType: 'rev_2020_w4',
        filingStatus: employeeFederalTax.filingStatus ?? '',
        twoJobs: employeeFederalTax.twoJobs ? 'true' : 'false',
        deductions: employeeFederalTax.deductions ? Number(employeeFederalTax.deductions) : 0,
        dependentsAmount: employeeFederalTax.dependentsAmount
          ? Number(employeeFederalTax.dependentsAmount)
          : 0,
        otherIncome: employeeFederalTax.otherIncome ? Number(employeeFederalTax.otherIncome) : 0,
        extraWithholding: employeeFederalTax.extraWithholding
          ? Number(employeeFederalTax.extraWithholding)
          : 0,
      }
    : {
        w4DataType: 'pre_2020_w4',
        filingStatus: employeeFederalTax.filingStatus ?? '',
        federalWithholdingAllowance: employeeFederalTax.federalWithholdingAllowance ?? 0,
        additionalWithholding: employeeFederalTax.additionalWithholding,
      }

  const formMethods = useForm<FederalFormInputs, unknown, FederalFormPayload>({
    resolver: zodResolver(FederalFormSchema),
    defaultValues,
  })
  const { handleSubmit, setError: _setError } = formMethods

  useEffect(() => {
    if (fieldErrors && fieldErrors.length > 0) {
      fieldErrors.forEach(msgObject => {
        const key = msgObject.errorKey.replace('.value', '')
        _setError(key as keyof FederalFormInputs, { type: 'custom', message: msgObject.message })
      })
    }
  }, [fieldErrors, _setError])

  const onSubmit: SubmitHandler<FederalFormPayload> = async data => {
    await baseSubmitHandler(data, async payload => {
      const requestBody =
        payload.w4DataType === 'rev_2020_w4'
          ? {
              filingStatus: payload.filingStatus,
              twoJobs: payload.twoJobs === 'true',
              dependentsAmount: payload.dependentsAmount,
              otherIncome: payload.otherIncome,
              deductions: payload.deductions,
              extraWithholding: payload.extraWithholding,
              w4DataType: payload.w4DataType,
              version: employeeFederalTax.version,
            }
          : {
              filingStatus: payload.filingStatus,
              federalWithholdingAllowance: payload.federalWithholdingAllowance,
              additionalWithholding: payload.additionalWithholding,
              w4DataType: payload.w4DataType,
              version: employeeFederalTax.version,
            }

      const federalTaxesResponse = await updateFederalTaxes({
        request: {
          employeeUuid: employeeId,
          requestBody,
        },
      })
      onEvent(componentEvents.EMPLOYEE_FEDERAL_TAXES_UPDATED, federalTaxesResponse)
      onEvent(componentEvents.EMPLOYEE_FEDERAL_TAXES_DONE)
    })
  }

  return {
    data: {
      employeeFederalTax,
      isRev2020,
    },
    actions: {
      onSubmit: handleSubmit(onSubmit),
    },
    meta: {
      isPending,
    },
    form: formMethods,
  }
}
