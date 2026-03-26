import type { Control, FieldErrors } from 'react-hook-form'
import { useFormContext } from 'react-hook-form'
import type { BaseFormHookReady } from '../types'
import { useFormFieldsMetadataContext } from './FormFieldsMetadataContext'
import { resolveFieldError } from './resolveFieldError'
import type { FieldsMetadata, ValidationMessages } from './types'

interface HookFieldResolution {
  metadata: FieldsMetadata
  control: Control | undefined
  errorMessage: string | undefined
}

/**
 * Resolves all data a HookField needs from either a `formHookResult` prop or
 * the standard context providers (FormProvider + FormFieldsMetadataProvider).
 *
 * When `formHookResult` is provided, metadata/errors/control are read from
 * the prop — no context providers required. When absent, falls back to the
 * existing context-based path.
 *
 * This hook always calls context hooks unconditionally (they safely return null
 * outside their providers), so React's rules of hooks are satisfied regardless
 * of which path is active.
 */
export function useHookFieldResolution<TErrorCode extends string>(
  name: string,
  formHookResult: BaseFormHookReady | undefined,
  validationMessages?: ValidationMessages<TErrorCode>,
): HookFieldResolution {
  // useFormContext returns null outside FormProvider in RHF v7.72
  const formContext = useFormContext() as ReturnType<typeof useFormContext> | null
  const metadataContext = useFormFieldsMetadataContext()

  const metadata = formHookResult?.form.fieldsMetadata ?? metadataContext?.metadata ?? {}

  const control = formHookResult?.form.hookFormInternals.formMethods.control

  const formErrors: FieldErrors = formHookResult
    ? formHookResult.form.hookFormInternals.formMethods.formState.errors
    : (formContext?.formState.errors ?? {})

  const sdkErrors = formHookResult
    ? formHookResult.errorHandling.errors
    : (metadataContext?.errors ?? [])

  const errorMessage = resolveFieldError(name, formErrors, sdkErrors, validationMessages)

  return { metadata, control, errorMessage }
}
