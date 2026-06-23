import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

const LONG_WAIT = 90_000

/**
 * SDK-1000 (v2026-02-01 upgrade): the self-onboarding employee-create
 * endpoint now rejects payloads without an `email` field at the server.
 *
 * The SDK's Zod schema in `employeeDetailsSchema.ts:128` already enforces
 * email-required when the admin toggles the self-onboarding switch on
 * create. This spec verifies that gate end-to-end against Demo:
 *
 *   1. Navigate to the employee-onboarding home
 *   2. Click Add Employee → land on Basics
 *   3. Toggle on "Invite this employee to enter their own details online."
 *      (the self-onboarding switch — backed by useEmployeeDetailsForm's
 *      `selfOnboarding` field)
 *   4. Click Continue without filling email
 *   5. Assert the form stays on Basics — i.e. Zod blocked the submit
 *      BEFORE the new v2026-02-01 server-side rejection could fire.
 *
 * Intentionally does NOT fill out the rest of the form. Other required-field
 * validation will also surface; we only care that the form did not advance,
 * which is the contract we're protecting. Keeping the spec minimal avoids
 * brittleness from date pickers, comboboxes, and other interactions
 * unrelated to the breaking change.
 */
test.describe('EmployeeOnboarding - self-onboarding email required (SDK-1000)', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'shared/onboarded',
    })
  })

  test('Continue does not advance past Basics when self-onboarding is on and email is empty', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(60_000)

    await page.goto('/?flow=employee-onboarding')
    await waitForLoadingComplete(page, {
      timeout: LONG_WAIT,
      anchor: page.getByRole('heading', { name: /your employees/i }),
    })

    const addButton = page.getByRole('button', { name: /^add( an| another)? employee$/i }).first()
    await expect(addButton).toBeVisible({ timeout: 30_000 })
    await addButton.click()
    await waitForLoadingComplete(page, LONG_WAIT)

    await expect(page.getByRole('heading', { name: /^basics$/i })).toBeVisible({ timeout: 30_000 })

    // Toggle self-onboarding ON. Don't fill any other fields. Email is now
    // required by Zod (and by the v2026-02-01 server contract).
    const selfOnboardingSwitch = page.getByRole('switch', {
      name: /invite this employee to enter their own details online/i,
    })
    await expect(selfOnboardingSwitch).toBeVisible({ timeout: 10_000 })
    await selfOnboardingSwitch.click()

    // Submit — Zod should block the form from advancing.
    await page.getByRole('button', { name: /^continue$/i }).click()

    // Critical assertion: we must still be on Basics. If validation passed,
    // the SDK would have navigated forward.
    await expect(page.getByRole('heading', { name: /^basics$/i })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('heading', { name: /^compensation$/i })).toHaveCount(0)
  })
})
