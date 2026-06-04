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
 * @remarks
 * Side effects: none. `getValues()` is a synchronous read from react-hook-form's
 * internal store — it does not trigger re-renders, mutate form state, or update
 * validation errors. `safeParse()` is a pure validation/transform that creates
 * a new object without mutating the input.
 *
 * @typeParam TFormData - Shape of the raw form values managed by react-hook-form.
 * @typeParam TFormOutputs - Shape of the parsed/transformed values produced by the Zod schema.
 * @param formMethods - `useForm` return value the getter reads values from.
 * @param schema - Zod schema applied to validate and transform the current values.
 * @returns A zero-arg function returning the parsed values, or `undefined` when
 *   the current form state fails validation.
 * @internal
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
