import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { EmployeeAddress } from '@gusto/embedded-api/models/components/employeeaddress'
import { useEmployeeAddressesGet } from '@gusto/embedded-api/react-query/employeeAddressesGet'
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
  /** When omitted on update without an effective-date field, the row’s `effectiveDate` from `homeAddressUuid` is used. */
  effectiveDate?: string
}

export interface UseHomeAddressFormProps {
  employeeId?: string
  /**
   * When set, the form updates that home address (PUT). When omitted, creates a new home address (POST).
   * Defaults are loaded from this row when updating.
   */
  homeAddressUuid?: string
  withEffectiveDateField?: boolean
  optionalFieldsToRequire?: HomeAddressOptionalFieldsToRequire
  defaultValues?: Partial<HomeAddressFormData>
  validationMode?: UseFormProps['mode']
  shouldFocusError?: boolean
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
    homeAddress: EmployeeAddress | null
    homeAddresses: EmployeeAddress[] | undefined
  }
  status: { isPending: boolean; mode: 'create' | 'update' }
  actions: {
    onSubmit: (
      options?: HomeAddressSubmitOptions,
    ) => Promise<HookSubmitResult<EmployeeAddress> | undefined>
  }
}

const getActiveHomeAddress = (addresses?: EmployeeAddress[]) => {
  if (!addresses || addresses.length === 0) return undefined
  return addresses.find(address => address.active) ?? addresses[0]
}

export function useHomeAddressForm({
  employeeId,
  homeAddressUuid,
  withEffectiveDateField = true,
  optionalFieldsToRequire,
  defaultValues: partnerDefaults,
  validationMode = 'onSubmit',
  shouldFocusError = true,
}: UseHomeAddressFormProps): HookLoadingResult | UseHomeAddressFormReady {
  const homeAddressesQuery = useEmployeeAddressesGet(
    { employeeId: employeeId ?? '' },
    { enabled: !!employeeId },
  )

  const homeAddresses = homeAddressesQuery.data?.employeeAddressList
  const currentHomeAddress = getActiveHomeAddress(homeAddresses)

  const isCreateMode = !homeAddressUuid

  const addressForUpdate = useMemo(() => {
    if (!homeAddressUuid || !homeAddresses?.length) {
      return undefined
    }
    return homeAddresses.find(a => a.uuid === homeAddressUuid)
  }, [homeAddressUuid, homeAddresses])

  const sourceAddressForDefaults = isCreateMode ? undefined : addressForUpdate

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

  const resolvedDefaults: HomeAddressFormData = useMemo(() => {
    if (isCreateMode) {
      return {
        street1: partnerDefaults?.street1 ?? '',
        street2: partnerDefaults?.street2 ?? '',
        city: partnerDefaults?.city ?? '',
        state: partnerDefaults?.state ?? '',
        zip: partnerDefaults?.zip ?? '',
        courtesyWithholding: partnerDefaults?.courtesyWithholding ?? false,
        effectiveDate: partnerDefaults?.effectiveDate ?? '',
      }
    }
    return {
      street1: sourceAddressForDefaults?.street1 ?? partnerDefaults?.street1 ?? '',
      street2: sourceAddressForDefaults?.street2 ?? partnerDefaults?.street2 ?? '',
      city: sourceAddressForDefaults?.city ?? partnerDefaults?.city ?? '',
      state: sourceAddressForDefaults?.state ?? partnerDefaults?.state ?? '',
      zip: sourceAddressForDefaults?.zip ?? partnerDefaults?.zip ?? '',
      courtesyWithholding:
        sourceAddressForDefaults?.courtesyWithholding ??
        partnerDefaults?.courtesyWithholding ??
        false,
      effectiveDate:
        sourceAddressForDefaults?.effectiveDate?.toString() ?? partnerDefaults?.effectiveDate ?? '',
    }
  }, [isCreateMode, sourceAddressForDefaults, partnerDefaults])

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

  const queries = employeeId ? [homeAddressesQuery] : []
  const errorHandling = composeErrorHandler(queries, { submitError, setSubmitError })

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

            if (!resolvedEmployeeId) {
              throw new SDKInternalError('employeeId is required to submit home address')
            }

            const resolvedEffectiveDate =
              withEffectiveDateField && payload.effectiveDate
                ? payload.effectiveDate
                : (options?.effectiveDate ??
                  (!withEffectiveDateField && !isCreateMode
                    ? addressForUpdate?.effectiveDate?.toString()
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
              const addressToUpdate = homeAddressUuid
                ? homeAddresses?.find(a => a.uuid === homeAddressUuid)
                : undefined

              if (!addressToUpdate) {
                throw new SDKInternalError(
                  'Cannot update home address: no matching address on file',
                )
              }

              const result = await updateHomeAddressMutation.mutateAsync({
                request: {
                  homeAddressUuid: addressToUpdate.uuid,
                  requestBody: {
                    version: addressToUpdate.version,
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

  const isDataLoading = employeeId ? homeAddressesQuery.isLoading : false

  if (isDataLoading || (employeeId && !homeAddresses)) {
    return { isLoading: true as const, errorHandling }
  }

  return {
    isLoading: false as const,
    data: {
      homeAddress: currentHomeAddress ?? null,
      homeAddresses,
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
