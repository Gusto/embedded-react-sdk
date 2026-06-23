import { test } from '../../utils/localTestFixture'
import { assertCompletedOverview } from '../../utils/companyFlowDrivers'
import { waitForLoadingComplete } from '../../utils/helpers'

/**
 * SDK-1000 (v2026-02-01 upgrade): the `migration_status` field on Company
 * endpoints changed from a string enum (`'pending'` / `'in_progress'` /
 * `'done'` / etc.) to a plain boolean.
 *
 * No SDK component in `src/` currently reads `migration_status` — verified
 * via `grep`. This spec exists as a defensive end-to-end check: load the
 * already-onboarded company-onboarding flow (whose response carries
 * migration_status) and confirm the completion overview renders cleanly.
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

    await page.goto('/?flow=company-onboarding')
    await waitForLoadingComplete(page, 60_000)

    // The onboarded company response carries migration_status. If anything
    // in the render tree narrows on the old string shape, the completion
    // overview won't render.
    await assertCompletedOverview(page)
  })
})
