import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

test.describe('TimeOffFlow - holiday policy lifecycle', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'time-off/time-off-policy-create-validation',
    })
  })

  test('creates a holiday pay policy end-to-end and lands on the holiday detail view', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(240_000)

    await page.goto('/?flow=time-off')
    await waitForLoadingComplete(page)

    const holidayRow = page.getByRole('row').filter({ has: page.getByText(/Holiday pay policy/i) })

    if (await holidayRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      await holidayRow.getByRole('button', { name: /actions for holiday pay policy/i }).click()
      await page.getByRole('menuitem', { name: /delete policy/i }).click()
      const cleanupDialog = page.getByRole('dialog').filter({ hasText: /holiday/i })
      await expect(cleanupDialog).toBeVisible({ timeout: 10000 })
      await cleanupDialog.getByRole('button', { name: /^delete policy$/i }).click()
      await waitForLoadingComplete(page, 30000)
    }

    await page
      .getByRole('button', { name: /create policy/i })
      .first()
      .click()
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /select policy type/i })).toBeVisible({
      timeout: 30000,
    })

    await page.getByRole('radio', { name: /holiday pay/i }).check()
    await page.getByRole('button', { name: /^continue$/i }).click()
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /choose your company holidays/i })).toBeVisible({
      timeout: 30000,
    })

    const newYearsCell = page.getByRole('gridcell', { name: /New Year's Day/i })
    await expect(newYearsCell).toBeVisible({ timeout: 15000 })

    const headerCheckbox = page.getByRole('checkbox', { name: /select all/i }).first()
    if (await headerCheckbox.isVisible().catch(() => false)) {
      await headerCheckbox.check()
    } else {
      const firstRowCheckbox = page.getByRole('row').nth(1).getByRole('checkbox')
      await firstRowCheckbox.check()
    }

    await page.getByRole('button', { name: /^continue$/i }).click()
    await waitForLoadingComplete(page, 60000)

    await expect(page.getByRole('heading', { name: /add employees to policy/i })).toBeVisible({
      timeout: 30000,
    })

    await page.getByRole('button', { name: /^continue$/i }).click()
    await waitForLoadingComplete(page, 60000)

    await expect(page.getByRole('heading', { name: /holiday pay policy/i })).toBeVisible({
      timeout: 30000,
    })
  })

  test('deletes the holiday pay policy from the list with a confirmation dialog', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(240_000)

    await page.goto('/?flow=time-off')
    await waitForLoadingComplete(page)

    const holidayRow = page.getByRole('row').filter({ has: page.getByText(/Holiday pay policy/i) })

    const exists = await holidayRow.isVisible({ timeout: 5000 }).catch(() => false)
    if (!exists) {
      await page
        .getByRole('button', { name: /create policy/i })
        .first()
        .click()
      await waitForLoadingComplete(page)
      await expect(page.getByRole('heading', { name: /select policy type/i })).toBeVisible({
        timeout: 30000,
      })
      await page.getByRole('radio', { name: /holiday pay/i }).check()
      await page.getByRole('button', { name: /^continue$/i }).click()
      await waitForLoadingComplete(page)
      await expect(
        page.getByRole('heading', { name: /choose your company holidays/i }),
      ).toBeVisible({ timeout: 30000 })
      const headerCheckbox = page.getByRole('checkbox', { name: /select all/i }).first()
      if (await headerCheckbox.isVisible().catch(() => false)) {
        await headerCheckbox.check()
      } else {
        await page.getByRole('row').nth(1).getByRole('checkbox').check()
      }
      await page.getByRole('button', { name: /^continue$/i }).click()
      await waitForLoadingComplete(page, 60000)
      await page.getByRole('button', { name: /^continue$/i }).click()
      await waitForLoadingComplete(page, 60000)
      await page.getByRole('button', { name: /back to policies/i }).click()
      await waitForLoadingComplete(page)
    }

    await expect(holidayRow).toBeVisible({ timeout: 15000 })
    await holidayRow.getByRole('button', { name: /actions for holiday pay policy/i }).click()
    await page.getByRole('menuitem', { name: /delete policy/i }).click()

    const dialog = page.getByRole('dialog').filter({ hasText: /holiday/i })
    await expect(dialog).toBeVisible({ timeout: 10000 })
    await dialog.getByRole('button', { name: /^delete policy$/i }).click()

    await expect(page.getByText(/holiday pay policy deleted successfully/i)).toBeVisible({
      timeout: 30000,
    })
  })
})
