import type { ComponentType } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Industry } from '@gusto/embedded-api/models/components/industry'
import { useIndustrySelectionGet } from '@gusto/embedded-api/react-query/industrySelectionGet'
import { useIndustrySelectionUpdateMutation } from '@gusto/embedded-api/react-query/industrySelectionUpdate'
import {
  createIndustrySchema,
  type IndustryOptionalFieldsToRequire,
  type IndustryFormData,
  type IndustryFormOutputs,
} from './industrySchema'
import type { IndustryFieldProps } from './fields'
import { IndustryField } from './fields'
import { useDeriveFieldsMetadata } from '@/partner-hook-utils/form/useDeriveFieldsMetadata'
import { useHookFormInternals } from '@/partner-hook-utils/form/useHookFormInternals'
import { createGetFormSubmissionValues } from '@/partner-hook-utils/form/getFormSubmissionValues'
import { withOptions } from '@/partner-hook-utils/form/withOptions'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type {
  BaseFormHookReady,
  FieldMetadata,
  FieldsMetadata,
  HookLoadingResult,
  HookSubmitResult,
} from '@/partner-hook-utils/types'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { SDKInternalError } from '@/types/sdkError'
import { loadAll, type NaicsCode } from '@/models/NAICSCodes'

export type { IndustryOptionalFieldsToRequire } from './industrySchema'

/** @internal */
function buildIndustryFieldsMetadata(
  base: Record<keyof IndustryFormData, FieldMetadata>,
  {
    industryOptions,
    industryEntries,
  }: {
    industryOptions: Array<{ label: string; value: string }>
    industryEntries: NaicsCode[]
  },
) {
  return {
    naicsCode: withOptions<NaicsCode>(base.naicsCode, industryOptions, industryEntries),
  } satisfies FieldsMetadata
}

/**
 * Optional overrides passed to {@link UseIndustryFormReady.actions.onSubmit | onSubmit}.
 *
 * @public
 */
export interface IndustrySubmitOptions {
  /** Override the company identifier supplied to the hook. */
  companyId?: string
}

/**
 * Configuration options for {@link useIndustryForm}.
 *
 * @public
 */
export interface UseIndustryFormProps {
  /** UUID of the company whose industry classification is being set. */
  companyId: string
  /** Override fields that are optional on a given mode to be required. See `IndustryOptionalFieldsToRequire`. */
  optionalFieldsToRequire?: IndustryOptionalFieldsToRequire
  /** Pre-fill form values. Server data takes precedence when a classification is already on file. */
  defaultValues?: Partial<IndustryFormData>
  /** Passed through to react-hook-form. Defaults to `'onSubmit'`. */
  validationMode?: UseFormProps['mode']
  /** Auto-focus the first invalid field on submit. Set to `false` when using `composeSubmitHandler` so submit-time focus is coordinated across multiple forms. Defaults to `true`. */
  shouldFocusError?: boolean
}

/**
 * Pre-bound field components exposed on `useIndustryForm().form.Fields`.
 *
 * @public
 */
export interface IndustryFormFields {
  /**
   * Bound to `naicsCode`. Filterable industry selector over the full NAICS code list,
   * emitting `REQUIRED` when left empty. When the company's saved classification is not
   * one of the listed codes, an extra option for it is added so the saved value stays
   * visible and selected; its entry carries an empty `title` when the API supplied none,
   * which `getOptionLabel` can use to substitute its own copy.
   */
  Industry: ComponentType<IndustryFieldProps>
}

/**
 * Ready-state shape returned by {@link useIndustryForm} once data has loaded.
 *
 * @remarks
 * Discriminated by `isLoading: false`. Extends {@link BaseFormHookReady} with
 * the industry-specific `data`, `status`, `actions`, and `form.Fields` shape.
 *
 * @public
 */
export interface UseIndustryFormReady extends BaseFormHookReady<
  IndustryFieldsMetadata,
  IndustryFormData,
  IndustryFormFields
> {
  /** Static entity data resolved from the API. */
  data: {
    /** The classification currently on file; `null` when the company has none. */
    industry: Industry | null
    /** Every selectable NAICS classification, including the saved one when it is not part of the bundled list. */
    naicsCodes: NaicsCode[]
  }
  /** Reactive status flags. */
  status: { isPending: boolean; mode: 'create' | 'update' }
  /** Available actions. */
  actions: {
    onSubmit: (options?: IndustrySubmitOptions) => Promise<HookSubmitResult<Industry> | undefined>
  }
}

/**
 * Form hook for selecting and saving a company's industry classification.
 *
 * @remarks
 * Loads the company's current classification and the full NAICS code list, then issues a
 * PUT on submit. Valid NAICS codes are four to six digits, but the bundled list holds only
 * six-digit classifications — when the company's saved code is shorter (or otherwise absent
 * from the list) the hook adds an option for it, labelled with the title the API returned,
 * so the saved classification displays and survives a submit that does not change it.
 *
 * @param props - See {@link UseIndustryFormProps}.
 * @returns A {@link HookLoadingResult} while loading, or a {@link UseIndustryFormReady} once ready.
 * @public
 *
 * @example
 * ```tsx
 * import {
 *   useIndustryForm,
 *   SDKFormProvider,
 *   type UseIndustryFormReady,
 * } from '@gusto/embedded-react-sdk'
 *
 * function IndustryPage({ companyId }: { companyId: string }) {
 *   const industry = useIndustryForm({ companyId })
 *
 *   if (industry.isLoading) return <div>Loading...</div>
 *
 *   return <IndustryReady industry={industry} />
 * }
 *
 * function IndustryReady({ industry }: { industry: UseIndustryFormReady }) {
 *   const { Fields } = industry.form
 *
 *   return (
 *     <SDKFormProvider formHookResult={industry}>
 *       <form onSubmit={e => { e.preventDefault(); void industry.actions.onSubmit() }}>
 *         <Fields.Industry label="Industry" placeholder="Select an industry" />
 *         <button type="submit" disabled={industry.status.isPending}>Save</button>
 *       </form>
 *     </SDKFormProvider>
 *   )
 * }
 * ```
 */
export function useIndustryForm({
  companyId,
  optionalFieldsToRequire,
  defaultValues: partnerDefaults,
  validationMode = 'onSubmit',
  shouldFocusError = true,
}: UseIndustryFormProps): HookLoadingResult | UseIndustryFormReady {
  const industryQuery = useIndustrySelectionGet({ companyId })

  const [naicsCodes, setNaicsCodes] = useState<NaicsCode[] | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const codes = await loadAll()
      if (!cancelled) setNaicsCodes(codes)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const industry = industryQuery.data?.industry
  const savedCode = industry?.naicsCode
  const savedTitle = industry?.title

  const isCreateMode = !savedCode
  const schemaMode = isCreateMode ? 'create' : 'update'

  const [schema, metadataConfig] = useMemo(
    () => createIndustrySchema({ mode: schemaMode, optionalFieldsToRequire }),
    [schemaMode, optionalFieldsToRequire],
  )

  // The combo box matches the form value against option values, so a saved code with
  // no entry in the bundled six-digit list would render as a blank field while still
  // holding the code. Add an entry for it, titled from the API, so it stays visible.
  const hasExactOption = !!savedCode && !!naicsCodes?.some(({ code }) => code === savedCode)
  const savedCodeNeedsOption = !!savedCode && !!naicsCodes && !hasExactOption

  const industryEntries = useMemo(() => {
    if (!naicsCodes) return []
    if (!savedCodeNeedsOption || !savedCode) return naicsCodes
    return [{ code: savedCode, title: savedTitle ?? '' }, ...naicsCodes]
  }, [naicsCodes, savedCodeNeedsOption, savedCode, savedTitle])

  const industryOptions = useMemo(
    () => industryEntries.map(({ code, title }) => ({ value: code, label: title || code })),
    [industryEntries],
  )

  const resolvedDefaults: IndustryFormData = useMemo(
    () => ({
      naicsCode: savedCode ?? partnerDefaults?.naicsCode ?? '',
    }),
    [savedCode, partnerDefaults],
  )

  const formMethods = useForm<IndustryFormData, unknown, IndustryFormOutputs>({
    resolver: zodResolver(schema),
    mode: validationMode,
    shouldFocusError,
    defaultValues: resolvedDefaults,
    values: resolvedDefaults,
    resetOptions: { keepDirtyValues: true },
  })

  const updateIndustryMutation = useIndustrySelectionUpdateMutation()

  const isPending = updateIndustryMutation.isPending

  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('IndustryForm')

  const errorHandling = composeErrorHandler([industryQuery], { submitError, setSubmitError })

  const baseMetadata = useDeriveFieldsMetadata(metadataConfig, formMethods.control)
  const fieldsMetadata = buildIndustryFieldsMetadata(baseMetadata, {
    industryOptions,
    industryEntries,
  })

  const onSubmit = async (
    options?: IndustrySubmitOptions,
  ): Promise<HookSubmitResult<Industry> | undefined> => {
    let submitResult: HookSubmitResult<Industry> | undefined

    await new Promise<void>(resolve => {
      void formMethods.handleSubmit(
        async (data: IndustryFormOutputs) => {
          await baseSubmitHandler(data, async payload => {
            const resolvedCompanyId = options?.companyId ?? companyId

            if (!resolvedCompanyId) {
              throw new SDKInternalError('companyId is required to submit industry selection')
            }

            // When resubmitting a saved classification that is absent from the bundled
            // list, send its title back too. The API derives a missing title by looking
            // the code up externally, which does not reliably resolve for the shorter
            // codes, and a classification without a title is rejected.
            const preservesUnlistedCode = savedCodeNeedsOption && payload.naicsCode === savedCode

            const result = await updateIndustryMutation.mutateAsync({
              request: {
                companyId: resolvedCompanyId,
                companyIndustrySelectionRequiredBody: {
                  naicsCode: payload.naicsCode,
                  ...(preservesUnlistedCode && savedTitle ? { title: savedTitle } : {}),
                },
              },
            })

            if (!result.industry) {
              throw new SDKInternalError('Industry selection update failed')
            }

            submitResult = {
              mode: isCreateMode ? 'create' : 'update',
              data: result.industry,
            }
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

  if (industryQuery.isLoading || !naicsCodes) {
    return { isLoading: true as const, errorHandling }
  }

  return {
    isLoading: false as const,
    data: {
      industry: industry ?? null,
      naicsCodes: industryEntries,
    },
    status: {
      isPending,
      mode: isCreateMode ? ('create' as const) : ('update' as const),
    },
    actions: { onSubmit },
    errorHandling,
    form: {
      Fields: {
        Industry: IndustryField,
      },
      fieldsMetadata,
      hookFormInternals,
      getFormSubmissionValues: createGetFormSubmissionValues(formMethods, schema),
    },
  }
}

/**
 * Discriminated union returned by {@link useIndustryForm}.
 *
 * @public
 */
export type UseIndustryFormResult = HookLoadingResult | UseIndustryFormReady
/**
 * Type of `form.fieldsMetadata` returned by {@link useIndustryForm}.
 *
 * @public
 */
export type IndustryFieldsMetadata = ReturnType<typeof buildIndustryFieldsMetadata>
