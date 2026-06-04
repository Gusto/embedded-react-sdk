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
 * Provides form context to field components so they can read metadata, control,
 * and error state without an explicit `formHookResult` prop on each field.
 * Server-side field errors are automatically synced onto their corresponding fields.
 *
 * @public
 *
 * @example
 * ```tsx
 * const formHookResult = useEmployeeDetailsForm({ employeeId })
 * const { Fields } = formHookResult.form
 *
 * // SDKFormProvider supplies context only — wire up submission and render the
 * // <form> element yourself.
 * const handleSubmit = () =>
 *   formHookResult.actions.onSubmit({ onEmployeeUpdated: (emp) => { ... } })
 *
 * return (
 *   <SDKFormProvider formHookResult={formHookResult}>
 *     <form onSubmit={handleSubmit}>
 *       <Fields.FirstName label="First name" />
 *       <Fields.LastName label="Last name" />
 *       <button type="submit">Save</button>
 *     </form>
 *   </SDKFormProvider>
 * )
 * ```
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
