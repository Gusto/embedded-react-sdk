import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form'
import { useEffect } from 'react'
import { useEmployeeTaxSetupGetStateTaxesSuspense } from '@gusto/embedded-api/react-query/employeeTaxSetupGetStateTaxes'
import { useEmployeeTaxSetupUpdateStateTaxesMutation } from '@gusto/embedded-api/react-query/employeeTaxSetupUpdateStateTaxes'
import { StateForm } from './StateForm'
import { StateFormSchema, type StateFormPayload } from './StateForm'
import { Actions } from './Actions'
import { StateTaxesProvider } from './useStateTaxes'
import {
  useBase,
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { Form } from '@/components/Common/Form'
import { useComponentDictionary } from '@/i18n/I18n'
import { snakeCaseToCamelCase } from '@/helpers/formattedStrings'

const DEFAULT_TAX_VALID_FROM = '2010-01-01'

interface StateTaxesProps extends CommonComponentInterface<'Employee.StateTaxes'> {
  employeeId: string
  isAdmin?: boolean
}

export function StateTaxes(props: StateTaxesProps & BaseComponentInterface) {
  return (
    <BaseComponent<'Employee.StateTaxes'> {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

const Root = (props: StateTaxesProps) => {
  const { employeeId, className, children, isAdmin = false, dictionary } = props
  const { onEvent, fieldErrors, baseSubmitHandler } = useBase()
  useI18n('Employee.StateTaxes')
  useComponentDictionary('Employee.StateTaxes', dictionary)

  const { data: stateData } = useEmployeeTaxSetupGetStateTaxesSuspense({
    employeeUuid: employeeId,
  })
  const employeeStateTaxes = stateData.employeeStateTaxesList!
  const { mutateAsync: updateStateTaxes, isPending } = useEmployeeTaxSetupUpdateStateTaxesMutation()

  const defaultValues = {
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

  const formMethods = useForm<Record<string, unknown>, unknown, StateFormPayload>({
    resolver: zodResolver(StateFormSchema),
    defaultValues,
  })
  const { handleSubmit, setError: _setError } = formMethods

  useEffect(() => {
    if (fieldErrors && fieldErrors.length > 0) {
      fieldErrors.forEach(msgObject => {
        const key = msgObject.key.replace('.value', '')
        const message = typeof msgObject.message === 'string' ? msgObject.message : 'Unknown error'
        _setError(key, { type: 'custom', message })
      })
    }
  }, [fieldErrors, _setError])

  const onSubmit: SubmitHandler<StateFormPayload> = async data => {
    await baseSubmitHandler(data, async payload => {
      const { states: statesPayload } = payload

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

      onEvent(componentEvents.EMPLOYEE_STATE_TAXES_DONE)
    })
  }

  return (
    <section className={className}>
      <StateTaxesProvider
        value={{
          employeeStateTaxes,
          isAdmin: isAdmin,
          isPending,
        }}
      >
        <FormProvider {...formMethods}>
          <Form onSubmit={handleSubmit(onSubmit)}>
            {children ? (
              children
            ) : (
              <>
                <StateForm />
                <Actions />
              </>
            )}
          </Form>
        </FormProvider>
      </StateTaxesProvider>
    </section>
  )
}
