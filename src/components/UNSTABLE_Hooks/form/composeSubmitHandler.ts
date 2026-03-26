import type { SyntheticEvent } from 'react'

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
}

/**
 * Coordinates validation and submission across multiple form hooks on the same page.
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
 * @example
 * ```ts
 * const detailsForm = useEmployeeDetailsForm({ employeeId, shouldFocusError: false })
 * const addressForm = useHomeAddressForm({ employeeId, shouldFocusError: false })
 *
 * const handleSubmit = composeSubmitHandler(
 *   [detailsForm, addressForm],
 *   async () => {
 *     await detailsForm.actions.onSubmit()
 *     await addressForm.actions.onSubmit()
 *   },
 * )
 *
 * return <form onSubmit={handleSubmit}>...</form>
 * ```
 */
export function composeSubmitHandler(
  forms: ComposableFormHookResult[],
  onAllValid: () => Promise<void>,
): (e: SyntheticEvent) => Promise<void> {
  return async (e: SyntheticEvent) => {
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
}
