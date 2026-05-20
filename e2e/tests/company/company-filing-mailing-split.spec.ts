import { test, expect } from '../../utils/localTestFixture'
import {
  landOnCompanyOnboarding,
  clickStartOrContinueOnboarding,
} from '../../utils/companyFlowDrivers'

test.describe('CompanyOnboarding — filing/mailing split', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'company/company-filing-mailing-split',
    })
  })

  test('provisions split filing/mailing locations and loads onboarding overview', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')

    expect(scenario.companyId).toBeTruthy()
    expect(Object.keys(scenario.locationIds)).toEqual(
      expect.arrayContaining(['filing-only', 'mailing-only']),
    )

    await landOnCompanyOnboarding(page)
    await clickStartOrContinueOnboarding(page)

    await expect(page.getByRole('heading', { name: /address/i })).toBeVisible({ timeout: 30000 })
  })
})
