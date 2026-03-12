import { useEffect, useRef, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { EmployeeAddress } from '@gusto/embedded-api/models/components/employeeaddress'
import { useEmployeeAddressesGet } from '@gusto/embedded-api/react-query/employeeAddressesGet'
import { useEmployeeAddressesCreateMutation } from '@gusto/embedded-api/react-query/employeeAddressesCreate'
import { useEmployeeAddressesUpdateMutation } from '@gusto/embedded-api/react-query/employeeAddressesUpdate'
import {
  useQueryErrorHandler,
  type HookFormInternals,
  type HookLoadingResult,
  type HookErrors,
  type HookSubmitResult,
} from '../../helpers'
import { generateHomeAddressSchema, type HomeAddressFormData } from './schema'
import type { HomeAddressFieldComponents } from './HomeAddressFields'
import { HomeAddressFields } from './homeAddressFieldMap'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'

const getActiveHomeAddress = (homeAddresses?: EmployeeAddress[]) => {
  if (!homeAddresses || homeAddresses.length === 0) return undefined
  return homeAddresses.find(address => address.active) ?? homeAddresses[0]
}

interface UseHomeAddressParams {
  employeeId?: string
}

export interface HomeAddressFormReady {
  isLoading: false
  isPending: boolean
  mode: 'create' | 'update'
  onSubmit: (submittedEmployeeId?: string) => Promise<HookSubmitResult<EmployeeAddress> | undefined>
  Fields: HomeAddressFieldComponents
  hookFormInternals: HookFormInternals<HomeAddressFormData>
  errors: HookErrors
}

export type UseHomeAddressFormResult = HookLoadingResult | HomeAddressFormReady

export function useHomeAddressForm({ employeeId }: UseHomeAddressParams): UseHomeAddressFormResult {
  const {
    data: addressData,
    isLoading,
    error: queryError,
  } = useEmployeeAddressesGet({ employeeId: employeeId! }, { enabled: !!employeeId })

  const { baseSubmitHandler, error, fieldErrors, setError } = useBaseSubmit()

  useQueryErrorHandler(queryError, setError)

  const schema = useMemo(() => generateHomeAddressSchema(), [])

  const currentAddress = getActiveHomeAddress(addressData?.employeeAddressList)
  const mode = currentAddress ? 'update' : 'create'

  const formMethods = useForm<HomeAddressFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      street1: '',
      street2: '',
      city: '',
      state: undefined,
      zip: '',
      courtesyWithholding: false,
    },
  })

  const hasInitializedForm = useRef(false)
  useEffect(() => {
    if (currentAddress && !hasInitializedForm.current) {
      hasInitializedForm.current = true
      formMethods.reset({
        street1: currentAddress.street1 ?? '',
        street2: currentAddress.street2 ?? '',
        city: currentAddress.city ?? '',
        state: currentAddress.state as HomeAddressFormData['state'],
        zip: currentAddress.zip ?? '',
        courtesyWithholding: currentAddress.courtesyWithholding ?? false,
      })
    }
  }, [currentAddress, formMethods.reset])

  const createMutation = useEmployeeAddressesCreateMutation()
  const updateMutation = useEmployeeAddressesUpdateMutation()

  const onSubmit = async (
    submittedEmployeeId?: string,
  ): Promise<HookSubmitResult<EmployeeAddress> | undefined> => {
    const resolvedEmployeeId = submittedEmployeeId ?? employeeId
    if (!resolvedEmployeeId) {
      throw new Error('employeeId is required for home address submission')
    }

    return new Promise<HookSubmitResult<EmployeeAddress> | undefined>((resolve, reject) => {
      formMethods
        .handleSubmit(
          async (data: HomeAddressFormData) => {
            const result = await baseSubmitHandler(data, async payload => {
              const { street1, street2, city, state, zip, courtesyWithholding } = payload

              if (currentAddress) {
                const { employeeAddress } = await updateMutation.mutateAsync({
                  request: {
                    homeAddressUuid: currentAddress.uuid,
                    requestBody: {
                      version: currentAddress.version,
                      street1,
                      street2,
                      city,
                      state,
                      zip,
                      courtesyWithholding,
                    },
                  },
                })
                return employeeAddress
              }

              const { employeeAddress } = await createMutation.mutateAsync({
                request: {
                  employeeId: resolvedEmployeeId,
                  requestBody: { street1, street2, city, state, zip, courtesyWithholding },
                },
              })
              return employeeAddress
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

  if (isLoading) {
    return { isLoading: true as const }
  }

  return {
    isLoading: false as const,
    isPending: createMutation.isPending || updateMutation.isPending,
    mode,
    onSubmit,
    Fields: HomeAddressFields,
    hookFormInternals: { formMethods },
    errors: { error, fieldErrors, setError },
  }
}
