import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form'
import { useEffect } from 'react'
import { useEmployeeTaxSetupGetFederalTaxesSuspense } from '@gusto/embedded-api/react-query/employeeTaxSetupGetFederalTaxes'
import { useEmployeeTaxSetupUpdateFederalTaxesMutation } from '@gusto/embedded-api/react-query/employeeTaxSetupUpdateFederalTaxes'
import type { PutV1EmployeesEmployeeIdFederalTaxesRequestBody } from '@gusto/embedded-api/models/operations/putv1employeesemployeeidfederaltaxes'
import { FederalForm } from './FederalForm'
import { FederalFormSchema, type FederalFormInputs, type FederalFormPayload } from './FederalForm'
import { Head } from './Head'
import { Actions } from './Actions'
import { FederalTaxesProvider } from './useFederalTaxes'
import {
  useBase,
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { useI18n } from '@/i18n'
import { normalizeErrorKeyForForm } from '@/helpers/formattedStrings'
import { componentEvents } from '@/shared/constants'
import { Form } from '@/components/Common/Form'
import { useComponentDictionary } from '@/i18n/I18n'

interface FederalTaxesProps extends CommonComponentInterface<'Employee.FederalTaxes'> {
  employeeId: string
}

export function FederalTaxes(props: FederalTaxesProps & BaseComponentInterface) {
  return (
    <BaseComponent<'Employee.FederalTaxes'> {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

const Root = (props: FederalTaxesProps) => {
  const { employeeId, className, children, dictionary } = props
  const { onEvent, error, baseSubmitHandler } = useBase()
  useI18n('Employee.FederalTaxes')
  useComponentDictionary('Employee.FederalTaxes', dictionary)

  const { data: fedData } = useEmployeeTaxSetupGetFederalTaxesSuspense({
    employeeUuid: employeeId,
  })
  const employeeFederalTax = fedData.employeeFederalTax!

  const { mutateAsync: updateFederalTaxes, isPending } =
    useEmployeeTaxSetupUpdateFederalTaxesMutation()

  const isRev2020 = employeeFederalTax.w4DataType === 'rev_2020_w4'

  const defaultValues = isRev2020
    ? {
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
        filingStatus: '',
        twoJobs: 'false',
        deductions: 0,
        dependentsAmount: 0,
        otherIncome: 0,
        extraWithholding: 0,
      }

  const formMethods = useForm<FederalFormInputs, unknown, FederalFormPayload>({
    resolver: zodResolver(FederalFormSchema),
    defaultValues,
  })
  const { handleSubmit, setError: _setError } = formMethods

  const fieldErrors = error?.fieldErrors
  useEffect(() => {
    if (fieldErrors && fieldErrors.length > 0) {
      fieldErrors.forEach(fieldError => {
        const key = normalizeErrorKeyForForm(fieldError.field)
        _setError(key as keyof FederalFormInputs, { type: 'custom', message: fieldError.message })
      })
    }
  }, [fieldErrors, _setError])

  const onSubmit: SubmitHandler<FederalFormPayload> = async data => {
    await baseSubmitHandler(data, async payload => {
      const requestBody: PutV1EmployeesEmployeeIdFederalTaxesRequestBody = {
        filingStatus:
          payload.filingStatus as PutV1EmployeesEmployeeIdFederalTaxesRequestBody['filingStatus'],
        twoJobs: payload.twoJobs === 'true',
        dependentsAmount: Number(payload.dependentsAmount),
        otherIncome: Number(payload.otherIncome),
        deductions: Number(payload.deductions),
        extraWithholding: Number(payload.extraWithholding),
        w4DataType: 'rev_2020_w4',
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

  return (
    <section className={className}>
      <FederalTaxesProvider
        value={{
          isPending,
        }}
      >
        <FormProvider {...formMethods}>
          <Form onSubmit={handleSubmit(onSubmit)}>
            {children ? (
              children
            ) : (
              <>
                <Head />
                <FederalForm />
                <Actions />
              </>
            )}
          </Form>
        </FormProvider>
      </FederalTaxesProvider>
    </section>
  )
}
