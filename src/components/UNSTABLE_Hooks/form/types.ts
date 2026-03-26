import type React from 'react'

export interface FieldMetadata {
  name: string
  isRequired?: boolean
  isDisabled?: boolean
  hasRedactedValue?: boolean
}

export interface FieldMetadataWithOptions<TEntry = unknown> extends FieldMetadata {
  options: Array<{ label: string; value: string }>
  entries?: TEntry[]
}

export type FieldsMetadata = { [key: string]: FieldMetadata | FieldMetadataWithOptions }

/** Maps every error code a schema field can produce to a partner-supplied display string. */
export type ValidationMessages<TErrorCode extends string> = Record<TErrorCode, string>

export interface BaseFieldProps {
  label: string
  description?: React.ReactNode
}

/** Strips `name` from a HookField props type for domain-specific field components that bind `name` internally. */
export type HookFieldProps<TProps extends { name: string }> = Omit<TProps, 'name'>
