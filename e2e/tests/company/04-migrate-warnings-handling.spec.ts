import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

/**
 * SDK-1000 (v2026-02-01 upgrade): migrate-success responses now include
 * a `warnings[]` array. The SDK previously assumed migrate-success was
 * warning-free.
 *
 * No SDK component in `src/` currently consumes the migrate-success
 * response shape directly — the migration flow is partner-driven. This
 * spec verifies the SDK doesn't choke when an unexpected `warnings`
 * field appears in a response it does touch.
 */
test.describe('Company - migrate-success warnings[] handling', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'shared/onboarded',
    })
  })

  test.skip('handles migrate-success response with warnings[] array', async ({
    page,
    scenario,
  }) => {
    // TODO(SDK-1000): un-skip once we have a scenario that drives a
    // company through the migrate flow. The shared/onboarded fixture is
    // already migrated, so triggering migrate-success requires a fresh
    // pre-migration company.
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(180_000)

    await page.goto('/?flow=company')
    await waitForLoadingComplete(page, 60_000)

    // Placeholder: real implementation drives the migrate API and asserts
    // the SDK's response-handling layer accepts the warnings[] array
    // without crashing. The exact assertion will depend on whether we add
    // partner-surfaced warnings rendering (separate feature, not this PR).
    await expect(page.getByRole('tab').first()).toBeVisible({ timeout: 15_000 })
  })
})
