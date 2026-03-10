import type { EmployeeAddress } from '@gusto/embedded-api/models/components/employeeaddress'
import { useEmployeeAddressesCreateMutation } from '@gusto/embedded-api/react-query/employeeAddressesCreate'
import type { HomeAddressFormData } from './schema'
import { useHomeAddressBase } from './useHomeAddressBase'
import { assertResponseData } from '@/helpers/assertResponseData'

export function useCreateEmployeeHomeAddress() {
  const { baseSubmitHandler, ...shared } = useHomeAddressBase()
  const createMutation = useEmployeeAddressesCreateMutation()

  const defaultValues = {
    street1: '',
    street2: '',
    city: '',
    state: undefined,
    zip: '',
    courtesyWithholding: false,
  }

  const onSubmit = async (
    data: HomeAddressFormData,
    employeeId: string,
  ): Promise<EmployeeAddress | undefined> => {
    return baseSubmitHandler(data, async payload => {
      const { street1, street2, city, state, zip, courtesyWithholding } = payload

      const { employeeAddress } = await createMutation.mutateAsync({
        request: {
          employeeId,
          requestBody: { street1, street2, city, state, zip, courtesyWithholding },
        },
      })

      assertResponseData(employeeAddress, 'employee address')
      return employeeAddress
    })
  }

  return {
    ...shared,
    defaultValues,
    onSubmit,
    isPending: createMutation.isPending,
  }
}
