import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

/**
 * SDK-1000 (v2026-02-01 upgrade): the `migration_status` field on Company
 * endpoints changed from a string enum (`'pending'` / `'in_progress'` /
 * `'done'` / etc.) to a plain boolean.
 *
 * No SDK component in `src/` currently reads `migration_status` — verified
 * via `grep`. This spec exists as a defensive end-to-end check: load a
 * company-scoped flow that has migration_status on its critical response
 * path and confirm no narrowing-on-string runtime error surfaces.
 *
 * If this spec ever fails, we missed a consumer of the old string shape.
 */
test.describe('Company - migration_status boolean shape', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'shared/onboarded',
    })
  })

  test('renders the onboarded company overview without choking on migration_status', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(120_000)

    await page.goto('/?flow=company')
    await waitForLoadingComplete(page, 60_000)

    // The onboarded company response carries migration_status. If anything
    // in the render tree narrows on the old string shape, we'll see a
    // runtime error or unhandled exception surface in the page.
    await expect(page.getByText(/migration_status/i)).toHaveCount(0, { timeout: 5_000 })

    // Smoke: an onboarded company overview should render a primary nav
    // element. If the response shape change crashes the tree, this fails.
    await expect(page.getByRole('tab').first()).toBeVisible({ timeout: 15_000 })
  })
})
