import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

test.describe('TimeOffFlow - policy list smoke', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'time-off/time-off-management',
    })
  })

  test('loads the time-off flow and displays the policy list heading', async ({ page }) => {
    await page.goto('/?flow=time-off')
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /time.?off|holiday/i }).first()).toBeVisible({
      timeout: 30000,
    })
  })
})
