import type { ComponentType } from 'react'
import { useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { useContractorsGet } from '@gusto/embedded-api/react-query/contractorsGet'
import { useContractorsUpdateMutation } from '@gusto/embedded-api/react-query/contractorsUpdate'
import {
  createContractorPaySchema,
  WageType,
  type ContractorPayFormData,
  type ContractorPayFormOutputs,
} from './contractorPaySchema'
import type { WageTypeFieldProps, HourlyRateFieldProps } from './fields'
import { WageTypeField, HourlyRateField } from './fields'
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

/**
 * Props for {@link useContractorPayForm}.
 *
 * @public
 */
export interface UseContractorPayFormProps {
  /** Contractor whose compensation is being edited. */
  contractorId: string
  /** When validation runs. Passed through to react-hook-form. Defaults to `'onSubmit'`. */
  validationMode?: UseFormProps['mode']
  /** Auto-focus the first invalid field on submit. Set to `false` when using `composeSubmitHandler`. Defaults to `true`. */
  shouldFocusError?: boolean
}

/**
 * Field components exposed by {@link useContractorPayForm} on `form.Fields`.
 *
 * @public
 */
export interface ContractorPayFormFields {
  /** Bound to `wageType`. Selects whether the contractor is paid Fixed or Hourly. */
  WageType: ComponentType<WageTypeFieldProps>
  /** Bound to `hourlyRate`. Required and rendered only when `wageType` is `Hourly`. */
  HourlyRate: ComponentType<HourlyRateFieldProps>
}

/**
 * Ready-state return value of {@link useContractorPayForm}.
 *
 * @public
 */
export interface UseContractorPayFormReady extends BaseFormHookReady<
  ContractorPayFieldsMetadata,
  ContractorPayFormData,
  ContractorPayFormFields
> {
  /** The full contractor entity, loaded from the API. */
  data: { contractor: Contractor }
  /**
   * `isPending` reflects the in-flight update mutation; `mode` is always
   * `'update'`. `isHourly` reflects the currently selected wage type so a
   * composing component can decide whether to render the hourly-rate field.
   */
  status: { isPending: boolean; mode: 'update'; isHourly: boolean }
  /** Submit the form. Returns the updated contractor on success or `undefined` on validation/mutation failure. */
  actions: {
    onSubmit: () => Promise<HookSubmitResult<Contractor> | undefined>
  }
}

/** @internal */
function buildContractorPayFieldsMetadata(
  base: Record<keyof ContractorPayFormData, FieldMetadata>,
) {
  const wageTypeOptions = [WageType.Fixed, WageType.Hourly].map(value => ({ value, label: value }))
  return {
    wageType: withOptions(base.wageType, wageTypeOptions, [WageType.Fixed, WageType.Hourly]),
    hourlyRate: base.hourlyRate,
  } satisfies FieldsMetadata
}

/**
 * Headless React Hook Form hook for editing a contractor's compensation.
 *
 * @remarks
 * Owns `wageType` (Fixed or Hourly) and, when Hourly, `hourlyRate`. Always
 * operates in update mode — a contractor's wage type is set at creation. Every
 * submit echoes the contractor's current `type` back to the API alongside the
 * changed fields: the update endpoint's wire schema defaults an omitted `type`
 * to `"Individual"`, so a narrower payload would silently misrepresent a
 * Business contractor.
 *
 * @param props - See {@link UseContractorPayFormProps}.
 * @returns A loading-state result while data loads, or a {@link UseContractorPayFormReady} once ready.
 * @public
 *
 * @example
 * ```tsx
 * import { useContractorPayForm, SDKFormProvider } from '@gusto/embedded-react-sdk'
 *
 * function PayScreen({ contractorId }: { contractorId: string }) {
 *   const pay = useContractorPayForm({ contractorId })
 *
 *   if (pay.isLoading) return null
 *   const { Fields } = pay.form
 *
 *   return (
 *     <SDKFormProvider formHookResult={pay}>
 *       <form
 *         onSubmit={e => {
 *           e.preventDefault()
 *           void pay.actions.onSubmit()
 *         }}
 *       >
 *         <Fields.WageType label="Compensation type" />
 *         <Fields.HourlyRate label="Hourly rate" />
 *         <button type="submit" disabled={pay.status.isPending}>Save</button>
 *       </form>
 *     </SDKFormProvider>
 *   )
 * }
 * ```
 */
export function useContractorPayForm({
  contractorId,
  validationMode = 'onSubmit',
  shouldFocusError = true,
}: UseContractorPayFormProps): HookLoadingResult | UseContractorPayFormReady {
  const contractorQuery = useContractorsGet({ contractorUuid: contractorId })
  const contractor = contractorQuery.data?.contractor

  const [schema, metadataConfig] = useMemo(() => createContractorPaySchema(), [])

  const resolvedDefaults: ContractorPayFormData = useMemo(
    () => ({
      wageType: contractor?.wageType ?? WageType.Fixed,
      hourlyRate: contractor?.hourlyRate ? Number(contractor.hourlyRate) : 0,
    }),
    [contractor],
  )

  const formMethods = useForm<ContractorPayFormData, unknown, ContractorPayFormOutputs>({
    resolver: zodResolver(schema),
    mode: validationMode,
    shouldFocusError,
    defaultValues: resolvedDefaults,
    values: resolvedDefaults,
    resetOptions: { keepDirtyValues: true },
  })

  const watchedWageType = useWatch({ control: formMethods.control, name: 'wageType' })
  const isHourly = watchedWageType === WageType.Hourly

  const updateMutation = useContractorsUpdateMutation()
  const isPending = updateMutation.isPending

  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('ContractorPayForm')

  const errorHandling = composeErrorHandler([contractorQuery], { submitError, setSubmitError })

  const baseMetadata = useDeriveFieldsMetadata(metadataConfig, formMethods.control)
  const fieldsMetadata = buildContractorPayFieldsMetadata(baseMetadata)

  const onSubmit = async (): Promise<HookSubmitResult<Contractor> | undefined> => {
    if (!contractor?.version) {
      throw new SDKInternalError('Cannot submit pay form before contractor data is loaded')
    }
    const contractorVersion = contractor.version
    const contractorType = contractor.type
    let submitResult: HookSubmitResult<Contractor> | undefined

    await new Promise<void>(resolve => {
      void formMethods.handleSubmit(
        async (data: ContractorPayFormOutputs) => {
          await baseSubmitHandler(data, async payload => {
            const result = await updateMutation.mutateAsync({
              request: {
                contractorUuid: contractorId,
                contractorUpdateRequestBody: {
                  version: contractorVersion,
                  type: contractorType,
                  wageType: payload.wageType,
                  hourlyRate:
                    payload.wageType === WageType.Hourly ? String(payload.hourlyRate) : undefined,
                },
              },
            })

            if (!result.contractor) {
              throw new SDKInternalError('Contractor pay update failed')
            }

            submitResult = { mode: 'update' as const, data: result.contractor }
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
    return { isLoading: true as const, errorHandling }
  }

  return {
    isLoading: false as const,
    data: { contractor },
    status: { isPending, mode: 'update' as const, isHourly },
    actions: { onSubmit },
    errorHandling,
    form: {
      Fields: {
        WageType: WageTypeField,
        HourlyRate: HourlyRateField,
      },
      fieldsMetadata,
      hookFormInternals,
      getFormSubmissionValues: createGetFormSubmissionValues(formMethods, schema),
    },
  }
}

/**
 * Return type of {@link useContractorPayForm} — a discriminated union on `isLoading`.
 *
 * @public
 */
export type UseContractorPayFormResult = HookLoadingResult | UseContractorPayFormReady

/**
 * Per-field metadata exposed on `form.fieldsMetadata` for {@link useContractorPayForm}.
 *
 * @public
 */
export type ContractorPayFieldsMetadata = ReturnType<typeof buildContractorPayFieldsMetadata>
