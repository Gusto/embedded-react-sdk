import { expect } from 'vitest'
import type { FieldMetadata, FieldsMetadata } from '@/partner-hook-utils/types'

/** Asserts a key exists on fieldsMetadata and returns it with a narrowed type (for tests). */
export function fieldsMetadataEntry(meta: FieldsMetadata, key: string): FieldMetadata {
  const entry = meta[key]
  expect(entry).toBeDefined()
  return entry as FieldMetadata
}
