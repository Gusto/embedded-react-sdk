import type { Control } from 'react-hook-form'
import { useFormState } from 'react-hook-form'
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
 * Uses `useFormState` to establish a proper RHF subscription for error updates.
 * When `control` is provided (prop path), useFormState subscribes directly via
 * the control object. When absent (context path), it falls back to useFormContext
 * internally. The `name` parameter scopes the subscription to this field.
 */
export function useHookFieldResolution<TErrorCode extends string>(
  name: string,
  formHookResult: BaseFormHookReady | undefined,
  validationMessages?: ValidationMessages<TErrorCode>,
): HookFieldResolution {
  const metadataContext = useFormFieldsMetadataContext()

  const metadata = formHookResult?.form.fieldsMetadata ?? metadataContext?.metadata ?? {}

  const control = formHookResult?.form.hookFormInternals.formMethods.control

  const { errors: formErrors } = useFormState({ control, name })

  const sdkErrors = formHookResult
    ? formHookResult.errorHandling.errors
    : (metadataContext?.errors ?? [])

  const errorMessage = resolveFieldError(name, formErrors, sdkErrors, validationMessages)

  return { metadata, control, errorMessage }
}
