import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { EmployeeAddress } from '@gusto/embedded-api/models/components/employeeaddress'
import { useEmployeeAddressesRetrieveHomeAddress } from '@gusto/embedded-api/react-query/employeeAddressesRetrieveHomeAddress'
import { useEmployeeAddressesCreateMutation } from '@gusto/embedded-api/react-query/employeeAddressesCreate'
import { useEmployeeAddressesUpdateMutation } from '@gusto/embedded-api/react-query/employeeAddressesUpdate'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
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

export interface HomeAddressSubmitOptions {
  employeeId?: string
  /** When omitted on update without an effective-date field, the row’s `effectiveDate` from the fetched address is used. */
  effectiveDate?: string
}

export interface UseHomeAddressFormProps {
  employeeId: string
  /**
   * When set, loads that home address via GET `/v1/home_addresses/{uuid}` and updates it (PUT).
   * When omitted, the form is in create mode (POST).
   */
  homeAddressUuid?: string
  withEffectiveDateField?: boolean
  optionalFieldsToRequire?: HomeAddressOptionalFieldsToRequire
  defaultValues?: Partial<HomeAddressFormData>
  validationMode?: UseFormProps['mode']
  shouldFocusError?: boolean
  /**
   * Increment when opening a create/edit modal so the form resets even when the target address and
   * default field values match the previous open (e.g. reopening the same row after cancel).
   */
  formSessionId?: number
}

export interface HomeAddressFields {
  Street1: typeof Street1Field
  Street2: typeof Street2Field
  City: typeof CityField
  State: typeof StateField
  Zip: typeof ZipField
  CourtesyWithholding: typeof CourtesyWithholdingField
  EffectiveDate: typeof EffectiveDateField | undefined
}

export interface UseHomeAddressFormReady extends BaseFormHookReady<
  FieldsMetadata,
  HomeAddressFormData,
  HomeAddressFields
> {
  data: {
    /** The address row loaded for update; `null` in create mode. */
    homeAddress: EmployeeAddress | null
  }
  status: { isPending: boolean; mode: 'create' | 'update' }
  actions: {
    onSubmit: (
      options?: HomeAddressSubmitOptions,
    ) => Promise<HookSubmitResult<EmployeeAddress> | undefined>
  }
}

export function useHomeAddressForm({
  employeeId,
  homeAddressUuid,
  withEffectiveDateField = true,
  optionalFieldsToRequire,
  defaultValues: partnerDefaults,
  validationMode = 'onSubmit',
  shouldFocusError = true,
  formSessionId = 0,
}: UseHomeAddressFormProps): HookLoadingResult | UseHomeAddressFormReady {
  const retrieveHomeAddressQuery = useEmployeeAddressesRetrieveHomeAddress(
    { homeAddressUuid: homeAddressUuid ?? '' },
    { enabled: !!homeAddressUuid },
  )

  const isCreateMode = !homeAddressUuid

  const fetchedHomeAddress = homeAddressUuid
    ? retrieveHomeAddressQuery.data?.employeeAddress
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
    resetOptions: { keepDirtyValues: false },
  })

  /* eslint-disable react-hooks/exhaustive-deps -- reset uses primitive deps to mirror resolvedDefaults without object-identity churn */
  useEffect(() => {
    formMethods.reset(resolvedDefaults)
  }, [
    formSessionId,
    homeAddressUuid,
    sourceAddressForDefaults?.uuid,
    resolvedDefaults.street1,
    resolvedDefaults.street2,
    resolvedDefaults.city,
    resolvedDefaults.state,
    resolvedDefaults.zip,
    resolvedDefaults.courtesyWithholding,
    resolvedDefaults.effectiveDate,
    formMethods,
  ])
  /* eslint-enable react-hooks/exhaustive-deps */

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
    state: withOptions(baseMetadata.state, stateOptions),
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
      hookFormInternals: { formMethods },
      getFormSubmissionValues: createGetFormSubmissionValues(formMethods, schema),
    },
  }
}

export type UseHomeAddressFormResult = HookLoadingResult | UseHomeAddressFormReady
export type HomeAddressFieldsMetadata = UseHomeAddressFormReady['form']['fieldsMetadata']
export type HomeAddressFormFields = UseHomeAddressFormReady['form']['Fields']
