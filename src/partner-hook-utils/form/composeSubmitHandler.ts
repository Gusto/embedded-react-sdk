import type { SyntheticEvent } from 'react'
import { composeErrorHandler } from '../composeErrorHandler'
import type { HookErrorHandling } from '../types'

/**
 * Minimal shape required for a form hook result to participate in `composeSubmitHandler`.
 * Any hook returning `BaseFormHookReady` satisfies this interface.
 *
 * Uses method syntax so TypeScript applies bivariant checking on parameter types,
 * allowing hooks with specific form data generics to be passed without casts.
 */
interface ComposableFormHookResult {
  form: {
    hookFormInternals: {
      formMethods: {
        handleSubmit(onValid: () => void, onInvalid?: () => void): () => Promise<void>
        setFocus(name: string): void
        formState: { errors: Record<string, unknown> }
      }
    }
  }
  errorHandling: HookErrorHandling
}

export interface ComposeSubmitHandlerResult {
  handleSubmit: (e: SyntheticEvent) => Promise<void>
  errorHandling: HookErrorHandling
}

/**
 * Coordinates validation and submission across multiple form hooks on the same page, and
 * returns aggregated `errorHandling` for those forms so you can drive a single error surface.
 *
 * Validates all forms simultaneously via `handleSubmit()`, then focuses the first invalid
 * field across all forms (in array order). Only calls `onAllValid` when every form passes.
 *
 * Uses `handleSubmit` rather than `trigger` so that react-hook-form sets
 * `formState.isSubmitted = true`, which enables `reValidateMode` (default: `onChange`).
 * Without this, errors set by manual `trigger()` calls would never clear as the user types.
 *
 * Each hook passed to `forms` should be initialized with `shouldFocusError: false` so that
 * react-hook-form's built-in per-form focus is disabled and `composeSubmitHandler` can manage
 * cross-form focus instead.
 *
 * The returned `errorHandling` is the same shape every SDK hook returns, so the whole result
 * can be passed back into `composeErrorHandler` when you need to add extra
 * `@gusto/embedded-api` queries or screen-level submit state.
 *
 * @example
 * ```ts
 * const detailsForm = useEmployeeDetailsForm({ employeeId, shouldFocusError: false })
 * const addressForm = useHomeAddressForm({ employeeId, shouldFocusError: false })
 *
 * const { handleSubmit, errorHandling } = composeSubmitHandler(
 *   [detailsForm, addressForm],
 *   async () => {
 *     await detailsForm.actions.onSubmit()
 *     await addressForm.actions.onSubmit()
 *   },
 * )
 *
 * // With extra queries or screen-level submit state:
 * // const errorHandling = composeErrorHandler([submitResult, extraQuery], { submitError, setSubmitError })
 *
 * return <form onSubmit={handleSubmit}>...</form>
 * ```
 */
export function composeSubmitHandler(
  forms: ComposableFormHookResult[],
  onAllValid: () => Promise<void>,
): ComposeSubmitHandlerResult {
  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()

    const validationResults = await Promise.all(
      forms.map(
        form =>
          new Promise<boolean>(resolve => {
            void form.form.hookFormInternals.formMethods.handleSubmit(
              () => {
                resolve(true)
              },
              () => {
                resolve(false)
              },
            )()
          }),
      ),
    )

    const allValid = validationResults.every(Boolean)

    if (!allValid) {
      for (const form of forms) {
        const firstErrorField = Object.keys(
          form.form.hookFormInternals.formMethods.formState.errors,
        )[0]
        if (firstErrorField) {
          form.form.hookFormInternals.formMethods.setFocus(firstErrorField)
          return
        }
      }
      return
    }

    await onAllValid()
  }

  const errorHandling = composeErrorHandler(forms)

  return { handleSubmit, errorHandling }
}
