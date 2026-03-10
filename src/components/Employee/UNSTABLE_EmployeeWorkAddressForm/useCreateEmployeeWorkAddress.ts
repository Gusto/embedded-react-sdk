import type { EmployeeWorkAddress } from '@gusto/embedded-api/models/components/employeeworkaddress'
import { useEmployeeAddressesCreateWorkAddressMutation } from '@gusto/embedded-api/react-query/employeeAddressesCreateWorkAddress'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import type { OptionalWorkAddressField, WorkAddressFormData } from './schema'
import { useWorkAddressBase } from './useWorkAddressBase'
import { assertResponseData } from '@/helpers/assertResponseData'

interface UseCreateEmployeeWorkAddressParams {
  companyId: string
  optionalFieldsToRequire?: OptionalWorkAddressField[]
}

export function useCreateEmployeeWorkAddress({
  companyId,
  optionalFieldsToRequire = [],
}: UseCreateEmployeeWorkAddressParams) {
  const { baseSubmitHandler, ...shared } = useWorkAddressBase({
    companyId,
    optionalFieldsToRequire,
  })
  const createMutation = useEmployeeAddressesCreateWorkAddressMutation()

  const defaultValues = {
    locationUuid: '',
    effectiveDate: '',
  }

  const onSubmit = async (
    data: WorkAddressFormData,
    employeeId: string,
  ): Promise<EmployeeWorkAddress | undefined> => {
    return baseSubmitHandler(data, async payload => {
      const { locationUuid, effectiveDate } = payload

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
    onSubmit,
    isPending: createMutation.isPending,
  }
}
