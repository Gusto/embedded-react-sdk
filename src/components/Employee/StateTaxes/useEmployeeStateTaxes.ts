import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { useEffect } from 'react'
import { useEmployeeTaxSetupGetStateTaxesSuspense } from '@gusto/embedded-api/react-query/employeeTaxSetupGetStateTaxes'
import { useEmployeeTaxSetupUpdateStateTaxesMutation } from '@gusto/embedded-api/react-query/employeeTaxSetupUpdateStateTaxes'
import { StateFormSchema, type StateFormPayload } from './StateForm'
import { useBase } from '@/components/Base'
import { componentEvents } from '@/shared/constants'
import { snakeCaseToCamelCase } from '@/helpers/formattedStrings'

const DEFAULT_TAX_VALID_FROM = '2010-01-01'

interface UseEmployeeStateTaxesProps {
  employeeId: string
  isAdmin?: boolean
}

export function useEmployeeStateTaxes({ employeeId, isAdmin = false }: UseEmployeeStateTaxesProps) {
  const { onEvent, fieldErrors, baseSubmitHandler } = useBase()

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
        const key = msgObject.errorKey.replace('.value', '')
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

  return {
    data: {
      employeeStateTaxes,
    },
    actions: {
      onSubmit: handleSubmit(onSubmit),
    },
    meta: {
      isPending,
      isAdmin,
    },
    form: formMethods,
  }
}
