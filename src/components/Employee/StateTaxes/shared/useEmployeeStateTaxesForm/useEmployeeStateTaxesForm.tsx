import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { EmployeeStateTaxesList } from '@gusto/embedded-api-v-2026-06-15/models/components/employeestatetaxeslist'
import type {
  EmployeeStateTaxesRequest,
  States as EmployeeStateTaxesRequestState,
} from '@gusto/embedded-api-v-2026-06-15/models/components/employeestatetaxesrequest'
import { useEmployeeTaxSetupGetStateTaxes } from '@gusto/embedded-api-v-2026-06-15/react-query/employeeTaxSetupGetStateTaxes'
import { useEmployeeTaxSetupUpdateStateTaxesMutation } from '@gusto/embedded-api-v-2026-06-15/react-query/employeeTaxSetupUpdateStateTaxes'
import {
  createEmployeeStateTaxesSchema,
  type EmployeeStateTaxesFormData,
  type EmployeeStateTaxesFormOutputs,
  type EmployeeStateTaxesMetadataConfig,
} from './employeeStateTaxesSchema'
import { createStateFields, type StateTaxFieldsGroup } from './fields'
import { getQuestionVariant } from './fieldMapping'
import { snakeCaseToCamelCase } from '@/helpers/formattedStrings'
import { useDeriveFieldsMetadata } from '@/partner-hook-utils/form/useDeriveFieldsMetadata'
import { createGetFormSubmissionValues } from '@/partner-hook-utils/form/getFormSubmissionValues'
import { useHookFormInternals } from '@/partner-hook-utils/form/useHookFormInternals'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type {
  BaseFormHookReady,
  FieldsMetadata,
  HookLoadingResult,
  HookSubmitResult,
} from '@/partner-hook-utils/types'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { SDKInternalError } from '@/types/sdkError'

const DEFAULT_TAX_VALID_FROM = '2010-01-01'

/**
 * Options accepted by {@link useEmployeeStateTaxesForm}.
 *
 * @public
 */
export interface UseEmployeeStateTaxesFormProps {
  /** The UUID of the employee whose state taxes are being updated. */
  employeeId: string
  /**
   * When `true`, admin-only questions are visible and submitted. When
   * `false`, they are filtered out and the surfaced answer for those
   * questions is preserved unchanged on submit.
   */
  isAdmin?: boolean
  /** When validation runs. Passed through to react-hook-form. Defaults to `'onSubmit'`. */
  validationMode?: UseFormProps['mode']
  /** Auto-focus the first invalid field on submit. Defaults to `true`. Set to `false` when composing with other forms. */
  shouldFocusError?: boolean
}

/**
 * Ready-state return value of {@link useEmployeeStateTaxesForm} — the
 * `isLoading: false` branch of {@link UseEmployeeStateTaxesFormResult}.
 *
 * @public
 */
export interface UseEmployeeStateTaxesFormReady extends BaseFormHookReady<
  FieldsMetadata,
  EmployeeStateTaxesFormData,
  StateTaxFieldsGroup[]
> {
  /** Current per-state tax records returned by the server. */
  data: {
    employeeStateTaxes: EmployeeStateTaxesList[]
  }
  /** Submission status. `mode` is always `'update'` since state-tax records are created with the employee. */
  status: { isPending: boolean; mode: 'update' }
  /** Form actions. */
  actions: {
    /** Validates and submits the form, resolving to the updated records on success or `undefined` when validation blocked the submit. */
    onSubmit: () => Promise<HookSubmitResult<EmployeeStateTaxesList[]> | undefined>
  }
  /** Form internals plus the iterable per-state `Fields` array. */
  form: BaseFormHookReady<
    FieldsMetadata,
    EmployeeStateTaxesFormData,
    StateTaxFieldsGroup[]
  >['form'] & {
    /** Iterable, render-ready group + question entries with bound Field components. */
    Fields: StateTaxFieldsGroup[]
  }
}

/**
 * Discriminated union returned by {@link useEmployeeStateTaxesForm}. Loading
 * branch carries only `errorHandling`; ready branch carries form data,
 * fields, status, and actions.
 *
 * @public
 */
export type UseEmployeeStateTaxesFormResult = HookLoadingResult | UseEmployeeStateTaxesFormReady

/**
 * Headless form hook for updating an employee's state tax withholding answers.
 * The set of questions is driven by the API response per state, so
 * `form.Fields` is an array of state groups with discriminated, render-ready
 * `Field` components rather than a fixed named object.
 *
 * @remarks
 * The state-tax record(s) are created automatically with the employee, so this
 * hook is always in update mode. When the form has no states with submittable
 * answers (e.g. an employee in a no-income-tax state), submit resolves with
 * the existing record list without making a network request.
 *
 * @param props - Hook options.
 * @returns A loading result while data is fetching, or a ready result with
 * form data, fields, status, actions, and error handling.
 * @public
 *
 * @example
 * ```tsx
 * import {
 *   useEmployeeStateTaxesForm,
 *   SDKFormProvider,
 *   type UseEmployeeStateTaxesFormReady,
 * } from '@gusto/embedded-react-sdk'
 *
 * function StateTaxesPage({ employeeId }: { employeeId: string }) {
 *   const stateTaxes = useEmployeeStateTaxesForm({ employeeId })
 *
 *   if (stateTaxes.isLoading) return <div>Loading...</div>
 *
 *   return <StateTaxesFormReady stateTaxes={stateTaxes} />
 * }
 *
 * function StateTaxesFormReady({
 *   stateTaxes,
 * }: {
 *   stateTaxes: UseEmployeeStateTaxesFormReady
 * }) {
 *   const handleSubmit = async () => {
 *     const result = await stateTaxes.actions.onSubmit()
 *     if (result) console.log('Updated state tax records:', result.data)
 *   }
 *
 *   return (
 *     <SDKFormProvider formHookResult={stateTaxes}>
 *       <form
 *         onSubmit={e => {
 *           e.preventDefault()
 *           void handleSubmit()
 *         }}
 *       >
 *         {stateTaxes.form.Fields.map(group => (
 *           <section key={group.state}>
 *             <h2>{group.state}</h2>
 *             {group.questions.map(question => (
 *               <question.Field key={question.questionId} />
 *             ))}
 *           </section>
 *         ))}
 *         <button type="submit" disabled={stateTaxes.status.isPending}>
 *           Save
 *         </button>
 *       </form>
 *     </SDKFormProvider>
 *   )
 * }
 * ```
 */
export function useEmployeeStateTaxesForm({
  employeeId,
  isAdmin = false,
  validationMode = 'onSubmit',
  shouldFocusError = true,
}: UseEmployeeStateTaxesFormProps): UseEmployeeStateTaxesFormResult {
  const stateTaxesQuery = useEmployeeTaxSetupGetStateTaxes({ employeeUuid: employeeId })

  const employeeStateTaxes = useMemo<EmployeeStateTaxesList[]>(
    () => stateTaxesQuery.data?.employeeStateTaxesList ?? [],
    [stateTaxesQuery.data?.employeeStateTaxesList],
  )

  const [schema, metadataConfig] = useMemo(
    () => createEmployeeStateTaxesSchema(employeeStateTaxes, { isAdmin }),
    [employeeStateTaxes, isAdmin],
  )

  const fieldsArray = useMemo(
    () => createStateFields(employeeStateTaxes, { isAdmin }),
    [employeeStateTaxes, isAdmin],
  )

  const resolvedDefaults = useMemo(
    () => deriveDefaultValues(employeeStateTaxes, isAdmin),
    [employeeStateTaxes, isAdmin],
  )

  const formMethods = useForm<EmployeeStateTaxesFormData, unknown, EmployeeStateTaxesFormOutputs>({
    resolver: zodResolver(schema),
    mode: validationMode,
    shouldFocusError,
    defaultValues: resolvedDefaults,
    values: resolvedDefaults,
    resetOptions: { keepDirtyValues: true },
  })

  const { mutateAsync: updateStateTaxes, isPending } = useEmployeeTaxSetupUpdateStateTaxesMutation()

  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('EmployeeStateTaxesForm')

  const errorHandling = composeErrorHandler([stateTaxesQuery], {
    submitError,
    setSubmitError,
  })

  const fieldsMetadata = useDeriveFieldsMetadata(
    metadataConfig as EmployeeStateTaxesMetadataConfig,
    formMethods.control,
  ) as FieldsMetadata

  const onSubmit = async (): Promise<HookSubmitResult<EmployeeStateTaxesList[]> | undefined> => {
    let submitResult: HookSubmitResult<EmployeeStateTaxesList[]> | undefined

    await new Promise<void>(resolve => {
      void formMethods.handleSubmit(
        async data => {
          await baseSubmitHandler(data, async payload => {
            const requestStates = serializeStatesPayload(payload, employeeStateTaxes, isAdmin)

            if (requestStates.length === 0) {
              submitResult = { mode: 'update', data: employeeStateTaxes }
              return
            }

            const requestBody: EmployeeStateTaxesRequest = { states: requestStates }
            const response = await updateStateTaxes({
              request: { employeeUuid: employeeId, employeeStateTaxesRequest: requestBody },
            })

            const updated = response.employeeStateTaxesList
            if (!updated) {
              throw new SDKInternalError('State taxes update did not return an updated record')
            }

            submitResult = { mode: 'update', data: updated }
          })
          resolve()
        },
        () => {
          resolve()
        },
      )()
    })

    return submitResult
  }

  const hookFormInternals = useHookFormInternals(formMethods)

  if (stateTaxesQuery.isLoading || !stateTaxesQuery.data?.employeeStateTaxesList) {
    return { isLoading: true as const, errorHandling }
  }

  return {
    isLoading: false as const,
    data: { employeeStateTaxes },
    status: { isPending, mode: 'update' as const },
    actions: { onSubmit },
    errorHandling,
    form: {
      Fields: fieldsArray,
      fieldsMetadata,
      hookFormInternals,
      getFormSubmissionValues: createGetFormSubmissionValues(formMethods, schema) as () =>
        | Record<string, unknown>
        | undefined,
    },
  }
}

// ── Defaults derivation ────────────────────────────────────────────────

function deriveDefaultValues(
  employeeStateTaxes: EmployeeStateTaxesList[],
  isAdmin: boolean,
): EmployeeStateTaxesFormData {
  const states: Record<string, Record<string, unknown>> = {}

  for (const stateGroup of employeeStateTaxes) {
    if (!stateGroup.state || !stateGroup.questions) continue

    const stateValues: Record<string, unknown> = {}
    for (const question of stateGroup.questions) {
      if (question.isQuestionForAdminOnly && !isAdmin) continue
      const formKey = snakeCaseToCamelCase(question.key)
      const wireValue = question.answers[0]?.value
      stateValues[formKey] = resolveDefaultForQuestion(question, wireValue)
    }

    if (Object.keys(stateValues).length > 0) {
      states[stateGroup.state] = stateValues
    }
  }

  return { states: states as EmployeeStateTaxesFormData['states'] }
}

function resolveDefaultForQuestion(
  question: EmployeeStateTaxesList['questions'] extends Array<infer Q> | undefined ? Q : never,
  wireValue: string | number | boolean | null | undefined,
): unknown {
  if (question.key === 'file_new_hire_report') {
    if (wireValue === undefined || wireValue === null) return true
    return wireValue
  }

  const variant = getQuestionVariant(question)

  switch (variant) {
    case 'date': {
      if (wireValue === undefined || wireValue === null || wireValue === '') return undefined
      if (typeof wireValue === 'string') {
        const trimmed = wireValue.trim()
        if (trimmed === '') return undefined
        const parsed = new Date(trimmed)
        return Number.isNaN(parsed.getTime()) ? undefined : parsed
      }
      return wireValue
    }
    case 'number':
    case 'currency': {
      if (wireValue === undefined || wireValue === null || wireValue === '') return undefined
      const parsed = typeof wireValue === 'number' ? wireValue : Number(wireValue)
      return Number.isNaN(parsed) ? undefined : parsed
    }
    default:
      return wireValue
  }
}

// ── Submit serialization ───────────────────────────────────────────────

type SerializedQuestion = {
  key: string
  answers: Array<{
    validFrom: string
    validUpTo: string | null
    value: string | number | boolean
  }>
}

function serializeStatesPayload(
  payload: EmployeeStateTaxesFormOutputs,
  employeeStateTaxes: EmployeeStateTaxesList[],
  isAdmin: boolean,
): EmployeeStateTaxesRequestState[] {
  const { states: statesPayload } = payload
  if (Object.keys(statesPayload).length === 0) return []

  const result: EmployeeStateTaxesRequestState[] = []

  for (const state of employeeStateTaxes) {
    const stateName = state.state
    if (!stateName || state.questions === undefined) continue

    const serialized: SerializedQuestion[] = []
    for (const question of state.questions) {
      if (question.isQuestionForAdminOnly && !isAdmin) continue

      const formValue = (statesPayload[stateName] as Record<string, unknown> | undefined)?.[
        snakeCaseToCamelCase(question.key)
      ]

      let serializedValue: string | number | boolean
      if (formValue === undefined || formValue === null) {
        serializedValue = ''
      } else if (typeof formValue === 'number' && Number.isNaN(formValue)) {
        serializedValue = ''
      } else if (formValue instanceof Date) {
        if (Number.isNaN(formValue.getTime())) {
          serializedValue = ''
        } else {
          serializedValue = formValue.toISOString().split('T')[0] ?? ''
        }
      } else {
        serializedValue = formValue as string | number | boolean
      }

      serialized.push({
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

    result.push({ state: stateName, questions: serialized })
  }

  return result
}

/**
 * Static field metadata keyed by full form path (`states.<STATE>.<camelKey>`),
 * with `isRequired` / `isDisabled` and option lists.
 *
 * @public
 */
export type EmployeeStateTaxesFieldsMetadata =
  UseEmployeeStateTaxesFormReady['form']['fieldsMetadata']

/**
 * The array of per-state field groups exposed by
 * {@link useEmployeeStateTaxesForm} on `form.Fields`.
 *
 * @public
 */
export type EmployeeStateTaxesFormFields = UseEmployeeStateTaxesFormReady['form']['Fields']
