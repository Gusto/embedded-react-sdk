import { generateHomeAddressSchema, homeAddressErrorCodes } from './schema'
import { deriveFieldsFromSchema } from '@/helpers/deriveFieldsFromSchema'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'

export function useHomeAddressBase() {
  const { baseSubmitHandler, error, fieldErrors, setError } = useBaseSubmit()

  const schema = generateHomeAddressSchema()
  const fields = deriveFieldsFromSchema(schema)

  return {
    schema,
    fields,
    baseSubmitHandler,
    errors: { error, fieldErrors, setError },
    validationMessageCodes: homeAddressErrorCodes,
  }
}
