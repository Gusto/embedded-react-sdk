import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

test.describe('ContractorOnboarding — business profile branch', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'shared/onboarded',
    })
  })

  test('contractor list shows the business contractor name', async ({ page, scenario }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')

    await page.goto('/?flow=contractor-onboarding')
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /contractor/i })).toBeVisible({
      timeout: 30000,
    })

    await expect(page.getByText(/Acme Consulting/i).first()).toBeVisible({ timeout: 15000 })
  })
})
