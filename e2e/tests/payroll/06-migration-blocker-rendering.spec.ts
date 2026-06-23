import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

/**
 * SDK-1000 (v2026-02-01 upgrade): the API surfaces new `migration_blocker`
 * and `migration_warning` blocker categories on the Company endpoint that
 * may flow into the payroll-overview `submission_blockers[]` array.
 *
 * Both PayrollOverviewPresentation.tsx:668 and PreviewPresentation.tsx:140
 * fall through to <GenericBlocker> for any blockerType not in
 * PAYROLL_RESOLVABLE_SUBMISSION_BLOCKER_TYPES, so an unknown migration_*
 * blocker should render as a generic banner and disable submit.
 *
 * This spec exercises the unknown-blockerType render path. The
 * `shared/onboarded` scenario is fully migrated so it does not naturally
 * carry a migration_blocker; the test is currently a placeholder until we
 * stage a Demo company in mid-migration state (tracked alongside SDK-999).
 */
test.describe('PayrollFlow - migration_blocker / migration_warning rendering', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'shared/onboarded',
    })
  })

  test.skip('renders unknown migration_blocker via GenericBlocker fallback', async ({
    page,
    scenario,
  }) => {
    // TODO(SDK-1000): replace with a scenario that provisions a company
    // with a migration_blocker present. Until then this is a structural
    // placeholder so the assertion shape is reviewable alongside the
    // upgrade PR.
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(180_000)

    await page.goto('/?flow=payroll')
    await waitForLoadingComplete(page, 60000)

    await expect(page.getByRole('tab', { name: /run payroll/i })).toBeVisible({ timeout: 30000 })

    // GenericBlocker renders the API-provided blocker message verbatim.
    // Expect submit to be disabled when any non-resolvable blocker is present.
    const submitButton = page.getByRole('button', { name: /submit payroll/i })
    await expect(submitButton).toBeDisabled({ timeout: 15000 })
  })
})
