import { useLocationsGetSuspense } from '@gusto/embedded-api/react-query/locationsGet'
import {
  generateWorkAddressSchema,
  workAddressErrorCodes,
  type OptionalWorkAddressField,
} from './schema'
import { assertResponseData } from '@/helpers/assertResponseData'
import { deriveFieldsFromSchema } from '@/helpers/deriveFieldsFromSchema'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'

interface WorkAddressBaseParams {
  companyId: string
  optionalFieldsToRequire?: OptionalWorkAddressField[]
}

export function useWorkAddressBase({
  companyId,
  optionalFieldsToRequire = [],
}: WorkAddressBaseParams) {
  const { data: locationsData } = useLocationsGetSuspense({ companyId })
  assertResponseData(locationsData.companyLocationsList, 'company locations')
  const companyLocations = locationsData.companyLocationsList

  const { baseSubmitHandler, error, fieldErrors, setError } = useBaseSubmit()

  const schema = generateWorkAddressSchema({ optionalFieldsToRequire })
  const fields = deriveFieldsFromSchema(schema)

  return {
    schema,
    fields,
    data: { companyLocations },
    baseSubmitHandler,
    errors: { error, fieldErrors, setError },
    validationMessageCodes: workAddressErrorCodes,
  }
}
