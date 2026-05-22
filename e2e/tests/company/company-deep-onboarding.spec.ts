import { test, expect } from '../../utils/localTestFixture'
import {
  landOnCompanyOnboarding,
  clickStartOrContinueOnboarding,
  advancePastLocations,
  advancePastFederalTaxes,
  advancePastIndustry,
} from '../../utils/companyFlowDrivers'

test.describe('CompanyOnboarding - deep flow through industry to bank account', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'company/fresh-with-hq-location',
    })
  })

  test('completes addresses + federal taxes + industry + reaches bank account step', async ({
    page,
  }) => {
    test.setTimeout(240_000)

    await landOnCompanyOnboarding(page)
    await clickStartOrContinueOnboarding(page)
    await advancePastLocations(page)
    await advancePastFederalTaxes(page)
    await advancePastIndustry(page)

    // Pin the landing check to the routing-number input rather than a
    // heading: the bank-account step renders one heading on the add path
    // ("Company bank account") and a different one on the verify path
    // ("Verify bank account"), both at the same `<h2>` level, so any
    // heading-based locator either has to enumerate both names or risk
    // matching multiple elements. The routing-number input is unique to
    // the form path that this fresh-company scenario reaches and is a
    // stronger contract — it asserts the form is interactive, not just
    // that *some* heading rendered.
    await expect(page.getByRole('textbox', { name: /routing number/i })).toBeVisible({
      timeout: 30000,
    })
  })
})
