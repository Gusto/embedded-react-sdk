import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { useEmployeeTaxSetupGetFederalTaxesSuspense } from '@gusto/embedded-api/react-query/employeeTaxSetupGetFederalTaxes'
import { useEmployeeTaxSetupUpdateFederalTaxesMutation } from '@gusto/embedded-api/react-query/employeeTaxSetupUpdateFederalTaxes'
import { useEmployeeTaxSetupGetStateTaxesSuspense } from '@gusto/embedded-api/react-query/employeeTaxSetupGetStateTaxes'
import { useEmployeeTaxSetupUpdateStateTaxesMutation } from '@gusto/embedded-api/react-query/employeeTaxSetupUpdateStateTaxes'
import type { OnboardingContextInterface } from '../OnboardingFlow/OnboardingFlow'
import { Actions } from './Actions'
import {
  FederalForm,
  FederalFormSchema,
  type FederalFormInputs,
  type FederalFormPayload,
} from './FederalForm'
import { FederalHead } from './FederalHead'
import { StateForm, StateFormSchema, type StateFormPayload } from './StateForm'
import { TaxesProvider } from './useTaxes'
import {
  useBase,
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { useFlow } from '@/components/Flow/useFlow'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { snakeCaseToCamelCase } from '@/helpers/formattedStrings'
import { Form } from '@/components/Common/Form'
import { useComponentDictionary } from '@/i18n/I18n'

const DEFAULT_TAX_VALID_FROM = '2010-01-01'

interface TaxesProps extends CommonComponentInterface<'Employee.Taxes'> {
  employeeId: string
  isAdmin?: boolean
}

export function Taxes(props: TaxesProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = (props: TaxesProps) => {
  const { employeeId, className, children, isAdmin = false, dictionary } = props
  const { onEvent, fieldErrors, baseSubmitHandler } = useBase()
  useI18n('Employee.Taxes')
  useComponentDictionary('Employee.Taxes', dictionary)

  const { data: fedData } = useEmployeeTaxSetupGetFederalTaxesSuspense({
    employeeUuid: employeeId,
  })
  const employeeFederalTax = fedData.employeeFederalTax!

  const { mutateAsync: updateFederalTaxes, isPending: isPendingFederalTaxes } =
    useEmployeeTaxSetupUpdateFederalTaxesMutation()

  const { data: stateData } = useEmployeeTaxSetupGetStateTaxesSuspense({
    employeeUuid: employeeId,
  })
  const employeeStateTaxes = stateData.employeeStateTaxesList!
  const { mutateAsync: updateStateTaxes, isPending: isPendingStateTaxes } =
    useEmployeeTaxSetupUpdateStateTaxesMutation()

  const defaultValues = {
    ...employeeFederalTax,
    filingStatus: employeeFederalTax.filingStatus ?? undefined,
    twoJobs: employeeFederalTax.twoJobs ? 'true' : 'false',
    deductions: employeeFederalTax.deductions ? Number(employeeFederalTax.deductions) : 0,
    dependentsAmount: employeeFederalTax.dependentsAmount
      ? Number(employeeFederalTax.dependentsAmount)
      : 0,
    otherIncome: employeeFederalTax.otherIncome ? Number(employeeFederalTax.otherIncome) : 0,
    extraWithholding: employeeFederalTax.extraWithholding
      ? Number(employeeFederalTax.extraWithholding)
      : 0,
    states: employeeStateTaxes.reduce((acc: Record<string, unknown>, state) => {
      if (state.state) {
        acc[state.state] = state.questions?.reduce((acc: Record<string, unknown>, question) => {
          const value = question.answers[0]?.value
          const key = snakeCaseToCamelCase(question.key)
          // Default new hire report to true if not specified
          if (key === 'fileNewHireReport') {
            acc[key] = typeof value === 'undefined' ? true : value
          } else {
            acc[key] = value
          }
          return acc
        }, {})
      }
      return acc
    }, {}),
  }

  const formMethods = useForm<FederalFormInputs, unknown, FederalFormPayload & StateFormPayload>({
    resolver: zodResolver(FederalFormSchema.merge(StateFormSchema)),
    defaultValues,
  })
  const { handleSubmit, setError: _setError } = formMethods

  useEffect(() => {
    //If list of field specific errors from API is present, mark corresponding fields as invalid
    if (fieldErrors && fieldErrors.length > 0) {
      fieldErrors.forEach(msgObject => {
        const key = msgObject.key.replace('.value', '')
        _setError(key as keyof FederalFormInputs, { type: 'custom', message: msgObject.message })
      })
    }
  }, [fieldErrors, _setError])

  const onSubmit: SubmitHandler<FederalFormPayload & StateFormPayload> = async data => {
    await baseSubmitHandler(data, async payload => {
      const { states: statesPayload, ...federalPayload } = payload

      const federalTaxesResponse = await updateFederalTaxes({
        request: {
          employeeUuid: employeeId,
          requestBody: {
            ...federalPayload,
            twoJobs: federalPayload.twoJobs === 'true',
            version: employeeFederalTax.version,
          },
        },
      })
      onEvent(componentEvents.EMPLOYEE_FEDERAL_TAXES_UPDATED, federalTaxesResponse)

      //State Taxes - only process if statesPayload exists
      if (statesPayload && Object.keys(statesPayload).length > 0) {
        const states = []

        for (const state of employeeStateTaxes) {
          const stateName = state.state

          if (stateName) {
            states.push({
              state: stateName,
              questions: state.questions?.map(question => {
                const formValue = statesPayload[stateName]?.[snakeCaseToCamelCase(question.key)]
                return {
                  key: question.key,
                  answers: [
                    {
                      validFrom: question.answers[0]?.validFrom ?? DEFAULT_TAX_VALID_FROM,
                      validUpTo: question.answers[0]?.validUpTo ?? null,
                      value:
                        formValue == null || (typeof formValue === 'number' && isNaN(formValue))
                          ? ''
                          : (formValue as string | number | boolean),
                    },
                  ],
                }
              }),
            })
          }
        }

        const stateTaxesResponse = await updateStateTaxes({
          request: { employeeUuid: employeeId, employeeStateTaxesRequest: { states } },
        })
        onEvent(componentEvents.EMPLOYEE_STATE_TAXES_UPDATED, stateTaxesResponse)
      }

      onEvent(componentEvents.EMPLOYEE_TAXES_DONE)
    })
  }

  return (
    <section className={className}>
      <TaxesProvider
        value={{
          employeeStateTaxes,
          isAdmin: isAdmin,
          isPending: isPendingFederalTaxes || isPendingStateTaxes,
        }}
      >
        <FormProvider {...formMethods}>
          <Form onSubmit={handleSubmit(onSubmit)}>
            {children ? (
              children
            ) : (
              <>
                <FederalHead />
                <FederalForm />
                <StateForm />
                <Actions />
              </>
            )}
          </Form>
        </FormProvider>
      </TaxesProvider>
    </section>
  )
}
Taxes.FederalHead = FederalHead
Taxes.FederalForm = FederalForm
Taxes.StateForm = StateForm
Taxes.Actions = Actions

export const TaxesContextual = () => {
  const { employeeId, onEvent, isAdmin } = useFlow<OnboardingContextInterface>()
  const { t } = useTranslation()
  if (!employeeId) {
    throw new Error(
      t('errors.missingParamsOrContext', {
        component: 'EmployeeTaxes',
        param: 'employeeId',
        provider: 'FlowProvider',
      }),
    )
  }
  return <Taxes employeeId={employeeId} onEvent={onEvent} isAdmin={isAdmin ?? false} />
}
