export function assertResponseData<T>(
  data: T | undefined | null,
  entityName: string,
): asserts data is T {
  if (data == null) {
    throw new Error(`Expected ${entityName} in API response`)
  }
}
