import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

test.describe('PayrollComplexScenarioProvisioning', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'payroll/payroll-multi-entity-history',
    })
  })

  test('provisions complex payroll context and loads payroll landing', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (demo/local mode)')

    expect(scenario.companyId).toBeTruthy()
    expect(scenario.paySchedule?.uuid).toBeTruthy()
    expect(Object.keys(scenario.locationIds)).toEqual(expect.arrayContaining(['hq', 'remote-site']))
    expect(Object.keys(scenario.employeeIds)).toEqual(expect.arrayContaining(['alice', 'bob']))
    expect(Object.keys(scenario.contractorIds)).toEqual(expect.arrayContaining(['casey']))
    expect(Object.keys(scenario.payrollIds)).toEqual(expect.arrayContaining(['off-cycle-preview']))

    await page.goto('/?flow=payroll')
    await waitForLoadingComplete(page)

    await expect(page.getByRole('tab', { name: /run payroll/i })).toBeVisible({ timeout: 30000 })
    await expect(page.getByRole('tab', { name: /payroll history/i })).toBeVisible()
  })
})
