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

    await expect(
      page
        .getByRole('heading', { name: /bank account|company bank/i })
        .or(page.getByRole('heading', { name: /verify|verification/i })),
    ).toBeVisible({ timeout: 30000 })
  })
})
