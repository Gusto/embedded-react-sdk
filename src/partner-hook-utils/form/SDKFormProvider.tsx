import { type ReactNode, useEffect, useRef } from 'react'
import type { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form'
import { FormProvider } from 'react-hook-form'
import type { FieldMetadata, FieldMetadataWithOptions, HookFormInternals } from '../types'
import { FormFieldsMetadataProvider } from './FormFieldsMetadataProvider'
import { FieldElementRegistryProvider } from '@/components/Common/Fields/hooks/FieldElementRegistryProvider'
import type { FieldElementRegistry } from '@/components/Common/Fields/hooks/fieldElementRegistry'
import { normalizeErrorKeyForForm } from '@/helpers/formattedStrings'
import type { SDKError, SDKFieldError } from '@/types/sdkError'

interface ApplicableFieldError {
  /** Field name normalized to the form-side dotted path (e.g. `homeAddress.street1`). */
  name: string
  message: string
}

/**
 * Produces a referentially-stable list of API field errors that apply to this
 * form — normalized to form-side keys and filtered to known fields.
 *
 * The array reference only changes when the error content changes. `fieldErrors`
 * is a fresh array on every render (`collectErrors` + `flatMap`), so keying an
 * effect on it directly would re-run every render and re-apply an error the user
 * just cleared. Following React's guidance to depend on a primitive rather than a
 * freshly-created object, we derive a content key and swap the returned reference
 * only when that key changes. The list is sorted first so the key is order-agnostic,
 * and `JSON.stringify` avoids delimiter collisions.
 */
function useApplicableFieldErrors(
  fieldErrors: SDKFieldError[],
  fieldsMetadata: Record<string, unknown>,
): ApplicableFieldError[] {
  const knownFields = new Set(Object.keys(fieldsMetadata))
  const applicable = fieldErrors
    .filter(
      fieldError =>
        fieldError.message && knownFields.has(normalizeErrorKeyForForm(fieldError.field)),
    )
    .map(fieldError => ({
      name: normalizeErrorKeyForForm(fieldError.field),
      message: fieldError.message,
    }))
    .sort((a, b) =>
      a.name === b.name ? a.message.localeCompare(b.message) : a.name.localeCompare(b.name),
    )

  const key = JSON.stringify(applicable)
  const stableRef = useRef<{ key: string; value: ApplicableFieldError[] }>({
    key,
    value: applicable,
  })
  if (stableRef.current.key !== key) {
    stableRef.current = { key, value: applicable }
  }
  return stableRef.current.value
}

/**
 * Applies API-derived field errors to their fields and clears each one as soon
 * as the user changes that field's value.
 *
 * In the absence of client-side validation for these fields, a server field
 * error would otherwise persist until the next submit. A single `watch(callback)`
 * subscription reacts to the changed field by name — no value comparison, no
 * re-renders — clearing the error so a fresh submit can surface a fresh result.
 * The top-level error alert is intentionally left untouched.
 */
function useSyncFieldErrors<TFormData extends FieldValues>(
  applicableFieldErrors: ApplicableFieldError[],
  formMethods: UseFormReturn<TFormData>,
) {
  const { setError, clearErrors, watch } = formMethods

  useEffect(() => {
    if (!applicableFieldErrors.length) return

    const apiErrorFields = new Set<string>()
    for (const { name, message } of applicableFieldErrors) {
      setError(name as FieldPath<TFormData>, { type: 'custom', message })
      apiErrorFields.add(name)
    }

    const subscription = watch((_values, { name }) => {
      if (name && apiErrorFields.has(name)) {
        clearErrors(name)
        apiErrorFields.delete(name)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [applicableFieldErrors, watch, setError, clearErrors])
}

/**
 * Props for {@link SDKFormProvider}.
 *
 * @typeParam TFormData - Shape of the form values managed by the wrapped form hook.
 * @typeParam TFieldsMetadata - The form hook's field-metadata map.
 * @public
 */
export interface SDKFormProviderProps<
  TFormData extends FieldValues = FieldValues,
  TFieldsMetadata extends {
    [K in keyof TFieldsMetadata]: FieldMetadata | FieldMetadataWithOptions
  } = Record<string, FieldMetadata | FieldMetadataWithOptions>,
> {
  /** The form hook result whose fields, metadata, and errors are shared with descendant field components. */
  formHookResult: {
    errorHandling: { errors: SDKError[] }
    form: {
      fieldsMetadata: TFieldsMetadata
      hookFormInternals: HookFormInternals<TFormData>
    }
  }
  /** Field components (or any content) that consume the provided form context. */
  children: ReactNode
}

/**
 * Provides form context to field components so they can read metadata, control,
 * and error state without an explicit `formHookResult` prop on each field.
 * Server-side field errors are automatically synced onto their corresponding fields.
 *
 * @public
 * @group Providers
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
  const applicableFieldErrors = useApplicableFieldErrors(allFieldErrors, form.fieldsMetadata)
  useSyncFieldErrors(applicableFieldErrors, form.hookFormInternals.formMethods)

  return (
    <FormFieldsMetadataProvider metadata={form.fieldsMetadata} errors={errorHandling.errors}>
      <FieldElementRegistryProvider
        registry={form.hookFormInternals._fieldElementRegistry as FieldElementRegistry | undefined}
      >
        <FormProvider {...form.hookFormInternals.formMethods}>{children}</FormProvider>
      </FieldElementRegistryProvider>
    </FormFieldsMetadataProvider>
  )
}
