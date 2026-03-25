import type { FieldValues, UseFormReturn } from 'react-hook-form'
import type { ZodTypeAny } from 'zod'

/**
 * Creates a typed getter that returns the current form values parsed through
 * the Zod schema. The result matches what `handleSubmit` would provide to its
 * valid callback — all preprocessing transforms (e.g. string→boolean coercion)
 * are applied.
 *
 * **When to call:** After validation has succeeded (e.g. inside
 * `composeSubmitHandler`'s `onAllValid`, or after `trigger()` returns `true`).
 * Calling on unvalidated form state will throw a `ZodError` if the data is invalid.
 *
 * **Side effects:** None. `getValues()` is a synchronous read from react-hook-form's
 * internal store — it does not trigger re-renders or mutate form state. `schema.parse()`
 * is a pure validation/transform — it creates a new object without mutating the input.
 * The only exceptional behavior is that `parse` throws `ZodError` when the data
 * does not satisfy the schema.
 */
export function createGetFormSubmissionValues<TFormData extends FieldValues, TFormOutputs>(
  formMethods: UseFormReturn<TFormData, unknown, TFormOutputs>,
  schema: ZodTypeAny,
): () => TFormOutputs {
  return () => schema.parse(formMethods.getValues()) as TFormOutputs
}
