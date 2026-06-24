import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

// Real-backend smoke for StateTaxesForm.
//
// The PR adds two filters to the State Taxes form: drop non-editable
// requirements, and gate the rest via the API's `applicable_if` contract.
// Both have thorough unit coverage in:
//   - src/.../applicableIf.test.ts (helper)
//   - src/.../StateTaxesForm.test.tsx (render + submit, MSW-driven WA fixture
//     with the parent `usedefaultsuirates` radio and gated children).
//
// On the real demo backend, the WA/ID `taxrates` sets surface only the
// resolved leaf requirements — Gusto's prepare_requirements collapses
// applicable_if when the underlying state filing requirement has the gate
// already resolved, which is the demo factory's default. So these specs can
// only assert what the demo actually exposes: that StateTaxesForm renders
// the discovered requirements end-to-end against the live backend. The
// scenario-runner's `stateTaxes` decoration (added alongside this spec)
// stays in place so future demo states that DO expose gating can be tested
// here without further plumbing work.
test.describe('StateTaxesForm — real-backend rendering', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'shared/state-taxes-wa-id',
    })
  })

  test('WA: renders the tax requirements returned by the real backend', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (real-backend CI/local runs)')

    await page.goto('/?flow=state-taxes-form&state=WA')
    await waitForLoadingComplete(page, {
      timeout: 30_000,
      anchor: page.getByRole('heading', { name: /tax rates/i }).first(),
    })

    // From the discovery dump: WA taxrates exposes UI rate (6ee9787b…)
    // and EAF rate (d312425d…) on this demo. Their labels are pinned by
    // the gws-flows tax_requirements catalog.
    await expect(page.getByText('Unemployment Insurance Rate', { exact: true })).toBeVisible()
    await expect(page.getByText('EAF Tax Rate', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: /Save/i })).toBeVisible()
  })

  test('ID: renders the tax requirements returned by the real backend', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (real-backend CI/local runs)')

    await page.goto('/?flow=state-taxes-form&state=ID')
    await waitForLoadingComplete(page, {
      timeout: 30_000,
      anchor: page.getByRole('heading', { name: /tax rates/i }).first(),
    })

    // ID taxrates exposes the three rate fields per ZP's tax_profiles
    // by_tax_agency/id_spec: UI Contribution, Administrative Reserve,
    // Workforce Development.
    await expect(page.getByText(/UI Contribution Rate/i).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /Save/i })).toBeVisible()
  })
})
