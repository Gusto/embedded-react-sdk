import { createContext, useContext, type ReactNode } from 'react'

export type FieldOption = {
  label: string
  value: string
}

export type FieldMetadataEntry<TEntry = unknown> = {
  isRequired?: boolean
  isDisabled?: boolean
  options?: FieldOption[]
  entries?: TEntry[]
}

export type FieldsMetadata<TFormData = Record<string, unknown>> = Partial<
  Record<keyof TFormData & string, FieldMetadataEntry>
>

const EMPTY_METADATA: FieldMetadataEntry = {}

const FormFieldsMetadataContext = createContext<Record<string, FieldMetadataEntry>>({})

interface FormFieldsMetadataProviderProps {
  metadata: Record<string, FieldMetadataEntry>
  children: ReactNode
}

export function FormFieldsMetadataProvider({
  metadata,
  children,
}: FormFieldsMetadataProviderProps) {
  return (
    <FormFieldsMetadataContext.Provider value={metadata}>
      {children}
    </FormFieldsMetadataContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components, @typescript-eslint/no-unnecessary-type-parameters
export function useFieldMetadata<TFormData = Record<string, unknown>, TEntry = unknown>(
  fieldName: keyof TFormData & string,
): FieldMetadataEntry<TEntry> {
  const metadata = useContext(FormFieldsMetadataContext)
  return (metadata[fieldName] ?? EMPTY_METADATA) as FieldMetadataEntry<TEntry>
}
