import { useMemo } from 'react'
import type { EmployeeWorkAddress } from '@gusto/embedded-api/models/components/employeeworkaddress'
import { useLocationsGet } from '@gusto/embedded-api/react-query/locationsGet'
import { useEmployeeAddressesGetWorkAddresses } from '@gusto/embedded-api/react-query/employeeAddressesGetWorkAddresses'
import { useEmployeeAddressesCreateWorkAddressMutation } from '@gusto/embedded-api/react-query/employeeAddressesCreateWorkAddress'
import { useEmployeeAddressesUpdateWorkAddressMutation } from '@gusto/embedded-api/react-query/employeeAddressesUpdateWorkAddress'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import {
  generateWorkAddressSchema,
  workAddressErrorCodes,
  type OptionalWorkAddressField,
  type WorkAddressFormData,
} from './schema'
import { assertResponseData } from '@/helpers/assertResponseData'
import { deriveFieldsFromSchema, type HookLoadingResult } from '@/helpers/deriveFieldsFromSchema'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { useQueryErrorHandler } from '@/hooks/useQueryErrorHandler'

interface UseEmployeeWorkAddressParams {
  companyId: string
  employeeId?: string
  optionalFieldsToRequire?: OptionalWorkAddressField[]
}

export function useEmployeeWorkAddress({
  companyId,
  employeeId,
  optionalFieldsToRequire = [],
}: UseEmployeeWorkAddressParams) {
  const {
    data: locationsData,
    isLoading: isLocationsLoading,
    error: locationsError,
  } = useLocationsGet({ companyId })

  const {
    data: workAddressData,
    isLoading: isWorkAddressLoading,
    error: workAddressError,
  } = useEmployeeAddressesGetWorkAddresses({ employeeId: employeeId! }, { enabled: !!employeeId })

  const { baseSubmitHandler, error, fieldErrors, setError } = useBaseSubmit()

  const queryErrors = useMemo(
    () => [locationsError, workAddressError],
    [locationsError, workAddressError],
  )
  useQueryErrorHandler(queryErrors, setError)

  const companyLocations = locationsData?.companyLocationsList ?? []
  const currentWorkAddress = workAddressData?.employeeWorkAddressesList?.find(
    address => address.active,
  )

  const schema = generateWorkAddressSchema({ optionalFieldsToRequire })
  const fields = deriveFieldsFromSchema(schema)

  const createMutation = useEmployeeAddressesCreateWorkAddressMutation()
  const updateMutation = useEmployeeAddressesUpdateWorkAddressMutation()

  const isLoading = isLocationsLoading || (!!employeeId && isWorkAddressLoading)

  const defaultValues = {
    locationUuid: currentWorkAddress?.locationUuid ?? '',
    effectiveDate: '',
  }

  const onSubmit = async (
    data: WorkAddressFormData,
    submittedEmployeeId?: string,
  ): Promise<EmployeeWorkAddress | undefined> => {
    const resolvedEmployeeId = submittedEmployeeId ?? employeeId
    if (!resolvedEmployeeId) {
      throw new Error('employeeId is required for work address submission')
    }

    return baseSubmitHandler(data, async payload => {
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
        assertResponseData(employeeWorkAddress, 'employee work address')
        return employeeWorkAddress
      }

      const { employeeWorkAddress } = await createMutation.mutateAsync({
        request: {
          employeeId: resolvedEmployeeId,
          requestBody: {
            locationUuid,
            effectiveDate: effectiveDate ? new RFCDate(effectiveDate) : undefined,
          },
        },
      })
      assertResponseData(employeeWorkAddress, 'employee work address')
      return employeeWorkAddress
    })
  }

  if (isLoading) {
    return { isLoading: true as const }
  }

  return {
    isLoading: false as const,
    schema,
    fields,
    data: { companyLocations, currentWorkAddress },
    defaultValues,
    onSubmit,
    isPending: createMutation.isPending || updateMutation.isPending,
    errors: { error, fieldErrors, setError },
    validationMessageCodes: workAddressErrorCodes,
  }
}

export type WorkAddressReady = Exclude<ReturnType<typeof useEmployeeWorkAddress>, HookLoadingResult>
