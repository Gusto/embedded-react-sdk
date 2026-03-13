import type { ComponentType } from 'react'
import { useEffect, useRef, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { EmployeeStateTaxesList } from '@gusto/embedded-api/models/components/employeestatetaxeslist'
import type { EmployeeStateTaxQuestion } from '@gusto/embedded-api/models/components/employeestatetaxquestion'
import { useEmployeeTaxSetupGetStateTaxes } from '@gusto/embedded-api/react-query/employeeTaxSetupGetStateTaxes'
import { useEmployeeTaxSetupUpdateStateTaxesMutation } from '@gusto/embedded-api/react-query/employeeTaxSetupUpdateStateTaxes'
import {
  useQueryErrorHandler,
  type HookFormInternals,
  type HookLoadingResult,
  type HookErrors,
  type HookSubmitResult,
} from '../../helpers'
import type { FieldsMetadata } from '../../FormFieldsContext'
import { stateTaxesSchema, type StateTaxesFormPayload } from './schema'
import {
  createStateTaxField,
  type StateTaxFieldProps,
  type StateTaxesFieldComponents,
} from './StateTaxesFields'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { snakeCaseToCamelCase, normalizeErrorKeyForForm } from '@/helpers/formattedStrings'

const DEFAULT_TAX_VALID_FROM = '2010-01-01'

function snakeToPascalCase(snakeCase: string): string {
  return snakeCase
    .split('_')
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('')
}

function buildFieldsFromStateTaxes(
  employeeStateTaxes: EmployeeStateTaxesList[],
  isAdmin: boolean,
): StateTaxesFieldComponents {
  const fields: StateTaxesFieldComponents = {}

  for (const stateData of employeeStateTaxes) {
    if (!stateData.state) continue
    const stateFields: Record<string, ComponentType<StateTaxFieldProps>> = {}

    for (const question of stateData.questions ?? []) {
      if (question.isQuestionForAdminOnly && !isAdmin) continue
      const pascalKey = snakeToPascalCase(question.key)
      stateFields[pascalKey] = createStateTaxField(stateData.state, question)
    }

    if (Object.keys(stateFields).length > 0) {
      fields[stateData.state] = stateFields
    }
  }

  return fields
}

interface UseStateTaxesFormParams {
  employeeId?: string
  isAdmin?: boolean
  shouldFocusError?: boolean
}

export interface StateTaxesData {
  employeeStateTaxes: EmployeeStateTaxesList[]
  isAdmin: boolean
}

export interface StateTaxesFormReady {
  isLoading: false
  isPending: boolean
  mode: 'update'
  data: StateTaxesData
  onSubmit: () => Promise<HookSubmitResult<EmployeeStateTaxesList[]> | undefined>
  Fields: StateTaxesFieldComponents
  hookFormInternals: HookFormInternals
  fieldsMetadata: FieldsMetadata
  errors: HookErrors
}

export type UseStateTaxesFormResult = HookLoadingResult | StateTaxesFormReady

function buildDefaultValues(employeeStateTaxes: EmployeeStateTaxesList[]) {
  return {
    states: employeeStateTaxes.reduce((acc: Record<string, Record<string, unknown>>, state) => {
      if (state.state) {
        acc[state.state] = (state.questions ?? []).reduce(
          (qAcc: Record<string, unknown>, question: EmployeeStateTaxQuestion) => {
            const value = question.answers[0]?.value
            const key = snakeCaseToCamelCase(question.key)
            const isDateField = question.inputQuestionFormat.type.toLowerCase() === 'date'

            if (key === 'fileNewHireReport') {
              qAcc[key] = typeof value === 'undefined' ? true : value
            } else if (isDateField && typeof value === 'string') {
              const trimmedValue = value.trim()
              qAcc[key] = trimmedValue === '' ? undefined : new Date(trimmedValue)
            } else {
              qAcc[key] = value
            }
            return qAcc
          },
          {},
        )
      }
      return acc
    }, {}),
  }
}

function serializeFormPayload(
  payload: StateTaxesFormPayload,
  employeeStateTaxes: EmployeeStateTaxesList[],
  isAdmin: boolean,
) {
  const { states: statesPayload } = payload

  if (!statesPayload || Object.keys(statesPayload).length === 0) {
    return []
  }

  const states = []

  for (const state of employeeStateTaxes) {
    const stateName = state.state
    const questions = state.questions ?? []

    if (stateName && questions.length > 0) {
      const serializedQuestions: Array<{
        key: string
        answers: Array<{
          validFrom: string
          validUpTo: string | null
          value: string | number | boolean
        }>
      }> = []

      for (const question of questions) {
        if (question.isQuestionForAdminOnly && !isAdmin) continue

        const formValue = statesPayload[stateName]?.[snakeCaseToCamelCase(question.key)]

        let serializedValue: string | number | boolean
        if (formValue == null || (typeof formValue === 'number' && isNaN(formValue))) {
          serializedValue = ''
        } else if (formValue instanceof Date) {
          serializedValue = isNaN(formValue.getTime())
            ? ''
            : (formValue.toISOString().split('T')[0] ?? '')
        } else {
          serializedValue = formValue as string | number | boolean
        }

        serializedQuestions.push({
          key: question.key,
          answers: [
            {
              validFrom: question.answers[0]?.validFrom ?? DEFAULT_TAX_VALID_FROM,
              validUpTo: question.answers[0]?.validUpTo ?? null,
              value: serializedValue,
            },
          ],
        })
      }

      states.push({
        state: stateName,
        questions: serializedQuestions,
      })
    }
  }

  return states
}

export function useStateTaxesForm({
  employeeId,
  isAdmin = false,
  shouldFocusError = true,
}: UseStateTaxesFormParams): UseStateTaxesFormResult {
  const {
    data: stateTaxData,
    isLoading,
    error: queryError,
  } = useEmployeeTaxSetupGetStateTaxes({ employeeUuid: employeeId! }, { enabled: !!employeeId })

  const { baseSubmitHandler, error, fieldErrors, setError } = useBaseSubmit()

  useQueryErrorHandler(queryError, setError)

  const employeeStateTaxes = stateTaxData?.employeeStateTaxesList ?? []

  const formMethods = useForm<Record<string, unknown>, unknown, StateTaxesFormPayload>({
    resolver: zodResolver(stateTaxesSchema),
    shouldFocusError,
    defaultValues: { states: {} },
  })

  const hasInitializedForm = useRef(false)
  useEffect(() => {
    if (employeeStateTaxes.length > 0 && !hasInitializedForm.current) {
      hasInitializedForm.current = true
      formMethods.reset(buildDefaultValues(employeeStateTaxes))
    }
  }, [employeeStateTaxes, formMethods.reset])

  useEffect(() => {
    if (fieldErrors && fieldErrors.length > 0) {
      fieldErrors.forEach(fieldError => {
        const formFieldKey = normalizeErrorKeyForForm(fieldError.errorKey)
        const message =
          typeof fieldError.message === 'string' ? fieldError.message : 'Unknown error'
        formMethods.setError(formFieldKey, { type: 'custom', message })
      })
    }
  }, [fieldErrors, formMethods.setError])

  const { mutateAsync: updateStateTaxes, isPending: isMutationPending } =
    useEmployeeTaxSetupUpdateStateTaxesMutation()

  const onSubmit = async (): Promise<HookSubmitResult<EmployeeStateTaxesList[]> | undefined> => {
    if (!employeeId) {
      throw new Error('employeeId is required for state taxes submission')
    }

    return new Promise<HookSubmitResult<EmployeeStateTaxesList[]> | undefined>(
      (resolve, reject) => {
        formMethods
          .handleSubmit(
            async (_data: StateTaxesFormPayload) => {
              const result = await baseSubmitHandler(_data, async payload => {
                const states = serializeFormPayload(payload, employeeStateTaxes, isAdmin)

                if (states.length > 0) {
                  const response = await updateStateTaxes({
                    request: {
                      employeeUuid: employeeId,
                      employeeStateTaxesRequest: { states },
                    },
                  })
                  return response.employeeStateTaxesList ?? []
                }

                return employeeStateTaxes
              })
              resolve(result ? { mode: 'update' as const, data: result } : undefined)
            },
            () => {
              resolve(undefined)
            },
          )()
          .catch(reject)
      },
    )
  }

  const Fields = useMemo(
    () => buildFieldsFromStateTaxes(employeeStateTaxes, isAdmin),
    [employeeStateTaxes, isAdmin],
  )

  if (isLoading) {
    return { isLoading: true as const }
  }

  return {
    isLoading: false as const,
    isPending: isMutationPending,
    mode: 'update',
    data: {
      employeeStateTaxes,
      isAdmin,
    },
    onSubmit,
    Fields,
    hookFormInternals: { formMethods },
    fieldsMetadata: {},
    errors: { error, fieldErrors, setError },
  }
}
