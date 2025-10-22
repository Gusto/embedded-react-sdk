import type { EntityErrorObject } from '@gusto/embedded-api/models/components/entityerrorobject'
import { snakeCaseToCamelCase } from './formattedStrings'

/**Traverses errorList and finds items with message properties */
export const renderErrorList = (errorList: Array<EntityErrorObject>): React.ReactNode[] => {
  return errorList.map(errorFromList => {
    if (errorFromList.message) {
      return <li key={errorFromList.errorKey}>{errorFromList.message}</li>
    }
    return null
  })
}
/**Recuresively parses error list and constructs an array of objects containing attribute value error messages associated with form fields. Nested errors construct '.' separated keys
 * metadata.state is a special case for state taxes validation errors
 */
export const getFieldErrors = (
  error: EntityErrorObject,
  parentKey?: string,
): Array<EntityErrorObject> => {
  const keyPrefix = parentKey ? parentKey + '.' : ''
  if (error.category === 'invalid_attribute_value' || error.category === 'invalid_operation') {
    return [
      {
        errorKey: snakeCaseToCamelCase(keyPrefix + error.errorKey),
        message: error.message ?? '',
        category: error.category,
      },
    ]
  }
  if (error.category === 'nested_errors' && error.errors !== undefined) {
    //TODO: clean this up once Metadata type is fixed in openapi spec
    let keySuffix = ''
    //@ts-expect-error: Metadata in speakeasy is incorrectly typed
    if (error.metadata?.key && typeof error.metadata.key === 'string') {
      //@ts-expect-error: Metadata in speakeasy is incorrectly typed
      keySuffix = error.metadata.key as string
      //@ts-expect-error: Metadata in speakeasy is incorrectly typed
    } else if (error.metadata?.state && typeof error.metadata.state === 'string') {
      //@ts-expect-error: Metadata in speakeasy is incorrectly typed
      keySuffix = error.metadata.state as string
    } else if (error.errorKey) {
      keySuffix = error.errorKey
    }
    return error.errors.flatMap(err => getFieldErrors(err, keyPrefix + keySuffix))
  }
  return []
}
