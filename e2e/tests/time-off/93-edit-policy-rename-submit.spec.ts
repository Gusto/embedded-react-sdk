import { test, expect } from '../../utils/localTestFixture'
import { runEditPolicyRename } from '../../utils/timeOffFlowDrivers'

test.describe.serial('TimeOffCanary 04 — edit policy rename end-to-end', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'shared/onboarded',
    })
  })

  test('creates a populated fixed-accrual policy, renames it via Edit, returns to detail view', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(10 * 60_000)

    const ts = Date.now()
    const originalName = `Canary Edit ${ts}`
    const renamedName = `${originalName} Renamed`

    await runEditPolicyRename(page, scenario, { originalName, renamedName })

    await expect(page.getByRole('heading', { name: new RegExp(renamedName, 'i') })).toBeVisible({
      timeout: 60_000,
    })
    await expect(page.getByRole('button', { name: /edit policy/i })).toBeVisible()
  })
})
