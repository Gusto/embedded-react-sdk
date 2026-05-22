import { test, expect } from '../../../utils/localTestFixture'
import {
  advancePastFederalTaxes,
  advancePastIndustry,
  advancePastLocations,
  clickStartOrContinueOnboarding,
  landOnCompanyOnboarding,
} from '../../../utils/companyFlowDrivers'

test.describe.serial('CompanyCanary 03 — federal taxes -> industry -> bank account', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'company/fresh-with-hq-location',
    })
  })

  test('drives the company through Federal Tax Information and Industry and lands on Company bank account', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(5 * 60_000)

    await landOnCompanyOnboarding(page)
    await clickStartOrContinueOnboarding(page)
    await advancePastLocations(page)
    await advancePastFederalTaxes(page)
    await advancePastIndustry(page)

    await expect(
      page.getByRole('heading', { name: /company bank account|bank account/i }).first(),
    ).toBeVisible({ timeout: 30_000 })
  })
})
