import type { FieldValues, UseFormReturn } from 'react-hook-form'
import type { HookFormInternals } from '../types'
import { useFieldElementRegistry } from './fieldElementRegistry'

/**
 * Builds the `hookFormInternals` object every SDK form hook returns. Creates a
 * per-form `FieldElementRegistry` (populated by `useField` via context) so
 * `composeSubmitHandler` can resolve the visually first invalid field across
 * multiple composed forms.
 *
 * Call once per `useForm()` inside each form hook and spread/return directly:
 *
 * ```ts
 * const formMethods = useForm<MyForm>({ ... })
 * return {
 *   ...
 *   form: {
 *     ...,
 *     hookFormInternals: useHookFormInternals(formMethods),
 *   },
 * }
 * ```
 */
export function useHookFormInternals<TFormData extends FieldValues>(
  formMethods: UseFormReturn<TFormData>,
): HookFormInternals<TFormData> {
  const fieldElementRegistry = useFieldElementRegistry()
  return {
    formMethods,
    _fieldElementRegistry: fieldElementRegistry,
  }
}
