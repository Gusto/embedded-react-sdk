import type { z } from 'zod'
import type { FieldMetadata } from './types'

export function deriveFieldsMetadata<T extends z.ZodObject<z.ZodRawShape>>(
  schema: T,
): Record<keyof z.infer<T>, FieldMetadata> {
  const shape = schema.shape as Record<string, z.ZodType>
  const result: Record<string, FieldMetadata> = {}

  for (const [key, fieldSchema] of Object.entries(shape)) {
    result[key] = {
      name: key,
      isRequired: !fieldSchema.isOptional(),
    }
  }

  return result as Record<keyof z.infer<T>, FieldMetadata>
}
