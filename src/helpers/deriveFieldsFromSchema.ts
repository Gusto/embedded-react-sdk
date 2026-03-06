import {
  type z,
  type ZodString,
  type ZodEmail,
  type ZodISODate,
  type ZodNumber,
  type ZodBoolean,
  type ZodDate,
  type ZodEnum,
  type ZodArray,
  type ZodFile,
  type ZodOptional,
  type ZodNullable,
  type ZodDefault,
  toJSONSchema,
} from 'zod'

// TODO: Replace with Zod's JSONSchema types once they're exported from the package
interface JSONSchemaProperty {
  type?: string
  format?: string
  enum?: unknown[]
}

// TODO: Replace with Zod's JSONSchema types once they're exported from the package
interface JSONSchemaObject {
  properties?: Record<string, JSONSchemaProperty>
  required?: string[]
}

export const fieldTypes = {
  text: 'text',
  email: 'email',
  number: 'number',
  boolean: 'boolean',
  date: 'date',
  enum: 'enum',
  array: 'array',
  file: 'file',
} as const

export type FieldType = (typeof fieldTypes)[keyof typeof fieldTypes]

type InferFieldType<T> =
  T extends ZodOptional<infer Inner>
    ? InferFieldType<Inner>
    : T extends ZodNullable<infer Inner>
      ? InferFieldType<Inner>
      : T extends ZodDefault<infer Inner>
        ? InferFieldType<Inner>
        : T extends ZodEmail
          ? typeof fieldTypes.email
          : T extends ZodISODate
            ? typeof fieldTypes.date
            : T extends ZodNumber
              ? typeof fieldTypes.number
              : T extends ZodBoolean
                ? typeof fieldTypes.boolean
                : T extends ZodDate
                  ? typeof fieldTypes.date
                  : T extends ZodEnum<infer _E>
                    ? typeof fieldTypes.enum
                    : T extends ZodArray<infer _El>
                      ? typeof fieldTypes.array
                      : T extends ZodFile
                        ? typeof fieldTypes.file
                        : T extends ZodString
                          ? typeof fieldTypes.text
                          : FieldType

type InferEnumValues<T> =
  T extends ZodOptional<infer Inner>
    ? InferEnumValues<Inner>
    : T extends ZodNullable<infer Inner>
      ? InferEnumValues<Inner>
      : T extends ZodDefault<infer Inner>
        ? InferEnumValues<Inner>
        : T extends ZodEnum<infer E>
          ? E[keyof E][]
          : never

type ExtractShape<T> = T extends z.ZodObject<infer S> ? S : never

export interface BaseFieldMetadata<TFieldType extends FieldType> {
  isRequired: boolean
  type: TFieldType
  hasRedactedValue: boolean
}

export type FieldMetadata<TFieldType extends FieldType = FieldType> =
  TFieldType extends typeof fieldTypes.enum
    ? BaseFieldMetadata<TFieldType> & { options: readonly string[] }
    : BaseFieldMetadata<TFieldType>

export type DerivedFields<T extends FormSchema> = {
  [K in keyof ExtractShape<T>]: InferFieldType<ExtractShape<T>[K]> extends typeof fieldTypes.enum
    ? BaseFieldMetadata<typeof fieldTypes.enum> & { options: InferEnumValues<ExtractShape<T>[K]> }
    : FieldMetadata<InferFieldType<ExtractShape<T>[K]>>
}

export type FormSchema = z.ZodObject<z.ZodRawShape>

export interface UseFormHookReturn<TSchema extends FormSchema, TResponse> {
  schema: TSchema
  fields: DerivedFields<TSchema>
  defaultValues: Partial<Record<keyof z.infer<TSchema>, string>>
  onSubmit: (data: z.infer<TSchema>) => Promise<{ data: TResponse; mode: 'create' | 'update' }>
  isPending: boolean
}

function resolveFieldMetadata(
  property: JSONSchemaProperty,
  fieldName: string,
): { type: FieldType; options?: readonly string[] } {
  if (property.enum) {
    return { type: fieldTypes.enum, options: property.enum as string[] }
  }

  if (property.format === 'date') return { type: fieldTypes.date }
  if (property.format === 'email') return { type: fieldTypes.email }
  if (property.format === 'binary') return { type: fieldTypes.file }

  switch (property.type) {
    case 'string':
      return { type: fieldTypes.text }
    case 'number':
    case 'integer':
      return { type: fieldTypes.number }
    case 'boolean':
      return { type: fieldTypes.boolean }
    case 'array':
      return { type: fieldTypes.array }
    default:
      // eslint-disable-next-line no-console -- Intentional dev warning for unsupported schema types
      console.warn(
        `[deriveFieldsFromSchema] Unsupported type "${String(property.type)}" for field "${fieldName}". Defaulting to "text".`,
      )
      return { type: fieldTypes.text }
  }
}

export function deriveFieldsFromSchema<T extends FormSchema>(schema: T): DerivedFields<T> {
  const jsonSchema = toJSONSchema(schema) as JSONSchemaObject
  const properties = jsonSchema.properties ?? {}
  const required = jsonSchema.required ?? []

  return Object.fromEntries(
    Object.entries(properties).map(([name, prop]) => [
      name,
      {
        isRequired: required.includes(name),
        hasRedactedValue: false,
        ...resolveFieldMetadata(prop, name),
      },
    ]),
  ) as DerivedFields<T>
}
