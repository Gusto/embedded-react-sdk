import type { EntityErrorObject } from '@gusto/embedded-api/models/components/entityerrorobject'
import { snakeCaseToCamelCase } from './formattedStrings'

/**
 * Renders each error in the list that carries a `message` as a `<span>` keyed by `errorKey`.
 *
 * @param errorList - Flat list of entity errors returned by the API.
 * @returns React nodes for messaged entries; entries without a message yield `null`.
 * @internal
 */
export const renderErrorList = (errorList: Array<EntityErrorObject>): React.ReactNode[] => {
  return errorList.map(errorFromList => {
    if (errorFromList.message) {
      return <span key={errorFromList.errorKey}>{errorFromList.message}</span>
    }
    return null
  })
}
/**
 * Recursively flattens a nested API error tree into a list keyed for form-field display.
 *
 * @remarks Builds dot-separated `errorKey` paths from nested errors and converts each segment
 * from snake_case to camelCase so the resulting keys match react-hook-form field names.
 * `metadata.key` is used as the path segment for nested errors when present; `metadata.state`
 * is a special case for state-tax validation errors, falling back to the node's own `errorKey`.
 *
 * @param error - The root entity error to flatten.
 * @param parentKey - Accumulated dot-path prefix used during recursion. Omit at the top level.
 * @returns A flat list of `{ errorKey, message, category }` entries ready to bind to form fields.
 * @internal
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
  if (error.message) {
    return [
      {
        errorKey: snakeCaseToCamelCase(keyPrefix + error.errorKey),
        message: error.message,
        category: error.category,
      },
    ]
  }
  return []
}
