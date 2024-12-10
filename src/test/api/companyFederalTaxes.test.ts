import { GustoClient } from '@/index'
import { describe, expect, it } from 'vitest'

describe('SDK: Company Federal Taxes requests', () => {
  describe('getCompanyFederalTaxes', () => {
    it('returns the federal taxes for a company', async () => {
      const client = new GustoClient()
      const { data } = await client.getCompanyFederalTaxes('company-uuid')
      expect(data!.legal_name).toBe('foobarbaz')
      expect(data!.has_ein).toBe(true)
    })
  })

  describe('updateCompanyFederalTaxes', () => {
    it('creates a bank account', async () => {
      const client = new GustoClient()
      const { data } = await client.updateCompanyFederalTaxes('company-uuid', {
        filing_form: '941',
        version: '12930928029384209',
      })
      expect(data!.filing_form).toBe('941')
    })
  })
})
