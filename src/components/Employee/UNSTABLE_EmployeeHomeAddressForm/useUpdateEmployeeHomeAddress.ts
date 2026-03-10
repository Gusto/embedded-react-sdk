import type { EmployeeAddress } from '@gusto/embedded-api/models/components/employeeaddress'
import { useEmployeeAddressesGetSuspense } from '@gusto/embedded-api/react-query/employeeAddressesGet'
import { useEmployeeAddressesCreateMutation } from '@gusto/embedded-api/react-query/employeeAddressesCreate'
import { useEmployeeAddressesUpdateMutation } from '@gusto/embedded-api/react-query/employeeAddressesUpdate'
import type { HomeAddressFormData, StateAbbr } from './schema'
import { useHomeAddressBase } from './useHomeAddressBase'
import { assertResponseData } from '@/helpers/assertResponseData'

interface UseUpdateEmployeeHomeAddressParams {
  employeeId: string
}

const getActiveHomeAddress = (homeAddresses?: EmployeeAddress[]) => {
  if (!homeAddresses || homeAddresses.length === 0) return undefined
  return homeAddresses.find(address => address.active) ?? homeAddresses[0]
}

export function useUpdateEmployeeHomeAddress({ employeeId }: UseUpdateEmployeeHomeAddressParams) {
  const {
    data: { employeeAddressList },
  } = useEmployeeAddressesGetSuspense({ employeeId })

  const currentAddress = getActiveHomeAddress(employeeAddressList)
  const { baseSubmitHandler, ...shared } = useHomeAddressBase()
  const createMutation = useEmployeeAddressesCreateMutation()
  const updateMutation = useEmployeeAddressesUpdateMutation()

  const defaultValues = {
    street1: currentAddress?.street1 ?? '',
    street2: currentAddress?.street2 ?? '',
    city: currentAddress?.city ?? '',
    state: currentAddress?.state as StateAbbr | undefined,
    zip: currentAddress?.zip ?? '',
    courtesyWithholding: currentAddress?.courtesyWithholding ?? false,
  }

  const onSubmit = async (data: HomeAddressFormData): Promise<EmployeeAddress | undefined> => {
    return baseSubmitHandler(data, async payload => {
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
        assertResponseData(employeeAddress, 'employee address')
        return employeeAddress
      }

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
    data: { currentAddress },
    onSubmit,
    isPending: createMutation.isPending || updateMutation.isPending,
  }
}
