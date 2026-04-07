import { useMemo } from 'react'
import type { Control, FieldValues } from 'react-hook-form'
import { useWatch } from 'react-hook-form'
import type { z } from 'zod'
import type { BuildFormSchemaResult } from './buildFormSchema'
import type { FieldMetadata } from '@/types/sdkHooks'

export function useDeriveFieldsMetadata<
  T extends Record<string, z.ZodType>,
  TFormData extends FieldValues = FieldValues,
>(
  schemaResult: BuildFormSchemaResult<T>,
  control: Control<TFormData>,
): Record<keyof T, FieldMetadata> {
  const values = useWatch({ control })
  return useMemo(
    () => schemaResult.getFieldsMetadata(values as Record<string, unknown>),
    [schemaResult, values],
  )
}
