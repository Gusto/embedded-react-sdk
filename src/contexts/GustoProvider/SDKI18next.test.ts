import { describe, expect, it } from 'vitest'
import { SDKI18next } from './SDKI18next'
import recoveryCasesResubmitEn from '@/i18n/en/Payroll.RecoveryCasesResubmit.json'

describe('SDKI18next', () => {
  it('renders an empty translation as an empty string instead of falling back to the key', () => {
    SDKI18next.addResourceBundle('en', 'Payroll.RecoveryCasesResubmit', recoveryCasesResubmitEn)
    SDKI18next.addResource(
      'en',
      'Payroll.RecoveryCasesResubmit',
      'errorCodes.bankError.instruction',
      '',
    )
    const t = SDKI18next.getFixedT('en', 'Payroll.RecoveryCasesResubmit')

    expect(t('errorCodes.bankError.instruction')).toBe('')
  })
})
