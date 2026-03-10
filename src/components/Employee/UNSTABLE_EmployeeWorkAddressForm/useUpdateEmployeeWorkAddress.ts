import type { EmployeeWorkAddress } from '@gusto/embedded-api/models/components/employeeworkaddress'
import { useEmployeeAddressesGetWorkAddressesSuspense } from '@gusto/embedded-api/react-query/employeeAddressesGetWorkAddresses'
import { useEmployeeAddressesCreateWorkAddressMutation } from '@gusto/embedded-api/react-query/employeeAddressesCreateWorkAddress'
import { useEmployeeAddressesUpdateWorkAddressMutation } from '@gusto/embedded-api/react-query/employeeAddressesUpdateWorkAddress'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import type { OptionalWorkAddressField, WorkAddressFormData } from './schema'
import { useWorkAddressBase } from './useWorkAddressBase'
import { assertResponseData } from '@/helpers/assertResponseData'

interface UseUpdateEmployeeWorkAddressParams {
  companyId: string
  employeeId: string
  optionalFieldsToRequire?: OptionalWorkAddressField[]
}

export function useUpdateEmployeeWorkAddress({
  companyId,
  employeeId,
  optionalFieldsToRequire = [],
}: UseUpdateEmployeeWorkAddressParams) {
  const {
    data: { employeeWorkAddressesList },
  } = useEmployeeAddressesGetWorkAddressesSuspense({ employeeId })

  const currentWorkAddress = employeeWorkAddressesList?.find(address => address.active)
  const { baseSubmitHandler, ...shared } = useWorkAddressBase({
    companyId,
    optionalFieldsToRequire,
  })
  const createMutation = useEmployeeAddressesCreateWorkAddressMutation()
  const updateMutation = useEmployeeAddressesUpdateWorkAddressMutation()

  const defaultValues = {
    locationUuid: currentWorkAddress?.locationUuid ?? '',
    effectiveDate: '',
  }

  const onSubmit = async (data: WorkAddressFormData): Promise<EmployeeWorkAddress | undefined> => {
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
          employeeId,
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

  return {
    ...shared,
    defaultValues,
    data: { companyLocations: shared.data.companyLocations, currentWorkAddress },
    onSubmit,
    isPending: createMutation.isPending || updateMutation.isPending,
  }
}
