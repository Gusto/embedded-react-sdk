import type { ComponentType } from 'react'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useContractorsGet } from '@gusto/embedded-api/react-query/contractorsGet'
import { useContractorsPostV1ContractorsContractorUuidRehireMutation } from '@gusto/embedded-api/react-query/contractorsPostV1ContractorsContractorUuidRehire'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import {
  createContractorRehireSchema,
  type ContractorRehireFormData,
  type ContractorRehireFormOutputs,
} from './contractorRehireSchema'
import type { StartDateFieldProps } from './fields'
import { StartDateField } from './fields'
import { useDeriveFieldsMetadata } from '@/partner-hook-utils/form/useDeriveFieldsMetadata'
import { useHookFormInternals } from '@/partner-hook-utils/form/useHookFormInternals'
import { createGetFormSubmissionValues } from '@/partner-hook-utils/form/getFormSubmissionValues'
import { withFlags } from '@/partner-hook-utils/form/withFlags'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type {
  BaseFormHookReady,
  FieldMetadata,
  FieldsMetadata,
  HookLoadingResult,
  HookSubmitResult,
} from '@/partner-hook-utils/types'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { GENERIC_API_ERROR_MESSAGE } from '@/types/sdkError'
import { addDays, formatDateToStringDate, normalizeToDate } from '@/helpers/dateFormatting'

/**
 * Props for {@link useContractorRehireForm}.
 *
 * @public
 */
export interface UseContractorRehireFormProps {
  /** The contractor being rehired. */
  contractorId: string
  /** Pre-fill form values. */
  defaultValues?: Partial<ContractorRehireFormData>
  /** When validation runs. Passed through to react-hook-form. Defaults to `'onSubmit'`. */
  validationMode?: UseFormProps['mode']
  /** Auto-focus the first invalid field on submit. Set to `false` when using `composeSubmitHandler`. Defaults to `true`. */
  shouldFocusError?: boolean
}

/**
 * Field components exposed by {@link useContractorRehireForm} on `form.Fields`.
 *
 * @public
 */
export interface ContractorRehireFormFields {
  /**
   * Date picker bound to `startDate` — the date the rehire takes effect. Required.
   * Bounded to the day after the contractor's dismissal date, so a rehire cannot
   * be scheduled before the dismissal took effect; a contractor with no recorded
   * dismissal date leaves the field unbounded. Past dates are accepted.
   */
  StartDate: ComponentType<StartDateFieldProps>
}

/** @internal */
function buildContractorRehireFieldsMetadata(
  base: Record<keyof ContractorRehireFormData, FieldMetadata>,
  { minDate }: { minDate: string | null },
) {
  return {
    startDate: withFlags(base.startDate, { minDate }),
  } satisfies FieldsMetadata
}

/**
 * Ready-state return value of {@link useContractorRehireForm}.
 *
 * @public
 */
export interface UseContractorRehireFormReady extends BaseFormHookReady<
  ContractorRehireFieldsMetadata,
  ContractorRehireFormData,
  ContractorRehireFormFields
> {
  /** The contractor being rehired, loaded from the API. */
  data: {
    contractor: Contractor
  }
  /** `isPending` reflects the in-flight rehire mutation; `mode` is always `'create'`. */
  status: { isPending: boolean; mode: 'create' }
  /** Submit the form. Resolves to a result on success, or `undefined` on validation or mutation failure. */
  actions: {
    onSubmit: () => Promise<HookSubmitResult<undefined> | undefined>
  }
}

/**
 * Headless React Hook Form hook for scheduling a dismissed contractor's rehire.
 *
 * @remarks
 * Fetches the contractor and manages a single required `startDate` field, bounded
 * to the day after their dismissal date. On submit it schedules the rehire, which
 * creates a new employment record effective on that date. The API returns no body,
 * so the submit result carries `data: undefined` — read the refreshed contractor
 * from a subsequent render rather than from the result.
 *
 * The contractor must be inactive and must not already have an upcoming employment;
 * either condition produces a `422` that surfaces through `errorHandling.errors`. A
 * scheduled rehire can be cancelled from the contractor list before it takes effect.
 *
 * @param props - See {@link UseContractorRehireFormProps}.
 * @returns A {@link HookLoadingResult} while the contractor is being fetched, or a {@link UseContractorRehireFormReady} once it has arrived.
 * @public
 *
 * @example
 * ```tsx
 * import { useContractorRehireForm, SDKFormProvider } from '@gusto/embedded-react-sdk'
 *
 * function RehireScreen({ contractorId }: { contractorId: string }) {
 *   const rehire = useContractorRehireForm({ contractorId })
 *
 *   if (rehire.isLoading) return null
 *   const { Fields } = rehire.form
 *
 *   return (
 *     <SDKFormProvider formHookResult={rehire}>
 *       <form
 *         onSubmit={e => {
 *           e.preventDefault()
 *           void rehire.actions.onSubmit()
 *         }}
 *       >
 *         <Fields.StartDate
 *           label="Start date"
 *           validationMessages={{ REQUIRED: 'Enter a start date' }}
 *         />
 *         <button type="submit" disabled={rehire.status.isPending}>
 *           Rehire contractor
 *         </button>
 *       </form>
 *     </SDKFormProvider>
 *   )
 * }
 * ```
 */
export function useContractorRehireForm({
  contractorId,
  defaultValues: partnerDefaults,
  validationMode = 'onSubmit',
  shouldFocusError = true,
}: UseContractorRehireFormProps): HookLoadingResult | UseContractorRehireFormReady {
  const contractorQuery = useContractorsGet({ contractorUuid: contractorId })
  const contractor = contractorQuery.data?.contractorShow

  const [schema, metadataConfig] = useMemo(() => createContractorRehireSchema(), [])

  // No `values` sync: `startDate` describes a rehire that doesn't exist yet, so there is no
  // server-side value for it to track — the field is only ever seeded from `defaultValues`.
  const formMethods = useForm<ContractorRehireFormData, unknown, ContractorRehireFormOutputs>({
    resolver: zodResolver(schema),
    mode: validationMode,
    shouldFocusError,
    defaultValues: { startDate: partnerDefaults?.startDate },
  })

  const rehireMutation = useContractorsPostV1ContractorsContractorUuidRehireMutation()
  const isPending = rehireMutation.isPending

  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('Contractor.Rehire')

  const errorHandling = composeErrorHandler([contractorQuery], { submitError, setSubmitError })

  // The rehire takes effect the day the new employment starts, so it can never predate the
  // dismissal it reverses. The API itself only checks that the contractor is inactive with no
  // upcoming employment, which leaves backdated rehires valid — hence a floor rather than
  // pinning the field to today.
  const dismissalDate = contractor?.dismissalDate
  const minDate = useMemo(() => {
    const parsed = dismissalDate ? normalizeToDate(dismissalDate) : null
    return parsed ? formatDateToStringDate(addDays(parsed, 1)) : null
  }, [dismissalDate])

  const baseMetadata = useDeriveFieldsMetadata(metadataConfig, formMethods.control)
  const fieldsMetadata = buildContractorRehireFieldsMetadata(baseMetadata, { minDate })

  const onSubmit = async (): Promise<HookSubmitResult<undefined> | undefined> => {
    let submitResult: HookSubmitResult<undefined> | undefined

    await new Promise<void>(resolve => {
      void formMethods.handleSubmit(
        async (data: ContractorRehireFormOutputs) => {
          await baseSubmitHandler(data, async payload => {
            await rehireMutation.mutateAsync({
              request: {
                contractorUuid: contractorId,
                requestBody: { startDate: new RFCDate(payload.startDate) },
              },
            })
            submitResult = { mode: 'create', data: undefined }
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

  if (contractorQuery.isLoading || !contractor) {
    // A settled query (not `isLoading`) with no query `error` but also no `contractor` in the
    // response body would otherwise report `isLoading: true` forever with an empty error list —
    // `contractor` is optional on the response type, so this isn't a thrown error we'd catch via
    // `composeErrorHandler`. Surface it as an error so the host sees a real failure state instead
    // of a stuck spinner.
    const settledWithNoContractor = !contractorQuery.isLoading && !contractorQuery.error
    return {
      isLoading: true as const,
      errorHandling: settledWithNoContractor
        ? {
            ...errorHandling,
            errors: [
              ...errorHandling.errors,
              { category: 'internal_error', message: GENERIC_API_ERROR_MESSAGE, fieldErrors: [] },
            ],
          }
        : errorHandling,
    }
  }

  return {
    isLoading: false as const,
    data: { contractor },
    status: { isPending, mode: 'create' as const },
    actions: { onSubmit },
    errorHandling,
    form: {
      Fields: {
        StartDate: StartDateField,
      },
      fieldsMetadata,
      hookFormInternals,
      getFormSubmissionValues: createGetFormSubmissionValues(formMethods, schema),
    },
  }
}

/**
 * Return type of {@link useContractorRehireForm} — a discriminated union on `isLoading`.
 *
 * @public
 */
export type UseContractorRehireFormResult = HookLoadingResult | UseContractorRehireFormReady

/**
 * Per-field metadata exposed on `form.fieldsMetadata` for {@link useContractorRehireForm}.
 *
 * @public
 */
export type ContractorRehireFieldsMetadata = ReturnType<typeof buildContractorRehireFieldsMetadata>
