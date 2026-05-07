import type { SyntheticEvent } from 'react'
import type { FieldValues, UseFormReturn } from 'react-hook-form'
import { composeErrorHandler } from '../composeErrorHandler'
import type { HookErrorHandling, HookFormInternals } from '../types'

/**
 * Minimal shape required for a form hook result to participate in `composeSubmitHandler`.
 * Any hook returning `BaseFormHookReady` satisfies this interface.
 *
 * `formMethods` is declared with method-call syntax (rather than reused from
 * `HookFormInternals`) so TypeScript applies bivariant parameter checking,
 * allowing hooks with specific form data generics to be passed without casts.
 * `_fieldElementRegistry` is reused directly since its type doesn't depend on
 * the form's generic.
 */
interface ComposableFormHookResult {
  form: {
    hookFormInternals: Pick<HookFormInternals, '_fieldElementRegistry'> & {
      formMethods: {
        handleSubmit(
          onValid: () => void,
          onInvalid?: (errors: Record<string, unknown>) => void,
        ): () => Promise<void>
        setFocus(name: string): void
        formState: { errors: Record<string, unknown> }
      }
    }
  }
  errorHandling: HookErrorHandling
}

/**
 * Accepted input for a single slot of `composeSubmitHandler`'s `forms` array.
 *
 * - SDK form hook results (anything matching `ComposableFormHookResult`) are composed directly.
 * - A raw `react-hook-form` `UseFormReturn<T>` is supported for screen-local auxiliary forms
 *   that don't warrant a dedicated SDK hook. Raw forms contribute validation/focus behavior
 *   but no `errorHandling` (fields surface their own inline errors via react-hook-form).
 */
export type ComposeSubmitInput<T extends FieldValues = FieldValues> =
  | ComposableFormHookResult
  | UseFormReturn<T>

interface FormValidationResult {
  input: ComposeSubmitInput
  formMethods: FormMethods
  valid: boolean
  errors: Record<string, unknown>
}

export interface ComposeSubmitHandlerResult {
  handleSubmit: (e: SyntheticEvent) => Promise<void>
  errorHandling: HookErrorHandling
}

type FormMethods = ComposableFormHookResult['form']['hookFormInternals']['formMethods']

function isRawUseForm<T extends FieldValues>(
  input: ComposeSubmitInput<T>,
): input is UseFormReturn<T> {
  return 'handleSubmit' in input && typeof input.handleSubmit === 'function'
}

function extractFormMethods<T extends FieldValues>(input: ComposeSubmitInput<T>): FormMethods {
  if (isRawUseForm(input)) return input as unknown as FormMethods
  return input.form.hookFormInternals.formMethods
}

/**
 * Picks the visually first invalid field across all composed forms using live
 * `getBoundingClientRect()` positions, then focuses its DOM element. Falls back
 * to array-order (first form's first error) when no element can be resolved —
 * raw `UseFormReturn` inputs have no registry, and forms rendered without
 * `SDKFormProvider` or a HookField wrapper won't have their fields registered
 * either, so we let react-hook-form's `setFocus` attempt it instead.
 *
 * Consumes `results` (captured from each form's `onInvalid` callback) rather
 * than reading `formState.errors` — the latter is a proxy that returns `{}`
 * when accessed outside a component subscription.
 */
function focusFirstInvalidAcrossForms(results: FormValidationResult[]): void {
  type Candidate = {
    formMethods: FormMethods
    name: string
    element: HTMLElement
  }
  const candidates: Candidate[] = []
  for (const { input, formMethods, errors } of results) {
    if (isRawUseForm(input)) continue
    const registry = input.form.hookFormInternals._fieldElementRegistry
    if (!registry) continue
    for (const name of Object.keys(errors)) {
      const element = registry.get(name)
      if (element) {
        candidates.push({ formMethods, name, element })
      }
    }
  }

  if (candidates.length > 0) {
    candidates.sort((a, b) => {
      const ar = a.element.getBoundingClientRect()
      const br = b.element.getBoundingClientRect()
      return ar.top - br.top || ar.left - br.left
    })
    const winner = candidates[0]!
    // Focus the DOM element directly. Bypasses react-hook-form's `setFocus`,
    // which depends on `_fields[name]._f.ref` and isn't reliably populated
    // when fields are rendered through libraries like react-aria-components.
    winner.element.focus()
    return
  }

  for (const { formMethods, errors } of results) {
    const firstErrorField = Object.keys(errors)[0]
    if (firstErrorField) {
      formMethods.setFocus(firstErrorField)
      return
    }
  }
}

/**
 * Coordinates validation and submission across multiple form hooks on the same page, and
 * returns aggregated `errorHandling` for those forms so you can drive a single error surface.
 *
 * Validates all forms simultaneously via `handleSubmit()`, then focuses the visually first
 * invalid field across all forms (sorted by `getBoundingClientRect()`). Only calls
 * `onAllValid` when every form passes.
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
export function composeSubmitHandler<TForms extends readonly FieldValues[]>(
  forms: readonly [...{ [K in keyof TForms]: ComposeSubmitInput<TForms[K]> }],
  onAllValid: () => Promise<void>,
): ComposeSubmitHandlerResult {
  const errorSources = forms.filter((form): form is ComposableFormHookResult => !isRawUseForm(form))

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()

    const validationResults = await Promise.all(
      forms.map(
        input =>
          new Promise<FormValidationResult>(resolve => {
            const formMethods = extractFormMethods(input)
            void formMethods.handleSubmit(
              () => {
                resolve({ input, formMethods, valid: true, errors: {} })
              },
              errors => {
                resolve({ input, formMethods, valid: false, errors })
              },
            )()
          }),
      ),
    )

    const allValid = validationResults.every(r => r.valid)

    if (!allValid) {
      focusFirstInvalidAcrossForms(validationResults)
      return
    }

    await onAllValid()
  }

  const errorHandling = composeErrorHandler(errorSources)

  return { handleSubmit, errorHandling }
}
