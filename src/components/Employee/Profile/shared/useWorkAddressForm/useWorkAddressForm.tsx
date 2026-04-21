import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Location } from '@gusto/embedded-api/models/components/location'
import type { EmployeeWorkAddress } from '@gusto/embedded-api/models/components/employeeworkaddress'
import { useLocationsGet } from '@gusto/embedded-api/react-query/locationsGet'
import { useEmployeeAddressesGetWorkAddresses } from '@gusto/embedded-api/react-query/employeeAddressesGetWorkAddresses'
import { useEmployeeAddressesCreateWorkAddressMutation } from '@gusto/embedded-api/react-query/employeeAddressesCreateWorkAddress'
import { useEmployeeAddressesUpdateWorkAddressMutation } from '@gusto/embedded-api/react-query/employeeAddressesUpdateWorkAddress'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import {
  createWorkAddressSchema,
  type WorkAddressOptionalFieldsToRequire,
  type WorkAddressFormData,
  type WorkAddressFormOutputs,
} from './workAddressSchema'
import { LocationField, EffectiveDateField } from './fields'
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
import { addressInline } from '@/helpers/formattedStrings'

export type { WorkAddressOptionalFieldsToRequire } from './workAddressSchema'

export interface WorkAddressSubmitCallbacks {
  onWorkAddressCreated?: (workAddress: EmployeeWorkAddress) => void
  onWorkAddressUpdated?: (workAddress: EmployeeWorkAddress) => void
}

export interface WorkAddressSubmitOptions {
  employeeId?: string
  effectiveDate?: string
}

export interface UseWorkAddressFormProps {
  /** Company UUID for locations; omit or leave unset while resolving from the employee record. */
  companyId?: string
  employeeId?: string
  /**
   * When set, the form updates that work address (PUT). When omitted, creates a new work address (POST).
   * Defaults are loaded from this row when updating.
   */
  workAddressUuid?: string
  withEffectiveDateField?: boolean
  optionalFieldsToRequire?: WorkAddressOptionalFieldsToRequire
  defaultValues?: Partial<WorkAddressFormData>
  validationMode?: UseFormProps['mode']
  shouldFocusError?: boolean
  /**
   * Increment when opening a create/edit modal so the form resets even when the target address and
   * default field values match the previous open (e.g. reopening the same row after cancel).
   */
  formSessionId?: number
}

export interface WorkAddressFields {
  Location: typeof LocationField
  EffectiveDate: typeof EffectiveDateField | undefined
}

export interface UseWorkAddressFormReady extends BaseFormHookReady<
  FieldsMetadata,
  WorkAddressFormData,
  WorkAddressFields
> {
  data: {
    workAddress: EmployeeWorkAddress | null
    workAddresses: EmployeeWorkAddress[] | undefined
    companyLocations: Location[] | undefined
  }
  status: { isPending: boolean; mode: 'create' | 'update' }
  actions: {
    onSubmit: (
      callbacks?: WorkAddressSubmitCallbacks,
      options?: WorkAddressSubmitOptions,
    ) => Promise<HookSubmitResult<EmployeeWorkAddress> | undefined>
  }
}

const getActiveWorkAddress = (addresses?: EmployeeWorkAddress[]) => {
  if (!addresses || addresses.length === 0) return undefined
  return addresses.find(address => address.active) ?? addresses[0]
}

export function useWorkAddressForm({
  companyId,
  employeeId,
  workAddressUuid,
  withEffectiveDateField = true,
  optionalFieldsToRequire,
  defaultValues: partnerDefaults,
  validationMode = 'onSubmit',
  shouldFocusError = true,
  formSessionId = 0,
}: UseWorkAddressFormProps): HookLoadingResult | UseWorkAddressFormReady {
  const locationsQuery = useLocationsGet({ companyId: companyId ?? '' }, { enabled: !!companyId })
  const workAddressesQuery = useEmployeeAddressesGetWorkAddresses(
    { employeeId: employeeId ?? '' },
    { enabled: !!employeeId },
  )

  const companyLocations = locationsQuery.data?.companyLocationsList
  const workAddresses = workAddressesQuery.data?.employeeWorkAddressesList
  const currentWorkAddress = getActiveWorkAddress(workAddresses)

  const isCreateMode = !workAddressUuid

  const addressForUpdate = useMemo(() => {
    if (!workAddressUuid || !workAddresses?.length) {
      return undefined
    }
    return workAddresses.find(a => a.uuid === workAddressUuid)
  }, [workAddressUuid, workAddresses])

  const sourceAddressForDefaults = isCreateMode ? undefined : addressForUpdate

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

  const resolvedDefaults: WorkAddressFormData = useMemo(() => {
    if (isCreateMode) {
      return {
        locationUuid: partnerDefaults?.locationUuid ?? '',
        effectiveDate: partnerDefaults?.effectiveDate ?? '',
      }
    }
    return {
      locationUuid: sourceAddressForDefaults?.locationUuid ?? partnerDefaults?.locationUuid ?? '',
      effectiveDate:
        sourceAddressForDefaults?.effectiveDate ?? partnerDefaults?.effectiveDate ?? '',
    }
  }, [isCreateMode, sourceAddressForDefaults, partnerDefaults])

  const formMethods = useForm<WorkAddressFormData, unknown, WorkAddressFormOutputs>({
    resolver: zodResolver(schema),
    mode: validationMode,
    shouldFocusError,
    defaultValues: resolvedDefaults,
    values: resolvedDefaults,
    resetOptions: { keepDirtyValues: true },
  })

  /* eslint-disable react-hooks/exhaustive-deps -- reset uses primitive deps to mirror resolvedDefaults without object-identity churn */
  useEffect(() => {
    formMethods.reset(resolvedDefaults, { keepDirtyValues: false })
  }, [
    formSessionId,
    workAddressUuid,
    sourceAddressForDefaults?.uuid,
    resolvedDefaults.locationUuid,
    resolvedDefaults.effectiveDate,
    formMethods,
  ])
  /* eslint-enable react-hooks/exhaustive-deps */

  const createWorkAddressMutation = useEmployeeAddressesCreateWorkAddressMutation()
  const updateWorkAddressMutation = useEmployeeAddressesUpdateWorkAddressMutation()

  const isPending = createWorkAddressMutation.isPending || updateWorkAddressMutation.isPending

  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('WorkAddressForm')

  const queries = employeeId ? [locationsQuery, workAddressesQuery] : [locationsQuery]
  const errorHandling = composeErrorHandler(queries, { submitError, setSubmitError })

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
              const addressToUpdate = workAddressUuid
                ? workAddresses?.find(a => a.uuid === workAddressUuid)
                : undefined

              if (!addressToUpdate) {
                throw new SDKInternalError('Cannot update work address: no matching address on file')
              }

              const result = await updateWorkAddressMutation.mutateAsync({
                request: {
                  workAddressUuid: addressToUpdate.uuid,
                  requestBody: {
                    version: addressToUpdate.version,
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

  const isDataLoading =
    (!!companyId && locationsQuery.isLoading) || (employeeId ? workAddressesQuery.isLoading : false)

  if (!companyId || isDataLoading || !companyLocations || (employeeId && !workAddresses)) {
    return { isLoading: true as const, errorHandling }
  }

  return {
    isLoading: false as const,
    data: {
      workAddress: currentWorkAddress ?? null,
      workAddresses,
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
      hookFormInternals: { formMethods },
      getFormSubmissionValues: createGetFormSubmissionValues(formMethods, schema),
    },
  }
}

export type UseWorkAddressFormResult = HookLoadingResult | UseWorkAddressFormReady
export type WorkAddressFieldsMetadata = UseWorkAddressFormReady['form']['fieldsMetadata']
export type WorkAddressFormFields = UseWorkAddressFormReady['form']['Fields']
