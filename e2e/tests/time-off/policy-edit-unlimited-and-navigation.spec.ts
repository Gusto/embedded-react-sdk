import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'
import {
  createFixedPolicyWithOneEmployee,
  openAddEmployeesFromDetail,
} from '../../utils/timeOffFlowDrivers'

// Extracted from QA-fest issues surfaced in PR #1879 (Kristine White).
// Edit-unlimited + back-button navigation contracts the QA fest reported.
test.describe('TimeOffFlow - edit unlimited + navigation regressions', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'shared/onboarded-ro',
    })
  })

  // QA issue reporter: Sam Nazarian
  // Opening the edit screen for an unlimited policy previously crashed because
  // the accrual_method field was locked but the form still tried to derive it.
  // We assert the edit form renders without crash. We intentionally do NOT
  // submit because the demo backend has a known PUT-unlimited issue
  // ("Policy accrual date by anniversary: Please make a selection") that is
  // tracked separately from this UI render contract.
  test('opening the edit form for an unlimited policy renders without crashing', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(240_000)

    const policyName = `E2E EditUnlimited ${Date.now()}`

    await page.goto('/?flow=time-off')
    await waitForLoadingComplete(page)

    await page
      .getByRole('button', { name: /create policy/i })
      .first()
      .click()
    await waitForLoadingComplete(page)

    await page.getByRole('radio', { name: /^time off$/i }).check()
    await page.getByRole('button', { name: /^continue$/i }).click()
    await waitForLoadingComplete(page)

    await page.getByLabel(/policy name/i).fill(policyName)
    await page.getByRole('radio', { name: /unlimited/i }).check()

    await page.getByRole('button', { name: /save.*continue|^continue$/i }).click()
    await waitForLoadingComplete(page, 60_000)

    await page.getByRole('button', { name: /^continue$/i }).click()
    await waitForLoadingComplete(page, 60_000)

    await expect(page.getByRole('heading', { name: new RegExp(policyName, 'i') })).toBeVisible({
      timeout: 30_000,
    })

    await page.getByRole('button', { name: /edit policy/i }).click()
    await waitForLoadingComplete(page, 60_000)

    await expect(
      page.getByRole('heading', { name: new RegExp(`Edit ${policyName}`, 'i') }),
    ).toBeVisible({ timeout: 30_000 })

    const nameField = page.getByLabel(/policy name/i)
    await expect(nameField).toHaveValue(policyName)
    await expect(page.getByRole('radio', { name: /unlimited/i })).toBeChecked()

    await expect(page.getByText(/unexpected error/i)).toHaveCount(0)
    await expect(page.getByText(/cannot read propert/i)).toHaveCount(0)
  })

  // QA issue reporters: Jeff Stephens / Aaron Lee
  // Hitting back from the add-employees screen must return the user to the
  // policy detail view, not jump out to the policy list.
  test('back from add-employees returns to the policy detail, not the policy list', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(300_000)

    const policyName = `E2E BackNav ${Date.now()}`
    await createFixedPolicyWithOneEmployee(page, policyName, '8')

    await openAddEmployeesFromDetail(page)

    await page.getByRole('button', { name: /^back$/i }).click()
    await waitForLoadingComplete(page, 60_000)

    await expect(page.getByRole('heading', { name: new RegExp(policyName, 'i') })).toBeVisible({
      timeout: 30_000,
    })
    await expect(page.getByRole('heading', { name: /^time off policies$/i })).toHaveCount(0)
  })

  // QA issue reporter: Charlie Lai
  // Cancelling out of the edit-policy form must return the user to the
  // policy detail view they came from.
  test('edit policy -> cancel returns to the policy detail view', async ({ page, scenario }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(300_000)

    const policyName = `E2E EditCancel ${Date.now()}`
    await createFixedPolicyWithOneEmployee(page, policyName, '8')

    await page.getByRole('button', { name: /edit policy/i }).click()
    await waitForLoadingComplete(page, 60_000)

    await expect(
      page.getByRole('heading', { name: new RegExp(`Edit ${policyName}`, 'i') }),
    ).toBeVisible({ timeout: 30_000 })

    await page.getByRole('button', { name: /^cancel$/i }).click()
    await waitForLoadingComplete(page, 60_000)

    await expect(page.getByRole('heading', { name: new RegExp(policyName, 'i') })).toBeVisible({
      timeout: 30_000,
    })
    await expect(page.getByRole('button', { name: /edit policy/i })).toBeVisible()
  })
})
