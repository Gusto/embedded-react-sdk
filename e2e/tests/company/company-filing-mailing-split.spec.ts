import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

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

    await page.goto('/?flow=company-onboarding')
    await waitForLoadingComplete(page)

    await expect(
      page.getByRole('heading', {
        name: /get started|let's get started|we need a few more details/i,
      }),
    ).toBeVisible({ timeout: 30000 })

    await page.getByRole('button', { name: /start onboarding|continue onboarding/i }).click()
    await waitForLoadingComplete(page, 30000)

    await expect(page.getByRole('heading', { name: /address/i })).toBeVisible({ timeout: 30000 })
  })
})
