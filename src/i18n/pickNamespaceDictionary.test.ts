import { describe, expect, it } from 'vitest'
import { pickNamespaceDictionary } from './pickNamespaceDictionary'
import type { MultiNamespaceDictionary } from './pickNamespaceDictionary'

type Namespaces = 'Company.Management.Industry' | 'Company.Industry'

describe('pickNamespaceDictionary', () => {
  const dictionary: MultiNamespaceDictionary<Namespaces> = {
    en: {
      'Company.Management.Industry': { card: { title: 'Sector' } },
      'Company.Industry': { submitCta: 'Save' },
    },
  }

  it('extracts the overrides for one namespace, keyed by language', () => {
    expect(pickNamespaceDictionary(dictionary, 'Company.Management.Industry')).toEqual({
      en: { card: { title: 'Sector' } },
    })
  })

  it('extracts each namespace independently, so one surface cannot retune another', () => {
    expect(pickNamespaceDictionary(dictionary, 'Company.Industry')).toEqual({
      en: { submitCta: 'Save' },
    })
  })

  it('returns undefined when the namespace is absent, so no empty bundle is merged', () => {
    const other: MultiNamespaceDictionary<Namespaces> = {
      en: { 'Company.Industry': { submitCta: 'Save' } },
    }

    expect(pickNamespaceDictionary(other, 'Company.Management.Industry')).toBeUndefined()
  })

  it('returns undefined when no dictionary was supplied', () => {
    expect(pickNamespaceDictionary(undefined, 'Company.Industry')).toBeUndefined()
  })
})
