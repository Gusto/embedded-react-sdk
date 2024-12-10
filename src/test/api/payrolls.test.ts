import { GustoClient } from '@/index'
import { describe, expect, it } from 'vitest'

describe('SDK: Payrolls', () => {
  describe('getHistoricalPayrolls', () => {
    it('returns an array of employee bank accounts', async () => {
      const client = new GustoClient()
      // TODO: Handler doesn't care about dates
      const startDate = new Date()
      const endDate = new Date()

      const { data } = await client.getHistoricalPayrolls('company-uuid', startDate, endDate)

      expect(data).toHaveLength(3)
    })
  })
})
