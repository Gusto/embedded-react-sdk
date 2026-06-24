import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

// MSW-only: these specs assert client-side `applicable_if` filtering against
// deterministic fixture data (e2e/../tax_requirements-{WA,ID}.json). The
// CI matrix runs `npm run test:e2e:demo` with E2E_USE_REAL_BACKEND=true,
// which bypasses MSW and hits a demo company whose state-tax requirements
// aren't shaped for this assertion. The behavior is fully covered by the
// unit tests in StateTaxesForm.test.tsx + applicableIf.test.ts; these
// specs add real-DOM coverage when running locally via `npm run test:e2e`.
test.skip(
  process.env.E2E_USE_REAL_BACKEND === 'true',
  'MSW-only spec: relies on tax_requirements fixtures, not real demo data',
)

test.describe('StateTaxesForm — applicable_if conditional visibility', () => {
  test('WA: rate fields stay hidden until "use default rates" radio toggles to No', async ({
    page,
  }) => {
    await page.goto('/?flow=state-taxes-form&state=WA')
    await waitForLoadingComplete(page, {
      timeout: 30_000,
      anchor: page.getByRole('heading', { name: /tax rates/i }).first(),
    })

    const useDefaultRadioYes = page.getByRole('radio', { name: /^Yes$/ }).first()
    await expect(useDefaultRadioYes).toBeChecked()

    const uiRateLabel = page.getByText('Unemployment Insurance Rate', { exact: true })
    const eafRateLabel = page.getByText('EAF Tax Rate', { exact: true })
    await expect(uiRateLabel).toHaveCount(0)
    await expect(eafRateLabel).toHaveCount(0)

    const useDefaultRadioNo = page.getByRole('radio', {
      name: /No, my agency gave me new rates/i,
    })
    await useDefaultRadioNo.check()

    await expect(uiRateLabel).toBeVisible()
    await expect(eafRateLabel).toBeVisible()
  })

  test('ID: rate fields stay visible until "reimbursable employer" radio toggles to Yes', async ({
    page,
  }) => {
    await page.goto('/?flow=state-taxes-form&state=ID')
    await waitForLoadingComplete(page, {
      timeout: 30_000,
      anchor: page.getByRole('heading', { name: /tax rates/i }).first(),
    })

    const reimbursableNo = page.getByRole('radio', { name: /No, we pay SUI tax/i })
    await expect(reimbursableNo).toBeChecked()

    const uiRateLabel = page.getByText('UI Contribution Rate', { exact: true })
    const adminRateLabel = page.getByText('Administrative Reserve Rate', { exact: true })
    const workforceRateLabel = page.getByText('Workforce Development Rate', { exact: true })
    await expect(uiRateLabel).toBeVisible()
    await expect(adminRateLabel).toBeVisible()
    await expect(workforceRateLabel).toBeVisible()

    const reimbursableYes = page.getByRole('radio', {
      name: /Yes, we're a reimbursable employer/i,
    })
    await reimbursableYes.check()

    await expect(uiRateLabel).toHaveCount(0)
    await expect(adminRateLabel).toHaveCount(0)
    await expect(workforceRateLabel).toHaveCount(0)
  })
})
