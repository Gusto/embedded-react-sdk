import type { EmployeeAddress } from '@gusto/embedded-api/models/components/employeeaddress'
import { useEmployeeAddressesGet } from '@gusto/embedded-api/react-query/employeeAddressesGet'
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
import { useQueryErrorHandler } from '@/hooks/useQueryErrorHandler'

const getActiveHomeAddress = (homeAddresses?: EmployeeAddress[]) => {
  if (!homeAddresses || homeAddresses.length === 0) return undefined
  return homeAddresses.find(address => address.active) ?? homeAddresses[0]
}

interface UseEmployeeHomeAddressParams {
  employeeId?: string
}

export function useEmployeeHomeAddress({ employeeId }: UseEmployeeHomeAddressParams) {
  const {
    data: addressData,
    isLoading,
    error: queryError,
  } = useEmployeeAddressesGet({ employeeId: employeeId! }, { enabled: !!employeeId })

  const { baseSubmitHandler, error, fieldErrors, setError } = useBaseSubmit()

  const schema = generateHomeAddressSchema()
  const fields = deriveFieldsFromSchema(schema)

  useQueryErrorHandler(queryError, setError)

  const currentAddress = getActiveHomeAddress(addressData?.employeeAddressList)
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

  const onSubmit = async (
    data: HomeAddressFormData,
    submittedEmployeeId?: string,
  ): Promise<EmployeeAddress | undefined> => {
    const resolvedEmployeeId = submittedEmployeeId ?? employeeId
    if (!resolvedEmployeeId) {
      throw new Error('employeeId is required for home address submission')
    }

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
          employeeId: resolvedEmployeeId,
          requestBody: { street1, street2, city, state, zip, courtesyWithholding },
        },
      })
      assertResponseData(employeeAddress, 'employee address')
      return employeeAddress
    })
  }

  return {
    schema,
    fields,
    isLoading,
    data: { currentAddress },
    defaultValues,
    onSubmit,
    isPending: createMutation.isPending || updateMutation.isPending,
    errors: { error, fieldErrors, setError },
    validationMessageCodes: homeAddressErrorCodes,
  }
}
