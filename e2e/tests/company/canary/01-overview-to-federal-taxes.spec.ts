import { test, expect } from '../../../utils/localTestFixture'
import {
  advancePastLocations,
  clickStartOrContinueOnboarding,
  landOnCompanyOnboarding,
} from '../../../utils/companyFlowDrivers'

test.describe.serial('CompanyCanary 01 — overview to federal taxes', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'company/fresh-with-hq-location',
    })
  })

  test('lands on overview, enters the wizard, and advances past Company addresses to Federal Tax Information', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(6 * 60_000)

    await landOnCompanyOnboarding(page)
    await expect(
      page.getByRole('heading', {
        name: /let['’]s get started|we need a few more details/i,
      }),
    ).toBeVisible({ timeout: 30_000 })

    await clickStartOrContinueOnboarding(page)
    await advancePastLocations(page)

    await expect(page.getByRole('heading', { name: /federal tax information/i })).toBeVisible({
      timeout: 30_000,
    })
  })
})
