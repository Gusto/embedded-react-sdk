import { useLocationsGetSuspense } from '@gusto/embedded-api/react-query/locationsGet'
import type { EmployeeWorkAddress } from '@gusto/embedded-api/models/components/employeeworkaddress'
import { useEmployeeAddressesCreateWorkAddressMutation } from '@gusto/embedded-api/react-query/employeeAddressesCreateWorkAddress'
import { useEmployeeAddressesUpdateWorkAddressMutation } from '@gusto/embedded-api/react-query/employeeAddressesUpdateWorkAddress'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import type { z } from 'zod'
import {
  generateWorkAddressSchema,
  workAddressErrorCodes,
  type OptionalWorkAddressField,
} from './schema'
import { deriveFieldsFromSchema, fieldTypes } from '@/helpers/deriveFieldsFromSchema'

interface UseEmployeeWorkAddressParams {
  companyId: string
  workAddresses?: EmployeeWorkAddress[]
  requiredFields?: OptionalWorkAddressField[]
}

export function useEmployeeWorkAddress({
  companyId,
  workAddresses,
  requiredFields = [],
}: UseEmployeeWorkAddressParams) {
  const { data } = useLocationsGetSuspense({ companyId })
  const companyLocations = data.companyLocationsList!
  const required = new Set(requiredFields)

  const currentWorkAddress = workAddresses?.find(address => address.active)

  const schema = generateWorkAddressSchema({ requiredFields })
  const baseFields = deriveFieldsFromSchema(schema)

  const fields = {
    ...baseFields,
    effectiveDate: {
      ...baseFields.effectiveDate,
      isRequired: required.has('effectiveDate'),
      type: fieldTypes.date as typeof fieldTypes.date,
    },
  }

  const defaultValues = {
    locationUuid: currentWorkAddress?.locationUuid ?? '',
    effectiveDate: '',
  }

  const createMutation = useEmployeeAddressesCreateWorkAddressMutation()
  const updateMutation = useEmployeeAddressesUpdateWorkAddressMutation()

  const isPending = createMutation.isPending || updateMutation.isPending

  const onSubmit = async (data: z.infer<typeof schema>, employeeId: string) => {
    const { locationUuid, effectiveDate } = data as { locationUuid: string; effectiveDate?: string }

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
      return { data: employeeWorkAddress!, mode: 'update' as const }
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
    return { data: employeeWorkAddress!, mode: 'create' as const }
  }

  return {
    schema,
    fields,
    defaultValues,
    onSubmit,
    isPending,
    errorCodes: workAddressErrorCodes,
    companyLocations,
  }
}
