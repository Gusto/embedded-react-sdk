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

    // Assert the page heading rather than a specific form control. The
    // scenario fixture caches a provisioned company across tests sharing
    // the same scenario ID; an earlier test in the worker may have
    // already submitted a bank account on this company, in which case
    // the SDK lands on the existing-account "view" path (no routing
    // number input — just a "Change bank account" + Continue) rather
    // than the empty-form "add" path. Both states render the same
    // "Company bank account" h2 heading, so that's the durable landmark.
    // .first() because the verify alert sub-heading can also match.
    await expect(
      page.getByRole('heading', { name: /company bank account|bank account/i }).first(),
    ).toBeVisible({ timeout: 30000 })
  })
})
