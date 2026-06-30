import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Location } from '@gusto/embedded-api-v-2026-06-15/models/components/location'
import type { EmployeeWorkAddress } from '@gusto/embedded-api-v-2026-06-15/models/components/employeeworkaddress'
import { useLocationsGet } from '@gusto/embedded-api-v-2026-06-15/react-query/locationsGet'
import { useEmployeeAddressesRetrieveWorkAddress } from '@gusto/embedded-api-v-2026-06-15/react-query/employeeAddressesRetrieveWorkAddress'
import { useEmployeeAddressesCreateWorkAddressMutation } from '@gusto/embedded-api-v-2026-06-15/react-query/employeeAddressesCreateWorkAddress'
import { useEmployeeAddressesUpdateWorkAddressMutation } from '@gusto/embedded-api-v-2026-06-15/react-query/employeeAddressesUpdateWorkAddress'
import { RFCDate } from '@gusto/embedded-api-v-2026-06-15/types/rfcdate'
import {
  createWorkAddressSchema,
  type WorkAddressOptionalFieldsToRequire,
  type WorkAddressFormData,
  type WorkAddressFormOutputs,
} from './workAddressSchema'
import { LocationField, EffectiveDateField } from './fields'
import { useDeriveFieldsMetadata } from '@/partner-hook-utils/form/useDeriveFieldsMetadata'
import { useHookFormInternals } from '@/partner-hook-utils/form/useHookFormInternals'
import { createGetFormSubmissionValues } from '@/partner-hook-utils/form/getFormSubmissionValues'
import { withOptions } from '@/partner-hook-utils/form/withOptions'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type {
  BaseFormHookReady,
  FieldsMetadata,
  HookLoadingResult,
  HookSubmitResult,
} from '@/partner-hook-utils/types'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { SDKInternalError } from '@/types/sdkError'
import { addressInline } from '@/helpers/formattedStrings'

export type { WorkAddressOptionalFieldsToRequire } from './workAddressSchema'

/**
 * Optional callbacks passed to {@link UseWorkAddressFormReady.actions.onSubmit | onSubmit}.
 *
 * @remarks
 * Only the callback matching the submit mode fires —
 * `onWorkAddressCreated` on create, `onWorkAddressUpdated` on update.
 *
 * @public
 */
export interface WorkAddressSubmitCallbacks {
  /** Fired after a new work address is successfully created. */
  onWorkAddressCreated?: (workAddress: EmployeeWorkAddress) => void
  /** Fired after an existing work address is successfully updated. */
  onWorkAddressUpdated?: (workAddress: EmployeeWorkAddress) => void
}

/**
 * Optional overrides passed to {@link UseWorkAddressFormReady.actions.onSubmit | onSubmit}.
 *
 * @public
 */
export interface WorkAddressSubmitOptions {
  /** Override the employee identifier supplied to the hook (e.g. after creating a new employee in the same flow). */
  employeeId?: string
  /** Override the effective date submitted with the address. */
  effectiveDate?: string
}

/**
 * Configuration options for {@link useWorkAddressForm}.
 *
 * @remarks
 * Presence or absence of `workAddressUuid` selects the API verb — see the
 * `workAddressUuid` field description. `companyId` is required to fetch
 * the location list; pass it when it is known.
 *
 * @public
 */
export interface UseWorkAddressFormProps {
  /** Company UUID for locations; omit or leave unset while resolving from the employee record. */
  companyId?: string
  /** UUID of the employee whose work address is being created or edited. */
  employeeId: string
  /**
   * When set, loads that work address via GET `/v1/work_addresses/{work_address_uuid}` and updates it (PUT).
   * When omitted, the form is in create mode (POST).
   */
  workAddressUuid?: string
  /**
   * Pre-loaded address matching `workAddressUuid`. When supplied, the form uses it directly
   * instead of issuing a GET — useful when the parent already has the row from a list query.
   */
  initialAddress?: EmployeeWorkAddress
  /** When `true`, renders `Fields.EffectiveDate`; otherwise it is `undefined`. Defaults to `true`. */
  withEffectiveDateField?: boolean
  /** Override fields that are optional on a given mode to be required. See `WorkAddressOptionalFieldsToRequire`. */
  optionalFieldsToRequire?: WorkAddressOptionalFieldsToRequire
  /** Pre-fill form values. Server data takes precedence on update. */
  defaultValues?: Partial<WorkAddressFormData>
  /** Passed through to react-hook-form. Defaults to `'onSubmit'`. */
  validationMode?: UseFormProps['mode']
  /** Auto-focus the first invalid field on submit. Set to `false` when using `composeSubmitHandler` so submit-time focus is coordinated across multiple forms. Defaults to `true`. */
  shouldFocusError?: boolean
}

/**
 * Pre-bound field components exposed on `useWorkAddressForm().form.Fields`.
 *
 * @remarks
 * `EffectiveDate` is `undefined` when `withEffectiveDateField` is `false`.
 * Always null-check it before rendering.
 *
 * @public
 */
export interface WorkAddressFields {
  /** Location selector. Always available. */
  Location: typeof LocationField
  /** Effective-date picker. Only available when `withEffectiveDateField` is `true`. */
  EffectiveDate: typeof EffectiveDateField | undefined
}

/**
 * Ready-state shape returned by {@link useWorkAddressForm} once data has loaded.
 *
 * @remarks
 * Discriminated by `isLoading: false`. Extends {@link BaseFormHookReady} with
 * the work-address-specific `data`, `status`, `actions`, and `form.Fields` shape.
 *
 * @public
 */
export interface UseWorkAddressFormReady extends BaseFormHookReady<
  FieldsMetadata,
  WorkAddressFormData,
  WorkAddressFields
> {
  /** Static entity data resolved from the API. */
  data: {
    /** The address row loaded for update; `null` in create mode. */
    workAddress: EmployeeWorkAddress | null
    /** Company locations available for selection; `undefined` until the locations query resolves. */
    companyLocations: Location[] | undefined
  }
  /** Reactive status flags. */
  status: { isPending: boolean; mode: 'create' | 'update' }
  /** Available actions. */
  actions: {
    onSubmit: (
      callbacks?: WorkAddressSubmitCallbacks,
      options?: WorkAddressSubmitOptions,
    ) => Promise<HookSubmitResult<EmployeeWorkAddress> | undefined>
  }
}

/**
 * Form hook for creating or editing an employee's work address.
 *
 * @remarks
 * When `workAddressUuid` is supplied the hook loads that address and issues a PUT on submit;
 * when omitted it operates in create mode and issues a POST. The hook requires `companyId`
 * to fetch the company's location list — it stays in loading state until `companyId` is known.
 *
 * @param props - See {@link UseWorkAddressFormProps}.
 * @returns A {@link HookLoadingResult} while loading, or a {@link UseWorkAddressFormReady} once ready.
 * @public
 */
export function useWorkAddressForm({
  companyId,
  employeeId,
  workAddressUuid,
  initialAddress,
  withEffectiveDateField = true,
  optionalFieldsToRequire,
  defaultValues: partnerDefaults,
  validationMode = 'onSubmit',
  shouldFocusError = true,
}: UseWorkAddressFormProps): HookLoadingResult | UseWorkAddressFormReady {
  const locationsQuery = useLocationsGet({ companyId: companyId ?? '' }, { enabled: !!companyId })

  const hasInitialAddressMatch = !!workAddressUuid && initialAddress?.uuid === workAddressUuid

  const retrieveWorkAddressQuery = useEmployeeAddressesRetrieveWorkAddress(
    { workAddressUuid: workAddressUuid ?? '' },
    { enabled: !!workAddressUuid && !hasInitialAddressMatch },
  )

  const companyLocations = locationsQuery.data?.companyLocationsList

  const isCreateMode = !workAddressUuid

  const fetchedWorkAddress = workAddressUuid
    ? hasInitialAddressMatch
      ? initialAddress
      : retrieveWorkAddressQuery.data?.employeeWorkAddress
    : undefined

  const schemaMode = isCreateMode ? 'create' : 'update'

  const [schema, metadataConfig] = useMemo(
    () =>
      createWorkAddressSchema({
        mode: schemaMode,
        optionalFieldsToRequire,
        withEffectiveDateField,
      }),
    [schemaMode, optionalFieldsToRequire, withEffectiveDateField],
  )

  const resolvedDefaults: WorkAddressFormData = useMemo(
    () => ({
      locationUuid: fetchedWorkAddress?.locationUuid ?? partnerDefaults?.locationUuid ?? '',
      effectiveDate: fetchedWorkAddress?.effectiveDate ?? partnerDefaults?.effectiveDate ?? '',
    }),
    [fetchedWorkAddress, partnerDefaults],
  )

  const formMethods = useForm<WorkAddressFormData, unknown, WorkAddressFormOutputs>({
    resolver: zodResolver(schema),
    mode: validationMode,
    shouldFocusError,
    defaultValues: resolvedDefaults,
    values: resolvedDefaults,
    resetOptions: { keepDirtyValues: true },
  })

  const createWorkAddressMutation = useEmployeeAddressesCreateWorkAddressMutation()
  const updateWorkAddressMutation = useEmployeeAddressesUpdateWorkAddressMutation()

  const isPending = createWorkAddressMutation.isPending || updateWorkAddressMutation.isPending

  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('WorkAddressForm')

  const queriesForErrors = [locationsQuery, ...(workAddressUuid ? [retrieveWorkAddressQuery] : [])]
  const errorHandling = composeErrorHandler(queriesForErrors, { submitError, setSubmitError })

  const locationOptions = (companyLocations ?? []).map(location => ({
    value: location.uuid,
    label: addressInline(location),
  }))

  const baseMetadata = useDeriveFieldsMetadata(metadataConfig, formMethods.control)
  const fieldsMetadata = {
    locationUuid: withOptions<Location>(
      baseMetadata.locationUuid,
      locationOptions,
      companyLocations ?? [],
    ),
    effectiveDate: baseMetadata.effectiveDate,
  }

  const onSubmit = async (
    callbacks?: WorkAddressSubmitCallbacks,
    options?: WorkAddressSubmitOptions,
  ): Promise<HookSubmitResult<EmployeeWorkAddress> | undefined> => {
    let submitResult: HookSubmitResult<EmployeeWorkAddress> | undefined

    await new Promise<void>(resolve => {
      void formMethods.handleSubmit(
        async (data: WorkAddressFormOutputs) => {
          await baseSubmitHandler(data, async payload => {
            const resolvedEmployeeId = options?.employeeId ?? employeeId

            if (!resolvedEmployeeId) {
              throw new SDKInternalError('employeeId is required to submit work address')
            }

            const resolvedEffectiveDate =
              withEffectiveDateField && payload.effectiveDate
                ? payload.effectiveDate
                : options?.effectiveDate

            const effectiveDateParam = resolvedEffectiveDate
              ? new RFCDate(new Date(resolvedEffectiveDate))
              : undefined

            let updatedWorkAddress: EmployeeWorkAddress

            if (isCreateMode) {
              const result = await createWorkAddressMutation.mutateAsync({
                request: {
                  employeeId: resolvedEmployeeId,
                  requestBody: {
                    locationUuid: payload.locationUuid,
                    effectiveDate: effectiveDateParam,
                  },
                },
              })

              if (!result.employeeWorkAddress) {
                throw new SDKInternalError('Work address creation failed')
              }

              updatedWorkAddress = result.employeeWorkAddress
              callbacks?.onWorkAddressCreated?.(updatedWorkAddress)
            } else {
              if (!fetchedWorkAddress || !workAddressUuid) {
                throw new SDKInternalError(
                  'Cannot update work address: no matching address on file',
                )
              }

              const result = await updateWorkAddressMutation.mutateAsync({
                request: {
                  workAddressUuid: fetchedWorkAddress.uuid,
                  requestBody: {
                    version: fetchedWorkAddress.version,
                    locationUuid: payload.locationUuid,
                    effectiveDate: effectiveDateParam,
                  },
                },
              })

              if (!result.employeeWorkAddress) {
                throw new SDKInternalError('Work address update failed')
              }

              updatedWorkAddress = result.employeeWorkAddress
              callbacks?.onWorkAddressUpdated?.(updatedWorkAddress)
            }

            submitResult = {
              mode: isCreateMode ? 'create' : 'update',
              data: updatedWorkAddress,
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

  const isDataLoading =
    (!!companyId && locationsQuery.isLoading) ||
    (!!workAddressUuid && retrieveWorkAddressQuery.isLoading)

  if (!companyId || isDataLoading || !companyLocations) {
    return { isLoading: true as const, errorHandling }
  }

  if (workAddressUuid && !fetchedWorkAddress) {
    return { isLoading: true as const, errorHandling }
  }

  return {
    isLoading: false as const,
    data: {
      workAddress: fetchedWorkAddress ?? null,
      companyLocations,
    },
    status: {
      isPending,
      mode: isCreateMode ? ('create' as const) : ('update' as const),
    },
    actions: { onSubmit },
    errorHandling,
    form: {
      Fields: {
        Location: LocationField,
        EffectiveDate: withEffectiveDateField ? EffectiveDateField : undefined,
      },
      fieldsMetadata,
      hookFormInternals,
      getFormSubmissionValues: createGetFormSubmissionValues(formMethods, schema),
    },
  }
}

/**
 * Discriminated union returned by {@link useWorkAddressForm}.
 *
 * @public
 */
export type UseWorkAddressFormResult = HookLoadingResult | UseWorkAddressFormReady
/**
 * Type of `form.fieldsMetadata` returned by {@link useWorkAddressForm}.
 *
 * @public
 */
export type WorkAddressFieldsMetadata = UseWorkAddressFormReady['form']['fieldsMetadata']
/**
 * Type of `form.Fields` returned by {@link useWorkAddressForm}.
 *
 * @public
 */
export type WorkAddressFormFields = UseWorkAddressFormReady['form']['Fields']
