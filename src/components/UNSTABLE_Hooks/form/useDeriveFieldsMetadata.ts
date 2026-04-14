import { useMemo } from 'react'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { useWatch } from 'react-hook-form'
import type { z } from 'zod'
import type { FieldsMetadataConfig } from './buildFormSchema'
import type { FieldMetadata } from '@/types/sdkHooks'

/**
 * Resolves dynamic field metadata (e.g. `isRequired` driven by predicate
 * rules) by watching only the form fields that predicates actually read.
 *
 * `buildFormSchema` auto-detects predicate dependencies via a recording
 * Proxy and exposes them as `predicateDeps`. This hook subscribes to only
 * those fields, so typing into unrelated inputs does not trigger re-renders
 * — preserving react-hook-form's per-field optimization.
 *
 * When no predicates exist (`predicateDeps` is empty), the hook skips
 * `useWatch` entirely and returns static metadata.
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
