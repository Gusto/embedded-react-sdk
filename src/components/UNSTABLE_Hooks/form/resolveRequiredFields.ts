export type RequiredFieldsInput<T> = T[] | { create?: T[]; update?: T[] }

export function resolveRequiredFields<T>(
  requiredFields: RequiredFieldsInput<T> | undefined,
  mode: 'create' | 'update',
): T[] {
  if (!requiredFields) return []
  if (Array.isArray(requiredFields)) return requiredFields
  return (mode === 'create' ? requiredFields.create : requiredFields.update) ?? []
}
