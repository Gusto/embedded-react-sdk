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
  withEffectiveDateField?: boolean
  optionalFieldsToRequire?: WorkAddressOptionalFieldsToRequire
  defaultValues?: Partial<WorkAddressFormData>
  validationMode?: UseFormProps['mode']
  shouldFocusError?: boolean
  /**
   * How to choose create (POST) vs update (PUT) when the employee may already have a current work address.
   * - `auto`: create only if there is no current address; otherwise update (default).
   * - `alwaysCreate`: always POST a new work address (e.g. change with a new effective date).
   * - `alwaysUpdate`: always PUT an existing work address (edit current or a row when `updateTargetUuid` is set).
   */
  submissionMode?: 'auto' | 'alwaysCreate' | 'alwaysUpdate'
  /**
   * `current` fills the form from the active address (or `updateTargetUuid` when updating);
   * `empty` clears fields for add-new flows even when a current address exists.
   */
  defaultValuesStrategy?: 'current' | 'empty'
  /**
   * When set with `submissionMode: 'alwaysUpdate'`, defaults and PUT target the work address with this UUID.
   * When omitted, the active work address is used.
   */
  updateTargetUuid?: string
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

export function useWorkAddressForm({
  companyId,
  employeeId,
  withEffectiveDateField = true,
  optionalFieldsToRequire,
  defaultValues: partnerDefaults,
  validationMode = 'onSubmit',
  shouldFocusError = true,
  submissionMode = 'auto',
  defaultValuesStrategy = 'current',
  updateTargetUuid,
  formSessionId = 0,
}: UseWorkAddressFormProps): HookLoadingResult | UseWorkAddressFormReady {
  const locationsQuery = useLocationsGet({ companyId: companyId ?? '' }, { enabled: !!companyId })
  const workAddressesQuery = useEmployeeAddressesGetWorkAddresses(
    { employeeId: employeeId ?? '' },
    { enabled: !!employeeId },
  )

  const companyLocations = locationsQuery.data?.companyLocationsList
  const workAddresses = workAddressesQuery.data?.employeeWorkAddressesList
  const currentWorkAddress = workAddresses?.find(address => address.active)

  const sourceAddressForDefaults = useMemo(() => {
    if (
      submissionMode === 'alwaysUpdate' &&
      updateTargetUuid &&
      workAddresses &&
      workAddresses.length > 0
    ) {
      return workAddresses.find(a => a.uuid === updateTargetUuid) ?? currentWorkAddress
    }
    return currentWorkAddress
  }, [submissionMode, updateTargetUuid, workAddresses, currentWorkAddress])

  const isCreateMode =
    submissionMode === 'alwaysCreate'
      ? true
      : submissionMode === 'alwaysUpdate'
        ? false
        : !currentWorkAddress

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
    if (defaultValuesStrategy === 'empty') {
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
  }, [defaultValuesStrategy, sourceAddressForDefaults, partnerDefaults])

  const formMethods = useForm<WorkAddressFormData, unknown, WorkAddressFormOutputs>({
    resolver: zodResolver(schema),
    mode: validationMode,
    shouldFocusError,
    defaultValues: resolvedDefaults,
    values: resolvedDefaults,
    resetOptions: { keepDirtyValues: false },
  })

  useEffect(() => {
    formMethods.reset(resolvedDefaults)
  }, [
    formSessionId,
    updateTargetUuid,
    sourceAddressForDefaults?.uuid,
    defaultValuesStrategy,
    resolvedDefaults.locationUuid,
    resolvedDefaults.effectiveDate,
    formMethods,
  ])

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

            const addressToUpdate =
              submissionMode === 'alwaysUpdate' && updateTargetUuid
                ? workAddresses?.find(a => a.uuid === updateTargetUuid)
                : currentWorkAddress

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
              if (!addressToUpdate) {
                throw new SDKInternalError('No work address available to update')
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
