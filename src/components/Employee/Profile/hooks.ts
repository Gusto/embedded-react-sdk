import { useEmployeeAddressesCreateWorkAddressMutation } from '@gusto/embedded-api/react-query/employeeAddressesCreateWorkAddress'
import { invalidateAllEmployeeAddressesGetWorkAddresses } from '@gusto/embedded-api/react-query/employeeAddressesGetWorkAddresses'
import { useEmployeeAddressesUpdateWorkAddressMutation } from '@gusto/embedded-api/react-query/employeeAddressesUpdateWorkAddress'
import { useInvalidateOnSuccess } from '@/hooks/useInvalidateOnSuccess'

export const useCreateEmployeeWorkAddress = () => {
  return useInvalidateOnSuccess({
    invalidators: [invalidateAllEmployeeAddressesGetWorkAddresses],
    mutator: useEmployeeAddressesCreateWorkAddressMutation,
  })
}

export const useUpdateEmployeeWorkAddress = () => {
  return useInvalidateOnSuccess({
    invalidators: [invalidateAllEmployeeAddressesGetWorkAddresses],
    mutator: useEmployeeAddressesUpdateWorkAddressMutation,
  })
}
