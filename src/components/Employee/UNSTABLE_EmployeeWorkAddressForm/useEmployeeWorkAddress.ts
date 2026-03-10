import { useLocationsGetSuspense } from '@gusto/embedded-api/react-query/locationsGet'
import type { EmployeeWorkAddress } from '@gusto/embedded-api/models/components/employeeworkaddress'
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
import { deriveFieldsFromSchema } from '@/helpers/deriveFieldsFromSchema'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'

interface UseEmployeeWorkAddressParams {
  companyId: string
  workAddresses?: EmployeeWorkAddress[]
  optionalFieldsToRequire?: OptionalWorkAddressField[]
}

export function useEmployeeWorkAddress({
  companyId,
  workAddresses,
  optionalFieldsToRequire = [],
}: UseEmployeeWorkAddressParams) {
  const { data: locationsData } = useLocationsGetSuspense({ companyId })
  assertResponseData(locationsData.companyLocationsList, 'company locations')
  const companyLocations = locationsData.companyLocationsList

  const { baseSubmitHandler, error, fieldErrors, setError } = useBaseSubmit()

  const currentWorkAddress = workAddresses?.find(address => address.active)

  const schema = generateWorkAddressSchema({ optionalFieldsToRequire })
  const fields = deriveFieldsFromSchema(schema)

  const defaultValues = {
    locationUuid: currentWorkAddress?.locationUuid ?? '',
    effectiveDate: '',
  }

  const createMutation = useEmployeeAddressesCreateWorkAddressMutation()
  const updateMutation = useEmployeeAddressesUpdateWorkAddressMutation()

  const isPending = createMutation.isPending || updateMutation.isPending

  const onSubmit = async (data: WorkAddressFormData, employeeId: string) => {
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
        return { data: employeeWorkAddress, mode: 'update' as const }
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
      return { data: employeeWorkAddress, mode: 'create' as const }
    })
  }

  return {
    data: { companyLocations, currentWorkAddress },
    schema,
    fields,
    defaultValues,
    onSubmit,
    isPending,
    errors: { error, fieldErrors, setError },
    validationMessageCodes: workAddressErrorCodes,
  }
}
