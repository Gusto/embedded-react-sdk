import type { SyntheticEvent } from 'react'
import type { HookFormInternals } from '../types'

/**
 * Minimal shape required for a form hook result to participate in `composeSubmitHandler`.
 * Any hook returning `BaseFormHookReady` satisfies this interface.
 */
export interface ComposableFormHookResult {
  form: {
    hookFormInternals: HookFormInternals
  }
}

/**
 * Coordinates validation and submission across multiple form hooks on the same page.
 *
 * Validates all forms simultaneously via `trigger()`, then focuses the first invalid
 * field across all forms (in array order). Only calls `onAllValid` when every form passes.
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
      forms.map(form => form.form.hookFormInternals.formMethods.trigger()),
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
