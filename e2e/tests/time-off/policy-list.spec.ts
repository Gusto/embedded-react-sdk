import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

test.describe('TimeOffFlow - policy list with multi-employee roster', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'time-off/time-off-policy-list-multi-employee',
    })
  })

  test('renders policy list shell with create policy entry point', async ({ page, scenario }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')

    await page.goto('/?flow=time-off')
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /time off policies/i })).toBeVisible({
      timeout: 30000,
    })

    const createPolicyCta = page.getByRole('button', { name: /create policy/i })
    await expect(createPolicyCta.first()).toBeVisible()
  })

  test('opens the policy type selector when create policy is clicked', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')

    await page.goto('/?flow=time-off')
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /time off policies/i })).toBeVisible({
      timeout: 30000,
    })

    await page
      .getByRole('button', { name: /create policy/i })
      .first()
      .click()
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /select policy type/i })).toBeVisible({
      timeout: 30000,
    })

    await expect(page.getByRole('radiogroup', { name: /policy type/i })).toBeVisible()
  })
})
