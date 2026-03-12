import { useMemo } from 'react'
import { useEmployeeTaxSetupGetStateTaxes } from '@gusto/embedded-api/react-query/employeeTaxSetupGetStateTaxes'
import { useEmployeeTaxSetupUpdateStateTaxesMutation } from '@gusto/embedded-api/react-query/employeeTaxSetupUpdateStateTaxes'
import type { EmployeeStateTaxesList } from '@gusto/embedded-api/models/components/employeestatetaxeslist'
import type { EmployeeStateTaxQuestion } from '@gusto/embedded-api/models/components/employeestatetaxquestion'
import { buildCombinedSchema, buildStateSchema, stateTaxErrorCodes } from './schema'
import { snakeCaseToCamelCase } from '@/helpers/formattedStrings'
import {
  deriveFieldsFromSchema,
  type FieldType,
  type BaseFieldMetadata,
  type HookLoadingResult,
  type HookErrors,
} from '@/helpers/deriveFieldsFromSchema'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'

const DEFAULT_TAX_VALID_FROM = '2010-01-01'

interface UseEmployeeStateTaxesParams {
  employeeId: string
  isAdmin?: boolean
}

export interface StateTaxFieldMetadata extends BaseFieldMetadata<FieldType> {
  label: string
  description: string | null
  questionKey: string
  isAdminOnly: boolean
  options?: Array<{ value: string; label: string }>
}

export interface StateTaxStateResult {
  state: string
  isWorkState: boolean
  fields: Record<string, StateTaxFieldMetadata>
  defaultValues: Record<string, unknown>
}

function buildDefaultValues(stateTaxesList: EmployeeStateTaxesList[]) {
  const states: Record<string, Record<string, unknown>> = {}

  for (const stateTax of stateTaxesList) {
    if (!stateTax.state || !stateTax.questions) continue

    const stateValues: Record<string, unknown> = {}
    for (const question of stateTax.questions) {
      const key = snakeCaseToCamelCase(question.key)
      const value = question.answers[0]?.value

      if (key === 'fileNewHireReport') {
        stateValues[key] = value === undefined ? true : String(value)
      } else {
        stateValues[key] = coerceDefaultValue(question, value)
      }
    }
    states[stateTax.state] = stateValues
  }

  return { states }
}

function coerceDefaultValue(
  question: EmployeeStateTaxQuestion,
  value: string | number | boolean | null | undefined,
): unknown {
  if (value === undefined || value === null) return undefined

  const questionType = question.inputQuestionFormat.type.toLowerCase()

  switch (questionType) {
    case 'select':
    case 'radio':
      return String(value)
    case 'number':
    case 'currency':
    case 'percent':
    case 'tax_rate':
      return typeof value === 'number' ? value : Number(value)
    case 'checkbox':
      return Boolean(value)
    default:
      return value
  }
}

function buildAugmentedFields(
  questions: EmployeeStateTaxQuestion[],
  stateSchema: ReturnType<typeof buildStateSchema>,
  isAdmin: boolean,
): Record<string, StateTaxFieldMetadata> {
  const derivedFields = deriveFieldsFromSchema(stateSchema)
  const augmentedFields: Record<string, StateTaxFieldMetadata> = {}

  for (const question of questions) {
    const fieldName = snakeCaseToCamelCase(question.key)
    const derived = derivedFields[fieldName as keyof typeof derivedFields]
    if (!derived) continue

    const selectOptions = question.inputQuestionFormat.options?.map(o => ({
      value: String(o.value),
      label: o.label,
    }))

    const { options: _derivedOptions, ...baseFields } = derived as typeof derived & {
      options?: unknown
    }

    augmentedFields[fieldName] = {
      ...baseFields,
      label: question.label,
      description: question.description,
      questionKey: question.key,
      isAdminOnly: question.isQuestionForAdminOnly,
      isDisabled: question.isQuestionForAdminOnly && !isAdmin,
      ...(selectOptions ? { options: selectOptions } : {}),
    }
  }

  return augmentedFields
}

export function useEmployeeStateTaxes({
  employeeId,
  isAdmin = false,
}: UseEmployeeStateTaxesParams) {
  const { data: stateData, isLoading } = useEmployeeTaxSetupGetStateTaxes({
    employeeUuid: employeeId,
  })

  const employeeStateTaxes = stateData?.employeeStateTaxesList

  const { mutateAsync: updateStateTaxes, isPending } = useEmployeeTaxSetupUpdateStateTaxesMutation()

  const { baseSubmitHandler, error, fieldErrors, setError } = useBaseSubmit()

  const schema = useMemo(
    () => (employeeStateTaxes ? buildCombinedSchema(employeeStateTaxes, isAdmin) : null),
    [employeeStateTaxes, isAdmin],
  )

  if (isLoading || !employeeStateTaxes || !schema) {
    return { isLoading: true as const }
  }

  const states: StateTaxStateResult[] = employeeStateTaxes
    .filter(
      (
        st,
      ): st is EmployeeStateTaxesList & {
        state: string
        questions: EmployeeStateTaxQuestion[]
      } => Boolean(st.state && st.questions),
    )
    .map(stateTax => {
      const stateSchema = buildStateSchema(stateTax.questions, isAdmin)
      return {
        state: stateTax.state,
        isWorkState: stateTax.isWorkState ?? false,
        fields: buildAugmentedFields(stateTax.questions, stateSchema, isAdmin),
        defaultValues: Object.fromEntries(
          stateTax.questions.map(q => {
            const key = snakeCaseToCamelCase(q.key)
            const value = q.answers[0]?.value
            if (key === 'fileNewHireReport') {
              return [key, value === undefined ? true : String(value)]
            }
            return [key, coerceDefaultValue(q, value)]
          }),
        ),
      }
    })

  const defaultValues = buildDefaultValues(employeeStateTaxes)

  const onSubmit = async (data: { states: Record<string, Record<string, unknown>> }) => {
    return baseSubmitHandler(data, async payload => {
      const statesPayload = payload.states

      const apiStates = employeeStateTaxes
        .filter(
          (
            st,
          ): st is EmployeeStateTaxesList & {
            state: string
            questions: EmployeeStateTaxQuestion[]
          } => Boolean(st.state && st.questions),
        )
        .map(stateTax => ({
          state: stateTax.state,
          questions: stateTax.questions
            .filter(q => !q.isQuestionForAdminOnly || isAdmin)
            .map(question => {
              const formValue = statesPayload[stateTax.state]?.[snakeCaseToCamelCase(question.key)]

              return {
                key: question.key,
                answers: [
                  {
                    validFrom: question.answers[0]?.validFrom ?? DEFAULT_TAX_VALID_FROM,
                    validUpTo: question.answers[0]?.validUpTo ?? null,
                    value: coerceSubmitValue(question, formValue),
                  },
                ],
              }
            }),
        }))

      const response = await updateStateTaxes({
        request: {
          employeeUuid: employeeId,
          employeeStateTaxesRequest: { states: apiStates },
        },
      })

      return response.employeeStateTaxesList
    })
  }

  return {
    schema,
    states,
    defaultValues,
    onSubmit,
    isPending,
    errors: { error, fieldErrors, setError } satisfies HookErrors,
    validationMessageCodes: stateTaxErrorCodes,
  }
}

function coerceSubmitValue(
  question: EmployeeStateTaxQuestion,
  formValue: unknown,
): string | number | boolean {
  if (formValue == null || (typeof formValue === 'number' && isNaN(formValue))) {
    return ''
  }

  const questionType = question.inputQuestionFormat.type.toLowerCase()

  if (questionType === 'select' || questionType === 'radio') {
    const formValueStr =
      typeof formValue === 'string'
        ? formValue
        : typeof formValue === 'number'
          ? formValue.toString()
          : typeof formValue === 'boolean'
            ? formValue.toString()
            : ''

    const originalOption = question.inputQuestionFormat.options?.find(
      o => String(o.value) === formValueStr,
    )
    if (originalOption?.value !== undefined) {
      return originalOption.value
    }
  }

  return formValue as string | number | boolean
}

export type EmployeeStateTaxesReady = Exclude<
  ReturnType<typeof useEmployeeStateTaxes>,
  HookLoadingResult
>
