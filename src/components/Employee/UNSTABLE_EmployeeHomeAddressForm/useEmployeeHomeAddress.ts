import type { EmployeeAddress } from '@gusto/embedded-api/models/components/employeeaddress'
import { useEmployeeAddressesCreateMutation } from '@gusto/embedded-api/react-query/employeeAddressesCreate'
import { useEmployeeAddressesUpdateMutation } from '@gusto/embedded-api/react-query/employeeAddressesUpdate'
import {
  generateHomeAddressSchema,
  homeAddressErrorCodes,
  type HomeAddressFormData,
  type StateAbbr,
} from './schema'
import { assertResponseData } from '@/helpers/assertResponseData'
import { deriveFieldsFromSchema } from '@/helpers/deriveFieldsFromSchema'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'

interface UseEmployeeHomeAddressParams {
  homeAddresses?: EmployeeAddress[]
}

const getActiveHomeAddress = (homeAddresses?: EmployeeAddress[]) => {
  if (!homeAddresses || homeAddresses.length === 0) return undefined
  return homeAddresses.find(address => address.active) ?? homeAddresses[0]
}

export function useEmployeeHomeAddress({ homeAddresses }: UseEmployeeHomeAddressParams = {}) {
  const currentAddress = getActiveHomeAddress(homeAddresses)
  const { baseSubmitHandler, error, fieldErrors, setError } = useBaseSubmit()

  const schema = generateHomeAddressSchema()
  const fields = deriveFieldsFromSchema(schema)

  const defaultValues = {
    street1: currentAddress?.street1 ?? '',
    street2: currentAddress?.street2 ?? '',
    city: currentAddress?.city ?? '',
    state: currentAddress?.state as StateAbbr | undefined,
    zip: currentAddress?.zip ?? '',
    courtesyWithholding: currentAddress?.courtesyWithholding ?? false,
  }

  const createMutation = useEmployeeAddressesCreateMutation()
  const updateMutation = useEmployeeAddressesUpdateMutation()

  const isPending = createMutation.isPending || updateMutation.isPending

  const onSubmit = async (
    data: HomeAddressFormData,
    employeeId: string,
  ): Promise<{ data: EmployeeAddress; mode: 'create' | 'update' } | undefined> => {
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
        return { data: employeeAddress, mode: 'update' as const }
      }

      const { employeeAddress } = await createMutation.mutateAsync({
        request: {
          employeeId,
          requestBody: { street1, street2, city, state, zip, courtesyWithholding },
        },
      })
      assertResponseData(employeeAddress, 'employee address')
      return { data: employeeAddress, mode: 'create' as const }
    })
  }

  return {
    data: { currentAddress },
    schema,
    fields,
    defaultValues,
    onSubmit,
    isPending,
    errors: { error, fieldErrors, setError },
    validationMessageCodes: homeAddressErrorCodes,
  }
}
