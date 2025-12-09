import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { useEmployeeTaxSetupGetFederalTaxesSuspense } from '@gusto/embedded-api/react-query/employeeTaxSetupGetFederalTaxes'
import { useEmployeeTaxSetupUpdateFederalTaxesMutation } from '@gusto/embedded-api/react-query/employeeTaxSetupUpdateFederalTaxes'
import { useEmployeeTaxSetupGetStateTaxesSuspense } from '@gusto/embedded-api/react-query/employeeTaxSetupGetStateTaxes'
import { useEmployeeTaxSetupUpdateStateTaxesMutation } from '@gusto/embedded-api/react-query/employeeTaxSetupUpdateStateTaxes'
import type { OnboardingContextInterface } from '../OnboardingFlow/OnboardingFlowComponents'
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

/**
 * @deprecated The Taxes component has been deprecated and will be removed in a future release.
 * The component has been split into separate components for state and federal. Use Employee.FederalTaxes
 * and Employee.StateTaxes components instead.
 */
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

  const isRev2020 = employeeFederalTax.w4DataType === 'rev_2020_w4'

  const statesDefaultValues = employeeStateTaxes.reduce((acc: Record<string, unknown>, state) => {
    if (state.state) {
      acc[state.state] = state.questions?.reduce((acc: Record<string, unknown>, question) => {
        const value = question.answers[0]?.value
        const key = snakeCaseToCamelCase(question.key)
        if (key === 'fileNewHireReport') {
          acc[key] = typeof value === 'undefined' ? true : value
        } else {
          acc[key] = value
        }
        return acc
      }, {})
    }
    return acc
  }, {})

  const defaultValues: FederalFormInputs & { states: typeof statesDefaultValues } = isRev2020
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
        states: statesDefaultValues,
      }
    : {
        w4DataType: 'pre_2020_w4',
        filingStatus: employeeFederalTax.filingStatus ?? '',
        federalWithholdingAllowance: employeeFederalTax.federalWithholdingAllowance ?? 0,
        additionalWithholding: employeeFederalTax.additionalWithholding,
        states: statesDefaultValues,
      }

  const formMethods = useForm<FederalFormInputs, unknown, FederalFormPayload & StateFormPayload>({
    resolver: zodResolver(FederalFormSchema.and(StateFormSchema)),
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

  const onSubmit: SubmitHandler<FederalFormPayload & StateFormPayload> = async data => {
    await baseSubmitHandler(data, async payload => {
      const { states: statesPayload, ...federalPayload } = payload

      const requestBody =
        federalPayload.w4DataType === 'rev_2020_w4'
          ? {
              filingStatus: federalPayload.filingStatus,
              twoJobs: federalPayload.twoJobs === 'true',
              dependentsAmount: federalPayload.dependentsAmount,
              otherIncome: federalPayload.otherIncome,
              deductions: federalPayload.deductions,
              extraWithholding: federalPayload.extraWithholding,
              w4DataType: federalPayload.w4DataType,
              version: employeeFederalTax.version,
            }
          : {
              filingStatus: federalPayload.filingStatus,
              federalWithholdingAllowance: federalPayload.federalWithholdingAllowance,
              additionalWithholding: federalPayload.additionalWithholding,
              w4DataType: federalPayload.w4DataType,
              version: employeeFederalTax.version,
            }

      const federalTaxesResponse = await updateFederalTaxes({
        request: {
          employeeUuid: employeeId,
          requestBody,
        },
      })
      onEvent(componentEvents.EMPLOYEE_FEDERAL_TAXES_UPDATED, federalTaxesResponse)

      if (statesPayload && Object.keys(statesPayload).length > 0) {
        const states = []

        for (const state of employeeStateTaxes) {
          const stateName = state.state

          if (stateName && state.questions !== undefined) {
            states.push({
              state: stateName,
              questions: state.questions
                .map(question => {
                  if (question.isQuestionForAdminOnly && !isAdmin) {
                    return null
                  }
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
                })
                .filter(q => q !== null),
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
