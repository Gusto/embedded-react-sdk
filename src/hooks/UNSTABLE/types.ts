import type { z } from 'zod'

export interface SelectOption<T = string> {
  value: T
  label: string
}

export interface BaseFieldDescriptor {
  isRequired: boolean
  isReadOnly: boolean
  hasRedactedValue: boolean
  validations: readonly (ValidationCode | string)[]
}

interface BaseFieldInput {
  isRequired?: boolean
  isReadOnly?: boolean
  hasRedactedValue?: boolean
  validations: readonly (ValidationCode | string)[]
}

interface TextFieldInput extends BaseFieldInput {
  mask?: string
  inputMode?: 'text' | 'numeric' | 'tel' | 'email'
}

type TextAreaFieldInput = BaseFieldInput

interface SelectFieldInput<T = string> extends BaseFieldInput {
  options: SelectOption<T>[]
}

interface ComboBoxFieldInput<T = string> extends BaseFieldInput {
  options: SelectOption<T>[]
}

interface RadioFieldInput<T = string> extends BaseFieldInput {
  options: SelectOption<T>[]
}

type DateFieldInput = BaseFieldInput

type CheckboxFieldInput = BaseFieldInput

interface CheckboxGroupFieldInput<T = string> extends BaseFieldInput {
  options: SelectOption<T>[]
}

type SwitchFieldInput = BaseFieldInput

interface NumberFieldInput extends BaseFieldInput {
  format?: 'currency' | 'decimal' | 'percent'
}

type FileFieldInput = BaseFieldInput

function buildField<const T extends BaseFieldInput, TType extends string>(config: T, type: TType) {
  const { isRequired = false, isReadOnly = false, hasRedactedValue = false, ...rest } = config
  return {
    ...rest,
    isRequired,
    isReadOnly,
    hasRedactedValue,
    type,
    resolveError(
      code: string | undefined,
      messages: Record<T['validations'][number], string>,
    ): string | undefined {
      if (!code) return undefined
      const messagesByCode: Partial<Record<string, string>> = messages
      return messagesByCode[code]
    },
  }
}

export function textField<const T extends TextFieldInput>(config: T) {
  return buildField(config, 'text')
}

export function textAreaField<const T extends TextAreaFieldInput>(config: T) {
  return buildField(config, 'textarea')
}

export function selectField<const T extends SelectFieldInput>(config: T) {
  return buildField(config, 'select')
}

export function comboBoxField<const T extends ComboBoxFieldInput>(config: T) {
  return buildField(config, 'combobox')
}

export function radioField<const T extends RadioFieldInput>(config: T) {
  return buildField(config, 'radio')
}

export function dateField<const T extends DateFieldInput>(config: T) {
  return buildField(config, 'date')
}

export function checkboxField<const T extends CheckboxFieldInput>(config: T) {
  return buildField(config, 'checkbox')
}

export function checkboxGroupField<const T extends CheckboxGroupFieldInput>(config: T) {
  return buildField(config, 'checkboxGroup')
}

export function switchField<const T extends SwitchFieldInput>(config: T) {
  return buildField(config, 'switch')
}

export function numberField<const T extends NumberFieldInput>(config: T) {
  return buildField(config, 'number')
}

export function fileField<const T extends FileFieldInput>(config: T) {
  return buildField(config, 'file')
}

export type FieldsConfig<T> = {
  [K in keyof T]-?: BaseFieldDescriptor & {
    type: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolveError: (...args: any[]) => string | undefined
  }
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
  MinLength = 'minLength',
  MaxLength = 'maxLength',
  EmailInvalidFormat = 'emailInvalidFormat',
  SsnInvalidFormat = 'ssnInvalidFormat',
  ZipInvalidFormat = 'zipInvalidFormat',
  PhoneInvalidFormat = 'phoneInvalidFormat',
  RoutingNumberInvalidFormat = 'routingNumberInvalidFormat',
  AccountNumberInvalidFormat = 'accountNumberInvalidFormat',
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
  onSubmit: (data: z.infer<TSchema>) => Promise<TResult>
  isPending: boolean
}
