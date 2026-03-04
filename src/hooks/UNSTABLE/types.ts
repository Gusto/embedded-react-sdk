import type { z } from 'zod'

export interface SelectOption<T = string> {
  value: T
  label: string
}

export interface BaseFieldDescriptor {
  required: boolean
  validations: (ValidationCode | string)[]
}

export interface TextFieldDescriptor extends BaseFieldDescriptor {
  type: 'text'
  mask?: string
  inputMode?: 'text' | 'numeric' | 'tel' | 'email'
}

export interface SelectFieldDescriptor<T = string> extends BaseFieldDescriptor {
  type: 'select'
  options: SelectOption<T>[]
}

export interface DateFieldDescriptor extends BaseFieldDescriptor {
  type: 'date'
}

export interface CheckboxFieldDescriptor extends BaseFieldDescriptor {
  type: 'checkbox'
}

export type FieldDescriptor =
  | TextFieldDescriptor
  | SelectFieldDescriptor
  | DateFieldDescriptor
  | CheckboxFieldDescriptor

export type FieldsConfig<T> = {
  [K in keyof T]-?: FieldDescriptor
}

export enum SubmitOperation {
  Created = 'created',
  Updated = 'updated',
  Deleted = 'deleted',
}

export type SubmitResult<TMap extends Partial<Record<SubmitOperation, unknown>>> = {
  [K in keyof TMap & SubmitOperation]: { operation: K; data: TMap[K] }
}[keyof TMap & SubmitOperation]

export enum ValidationCode {
  Required = 'required',
  MinLength = 'min_length',
  MaxLength = 'max_length',
  EmailInvalidFormat = 'email_invalid_format',
  SsnInvalidFormat = 'ssn_invalid_format',
  ZipInvalidFormat = 'zip_invalid_format',
  PhoneInvalidFormat = 'phone_invalid_format',
  RoutingNumberInvalidFormat = 'routing_number_invalid_format',
  AccountNumberInvalidFormat = 'account_number_invalid_format',
}

export interface HookFieldError {
  field: string
  message: string
}

export interface HookError {
  title: string
  description: string
  fieldErrors: HookFieldError[]
  errors: unknown[]
}

export interface HookReturn<
  TSchema extends z.ZodType,
  TFields,
  TData = unknown,
  TResult = unknown,
> {
  data: TData
  schema: TSchema
  fields: TFields
  defaultValues: z.infer<TSchema>
  onSubmit: (data: z.infer<TSchema>) => Promise<TResult | null>
  isLoading: boolean
  isPending: boolean
  error: HookError | null
  retry: () => void
}
