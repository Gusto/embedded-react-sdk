import type { FieldValues, UseFormReturn } from 'react-hook-form'
import type { ZodTypeAny } from 'zod'

/**
 * Creates a typed getter that returns the current form values parsed through
 * the Zod schema. The result matches what `handleSubmit` would provide to its
 * valid callback — all preprocessing transforms (e.g. string→boolean coercion)
 * are applied.
 *
 * Returns `undefined` when the current form state does not satisfy the schema
 * (e.g. required fields are empty, cross-field rules fail). This is safe to call
 * at any time — it never throws.
 *
 * **Side effects:** None. `getValues()` is a synchronous read from react-hook-form's
 * internal store — it does not trigger re-renders, mutate form state, or update
 * validation errors. `safeParse()` is a pure validation/transform that creates
 * a new object without mutating the input.
 */
export function createGetFormSubmissionValues<TFormData extends FieldValues, TFormOutputs>(
  formMethods: UseFormReturn<TFormData, unknown, TFormOutputs>,
  schema: ZodTypeAny,
): () => TFormOutputs | undefined {
  return () => {
    const result = schema.safeParse(formMethods.getValues())
    return result.success ? (result.data as TFormOutputs) : undefined
  }
}
