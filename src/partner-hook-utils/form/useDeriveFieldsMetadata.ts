import { useMemo } from 'react'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { useWatch } from 'react-hook-form'
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
 * @typeParam TFormData - The form data interface the metadata config was built for.
 * @typeParam TRhfData - Shape of the form values managed by react-hook-form.
 * @param metadataConfig - Metadata config produced alongside the form schema,
 *   carrying both the resolver function and the predicate dependency list.
 * @param control - react-hook-form `control` returned by `useForm`.
 * @returns A map from field name to {@link FieldMetadata}, recomputed whenever
 *   a watched dependency changes.
 * @internal
 */
export function useDeriveFieldsMetadata<TFormData, TRhfData extends FieldValues = FieldValues>(
  metadataConfig: FieldsMetadataConfig<TFormData>,
  control: Control<TRhfData>,
): Record<keyof TFormData, FieldMetadata> {
  const { predicateDeps } = metadataConfig
  const hasDeps = predicateDeps.length > 0

  const watchedValues = useWatch({
    control,
    name: hasDeps ? (predicateDeps as FieldPath<TRhfData>[]) : ([] as never[]),
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
    return metadataConfig.getFieldsMetadata(data as Partial<TFormData>)
  }, [metadataConfig, hasDeps, predicateDeps, watchedValues])
}
