export interface FieldMetadata<TEntry = unknown> {
  name: string
  isRequired?: boolean
  isDisabled?: boolean
  options?: Array<{ label: string; value: string }>
  entries?: TEntry[]
}

export type FieldsMetadata = Record<string, FieldMetadata>
