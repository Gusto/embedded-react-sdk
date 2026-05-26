import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

test.describe('ContractorOnboarding — mixed roster', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'shared/onboarded',
    })
  })

  test('renders both individual and business contractors in the list', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')

    expect(Object.keys(scenario.contractorIds)).toEqual(
      expect.arrayContaining(['individual', 'business']),
    )

    await page.goto('/?flow=contractor-onboarding')
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /contractor/i })).toBeVisible({
      timeout: 30000,
    })

    await expect(page.getByText(/Acme Consulting/i).first()).toBeVisible({ timeout: 15000 })
    await expect(page.getByText(/Charlie/i).first()).toBeVisible({ timeout: 15000 })
  })
})
