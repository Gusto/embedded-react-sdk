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
import type { HookSubmitResult } from '../../types'
import { useErrorHandling } from '../../useErrorHandling'
import { deriveFieldsMetadata } from '../../form/deriveFieldsMetadata'
import { withOptions } from '../../form/withOptions'
import { resolveRequiredFields, type RequiredFieldsInput } from '../../form/resolveRequiredFields'
import {
  createWorkAddressSchema,
  type WorkAddressFormData,
  type WorkAddressFormOutputs,
  type WorkAddressField,
} from './workAddressSchema'
import { LocationField, EffectiveDateField } from './fields'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { SDKInternalError } from '@/types/sdkError'
import { addressInline } from '@/helpers/formattedStrings'

export type WorkAddressRequiredFields = RequiredFieldsInput<WorkAddressField>

export interface WorkAddressSubmitCallbacks {
  onWorkAddressCreated?: (workAddress: EmployeeWorkAddress) => void
  onWorkAddressUpdated?: (workAddress: EmployeeWorkAddress) => void
}

export interface WorkAddressSubmitOptions {
  effectiveDate?: string
}

export interface UseWorkAddressFormProps {
  companyId: string
  employeeId: string
  withEffectiveDateField?: boolean
  requiredFields?: WorkAddressRequiredFields
  defaultValues?: Partial<WorkAddressFormData>
  validationMode?: UseFormProps['mode']
  shouldFocusError?: boolean
}

export function useWorkAddressForm({
  companyId,
  employeeId,
  withEffectiveDateField = true,
  requiredFields,
  defaultValues: partnerDefaults,
  validationMode = 'onSubmit',
  shouldFocusError = true,
}: UseWorkAddressFormProps) {
  const locationsQuery = useLocationsGet({ companyId })
  const workAddressesQuery = useEmployeeAddressesGetWorkAddresses({ employeeId })

  const companyLocations = locationsQuery.data?.companyLocationsList
  const workAddresses = workAddressesQuery.data?.employeeWorkAddressesList
  const currentWorkAddress = workAddresses?.find(address => address.active)

  const isCreateMode = !currentWorkAddress
  const mode = isCreateMode ? 'create' : 'update'
  const modeRequiredFields = resolveRequiredFields(requiredFields, mode)

  const schema = createWorkAddressSchema({
    mode,
    requiredFields: modeRequiredFields,
    withEffectiveDateField,
  })

  const resolvedDefaults: WorkAddressFormData = {
    locationUuid: currentWorkAddress?.locationUuid ?? partnerDefaults?.locationUuid ?? '',
    effectiveDate: currentWorkAddress?.effectiveDate ?? partnerDefaults?.effectiveDate ?? '',
  }

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

  const { baseSubmitHandler, error: submitError, setError } = useBaseSubmit('WorkAddressForm')

  const queries = [locationsQuery, workAddressesQuery]
  const errorHandling = useErrorHandling(queries, { error: submitError, setError })

  const locationOptions = (companyLocations ?? []).map(location => ({
    value: location.uuid,
    label: addressInline(location),
  }))

  const baseMetadata = deriveFieldsMetadata(schema)
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
            let updatedWorkAddress: EmployeeWorkAddress

            if (isCreateMode) {
              const resolvedEffectiveDate =
                withEffectiveDateField && payload.effectiveDate
                  ? payload.effectiveDate
                  : options?.effectiveDate

              if (!resolvedEffectiveDate) {
                throw new SDKInternalError('Effective date is required')
              }

              const result = await createWorkAddressMutation.mutateAsync({
                request: {
                  employeeId,
                  requestBody: {
                    locationUuid: payload.locationUuid,
                    effectiveDate: new RFCDate(new Date(resolvedEffectiveDate)),
                  },
                },
              })

              if (!result.employeeWorkAddress) {
                throw new SDKInternalError('Work address creation failed')
              }

              updatedWorkAddress = result.employeeWorkAddress
              callbacks?.onWorkAddressCreated?.(updatedWorkAddress)
            } else {
              const result = await updateWorkAddressMutation.mutateAsync({
                request: {
                  workAddressUuid: currentWorkAddress.uuid,
                  requestBody: {
                    version: currentWorkAddress.version,
                    locationUuid: payload.locationUuid,
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

  const isDataLoading = locationsQuery.isLoading || workAddressesQuery.isLoading

  if (isDataLoading || !companyLocations || !workAddresses) {
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
        EffectiveDate: withEffectiveDateField && isCreateMode ? EffectiveDateField : undefined,
      },
      fieldsMetadata,
      hookFormInternals: { formMethods },
    },
  }
}

export type UseWorkAddressFormResult = ReturnType<typeof useWorkAddressForm>
export type UseWorkAddressFormReady = Extract<UseWorkAddressFormResult, { data: object }>
export type WorkAddressFieldsMetadata = UseWorkAddressFormReady['form']['fieldsMetadata']
export type WorkAddressFormFields = UseWorkAddressFormReady['form']['Fields']
