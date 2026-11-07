import { describe, expect, it } from 'vitest'
import { toDocumentRows } from './documentRows'

describe('toDocumentRows', () => {
  it('lists forms before documents and carries the signing source through', () => {
    const rows = toDocumentRows({
      forms: [{ uuid: 'form-1', title: 'Form 1099: 2026', description: 'Annual income' }],
      documents: [
        { uuid: 'doc-1', title: 'W-9', description: 'Taxpayer identification', signedAt: null },
      ],
    })

    expect(rows).toEqual([
      {
        kind: 'form',
        uuid: 'form-1',
        title: 'Form 1099: 2026',
        name: undefined,
        description: 'Annual income',
      },
      {
        kind: 'document',
        uuid: 'doc-1',
        title: 'W-9',
        name: undefined,
        description: 'Taxpayer identification',
        signedAt: null,
      },
    ])
  })

  it('drops documents without a uuid, since their PDF cannot be addressed', () => {
    const rows = toDocumentRows({
      forms: [],
      documents: [{ title: 'Unidentified' }, { uuid: 'doc-1', title: 'W-9' }],
    })

    expect(rows.map(row => row.uuid)).toEqual(['doc-1'])
  })
})
