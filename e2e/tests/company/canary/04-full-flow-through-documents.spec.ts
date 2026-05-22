import { test, expect } from '../../../utils/localTestFixture'
import { runFullOnboardingThroughDocuments } from '../../../utils/companyFlowDrivers'

test.describe.serial('CompanyCanary 04 — full wizard from overview through documents', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'company/fresh-with-hq-location',
    })
  })

  test('walks every Company onboarding wizard step (locations -> federal -> industry -> bank -> employees skip -> pay schedule -> state taxes -> documents)', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(8 * 60_000)

    await runFullOnboardingThroughDocuments(page)

    await expect(
      page
        .getByRole('heading', { name: /^documents$/i })
        .or(page.getByRole('heading', { name: /assign a company signatory/i }))
        .first(),
    ).toBeVisible({ timeout: 30_000 })
  })
})
