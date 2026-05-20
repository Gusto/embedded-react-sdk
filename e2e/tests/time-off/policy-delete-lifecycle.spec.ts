import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

async function createUnlimitedPolicy(
  page: import('@playwright/test').Page,
  policyName: string,
): Promise<void> {
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

  await page.getByRole('radio', { name: /^time off$/i }).check()
  await page.getByRole('button', { name: /^continue$/i }).click()
  await waitForLoadingComplete(page)

  await page.getByLabel(/policy name/i).fill(policyName)
  await page.getByRole('radio', { name: /unlimited/i }).check()
  await page.getByRole('button', { name: /save.*continue|^continue$/i }).click()
  await waitForLoadingComplete(page, 60000)

  await expect(page.getByRole('heading', { name: /add employees to policy/i })).toBeVisible({
    timeout: 30000,
  })
  await page.getByRole('button', { name: /^continue$/i }).click()
  await waitForLoadingComplete(page, 60000)

  await expect(page.getByRole('heading', { name: new RegExp(policyName, 'i') })).toBeVisible({
    timeout: 30000,
  })
}

test.describe('TimeOffFlow - delete policy lifecycle', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'time-off/time-off-policy-create-validation',
    })
  })

  test('creates a policy then deletes it from the list and asserts the success alert', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(240_000)

    const policyName = `E2E Delete ${Date.now()}`

    await createUnlimitedPolicy(page, policyName)

    await page.getByRole('button', { name: /time off policies/i }).click()
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /time off policies/i })).toBeVisible({
      timeout: 30000,
    })

    const policyRow = page
      .getByRole('row')
      .filter({ has: page.getByText(policyName, { exact: true }) })
    await expect(policyRow).toBeVisible({ timeout: 15000 })

    await policyRow
      .getByRole('button', { name: new RegExp(`actions for ${policyName}`, 'i') })
      .click()

    await page.getByRole('menuitem', { name: /delete policy/i }).click()

    const confirmDialog = page
      .getByRole('dialog')
      .filter({ hasText: new RegExp(`Are you sure.*${policyName}`, 'i') })
    await expect(confirmDialog).toBeVisible({ timeout: 10000 })
    await confirmDialog.getByRole('button', { name: /^delete policy$/i }).click()

    await expect(
      page.getByText(new RegExp(`Policy "${policyName}" deleted successfully`, 'i')),
    ).toBeVisible({ timeout: 30000 })

    await expect(policyRow).not.toBeVisible({ timeout: 15000 })
  })
})
