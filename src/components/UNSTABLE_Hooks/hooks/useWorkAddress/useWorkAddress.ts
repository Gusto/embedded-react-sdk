import { useEffect, useRef, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { EmployeeWorkAddress } from '@gusto/embedded-api/models/components/employeeworkaddress'
import type { Location } from '@gusto/embedded-api/models/components/location'
import { useEmployeeAddressesGetWorkAddresses } from '@gusto/embedded-api/react-query/employeeAddressesGetWorkAddresses'
import { useLocationsGet } from '@gusto/embedded-api/react-query/locationsGet'
import { useEmployeeAddressesCreateWorkAddressMutation } from '@gusto/embedded-api/react-query/employeeAddressesCreateWorkAddress'
import { useEmployeeAddressesUpdateWorkAddressMutation } from '@gusto/embedded-api/react-query/employeeAddressesUpdateWorkAddress'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import {
  useQueryErrorHandler,
  type HookFormInternals,
  type HookLoadingResult,
  type HookErrors,
  type HookSubmitResult,
} from '../../helpers'
import type { FieldsMetadata } from '../../FormFieldsContext'
import { generateWorkAddressSchema, type WorkAddressFormData } from './schema'
import * as WorkAddressFields from './WorkAddressFields'
import type { WorkAddressFieldComponents } from './WorkAddressFields'
import { addressInline } from '@/helpers/formattedStrings'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'

const getActiveWorkAddress = (workAddresses?: EmployeeWorkAddress[]) => {
  if (!workAddresses || workAddresses.length === 0) return undefined
  return workAddresses.find(address => address.active) ?? workAddresses[0]
}

interface UseWorkAddressParams {
  employeeId?: string
  companyId?: string
  shouldFocusError?: boolean
}

export interface WorkAddressData {
  currentWorkAddress: EmployeeWorkAddress | undefined
  companyLocations: Location[]
}

export interface WorkAddressFormReady {
  isLoading: false
  isPending: boolean
  mode: 'create' | 'update'
  data: WorkAddressData
  onSubmit: (
    submittedEmployeeId?: string,
  ) => Promise<HookSubmitResult<EmployeeWorkAddress> | undefined>
  Fields: WorkAddressFieldComponents
  hookFormInternals: HookFormInternals<WorkAddressFormData>
  fieldsMetadata: FieldsMetadata<WorkAddressFormData>
  errors: HookErrors
}

export type UseWorkAddressFormResult = HookLoadingResult | WorkAddressFormReady

export function useWorkAddressForm({
  employeeId,
  companyId,
  shouldFocusError = true,
}: UseWorkAddressParams): UseWorkAddressFormResult {
  const {
    data: workAddressData,
    isLoading: isLoadingWorkAddresses,
    error: workAddressQueryError,
  } = useEmployeeAddressesGetWorkAddresses({ employeeId: employeeId! }, { enabled: !!employeeId })

  const {
    data: locationsData,
    isLoading: isLoadingLocations,
    error: locationsQueryError,
  } = useLocationsGet({ companyId: companyId! }, { enabled: !!companyId })

  const { baseSubmitHandler, error, fieldErrors, setError } = useBaseSubmit()

  useQueryErrorHandler([workAddressQueryError, locationsQueryError], setError)

  const schema = useMemo(() => generateWorkAddressSchema(), [])

  const currentWorkAddress = getActiveWorkAddress(workAddressData?.employeeWorkAddressesList)
  const mode = currentWorkAddress ? 'update' : 'create'

  const formMethods = useForm<WorkAddressFormData>({
    resolver: zodResolver(schema),
    shouldFocusError,
    defaultValues: {
      locationUuid: '',
      effectiveDate: null as unknown as Date,
    },
  })

  const hasInitializedForm = useRef(false)
  useEffect(() => {
    if (currentWorkAddress && !hasInitializedForm.current) {
      hasInitializedForm.current = true
      formMethods.reset({
        locationUuid: currentWorkAddress.locationUuid ?? '',
        effectiveDate: currentWorkAddress.effectiveDate
          ? new Date(currentWorkAddress.effectiveDate)
          : (null as unknown as Date),
      })
    }
  }, [currentWorkAddress, formMethods.reset])

  const createMutation = useEmployeeAddressesCreateWorkAddressMutation()
  const updateMutation = useEmployeeAddressesUpdateWorkAddressMutation()

  const onSubmit = async (
    submittedEmployeeId?: string,
  ): Promise<HookSubmitResult<EmployeeWorkAddress> | undefined> => {
    const resolvedEmployeeId = submittedEmployeeId ?? employeeId
    if (!resolvedEmployeeId) {
      throw new Error('employeeId is required for work address submission')
    }

    return new Promise<HookSubmitResult<EmployeeWorkAddress> | undefined>((resolve, reject) => {
      formMethods
        .handleSubmit(
          async (data: WorkAddressFormData) => {
            const result = await baseSubmitHandler(data, async payload => {
              const { locationUuid, effectiveDate } = payload

              if (currentWorkAddress) {
                const { employeeWorkAddress } = await updateMutation.mutateAsync({
                  request: {
                    workAddressUuid: currentWorkAddress.uuid,
                    requestBody: {
                      version: currentWorkAddress.version,
                      locationUuid,
                    },
                  },
                })
                return employeeWorkAddress
              }

              const { employeeWorkAddress } = await createMutation.mutateAsync({
                request: {
                  employeeId: resolvedEmployeeId,
                  requestBody: {
                    locationUuid,
                    effectiveDate: new RFCDate(effectiveDate),
                  },
                },
              })
              return employeeWorkAddress
            })
            resolve(result ? { mode, data: result } : undefined)
          },
          () => {
            resolve(undefined)
          },
        )()
        .catch(reject)
    })
  }

  const isLoading = isLoadingWorkAddresses || isLoadingLocations

  if (isLoading) {
    return { isLoading: true as const }
  }

  const companyLocations = locationsData?.companyLocationsList ?? []

  return {
    isLoading: false as const,
    isPending: createMutation.isPending || updateMutation.isPending,
    mode,
    data: {
      currentWorkAddress,
      companyLocations,
    },
    onSubmit,
    Fields: WorkAddressFields,
    hookFormInternals: { formMethods },
    fieldsMetadata: {
      locationUuid: {
        entries: companyLocations,
        options: companyLocations.map(location => ({
          label: addressInline(location),
          value: location.uuid,
        })),
      },
    },
    errors: { error, fieldErrors, setError },
  }
}
