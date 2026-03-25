export type RequiredFields<T> = T[] | { create?: T[]; update?: T[] }

export function resolveRequiredFields<T>(
  requiredFields: RequiredFields<T> | undefined,
  mode: 'create' | 'update',
): T[] {
  if (!requiredFields) return []
  if (Array.isArray(requiredFields)) return requiredFields
  return (mode === 'create' ? requiredFields.create : requiredFields.update) ?? []
}

export function filterRequiredFields<T>(
  requiredFields: RequiredFields<T> | undefined,
  exclude: T,
): RequiredFields<T> | undefined {
  if (!requiredFields) return requiredFields
  if (Array.isArray(requiredFields)) return requiredFields.filter(f => f !== exclude)
  return {
    ...(requiredFields.create && { create: requiredFields.create.filter(f => f !== exclude) }),
    ...(requiredFields.update && { update: requiredFields.update.filter(f => f !== exclude) }),
  }
}
