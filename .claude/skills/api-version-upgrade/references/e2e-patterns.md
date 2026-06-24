# E2E patterns for upgrade verification

E2E specs added during an upgrade exist to **catch a regression in a specific consumer of a breaking change**. They are not generic smoke tests. Each spec maps to a row in the breaking-change matrix.

## What makes a useful spec

- **Runs against Demo via `shared/onboarded` (or another existing scenario)**. Don't write `test.skip` placeholders unless the spec genuinely needs a new scenario that doesn't exist yet — in which case, file a separate ticket to author the scenario and skip with a TODO referencing it.
- **Minimal interactions**. Test only the contract under test. Filling out an entire form to assert one Zod gate introduces brittleness from unrelated controls.
- **Lives on the BASE branch** alongside the codemod. The base PR's CI shows the verification trail directly — as fix PRs land on top, the corresponding spec flips green visibly.
- **Asserts negative or positive states clearly**. If the assertion is "we did not advance", check for the current screen's heading + the absence of the next screen's heading.

## What scenarios are available

The `shared/onboarded` scenario is the workhorse — it provisions a fully-onboarded `react_sdk_demo_company_onboarded` company with biweekly pay schedule, two employees, three contractors. Use it unless you have a specific reason not to.

`shared/fresh-wizard` is for company-onboarding wizard tests starting from an empty state. Mutually exclusive with `shared/onboarded` (different baseDemo).

If your spec needs a NEW state (e.g. a partner-managed company in pre-migration, a company with active blockers), don't bolt on inline state setup — author a new shared scenario in `e2e/scenarios/shared/<name>.json` and reference it via `testInfo.annotations.push({ type: 'scenario', description: 'shared/<name>' })`. See `e2e/CLAUDE.md` for the scenario schema and how `e2e-setup` provisions them.

## Selector lessons (the brittleness file)

### Switches — use label-text, not `getByRole('switch')`

The SDK's `SwitchHookField` renders the underlying input as visually-hidden. `getByRole('switch')` finds the hidden input, but `.click()` then hangs on actionability checks because the element isn't pointer-event-able.

**Don't:**

```ts
const sw = page.getByRole('switch', { name: /invite this employee.../i })
await sw.click() // hangs past timeout
```

**Do:**

```ts
const label = page.getByText(/invite this employee.../i)
await label.click()
```

Standard HTML `<label>` semantics make the label text a clickable proxy for the control.

### Comboboxes — click the button, then the option in the listbox

SDK's combobox renders as a button trigger that opens a popover listbox.

```ts
await page.getByRole('button', { name: /work address/i }).click()
await page.getByRole('listbox').getByRole('option').first().click()
```

### Date pickers — use the `fillDate` helper from `e2e/utils/helpers`

The DOM is non-trivial (segmented inputs + popover calendar). Hand-rolling the interaction is brittle.

```ts
import { fillDate } from '../../utils/helpers'
await fillDate(page, 'Date of birth', { month: 4, day: 15, year: 1992 })
```

### Page-load anchors — use `waitForLoadingComplete` with an anchor

Don't `await page.waitForLoadState('networkidle')` — networkidle is flaky with React Query background polling. Anchor to a visible heading instead:

```ts
import { waitForLoadingComplete } from '../../utils/helpers'
await waitForLoadingComplete(page, {
  timeout: 60_000,
  anchor: page.getByRole('heading', { name: /your employees/i }),
})
```

### Asserting the form didn't advance

When testing a Zod validation gate, the cleanest assertion is "we're still on the same screen + the next screen's heading is absent":

```ts
await expect(page.getByRole('heading', { name: /^basics$/i })).toBeVisible({ timeout: 10_000 })
await expect(page.getByRole('heading', { name: /^compensation$/i })).toHaveCount(0)
```

`toHaveCount(0)` is more reliable than `not.toBeVisible()` for asserting absence.

## Numeric prefix conventions

E2E specs in domain folders use a numeric prefix that signals mutation class:

- **`01-89`** — read-only or create-isolated-entity specs. Safe to share a company.
- **`90-99`** — mutating specs (consume pay periods, submit terminations, etc.). Within `90-99`, lower numbers run first.

Upgrade-verification specs are almost always read-only or create-isolated. Slot them in the `01-89` range, picking the next available number in the relevant domain folder (`e2e/tests/<domain>/`).

## Anti-patterns

- **`test.skip` without a referenced ticket.** A skipped spec is dead weight that hides a coverage gap. Either un-skip with a real implementation or delete the file.
- **Generic smoke tests not tied to a breaking change.** If a spec doesn't map to a matrix row, it doesn't belong in the upgrade PR.
- **Inline scenario state setup.** Mutating state at the start of every test invites flakes. Author a shared scenario.
- **Asserting against text the SDK doesn't own.** Don't assert on copy that lives in a partner's app or in mocked-MSW responses. Assert against the SDK's own rendered output.
- **Testing the error pipeline as if it's the breaking change.** When an upgrade introduces server-side validation tightening (e.g., "field X required if Y=true at the server"), the SDK's `normalizeToSDKError` → `errorHandling.error.fieldErrors[]` → inline UI render path handles it. The user sees an inline error and resubmits — identical UX to a client-side gate. An E2E asserting "submit fails and error appears" is testing the existing error pipeline, not the upgrade. See `known-pitfalls.md` § "Trust the error pipeline" for the full reasoning. **Only write an E2E for these cases if the SDK has a custom Zod refinement that mirrors the server rule and you need to verify the two stay in sync.**

## Pattern: the canonical upgrade-verification spec

```ts
import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

/**
 * SDK-XXXX (v<NEW> upgrade): <one-sentence what the breaking change is>.
 *
 * The SDK's <consumer file> (<file:line>) <one-sentence what protects us>.
 * This spec verifies that gate end-to-end against Demo by <one-sentence
 * what the user-visible interaction is>.
 *
 * If this spec ever fails, it means <one-sentence what real regression
 * the failure points to>.
 */
test.describe('<Surface> - <breaking change> (SDK-XXXX)', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'shared/onboarded',
    })
  })

  test('<single sentence describing the contract>', async ({ page, scenario }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(60_000)

    // Drive the minimal interaction that exercises the contract.
    // ...

    // Assert the contract is upheld.
    // ...
  })
})
```

Every upgrade-verification spec follows this shape. The JSDoc comment explaining "what real regression a failure points to" is non-optional — it's the difference between signal and noise.
