import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { EmployeeAddress } from '@gusto/embedded-api-v-2026-06-15/models/components/employeeaddress'
import { useEmployeeAddressesRetrieveHomeAddress } from '@gusto/embedded-api-v-2026-06-15/react-query/employeeAddressesRetrieveHomeAddress'
import { useEmployeeAddressesCreateMutation } from '@gusto/embedded-api-v-2026-06-15/react-query/employeeAddressesCreate'
import { useEmployeeAddressesUpdateMutation } from '@gusto/embedded-api-v-2026-06-15/react-query/employeeAddressesUpdate'
import { RFCDate } from '@gusto/embedded-api-v-2026-06-15/types/rfcdate'
import {
  createHomeAddressSchema,
  type HomeAddressOptionalFieldsToRequire,
  type HomeAddressFormData,
  type HomeAddressFormOutputs,
} from './homeAddressSchema'
import {
  Street1Field,
  Street2Field,
  CityField,
  StateField,
  ZipField,
  CourtesyWithholdingField,
  EffectiveDateField,
} from './fields'
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
import { STATES_ABBR } from '@/shared/constants'

export type { HomeAddressOptionalFieldsToRequire } from './homeAddressSchema'

/**
 * Optional overrides passed to {@link UseHomeAddressFormReady.actions.onSubmit | onSubmit}.
 *
 * @public
 */
export interface HomeAddressSubmitOptions {
  /** Override the employee identifier supplied to the hook (e.g. after creating a new employee in the same flow). */
  employeeId?: string
  /** Override the effective date submitted with the address. When omitted on update without an effective-date field, the row's `effectiveDate` from the fetched address is used. */
  effectiveDate?: string
}

/**
 * Configuration options for {@link useHomeAddressForm}.
 *
 * @remarks
 * Presence or absence of `homeAddressUuid` selects the API verb — see the
 * `homeAddressUuid` field description.
 *
 * @public
 */
export interface UseHomeAddressFormProps {
  /** UUID of the employee whose home address is being created or edited. */
  employeeId: string
  /**
   * When set, loads that home address via GET `/v1/home_addresses/{uuid}` and updates it (PUT).
   * When omitted, the form is in create mode (POST).
   */
  homeAddressUuid?: string
  /**
   * Pre-loaded address matching `homeAddressUuid`. When supplied, the form uses it directly
   * instead of issuing a GET — useful when the parent already has the row from a list query.
   */
  initialAddress?: EmployeeAddress
  /** When `true`, renders `Fields.EffectiveDate`; otherwise it is `undefined`. Defaults to `true`. */
  withEffectiveDateField?: boolean
  /** Override fields that are optional on a given mode to be required. See `HomeAddressOptionalFieldsToRequire`. */
  optionalFieldsToRequire?: HomeAddressOptionalFieldsToRequire
  /** Pre-fill form values. Server data takes precedence on update. */
  defaultValues?: Partial<HomeAddressFormData>
  /** Passed through to react-hook-form. Defaults to `'onSubmit'`. */
  validationMode?: UseFormProps['mode']
  /** Auto-focus the first invalid field on submit. Set to `false` when using `composeSubmitHandler` so submit-time focus is coordinated across multiple forms. Defaults to `true`. */
  shouldFocusError?: boolean
}

/**
 * Pre-bound field components exposed on `useHomeAddressForm().form.Fields`.
 *
 * @remarks
 * `EffectiveDate` is `undefined` when `withEffectiveDateField` is `false`.
 * Always null-check it before rendering.
 *
 * @public
 */
export interface HomeAddressFields {
  /** Street address line 1 text input. Always available. */
  Street1: typeof Street1Field
  /** Street address line 2 text input. Always available. */
  Street2: typeof Street2Field
  /** City text input. Always available. */
  City: typeof CityField
  /** State selector. Always available. */
  State: typeof StateField
  /** ZIP code text input. Always available. */
  Zip: typeof ZipField
  /** Courtesy withholding checkbox. Always available. */
  CourtesyWithholding: typeof CourtesyWithholdingField
  /** Effective-date picker. Only available when `withEffectiveDateField` is `true`. */
  EffectiveDate: typeof EffectiveDateField | undefined
}

/**
 * Ready-state shape returned by {@link useHomeAddressForm} once data has loaded.
 *
 * @remarks
 * Discriminated by `isLoading: false`. Extends {@link BaseFormHookReady} with
 * the home-address-specific `data`, `status`, `actions`, and `form.Fields` shape.
 *
 * @public
 */
export interface UseHomeAddressFormReady extends BaseFormHookReady<
  FieldsMetadata,
  HomeAddressFormData,
  HomeAddressFields
> {
  /** Static entity data resolved from the API. */
  data: {
    /** The address row loaded for update; `null` in create mode. */
    homeAddress: EmployeeAddress | null
  }
  /** Reactive status flags. */
  status: { isPending: boolean; mode: 'create' | 'update' }
  /** Available actions. */
  actions: {
    onSubmit: (
      options?: HomeAddressSubmitOptions,
    ) => Promise<HookSubmitResult<EmployeeAddress> | undefined>
  }
}

/**
 * Form hook for creating or editing an employee's home address.
 *
 * @remarks
 * When `homeAddressUuid` is supplied the hook loads that address and issues a PUT on submit;
 * when omitted it operates in create mode and issues a POST. Pass `initialAddress` to
 * skip the fetch when the parent already holds the row.
 *
 * @param props - See {@link UseHomeAddressFormProps}.
 * @returns A {@link HookLoadingResult} while loading, or a {@link UseHomeAddressFormReady} once ready.
 * @public
 */
export function useHomeAddressForm({
  employeeId,
  homeAddressUuid,
  initialAddress,
  withEffectiveDateField = true,
  optionalFieldsToRequire,
  defaultValues: partnerDefaults,
  validationMode = 'onSubmit',
  shouldFocusError = true,
}: UseHomeAddressFormProps): HookLoadingResult | UseHomeAddressFormReady {
  const hasInitialAddressMatch = !!homeAddressUuid && initialAddress?.uuid === homeAddressUuid

  const retrieveHomeAddressQuery = useEmployeeAddressesRetrieveHomeAddress(
    { homeAddressUuid: homeAddressUuid ?? '' },
    { enabled: !!homeAddressUuid && !hasInitialAddressMatch },
  )

  const isCreateMode = !homeAddressUuid

  const fetchedHomeAddress = homeAddressUuid
    ? hasInitialAddressMatch
      ? initialAddress
      : retrieveHomeAddressQuery.data?.employeeAddress
    : undefined

  const schemaMode = isCreateMode ? 'create' : 'update'

  const [schema, metadataConfig] = useMemo(
    () =>
      createHomeAddressSchema({
        mode: schemaMode,
        optionalFieldsToRequire,
        withEffectiveDateField,
      }),
    [schemaMode, optionalFieldsToRequire, withEffectiveDateField],
  )

  const resolvedDefaults: HomeAddressFormData = useMemo(
    () => ({
      street1: fetchedHomeAddress?.street1 ?? partnerDefaults?.street1 ?? '',
      street2: fetchedHomeAddress?.street2 ?? partnerDefaults?.street2 ?? '',
      city: fetchedHomeAddress?.city ?? partnerDefaults?.city ?? '',
      state: fetchedHomeAddress?.state ?? partnerDefaults?.state ?? '',
      zip: fetchedHomeAddress?.zip ?? partnerDefaults?.zip ?? '',
      courtesyWithholding:
        fetchedHomeAddress?.courtesyWithholding ?? partnerDefaults?.courtesyWithholding ?? false,
      effectiveDate:
        fetchedHomeAddress?.effectiveDate?.toString() ?? partnerDefaults?.effectiveDate ?? '',
    }),
    [fetchedHomeAddress, partnerDefaults],
  )

  const formMethods = useForm<HomeAddressFormData, unknown, HomeAddressFormOutputs>({
    resolver: zodResolver(schema),
    mode: validationMode,
    shouldFocusError,
    defaultValues: resolvedDefaults,
    values: resolvedDefaults,
    resetOptions: { keepDirtyValues: true },
  })

  const createHomeAddressMutation = useEmployeeAddressesCreateMutation()
  const updateHomeAddressMutation = useEmployeeAddressesUpdateMutation()

  const isPending = createHomeAddressMutation.isPending || updateHomeAddressMutation.isPending

  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('HomeAddressForm')

  const queriesForErrors = homeAddressUuid ? [retrieveHomeAddressQuery] : []
  const errorHandling = composeErrorHandler(queriesForErrors, { submitError, setSubmitError })

  const stateOptions = STATES_ABBR.map(abbr => ({
    value: abbr,
    label: abbr,
  }))

  const baseMetadata = useDeriveFieldsMetadata(metadataConfig, formMethods.control)
  const fieldsMetadata = {
    street1: baseMetadata.street1,
    street2: baseMetadata.street2,
    city: baseMetadata.city,
    state: withOptions(baseMetadata.state, stateOptions, STATES_ABBR),
    zip: baseMetadata.zip,
    courtesyWithholding: baseMetadata.courtesyWithholding,
    effectiveDate: baseMetadata.effectiveDate,
  }

  const onSubmit = async (
    options?: HomeAddressSubmitOptions,
  ): Promise<HookSubmitResult<EmployeeAddress> | undefined> => {
    let submitResult: HookSubmitResult<EmployeeAddress> | undefined

    await new Promise<void>(resolve => {
      void formMethods.handleSubmit(
        async (data: HomeAddressFormOutputs) => {
          await baseSubmitHandler(data, async payload => {
            const resolvedEmployeeId = options?.employeeId ?? employeeId

            const resolvedEffectiveDate =
              withEffectiveDateField && payload.effectiveDate
                ? payload.effectiveDate
                : (options?.effectiveDate ??
                  (!withEffectiveDateField && !isCreateMode
                    ? fetchedHomeAddress?.effectiveDate?.toString()
                    : undefined))

            const effectiveDateParam = resolvedEffectiveDate
              ? new RFCDate(new Date(resolvedEffectiveDate))
              : undefined

            let updatedHomeAddress: EmployeeAddress

            if (isCreateMode) {
              const result = await createHomeAddressMutation.mutateAsync({
                request: {
                  employeeId: resolvedEmployeeId,
                  requestBody: {
                    street1: payload.street1,
                    street2: payload.street2 || undefined,
                    city: payload.city,
                    state: payload.state,
                    zip: payload.zip,
                    courtesyWithholding: payload.courtesyWithholding,
                    effectiveDate: effectiveDateParam,
                  },
                },
              })

              if (!result.employeeAddress) {
                throw new SDKInternalError('Home address creation failed')
              }

              updatedHomeAddress = result.employeeAddress
            } else {
              if (!fetchedHomeAddress || !homeAddressUuid) {
                throw new SDKInternalError(
                  'Cannot update home address: no matching address on file',
                )
              }

              const result = await updateHomeAddressMutation.mutateAsync({
                request: {
                  homeAddressUuid: fetchedHomeAddress.uuid,
                  requestBody: {
                    version: fetchedHomeAddress.version,
                    street1: payload.street1,
                    street2: payload.street2 || undefined,
                    city: payload.city,
                    state: payload.state,
                    zip: payload.zip,
                    courtesyWithholding: payload.courtesyWithholding,
                    effectiveDate: effectiveDateParam,
                  },
                },
              })

              if (!result.employeeAddress) {
                throw new SDKInternalError('Home address update failed')
              }

              updatedHomeAddress = result.employeeAddress
            }

            submitResult = {
              mode: isCreateMode ? 'create' : 'update',
              data: updatedHomeAddress,
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

  if (homeAddressUuid && !fetchedHomeAddress) {
    return { isLoading: true as const, errorHandling }
  }

  return {
    isLoading: false as const,
    data: {
      homeAddress: fetchedHomeAddress ?? null,
    },
    status: {
      isPending,
      mode: isCreateMode ? ('create' as const) : ('update' as const),
    },
    actions: { onSubmit },
    errorHandling,
    form: {
      Fields: {
        Street1: Street1Field,
        Street2: Street2Field,
        City: CityField,
        State: StateField,
        Zip: ZipField,
        CourtesyWithholding: CourtesyWithholdingField,
        EffectiveDate: withEffectiveDateField ? EffectiveDateField : undefined,
      },
      fieldsMetadata,
      hookFormInternals,
      getFormSubmissionValues: createGetFormSubmissionValues(formMethods, schema),
    },
  }
}

/**
 * Discriminated union returned by {@link useHomeAddressForm}.
 *
 * @public
 */
export type UseHomeAddressFormResult = HookLoadingResult | UseHomeAddressFormReady
/**
 * Type of `form.fieldsMetadata` returned by {@link useHomeAddressForm}.
 *
 * @public
 */
export type HomeAddressFieldsMetadata = UseHomeAddressFormReady['form']['fieldsMetadata']
/**
 * Type of `form.Fields` returned by {@link useHomeAddressForm}.
 *
 * @public
 */
export type HomeAddressFormFields = UseHomeAddressFormReady['form']['Fields']
