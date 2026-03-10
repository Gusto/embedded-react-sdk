import {
  generateEmployeeDetailsSchema,
  employeeDetailsErrorCodes,
  type OptionalEmployeeField,
} from './schema'
import { deriveFieldsFromSchema } from '@/helpers/deriveFieldsFromSchema'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'

interface EmployeeDetailsBaseParams {
  hasSsn?: boolean
  optionalFieldsToRequire?: OptionalEmployeeField[]
}

export function useEmployeeDetailsBase({
  hasSsn,
  optionalFieldsToRequire = [],
}: EmployeeDetailsBaseParams) {
  const { baseSubmitHandler, error, fieldErrors, setError } = useBaseSubmit()

  const schema = generateEmployeeDetailsSchema({
    hasSsn,
    optionalFieldsToRequire,
  })

  const baseFields = deriveFieldsFromSchema(schema)
  const fields = {
    ...baseFields,
    ssn: { ...baseFields.ssn, hasRedactedValue: Boolean(hasSsn) },
  }

  return {
    schema,
    fields,
    baseSubmitHandler,
    errors: { error, fieldErrors, setError },
    validationMessageCodes: employeeDetailsErrorCodes,
  }
}
