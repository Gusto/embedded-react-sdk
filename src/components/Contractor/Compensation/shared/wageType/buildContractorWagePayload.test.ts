import { describe, expect, it } from 'vitest'
import { ContractorWageType } from '@gusto/embedded-api/models/components/contractor'
import { buildContractorWagePayload } from './buildContractorWagePayload'

describe('buildContractorWagePayload', () => {
  it('stringifies a finite hourly rate for Hourly contractors', () => {
    expect(
      buildContractorWagePayload({ wageType: ContractorWageType.Hourly, hourlyRate: 25.5 }),
    ).toEqual({ wageType: 'Hourly', hourlyRate: '25.5' })
  })

  it('omits the rate for Fixed contractors', () => {
    expect(
      buildContractorWagePayload({ wageType: ContractorWageType.Fixed, hourlyRate: 25 }),
    ).toEqual({ wageType: 'Fixed', hourlyRate: undefined })
  })

  it('omits the rate for Hourly contractors with a missing or non-finite rate', () => {
    expect(buildContractorWagePayload({ wageType: ContractorWageType.Hourly })).toEqual({
      wageType: 'Hourly',
      hourlyRate: undefined,
    })
    expect(
      buildContractorWagePayload({ wageType: ContractorWageType.Hourly, hourlyRate: NaN }),
    ).toEqual({ wageType: 'Hourly', hourlyRate: undefined })
  })
})
