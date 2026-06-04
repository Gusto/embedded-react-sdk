import { type ReactNode, useEffect } from 'react'
import type { FieldPath, FieldValues } from 'react-hook-form'
import { FormProvider } from 'react-hook-form'
import type { FieldMetadata, FieldMetadataWithOptions, HookFormInternals } from '../types'
import { FormFieldsMetadataProvider } from './FormFieldsMetadataProvider'
import { FieldElementRegistryProvider } from '@/components/Common/Fields/hooks/FieldElementRegistryProvider'
import { normalizeErrorKeyForForm } from '@/helpers/formattedStrings'
import type { SDKError, SDKFieldError } from '@/types/sdkError'

function useSyncFieldErrors<
  TFormData extends FieldValues,
  TFieldsMetadata extends {
    [K in keyof TFieldsMetadata]: FieldMetadata | FieldMetadataWithOptions
  },
>(
  fieldErrors: SDKFieldError[],
  form: {
    fieldsMetadata: TFieldsMetadata
    hookFormInternals: HookFormInternals<TFormData>
  },
) {
  const { fieldsMetadata } = form
  const { setError } = form.hookFormInternals.formMethods

  useEffect(() => {
    if (!fieldErrors.length) return
    const knownFields = new Set(Object.keys(fieldsMetadata))
    for (const fieldError of fieldErrors) {
      const normalizedField = normalizeErrorKeyForForm(fieldError.field)
      if (knownFields.has(normalizedField)) {
        setError(normalizedField as FieldPath<TFormData>, {
          type: 'custom',
          message: fieldError.message,
        })
      }
    }
  }, [fieldErrors, setError, fieldsMetadata])
}

interface SDKFormProviderProps<
  TFormData extends FieldValues = FieldValues,
  TFieldsMetadata extends {
    [K in keyof TFieldsMetadata]: FieldMetadata | FieldMetadataWithOptions
  } = Record<string, FieldMetadata | FieldMetadataWithOptions>,
> {
  formHookResult: {
    errorHandling: { errors: SDKError[] }
    form: {
      fieldsMetadata: TFieldsMetadata
      hookFormInternals: HookFormInternals<TFormData>
    }
  }
  children: ReactNode
}

/**
 * Wraps form fields with the React context they need to discover form state,
 * field metadata, and error syncing from a single form hook result.
 *
 * @remarks
 * Fields rendered inside `SDKFormProvider` no longer need an explicit
 * `formHookResult` prop — they read metadata, control, and error state from
 * context instead. Server-side field errors (e.g. 422 responses) are
 * automatically synced onto the corresponding form fields so they surface
 * alongside client-side validation errors.
 *
 * When the same field is also passed `formHookResult` as a prop, the prop wins
 * and the surrounding provider is ignored. Avoid that combination.
 *
 * @typeParam TFormData - The shape of values managed by the underlying form hook.
 * @typeParam TFieldsMetadata - The map of field names to their metadata entries.
 * @param props - The wrapper props, including the `formHookResult` from a form hook.
 * @returns A React element that scopes form context to its children.
 * @public
 */
export function SDKFormProvider<
  TFormData extends FieldValues = FieldValues,
  TFieldsMetadata extends {
    [K in keyof TFieldsMetadata]: FieldMetadata | FieldMetadataWithOptions
  } = Record<string, FieldMetadata | FieldMetadataWithOptions>,
>({ formHookResult, children }: SDKFormProviderProps<TFormData, TFieldsMetadata>) {
  const { errorHandling, form } = formHookResult
  const allFieldErrors = errorHandling.errors.flatMap(e => e.fieldErrors)
  useSyncFieldErrors(allFieldErrors, form)

  return (
    <FormFieldsMetadataProvider metadata={form.fieldsMetadata} errors={errorHandling.errors}>
      <FieldElementRegistryProvider registry={form.hookFormInternals._fieldElementRegistry}>
        <FormProvider {...form.hookFormInternals.formMethods}>{children}</FormProvider>
      </FieldElementRegistryProvider>
    </FormFieldsMetadataProvider>
  )
}
