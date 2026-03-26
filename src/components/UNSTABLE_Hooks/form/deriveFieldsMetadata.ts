import { z } from 'zod'
import type { FieldMetadata } from './types'

export function deriveFieldsMetadata<T extends z.ZodObject>(
  schema: T,
): Record<keyof z.infer<T>, FieldMetadata> {
  const jsonSchema = z.toJSONSchema(schema)
  const requiredFields = new Set((jsonSchema as { required?: string[] }).required ?? [])
  const shape = schema.shape as Record<string, z.ZodType>
  const result: Record<string, FieldMetadata> = {}

  for (const key of Object.keys(shape)) {
    result[key] = {
      name: key,
      isRequired: requiredFields.has(key),
    }
  }

  return result as Record<keyof z.infer<T>, FieldMetadata>
}
