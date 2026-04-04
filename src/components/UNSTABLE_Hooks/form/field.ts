import type { z } from 'zod'

export type FormMode = 'create' | 'update'

export type RequiredConfig =
  | 'create'
  | 'update'
  | 'always'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | ((data: any, mode: FormMode) => boolean)

export interface FieldDefWithRequired<
  TSchema extends z.ZodType = z.ZodType,
  TErrorCode extends string = string,
> {
  schema: TSchema
  required: RequiredConfig
  errorCode?: TErrorCode
}

export interface FieldDefStatic<TSchema extends z.ZodType = z.ZodType> {
  schema: TSchema
  required?: undefined
  errorCode?: undefined
}

export type FieldDef<TSchema extends z.ZodType = z.ZodType, TErrorCode extends string = string> =
  | FieldDefWithRequired<TSchema, TErrorCode>
  | FieldDefStatic<TSchema>

export type FieldDefs = Record<string, FieldDef>

export type FieldConfig<TSchemas extends Record<string, z.ZodType>> = {
  [K in keyof TSchemas]: FieldDef<TSchemas[K]>
}

export function field<TSchema extends z.ZodType>(schema: TSchema): FieldDefStatic<TSchema>

export function field<TSchema extends z.ZodType, TErrorCode extends string>(
  schema: TSchema,
  options: {
    required: RequiredConfig
    errorCode?: TErrorCode
  },
): FieldDefWithRequired<TSchema, TErrorCode>

export function field<TSchema extends z.ZodType>(
  schema: TSchema,
  options?: {
    required?: RequiredConfig
    errorCode?: string
  },
): FieldDef<TSchema> {
  if (!options || options.required === undefined) {
    return { schema }
  }
  return {
    schema,
    required: options.required,
    errorCode: options.errorCode,
  }
}

export type ConfigurableFieldName<T extends FieldDefs> = {
  [K in keyof T]: T[K] extends { required: RequiredConfig } ? K : never
}[keyof T] &
  string

export type InferFormData<T extends FieldDefs> = {
  [K in keyof T]: T[K] extends { schema: infer S extends z.ZodType } ? z.infer<S> : never
}

export type InferErrorCode<T extends FieldDefs> = {
  [K in keyof T]: T[K] extends FieldDefWithRequired<z.ZodType, infer E> ? E : never
}[keyof T] extends infer U
  ? U extends string
    ? U
    : never
  : never

export function isFieldConfigurable(def: FieldDef): def is FieldDefWithRequired {
  return def.required !== undefined
}

export function isStaticRequired(
  required: RequiredConfig,
): required is 'create' | 'update' | 'always' {
  return typeof required === 'string'
}

export function evaluateRequired(
  required: RequiredConfig,
  mode: FormMode,
  data?: Record<string, unknown>,
): boolean {
  if (required === 'always') return true
  if (required === 'create') return mode === 'create'
  if (required === 'update') return mode === 'update'
  return data ? required(data, mode) : false
}
