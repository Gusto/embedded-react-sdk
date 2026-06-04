import { useMemo } from 'react'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { useWatch } from 'react-hook-form'
import type { z } from 'zod'
import type { FieldMetadata } from '../types'
import type { FieldsMetadataConfig } from './buildFormSchema'

/**
 * Resolves dynamic per-field metadata (e.g. `isRequired` driven by predicate
 * rules) by subscribing only to the form fields the predicates actually read.
 *
 * @remarks
 * The companion schema builder records predicate dependencies via a recording
 * Proxy and exposes them on the config as `predicateDeps`. This hook subscribes
 * to only those fields, so typing into unrelated inputs does not trigger
 * re-renders — preserving react-hook-form's per-field rendering optimization.
 *
 * When no predicates exist (`predicateDeps` is empty), the hook skips
 * subscribing entirely and returns static metadata derived once per render.
 *
 * @typeParam T - Map of field name to Zod validator, mirroring the schema config.
 * @typeParam TFormData - Shape of the form values managed by react-hook-form.
 * @param metadataConfig - Metadata config produced alongside the form schema,
 *   carrying both the resolver function and the predicate dependency list.
 * @param control - react-hook-form `control` returned by `useForm`.
 * @returns A map from field name to {@link FieldMetadata}, recomputed whenever
 *   a watched dependency changes.
 * @public
 */
export function useDeriveFieldsMetadata<
  T extends Record<string, z.ZodType>,
  TFormData extends FieldValues = FieldValues,
>(
  metadataConfig: FieldsMetadataConfig<T>,
  control: Control<TFormData>,
): Record<keyof T, FieldMetadata> {
  const { predicateDeps } = metadataConfig
  const hasDeps = predicateDeps.length > 0

  const watchedValues = useWatch({
    control,
    name: hasDeps ? (predicateDeps as FieldPath<TFormData>[]) : ([] as never[]),
    disabled: !hasDeps,
  })

  return useMemo(() => {
    if (!hasDeps) {
      return metadataConfig.getFieldsMetadata()
    }

    const data: Record<string, unknown> = {}
    for (let i = 0; i < predicateDeps.length; i++) {
      data[predicateDeps[i]!] = (watchedValues as unknown[])[i]
    }
    return metadataConfig.getFieldsMetadata(data)
  }, [metadataConfig, hasDeps, predicateDeps, watchedValues])
}
