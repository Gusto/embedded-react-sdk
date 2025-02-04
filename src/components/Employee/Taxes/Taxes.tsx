import { valibotResolver } from '@hookform/resolvers/valibot'
import { Form } from 'react-aria-components'
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as v from 'valibot'

import {
  useBase,
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
  createCompoundContext,
} from '@/components/Base'
import { useFlow, type EmployeeOnboardingContextInterface } from '@/components/Flow'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { Actions } from './Actions'
import {
  FederalForm,
  FederalFormSchema,
  type FederalFormInputs,
  type FederalFormPayload,
} from './FederalForm'
import { FederalHead } from './FederalHead'
import { StateForm, StateFormSchema, type StateFormPayload } from './StateForm'
import type { Schemas } from '@/types/schema'
import {
  useGetEmployeeFederalTaxes,
  useGetEmployeeStateTaxes,
  useUpdateEmployeeFederalTaxes,
  useUpdateEmployeeStateTaxes,
} from '@/api/queries/employee'
import { useEffect } from 'react'

interface TaxesProps extends CommonComponentInterface {
  employeeId: string
  isAdmin?: boolean
}
type TaxesContextType = {
  employeeStateTaxes: Schemas['Employee-State-Tax'][]
  isPending: boolean
  isAdmin: boolean
}

const [useTaxes, TaxesProvider] = createCompoundContext<TaxesContextType>('TaxesContext')
export { useTaxes }

export function Taxes(props: TaxesProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = (props: TaxesProps) => {
  const { employeeId, className, children, isAdmin = false } = props
  const { onEvent, fieldErrors, baseSubmitHandler } = useBase()
  useI18n('Employee.Taxes')

  const { data: employeeFederalTaxes } = useGetEmployeeFederalTaxes(employeeId)
  const { data: employeeStateTaxes } = useGetEmployeeStateTaxes(employeeId)

  const defaultValues = {
    ...employeeFederalTaxes,
    two_jobs: employeeFederalTaxes.two_jobs ? 'true' : 'false',
    deductions: employeeFederalTaxes.deductions ? Number(employeeFederalTaxes.deductions) : 0,
    dependents_amount: employeeFederalTaxes.dependents_amount
      ? Number(employeeFederalTaxes.dependents_amount)
      : 0,
    other_income: employeeFederalTaxes.other_income ? Number(employeeFederalTaxes.other_income) : 0,
    extra_withholding: employeeFederalTaxes.extra_withholding
      ? Number(employeeFederalTaxes.extra_withholding)
      : 0,
    states: employeeStateTaxes.reduce((acc: Record<string, unknown>, state) => {
      acc[state.state] = state.questions.reduce((acc: Record<string, unknown>, question) => {
        const value = question.answers[0]?.value
        // Default new hire report to true if not specified
        if (question.key === 'file_new_hire_report') {
          acc[question.key] = typeof value === 'undefined' ? true : value
        } else {
          acc[question.key] = value ?? ''
        }
        return acc
      }, {})
      return acc
    }, {}),
  }

  const formMethods = useForm<FederalFormInputs, unknown, FederalFormPayload & StateFormPayload>({
    resolver: valibotResolver(
      v.object({ ...FederalFormSchema.entries, ...StateFormSchema.entries }),
    ),
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

  const federalTaxesMutation = useUpdateEmployeeFederalTaxes(employeeId)
  const stateTaxesMutation = useUpdateEmployeeStateTaxes(employeeId)

  const onSubmit: SubmitHandler<FederalFormPayload & StateFormPayload> = async data => {
    await baseSubmitHandler(data, async payload => {
      const { states: statesPayload, ...federalPayload } = payload
      //Federal Taxes
      const federalTaxesResponse = await federalTaxesMutation.mutateAsync({
        body: {
          ...federalPayload,
          two_jobs: federalPayload.two_jobs === 'true',
          version: employeeFederalTaxes.version,
        },
      })
      onEvent(componentEvents.EMPLOYEE_FEDERAL_TAXES_UPDATED, federalTaxesResponse)
      //State Taxes
      const body = {
        states: employeeStateTaxes.map(state => ({
          state: state.state,
          questions: state.questions.map(question => ({
            key: question.key,
            answers: [
              {
                valid_from: question.answers[0]?.valid_from ?? '2010-01-01', //Currently always that date
                valid_up_to: question.answers[0]?.valid_up_to ?? null, //Currently always null
                value: statesPayload[state.state]?.[question.key] as string,
              },
            ],
          })),
        })),
      }
      const stateTaxesResponse = await stateTaxesMutation.mutateAsync({ body })
      onEvent(componentEvents.EMPLOYEE_STATE_TAXES_UPDATED, stateTaxesResponse)
      onEvent(componentEvents.EMPLOYEE_TAXES_DONE)
    })
  }

  return (
    <section className={className}>
      <TaxesProvider
        value={{
          employeeStateTaxes,
          isAdmin: isAdmin,
          isPending: federalTaxesMutation.isPending || stateTaxesMutation.isPending,
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
  const { employeeId, onEvent, isAdmin } = useFlow<EmployeeOnboardingContextInterface>()
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
