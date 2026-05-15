import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

test.describe('CompanyComplexScenarioProvisioning', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'company/company-multi-entity',
    })
  })

  test('provisions multi-entity company context and loads onboarding flow', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (demo/local mode)')

    expect(scenario.companyId).toBeTruthy()
    expect(scenario.paySchedule?.uuid).toBeTruthy()
    expect(Object.keys(scenario.locationIds)).toEqual(
      expect.arrayContaining(['hq', 'oakland-office', 'san-jose-hub']),
    )
    expect(Object.keys(scenario.employeeIds)).toEqual(expect.arrayContaining(['alice', 'bob']))
    expect(Object.keys(scenario.contractorIds)).toEqual(expect.arrayContaining(['casey']))

    await page.goto('/?flow=company-onboarding')
    await waitForLoadingComplete(page)

    await expect(
      page.getByRole('heading', {
        name: /get started|we need a few more details|company onboarding/i,
      }),
    ).toBeVisible({ timeout: 30000 })
  })
})
