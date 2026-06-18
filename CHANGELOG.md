# Changelog

## [0.48.3](https://github.com/Gusto/embedded-react-sdk/compare/v0.48.2...v0.48.3) (2026-06-17)

### Features & Enhancements

- Export `LocationsList` component from `CompanyOnboarding` namespace ([#2198](https://github.com/Gusto/embedded-react-sdk/issues/2198))
- `PayrollReceipts` now displays formatted licensee phone numbers ([#2195](https://github.com/Gusto/embedded-react-sdk/issues/2195))

### Fixes

- Export `LocationsListProps` type from `CompanyOnboarding` namespace ([#2200](https://github.com/Gusto/embedded-react-sdk/issues/2200))

### Chores & Maintenance

- Add TSDoc comments to `Company` and `Contractor` namespaces ([#2187](https://github.com/Gusto/embedded-react-sdk/issues/2187), [#2170](https://github.com/Gusto/embedded-react-sdk/issues/2170))

## [0.48.2](https://github.com/Gusto/embedded-react-sdk/compare/v0.48.1...v0.48.2) (2026-06-17)

### Features & Enhancements

- **Employee:** export DocumentSigner sub-components from EmployeeOnboarding ([#2192](https://github.com/Gusto/embedded-react-sdk/issues/2192)) ([5749f99](https://github.com/Gusto/embedded-react-sdk/commit/5749f99d720bd7c0614d97bef8270020150b3ab5))

### Fixes

- **Payroll:** use EmptyData for PayrollList empty state ([#2189](https://github.com/Gusto/embedded-react-sdk/issues/2189)) ([ac0514a](https://github.com/Gusto/embedded-react-sdk/commit/ac0514a367445e308e128eeb688e1b6a381f992a))
- **TimeOff:** use empty data component for empty states ([#2188](https://github.com/Gusto/embedded-react-sdk/issues/2188)) ([890e155](https://github.com/Gusto/embedded-react-sdk/commit/890e15554306147ef042c5e753ef678ff81070c0))

### Chores & Maintenance

- add STANDALONE_PAGES routing to sdk-router (1/4) ([#2172](https://github.com/Gusto/embedded-react-sdk/issues/2172)) ([0442494](https://github.com/Gusto/embedded-react-sdk/commit/044249425647ccda5d3b1cc322262e163cc000f1))
- **deps-dev:** bump @storybook/react-vite from 10.4.4 to 10.4.6 ([#2185](https://github.com/Gusto/embedded-react-sdk/issues/2185)) ([6611fdc](https://github.com/Gusto/embedded-react-sdk/commit/6611fdc06e89c1e01f3029dbbe9310a1abfd5bff))
- **deps-dev:** bump @typescript-eslint/parser from 8.61.0 to 8.61.1 ([#2182](https://github.com/Gusto/embedded-react-sdk/issues/2182)) ([bd19b5f](https://github.com/Gusto/embedded-react-sdk/commit/bd19b5f89359252d92ffd5785e7ada92a093e880))
- **deps-dev:** bump @vitest/coverage-v8 from 4.1.8 to 4.1.9 ([#2183](https://github.com/Gusto/embedded-react-sdk/issues/2183)) ([e2174fa](https://github.com/Gusto/embedded-react-sdk/commit/e2174fa840b332f9bed3d10837e936e272f950ea))
- **deps-dev:** bump vitest from 4.1.8 to 4.1.9 ([#2184](https://github.com/Gusto/embedded-react-sdk/issues/2184)) ([0d1acf7](https://github.com/Gusto/embedded-react-sdk/commit/0d1acf744b7386cefa186825f74794170ee65fe7))
- **DocumentList:** unify empty and error states via EmptyData ([#2190](https://github.com/Gusto/embedded-react-sdk/issues/2190)) ([6324058](https://github.com/Gusto/embedded-react-sdk/commit/6324058d200a1b2a799dd59026743a454be847fa))
- export utility types, add TSDoc [@group](https://github.com/group) tags (2/4) ([#2173](https://github.com/Gusto/embedded-react-sdk/issues/2173)) ([75c3668](https://github.com/Gusto/embedded-react-sdk/commit/75c36685d8f562c4d270bc279a3115efba53e7b3))
- **tsdoc-backfill:** backfill Payroll ([#2181](https://github.com/Gusto/embedded-react-sdk/issues/2181)) ([32f226e](https://github.com/Gusto/embedded-react-sdk/commit/32f226e3f8284320dcf78f64d32bc492dc9579cb))
- **tsdoc-backfill:** backfill TimeOff ([#2179](https://github.com/Gusto/embedded-react-sdk/issues/2179)) ([e6d2c2b](https://github.com/Gusto/embedded-react-sdk/commit/e6d2c2b76d8041137346c4d675cc17dc85b366fa))

## [0.48.1](https://github.com/Gusto/embedded-react-sdk/compare/v0.48.0...v0.48.1) (2026-06-16)

### Fixes

- `Form` no longer enables native browser validation by default, so field-level validation and error messaging render consistently across browsers ([#2168](https://github.com/Gusto/embedded-react-sdk/issues/2168))
- `EmptyData` no longer falls back to a magnifying-glass illustration when none is provided ([#2169](https://github.com/Gusto/embedded-react-sdk/issues/2169))

### Chores & Maintenance

- Bump dev dependencies (`@playwright/test`, `@storybook/addon-a11y`, `@storybook/addon-docs`, `typescript-eslint`) and override transitive dependencies (`esbuild`, `js-yaml`, `markdown-it`, `uuid`, `@babel/core`) to clear security advisories ([#2155](https://github.com/Gusto/embedded-react-sdk/issues/2155), [#2152](https://github.com/Gusto/embedded-react-sdk/issues/2152), [#2154](https://github.com/Gusto/embedded-react-sdk/issues/2154), [#2153](https://github.com/Gusto/embedded-react-sdk/issues/2153), [#2156](https://github.com/Gusto/embedded-react-sdk/issues/2156), [#2157](https://github.com/Gusto/embedded-react-sdk/issues/2157), [#2159](https://github.com/Gusto/embedded-react-sdk/issues/2159), [#2162](https://github.com/Gusto/embedded-react-sdk/issues/2162), [#2163](https://github.com/Gusto/embedded-react-sdk/issues/2163), [#2166](https://github.com/Gusto/embedded-react-sdk/issues/2166))

## [0.48.0](https://github.com/Gusto/embedded-react-sdk/compare/v0.47.1...v0.48.0) (2026-06-15)

### Breaking Changes

#### Removed deprecated namespace exports: `Company`, `Employee`, `Contractor`, `GustoApiProvider` ([#2120](https://github.com/Gusto/embedded-react-sdk/issues/2120))

These umbrella exports have been removed in favor of the journey-based namespaces.

**`GustoApiProvider` → `GustoProvider`** (an alias since 0.8.0)

```tsx
// Before
import { GustoApiProvider } from '@gusto/embedded-react-sdk'
;<GustoApiProvider {...props} />

// After
import { GustoProvider } from '@gusto/embedded-react-sdk'
;<GustoProvider {...props} />
```

**`Company` → `CompanyOnboarding`**

```tsx
// Before
import { Company } from '@gusto/embedded-react-sdk'
;<Company.OnboardingFlow {...props} />

// After
import { CompanyOnboarding } from '@gusto/embedded-react-sdk'
;<CompanyOnboarding.OnboardingFlow {...props} />
```

**`Employee` → `EmployeeOnboarding` / `EmployeeManagement`**

Onboarding components live in `EmployeeOnboarding`; post-hire management components live in `EmployeeManagement`. Tax and address components exist in both namespaces — pick the one that matches your surface.

```tsx
// Before
import { Employee } from '@gusto/embedded-react-sdk'
;<Employee.Profile {...props} />
;<Employee.FederalTaxes {...props} />

// After
import { EmployeeOnboarding, EmployeeManagement } from '@gusto/embedded-react-sdk'
;<EmployeeManagement.Profile {...props} />
;<EmployeeOnboarding.FederalTaxes {...props} />
```

**`Contractor` → `ContractorOnboarding` / `ContractorManagement`**

Onboarding components (`OnboardingFlow`, `ContractorList`, `ContractorProfile`, `Address`, `PaymentMethod`, `NewHireReport`, `ContractorSubmit`) live in `ContractorOnboarding`. Payment components (`PaymentFlow`, `PaymentsList`, `CreatePayment`, `PaymentHistory`, `PaymentSummary`, `PaymentStatement`) live in the new `ContractorManagement` namespace.

```tsx
// Before
import { Contractor } from '@gusto/embedded-react-sdk'
;<Contractor.OnboardingFlow {...props} />
;<Contractor.PaymentFlow {...props} />

// After
import { ContractorOnboarding, ContractorManagement } from '@gusto/embedded-react-sdk'
;<ContractorOnboarding.OnboardingFlow {...props} />
;<ContractorManagement.PaymentFlow {...props} />
```

#### Removed deprecated `Employee.Taxes` component and `EMPLOYEE_TAXES_DONE` event ([#2098](https://github.com/Gusto/embedded-react-sdk/issues/2098))

Tax collection was split into separate federal and state components. The combined `Employee.Taxes` component, its i18n namespace, and the `EMPLOYEE_TAXES_DONE` event have been removed. The two components are now separate routing steps — `FederalTaxes` emits `EMPLOYEE_FEDERAL_TAXES_DONE`, and `StateTaxes` emits `EMPLOYEE_STATE_TAXES_DONE` when complete.

```tsx
// Before
import { Employee } from '@gusto/embedded-react-sdk'
;<Employee.Taxes employeeId={employeeId} onEvent={onEvent} />

// After
import { EmployeeOnboarding } from '@gusto/embedded-react-sdk'
;<EmployeeOnboarding.FederalTaxes employeeId={employeeId} onEvent={onEvent} />
;<EmployeeOnboarding.StateTaxes employeeId={employeeId} onEvent={onEvent} />
```

`EMPLOYEE_TAXES_DONE` → `EMPLOYEE_FEDERAL_TAXES_DONE` + `EMPLOYEE_STATE_TAXES_DONE`:

```tsx
// Before
if (event.eventType === componentEvents.EMPLOYEE_TAXES_DONE) {
  navigate('/next_step')
}

// After
if (event.eventType === componentEvents.EMPLOYEE_FEDERAL_TAXES_DONE) {
  navigate('/state_taxes')
}
// in the StateTaxes onEvent handler:
if (event.eventType === componentEvents.EMPLOYEE_STATE_TAXES_DONE) {
  navigate('/next_step')
}
```

#### `TimeOff.PolicySettings` is now the data-connected component ([#2119](https://github.com/Gusto/embedded-react-sdk/issues/2119))

`TimeOff.PolicySettings` now refers to the data-connected component, whose props are `{ policyId, mode?, onEvent }` (`PolicySettingsProps`). The presentational component is now exported as `TimeOff.PolicySettingsPresentation` with `PolicySettingsPresentationProps`.

```tsx
// Before — TimeOff.PolicySettings was the presentational component
import { TimeOff, type PolicySettingsProps } from '@gusto/embedded-react-sdk'
;<TimeOff.PolicySettings {...presentationalProps} />

// After — the presentational component is renamed
import { TimeOff, type PolicySettingsPresentationProps } from '@gusto/embedded-react-sdk'
;<TimeOff.PolicySettingsPresentation {...presentationalProps} />

// TimeOff.PolicySettings now fetches its own data
;<TimeOff.PolicySettings policyId={policyId} onEvent={onEvent} />
```

### Features & Enhancements

- Export the `useEmployeeList` hook for fetching and paginating a company's employees ([#2092](https://github.com/Gusto/embedded-react-sdk/issues/2092))
- **TimeOff:** Export the data-connected `TimeOff.PolicySettings` and `TimeOff.TimeOffPolicyDetail` blocks, each rendering and fetching from just `policyId` + `onEvent` ([#2119](https://github.com/Gusto/embedded-react-sdk/issues/2119))
- **Payroll:** Export the `DismissalPayPeriodSelection` block ([#2115](https://github.com/Gusto/embedded-react-sdk/issues/2115))
- **Employee:** Surface `PayrollOption` on the `EmployeeManagement` namespace ([#2117](https://github.com/Gusto/embedded-react-sdk/issues/2117))
- Render payroll reimbursements in a `DataView` with an empty-state CTA ([#2135](https://github.com/Gusto/embedded-react-sdk/issues/2135))

### Chores & Maintenance

- Bump `dompurify` (3.4.8 → 3.4.10) ([#2096](https://github.com/Gusto/embedded-react-sdk/issues/2096), [#2124](https://github.com/Gusto/embedded-react-sdk/issues/2124))
- Bump `react-hook-form` (7.78.0 → 7.79.0) ([#2125](https://github.com/Gusto/embedded-react-sdk/issues/2125))
- Bump dev and tooling dependencies (`storybook`, `@storybook/*`, `eslint-plugin-storybook`, `prettier`, `@types/react`, `@microsoft/api-extractor`, `axe-core`, `form-data`)

## [0.47.1](https://github.com/Gusto/embedded-react-sdk/compare/v0.47.0...v0.47.1) (2026-06-09)

### Features & Enhancements

- add create-design-prototype skill ([#2062](https://github.com/Gusto/embedded-react-sdk/issues/2062)) ([6618bfe](https://github.com/Gusto/embedded-react-sdk/commit/6618bfe44a1422706ad251c1674f09c0b546f368))
- re-export onboarding status constants from public entry ([#2080](https://github.com/Gusto/embedded-react-sdk/issues/2080)) ([64edd32](https://github.com/Gusto/embedded-react-sdk/commit/64edd323f2703a58bf58e61404cf2051c4c6caa6))

### Fixes

- tighten federal taxes form field spacing ([#2063](https://github.com/Gusto/embedded-react-sdk/issues/2063)) ([8644bee](https://github.com/Gusto/embedded-react-sdk/commit/8644bee5d7be93f472201f1066147b6490c1bf3c))

### Chores & Maintenance

- **deps-dev:** bump @microsoft/api-extractor from 7.58.7 to 7.58.8 ([#2070](https://github.com/Gusto/embedded-react-sdk/issues/2070)) ([e8153e5](https://github.com/Gusto/embedded-react-sdk/commit/e8153e53fb8597be925e35ccf90f9332b4c71fa8))
- **deps-dev:** bump @storybook/addon-docs from 10.4.1 to 10.4.2 ([#2071](https://github.com/Gusto/embedded-react-sdk/issues/2071)) ([1321422](https://github.com/Gusto/embedded-react-sdk/commit/132142240b23631601bc5da9edb6157fafa903fe))
- **deps-dev:** bump @typescript-eslint/rule-tester from 8.60.1 to 8.61.0 ([#2074](https://github.com/Gusto/embedded-react-sdk/issues/2074)) ([5ea4631](https://github.com/Gusto/embedded-react-sdk/commit/5ea463124eca514a514a44845d4583c1896daa06))
- **deps-dev:** bump @typescript-eslint/utils from 8.60.1 to 8.61.0 ([#2072](https://github.com/Gusto/embedded-react-sdk/issues/2072)) ([69080d8](https://github.com/Gusto/embedded-react-sdk/commit/69080d883513c5485883635ac39df957d3ce2d43))
- **deps-dev:** bump shell-quote from 1.8.3 to 1.8.4 in the npm_and_yarn group across 1 directory ([#2075](https://github.com/Gusto/embedded-react-sdk/issues/2075)) ([d8b3a5b](https://github.com/Gusto/embedded-react-sdk/commit/d8b3a5bc12ba829664f58a6e2aaad209ac27e042))
- **deps-dev:** bump typescript-eslint from 8.60.1 to 8.61.0 ([#2073](https://github.com/Gusto/embedded-react-sdk/issues/2073)) ([0f58397](https://github.com/Gusto/embedded-react-sdk/commit/0f58397965ecbceb74cc4785d2ea415ce0c42f73))
- move EmployeeDocuments export from EmployeeManagement to EmployeeOnboarding ([#2065](https://github.com/Gusto/embedded-react-sdk/issues/2065)) ([d07bd90](https://github.com/Gusto/embedded-react-sdk/commit/d07bd90b8d5e120d540d7e22a30d3717011b2ad0))
- **SDK-1010:** backfill phase 5 ([#2061](https://github.com/Gusto/embedded-react-sdk/issues/2061)) ([2a02b30](https://github.com/Gusto/embedded-react-sdk/commit/2a02b30597c37f846576a617330f7e84f7273909))
- **SDK-1011:** backfill phase 6 ([#2064](https://github.com/Gusto/embedded-react-sdk/issues/2064)) ([7d8a165](https://github.com/Gusto/embedded-react-sdk/commit/7d8a165f5656380f8fe9d0a088b704859b02939c))

## [0.47.0](https://github.com/Gusto/embedded-react-sdk/compare/v0.46.3...v0.47.0) (2026-06-08)

### Breaking Changes

- Compensation wage-label i18n keys were consolidated under a single source of truth. If you override compensation labels, update your translation overrides in the `Employee.Compensation` namespace ([#1984](https://github.com/Gusto/embedded-react-sdk/issues/1984)):

  ```diff
  - "Employee.Compensation.amount": "Compensation amount"
  - "Employee.Compensation.paymentUnitLabel": "Wage frequency"
  - "Employee.Compensation.management.wageLabel": "Wage"
  - "Employee.Compensation.management.wageFrequencyLabel": "Wage frequency"
  + "Employee.Compensation.wageLabel": "Wage"
  + "Employee.Compensation.wageFrequencyLabel": "Wage frequency"
  ```

  The Add and Management compensation forms now share these top-level `wageLabel` / `wageFrequencyLabel` keys (both display "Wage" instead of the former "Compensation amount").

### Features & Enhancements

- Extract every `DashboardFlow` card into a standalone, independently-consumable management block — `Profile`, `HomeAddress`, `WorkAddress`, `Compensation`, `Deductions`, `Documents`, `Paystubs`, `PaymentMethod`, and `Federal`/`State` taxes — so each can be embedded on its own ([#1976](https://github.com/Gusto/embedded-react-sdk/issues/1976), [#1992](https://github.com/Gusto/embedded-react-sdk/issues/1992), [#2007](https://github.com/Gusto/embedded-react-sdk/issues/2007), [#2036](https://github.com/Gusto/embedded-react-sdk/issues/2036), [#2008](https://github.com/Gusto/embedded-react-sdk/issues/2008), [#2030](https://github.com/Gusto/embedded-react-sdk/issues/2030), [#2011](https://github.com/Gusto/embedded-react-sdk/issues/2011), [#2006](https://github.com/Gusto/embedded-react-sdk/issues/2006), [#2022](https://github.com/Gusto/embedded-react-sdk/issues/2022), [#2021](https://github.com/Gusto/embedded-react-sdk/issues/2021))
- Add `OnboardingExecutionFlow` and skip the redundant employee list in `EmployeeListFlow` ([#1990](https://github.com/Gusto/embedded-react-sdk/issues/1990))
- Surface FLSA-aware alerts in compensation forms — commission-only federal-minimum-pay and minimum-wage warnings, plus an owner reasonable-salary reminder — via new `useCompensationForm` `status` flags (`showCommissionFederalMinimumPayAlert`, `showCommissionMinimumWageAlert`, `showOwnerSalaryAlert`). Wage and wage-frequency inputs are hidden for commission-only statuses ([#1984](https://github.com/Gusto/embedded-react-sdk/issues/1984))
- `PayrollList`: disable Run Payroll on regular rows while transition payrolls are pending ([#1989](https://github.com/Gusto/embedded-react-sdk/issues/1989))

### Fixes

- Surface home address submit errors inside the edit/create modal instead of at the page level ([#1993](https://github.com/Gusto/embedded-react-sdk/issues/1993))
- Pin the Current home address card to the active row ([#1985](https://github.com/Gusto/embedded-react-sdk/issues/1985))
- Show deduction cap fields consistently across the create and edit forms ([#1997](https://github.com/Gusto/embedded-react-sdk/issues/1997))
- Stop showing "0% per paycheck" for fixed-cap garnishments ([#1998](https://github.com/Gusto/embedded-react-sdk/issues/1998))
- Return to the dashboard after signing a document ([#1999](https://github.com/Gusto/embedded-react-sdk/issues/1999))
- Stop a failed PDF preview fetch from surfacing as a signing error ([#2032](https://github.com/Gusto/embedded-react-sdk/issues/2032))
- Align the onboarding compensation form layout and alert conditions with the management forms ([#2046](https://github.com/Gusto/embedded-react-sdk/issues/2046))
- Add clarifying copy to the remove-secondary-jobs warning ([#2005](https://github.com/Gusto/embedded-react-sdk/issues/2005))
- Remove the gap between tabs and table in the management employee list ([#2051](https://github.com/Gusto/embedded-react-sdk/issues/2051))

### Chores & Maintenance

- Upgrade to the `@gusto/embedded-api-v-2025-11-15` API package ([#1814](https://github.com/Gusto/embedded-react-sdk/issues/1814))
- Standardize management card loading with per-card Suspense boundaries and normalize `useCompensationManagement` return shape ([#2054](https://github.com/Gusto/embedded-react-sdk/issues/2054), [#2048](https://github.com/Gusto/embedded-react-sdk/issues/2048))
- Share PaymentMethod bank/split form bodies via an injected dictionary and give Profile/HomeAddress their own management i18n namespaces ([#2045](https://github.com/Gusto/embedded-react-sdk/issues/2045), [#2053](https://github.com/Gusto/embedded-react-sdk/issues/2053), [#2044](https://github.com/Gusto/embedded-react-sdk/issues/2044))
- Expand TSDoc coverage across models, internal hooks, and PaymentMethod docs ([#2043](https://github.com/Gusto/embedded-react-sdk/issues/2043))
- Bump dependencies (`react-hook-form`, `i18next`, `dompurify`, `vite`, `react-router-dom`, `typescript-eslint`, `@storybook/*`, `fuse.js`, `axe-core`, and others)

## [0.46.3](https://github.com/Gusto/embedded-react-sdk/compare/v0.46.2...v0.46.3) (2026-06-01)

### Features & Enhancements

- allow searching by department in add-employee tables (SDK-892) ([#1959](https://github.com/Gusto/embedded-react-sdk/issues/1959)) ([e610081](https://github.com/Gusto/embedded-react-sdk/commit/e61008103c4a7ab7317086704b3cc61fb9c8b584))
- **e2e:** reliability hardening — provisioning, loading waits, retries ([#1914](https://github.com/Gusto/embedded-react-sdk/issues/1914)) ([7356c6b](https://github.com/Gusto/embedded-react-sdk/commit/7356c6b94884312ed6a5bac25a6b2edf446a6291)), closes [employeeFlowDrivers#landOnEmployeeOnboardingHome](https://github.com/Gusto/employeeFlowDrivers/issues/landOnEmployeeOnboardingHome) [contractorFlowDrivers#reviewAndSubmitPayment](https://github.com/Gusto/contractorFlowDrivers/issues/reviewAndSubmitPayment) [payrollFlowDrivers#terminateAndRunDismissalPayroll](https://github.com/Gusto/payrollFlowDrivers/issues/terminateAndRunDismissalPayroll) [employeeFlowDrivers#runEmployeeTermination](https://github.com/Gusto/employeeFlowDrivers/issues/runEmployeeTermination) [#1](https://github.com/Gusto/embedded-react-sdk/issues/1) [#4](https://github.com/Gusto/embedded-react-sdk/issues/4) [#2](https://github.com/Gusto/embedded-react-sdk/issues/2) [#5](https://github.com/Gusto/embedded-react-sdk/issues/5)

### Fixes

- align wage frequency option copy between add and edit forms (SDK-974) ([#1957](https://github.com/Gusto/embedded-react-sdk/issues/1957)) ([c49aa0e](https://github.com/Gusto/embedded-react-sdk/commit/c49aa0ef298a2571395ba8bf5dfb48d4d7d9f7ee))
- always show reassignment warning on time off add employees view ([#1960](https://github.com/Gusto/embedded-react-sdk/issues/1960)) ([0d222f9](https://github.com/Gusto/embedded-react-sdk/commit/0d222f97c6925584bb31c56a9d8299131eb6aac7))
- clear stale compensation field errors when FLSA change disables them ([#1965](https://github.com/Gusto/embedded-react-sdk/issues/1965)) ([16cb010](https://github.com/Gusto/embedded-react-sdk/commit/16cb01048f4fff11ff9f92bc50628a20b3bd0ab0))
- **Dashboard:** close review modal when all pending changes are cancelled ([#1937](https://github.com/Gusto/embedded-react-sdk/issues/1937)) ([52edc54](https://github.com/Gusto/embedded-react-sdk/commit/52edc540e99a8ff128c363293e4b1b9613cad5c1))
- **dashboard:** show compensation.title (not job.title) on job & pay row ([#1975](https://github.com/Gusto/embedded-react-sdk/issues/1975)) ([aaaff5a](https://github.com/Gusto/embedded-react-sdk/commit/aaaff5afbce1eac97997fdd6f4439b4266d6ad4f))
- hide compensation Edit while a pending update exists (SDK-975) ([#1956](https://github.com/Gusto/embedded-react-sdk/issues/1956)) ([5e4bc87](https://github.com/Gusto/embedded-react-sdk/commit/5e4bc87a2dc31430a8091fee80256f7de15dc275))
- increase default pagination for add-employee flows (SDK-889) ([#1947](https://github.com/Gusto/embedded-react-sdk/issues/1947)) ([44d0540](https://github.com/Gusto/embedded-react-sdk/commit/44d0540b1bd67bcaf687a8b79a7bad8da45a1786))
- remove confirmation dialog from add employees view (SDK-977) ([#1958](https://github.com/Gusto/embedded-react-sdk/issues/1958)) ([c4dde85](https://github.com/Gusto/embedded-react-sdk/commit/c4dde85651669d5f83ecba051e005a893feb8a19))
- remove Flex container from job cell in employee dashboard ([#1961](https://github.com/Gusto/embedded-react-sdk/issues/1961)) ([c736551](https://github.com/Gusto/embedded-react-sdk/commit/c736551521644f67e45e3596bd2eabc3c4bc968e))
- remove Text wrapper from time off balance cell ([#1962](https://github.com/Gusto/embedded-react-sdk/issues/1962)) ([2c69e69](https://github.com/Gusto/embedded-react-sdk/commit/2c69e697daf699105d73e848a74db855a2360e08))
- render employee steady-state details with DescriptionList ([#1964](https://github.com/Gusto/embedded-react-sdk/issues/1964)) ([2e297db](https://github.com/Gusto/embedded-react-sdk/commit/2e297dbd381a11ddaad962dfad6a11d3d60608ac))
- **SDK-927:** require Start date in home address creation modal ([#1935](https://github.com/Gusto/embedded-react-sdk/issues/1935)) ([5d2be6c](https://github.com/Gusto/embedded-react-sdk/commit/5d2be6c9034f7f14aca39f0928a1fb156469d7a6))
- **SDK-928:** reset home address form state when closing the modal ([#1938](https://github.com/Gusto/embedded-react-sdk/issues/1938)) ([50f474d](https://github.com/Gusto/embedded-react-sdk/commit/50f474d434c40967732ec18d536e0055356b9820))
- **SDK-929:** keep home address modal open on invalid Save ([#1936](https://github.com/Gusto/embedded-react-sdk/issues/1936)) ([9dd04b4](https://github.com/Gusto/embedded-react-sdk/commit/9dd04b4ac8239e5cbf32a707bb59b0132b6b9518))
- **SDK-933:** track agency-required garnishment fields dynamically ([#1950](https://github.com/Gusto/embedded-react-sdk/issues/1950)) ([df6013c](https://github.com/Gusto/embedded-react-sdk/commit/df6013c30966bc1a3ae731e8923f3db5141794aa))
- **SDK-934:** stop double-encoding interpolated values in work address banner ([#1953](https://github.com/Gusto/embedded-react-sdk/issues/1953)) ([478d597](https://github.com/Gusto/embedded-react-sdk/commit/478d597907fd8d4d12fae28e2775e48b9082d8a2)), closes [#39](https://github.com/Gusto/embedded-react-sdk/issues/39)
- **SDK-935:** expose Start date in the home address Edit modal ([#1982](https://github.com/Gusto/embedded-react-sdk/issues/1982)) ([eab07d8](https://github.com/Gusto/embedded-react-sdk/commit/eab07d8d0e93a39fbab1c001130c802a0f8dde65))
- **SDK-936:** edit just-created home/work address without page-level loading ([#1939](https://github.com/Gusto/embedded-react-sdk/issues/1939)) ([64de9c8](https://github.com/Gusto/embedded-react-sdk/commit/64de9c8631169daf3ea1fb993ec8109d6601c8dc))
- **SDK-937:** switch Amount helper text when toggling Percentage / Fixed ([#1973](https://github.com/Gusto/embedded-react-sdk/issues/1973)) ([77602a7](https://github.com/Gusto/embedded-react-sdk/commit/77602a7e9374605127634670c2ecb06364c6ffab))
- **SDK-938:** show a format-specific message for invalid account numbers ([#1951](https://github.com/Gusto/embedded-react-sdk/issues/1951)) ([38a8db5](https://github.com/Gusto/embedded-react-sdk/commit/38a8db55eed510270aaeb1ea07c17a8a9686eea8))
- **SDK-940:** make Documents tab forms table flush with its container ([#1952](https://github.com/Gusto/embedded-react-sdk/issues/1952)) ([13c3a5f](https://github.com/Gusto/embedded-react-sdk/commit/13c3a5fa46bb5ccc3335447a90a1d25d38d29734))
- **SDK-942:** handle no-income-tax states in State taxes card and edit form ([#1954](https://github.com/Gusto/embedded-react-sdk/issues/1954)) ([aab92b3](https://github.com/Gusto/embedded-react-sdk/commit/aab92b312d738a20a39480fbf792ff6abc79aab5))
- **SDK-946:** remount DocumentViewer embed when the PDF url changes ([#1955](https://github.com/Gusto/embedded-react-sdk/issues/1955)) ([5222623](https://github.com/Gusto/embedded-react-sdk/commit/5222623df12c67bf24578cc771cfd9ee38528af6))
- **SDK-948:** hide PDF viewer black-flash behind page background ([#1974](https://github.com/Gusto/embedded-react-sdk/issues/1974)) ([6368a06](https://github.com/Gusto/embedded-react-sdk/commit/6368a060dfa044f4ad38a5e0f235f63ed4baf39e))
- **SDK-949:** select existing value when a NumberInput is focused ([#1971](https://github.com/Gusto/embedded-react-sdk/issues/1971)) ([77d7e08](https://github.com/Gusto/embedded-react-sdk/commit/77d7e0878ed2f815c91d95739b8be469f19d251f))
- **SDK-978:** preserve secondary compensation effective_date when primary hire_date changes ([#1972](https://github.com/Gusto/embedded-react-sdk/issues/1972)) ([38642f6](https://github.com/Gusto/embedded-react-sdk/commit/38642f67e3fe7d79a91e5404fa4b629d3b9853d2))
- use max-width to constrain starting balance input width (SDK-893) ([#1949](https://github.com/Gusto/embedded-react-sdk/issues/1949)) ([347aba5](https://github.com/Gusto/embedded-react-sdk/commit/347aba509d8118bef73b927421cfcd568a801821))

### Chores & Maintenance

- colorize ASCII art banners with Gusto coral ([#1966](https://github.com/Gusto/embedded-react-sdk/issues/1966)) ([e593d2c](https://github.com/Gusto/embedded-react-sdk/commit/e593d2c6e81d07aa7ebc6d27ff40bef759886fad)), closes [#F45D48](https://github.com/Gusto/embedded-react-sdk/issues/F45D48)
- **deps-dev:** bump @commitlint/config-conventional from 21.0.1 to 21.0.2 ([#1978](https://github.com/Gusto/embedded-react-sdk/issues/1978)) ([2f53edc](https://github.com/Gusto/embedded-react-sdk/commit/2f53edc90e9bae3fcc7f8c0f4e2bc209f23af6bc))
- **deps-dev:** bump @release-it/conventional-changelog from 11.0.0 to 11.0.1 ([#1979](https://github.com/Gusto/embedded-react-sdk/issues/1979)) ([7b7ae8f](https://github.com/Gusto/embedded-react-sdk/commit/7b7ae8fe79e1eef046248c71c05ef4ac62865eff))
- **deps-dev:** bump @storybook/addon-a11y from 10.4.0 to 10.4.1 ([#1931](https://github.com/Gusto/embedded-react-sdk/issues/1931)) ([3962ee5](https://github.com/Gusto/embedded-react-sdk/commit/3962ee543949d7f3dbdde71c6955e208f2bf87f6))
- **deps-dev:** bump @storybook/addon-docs from 10.4.0 to 10.4.1 ([#1927](https://github.com/Gusto/embedded-react-sdk/issues/1927)) ([90b9e7e](https://github.com/Gusto/embedded-react-sdk/commit/90b9e7e45fdaf054b5b92755ff110366af090a9d))
- **deps-dev:** bump @storybook/addon-onboarding from 10.4.0 to 10.4.1 ([#1925](https://github.com/Gusto/embedded-react-sdk/issues/1925)) ([dbdc532](https://github.com/Gusto/embedded-react-sdk/commit/dbdc532a3399e6e39b1390912fb2a32e3bd0c169))
- **deps-dev:** bump @storybook/react-vite from 10.4.0 to 10.4.1 ([#1929](https://github.com/Gusto/embedded-react-sdk/issues/1929)) ([465768d](https://github.com/Gusto/embedded-react-sdk/commit/465768d18e23431f4733816b6713960c7a9aeea2))
- **deps-dev:** bump eslint-plugin-storybook from 10.4.0 to 10.4.1 ([#1932](https://github.com/Gusto/embedded-react-sdk/issues/1932)) ([561bcca](https://github.com/Gusto/embedded-react-sdk/commit/561bcca6851723c6032e4fcea193c2ee7d6e73ff))
- **deps-dev:** bump lint-staged from 17.0.5 to 17.0.7 ([#1981](https://github.com/Gusto/embedded-react-sdk/issues/1981)) ([0e01c04](https://github.com/Gusto/embedded-react-sdk/commit/0e01c04c36a75498cfa86c5548de1abbbd02c2d4))
- **deps-dev:** bump react-router-dom from 7.15.1 to 7.16.0 ([#1970](https://github.com/Gusto/embedded-react-sdk/issues/1970)) ([6312d9d](https://github.com/Gusto/embedded-react-sdk/commit/6312d9d985c036da25e4bc73017def7aacabdcc8))
- **deps-dev:** bump release-it from 20.0.1 to 20.2.0 ([#1977](https://github.com/Gusto/embedded-react-sdk/issues/1977)) ([1349ea6](https://github.com/Gusto/embedded-react-sdk/commit/1349ea679b8720333d72364555e83e8a08eb3081))
- **deps-dev:** bump sass-embedded from 1.99.0 to 1.100.0 ([#1912](https://github.com/Gusto/embedded-react-sdk/issues/1912)) ([b60e3f9](https://github.com/Gusto/embedded-react-sdk/commit/b60e3f98091eed5002984fd3384f8443bc3474d8))
- **deps-dev:** bump typescript-eslint from 8.59.4 to 8.60.0 ([#1930](https://github.com/Gusto/embedded-react-sdk/issues/1930)) ([4fd978d](https://github.com/Gusto/embedded-react-sdk/commit/4fd978df43e0f2c844ef28c476f89f431614ddc5))
- **deps-dev:** bump vite-plugin-checker from 0.13.0 to 0.14.1 ([#1945](https://github.com/Gusto/embedded-react-sdk/issues/1945)) ([89eda8a](https://github.com/Gusto/embedded-react-sdk/commit/89eda8ac14d4a8274c21e69011d9a2e10f3d9cb1))
- **deps:** bump @hookform/resolvers from 5.2.2 to 5.4.0 ([#1911](https://github.com/Gusto/embedded-react-sdk/issues/1911)) ([93fda39](https://github.com/Gusto/embedded-react-sdk/commit/93fda396e2cea94ca4d693bcf0f3e0f68c83d4fb))
- **deps:** bump @internationalized/date from 3.12.1 to 3.12.2 ([#1969](https://github.com/Gusto/embedded-react-sdk/issues/1969)) ([1c9a377](https://github.com/Gusto/embedded-react-sdk/commit/1c9a377098aecd6479a21b36821ffbc0fcbf39f8))
- **deps:** bump @internationalized/number from 3.6.6 to 3.6.7 ([#1968](https://github.com/Gusto/embedded-react-sdk/issues/1968)) ([82331bf](https://github.com/Gusto/embedded-react-sdk/commit/82331bf3af9144fe941475d6ff77acdbf7d542cb))
- **deps:** bump dompurify from 3.4.5 to 3.4.7 ([#1944](https://github.com/Gusto/embedded-react-sdk/issues/1944)) ([bf47a3c](https://github.com/Gusto/embedded-react-sdk/commit/bf47a3cd939eb265512a51467d8d1aeefb1afeee))
- **deps:** bump i18next from 26.2.0 to 26.3.0 ([#1946](https://github.com/Gusto/embedded-react-sdk/issues/1946)) ([8176319](https://github.com/Gusto/embedded-react-sdk/commit/81763196b355a43dcc53883be1f0792bc410ca03))
- **deps:** bump react-error-boundary from 6.1.1 to 6.1.2 ([#1926](https://github.com/Gusto/embedded-react-sdk/issues/1926)) ([8097fec](https://github.com/Gusto/embedded-react-sdk/commit/8097fecfd443d3d523e5ea3a9571c5c82ffac2e9))
- **deps:** bump react-hook-form from 7.76.0 to 7.76.1 ([#1928](https://github.com/Gusto/embedded-react-sdk/issues/1928)) ([e686f90](https://github.com/Gusto/embedded-react-sdk/commit/e686f90e5b3a36703055526ead5a0132cb925269))
- **lint:** re-enable trivially-clean strict typescript-eslint rules ([#1924](https://github.com/Gusto/embedded-react-sdk/issues/1924)) ([77900d5](https://github.com/Gusto/embedded-react-sdk/commit/77900d5771c70813c86a3b02c22ebbbbd96f1184))
- remove ReadMe docs publishing pipeline ([#1940](https://github.com/Gusto/embedded-react-sdk/issues/1940)) ([f4a4c99](https://github.com/Gusto/embedded-react-sdk/commit/f4a4c99fd171c539837afe0e2be6c04393f7c124))
- **SDK-899:** add RFC for autogenerated API docs ([#1942](https://github.com/Gusto/embedded-react-sdk/issues/1942)) ([1380f06](https://github.com/Gusto/embedded-react-sdk/commit/1380f069a894e88514ed28485057b9e1937a0e2d))
- **SDK-970:** install eslint-plugin-tsdoc to lint comment syntax ([#1963](https://github.com/Gusto/embedded-react-sdk/issues/1963)) ([85fd0f0](https://github.com/Gusto/embedded-react-sdk/commit/85fd0f07e2641b98c4b9afa7a506b7f55c5381c1))
- **SDK-970:** lint tsdoc coverage and quality ([#1967](https://github.com/Gusto/embedded-react-sdk/issues/1967)) ([7ff453d](https://github.com/Gusto/embedded-react-sdk/commit/7ff453dfffbd814b4cf343f4c39382742e5edc27))
- stand up Docusaurus site for ongoing docs work ([#1943](https://github.com/Gusto/embedded-react-sdk/issues/1943)) ([a659e82](https://github.com/Gusto/embedded-react-sdk/commit/a659e82f23450630618959fc77b54e3db75a80a9))

## [0.46.2](https://github.com/Gusto/embedded-react-sdk/compare/v0.46.0...v0.46.2) (2026-05-22)

### Features & Enhancements

- **compensation:** enforce effectiveDate floor via Zod schema with distinct error messages ([#1919](https://github.com/Gusto/embedded-react-sdk/issues/1919)) ([c1bfb2c](https://github.com/Gusto/embedded-react-sdk/commit/c1bfb2c796eb05d8ef70c75426dd80ad016b1e6c))
- **Dashboard:** fix pending compensation edit — route date field by job type ([#1909](https://github.com/Gusto/embedded-react-sdk/issues/1909)) ([362d94f](https://github.com/Gusto/embedded-react-sdk/commit/362d94f9d27e260f4492f1ea1241be31ceda8b04))
- **dashboard:** show Pending badge for future-dated compensations on job card and table ([#1897](https://github.com/Gusto/embedded-react-sdk/issues/1897)) ([41031b4](https://github.com/Gusto/embedded-react-sdk/commit/41031b48e45b4bf03ea69d0df51c6b59e29230f3))
- **Dashboard:** wire add-job and add-another-job compensation forms ([#1898](https://github.com/Gusto/embedded-react-sdk/issues/1898)) ([bd0ecff](https://github.com/Gusto/embedded-react-sdk/commit/bd0ecff3b3752b2ce6fd1780df55976f31d24cff))
- **SDK-517:** add EmployeeListFlow for management employee navigation ([#1921](https://github.com/Gusto/embedded-react-sdk/issues/1921)) ([3304000](https://github.com/Gusto/embedded-react-sdk/commit/330400023966c5b4b641f1d2a65b043acf6f123e))

### Fixes

- always show Create Policy button in page header ([#1905](https://github.com/Gusto/embedded-react-sdk/issues/1905)) ([962b8a4](https://github.com/Gusto/embedded-react-sdk/commit/962b8a4a88f31d087fd48e0c9a4b341c8c316b03))
- block switching between unlimited and accrual-based time off policy types ([#1900](https://github.com/Gusto/embedded-react-sdk/issues/1900)) ([b3e737b](https://github.com/Gusto/embedded-react-sdk/commit/b3e737b08a700fdb9426b7b33577fd98b69a6f8a))
- clarify policy deletion error when pending requests exist ([#1906](https://github.com/Gusto/embedded-react-sdk/issues/1906)) ([d4cdb8a](https://github.com/Gusto/embedded-react-sdk/commit/d4cdb8ac81cb23f9141a60e7b0d531c74b2d2693))
- close remove-employee modal on error and clear stale errors in balance modal ([#1899](https://github.com/Gusto/embedded-react-sdk/issues/1899)) ([0987443](https://github.com/Gusto/embedded-react-sdk/commit/0987443147881b074a2c224e150e0bbeaf364e21))
- **Dashboard:** show pending compensation changes including title ([#1908](https://github.com/Gusto/embedded-react-sdk/issues/1908)) ([420e8e3](https://github.com/Gusto/embedded-react-sdk/commit/420e8e3956a50aedc1fa039284b3594525368c8a))
- **Dashboard:** unblock paystub download — drop noopener and defer blob URL revoke ([#1915](https://github.com/Gusto/embedded-react-sdk/issues/1915)) ([507bb47](https://github.com/Gusto/embedded-react-sdk/commit/507bb47812d915c19fe5163746d9e05af15ff0c2))
- **Deductions:** await column header render before asserting in DeductionsList test ([#1910](https://github.com/Gusto/embedded-react-sdk/issues/1910)) ([3f005ad](https://github.com/Gusto/embedded-react-sdk/commit/3f005adb802af1b73b8e7c33b8a4d1756d823706))
- fall back to first job title when no primary job is flagged ([#1902](https://github.com/Gusto/embedded-react-sdk/issues/1902)) ([729dbdb](https://github.com/Gusto/embedded-react-sdk/commit/729dbdb214020fdaba0b94f6f4e6f729e4e11e70))
- hide assigned employees from time-off add list (SDK-894) ([#1843](https://github.com/Gusto/embedded-react-sdk/issues/1843)) ([acb6194](https://github.com/Gusto/embedded-react-sdk/commit/acb6194e164df578bd23e946b7ccb58c92080134)), closes [#1887](https://github.com/Gusto/embedded-react-sdk/issues/1887) [#1849](https://github.com/Gusto/embedded-react-sdk/issues/1849)
- preserve carry-over balances when adding employees to policy ([#1907](https://github.com/Gusto/embedded-react-sdk/issues/1907)) ([094a9fc](https://github.com/Gusto/embedded-react-sdk/commit/094a9fc587716efb09a4ec8ed42e4275eb060f9a))
- preserve date picker state when switching back from unlimited ([#1904](https://github.com/Gusto/embedded-react-sdk/issues/1904)) ([fa9e0b0](https://github.com/Gusto/embedded-react-sdk/commit/fa9e0b08cc978da58357a699ef38cf46ce152ac1))
- provide descriptive error when balance update exceeds policy max ([#1903](https://github.com/Gusto/embedded-react-sdk/issues/1903)) ([88af535](https://github.com/Gusto/embedded-react-sdk/commit/88af535ff68c613301f0afb0aa1db66889f08db9))
- route holiday Add Employees back button to policy detail ([#1918](https://github.com/Gusto/embedded-react-sdk/issues/1918)) ([1db88fd](https://github.com/Gusto/embedded-react-sdk/commit/1db88fd17f0d272f0aa45d179ddab166df7cd29a))
- use fresh compensation version from job PUT response in EditPendingCompensation ([#1920](https://github.com/Gusto/embedded-react-sdk/issues/1920)) ([9de8a5b](https://github.com/Gusto/embedded-react-sdk/commit/9de8a5bb403ecefbe585f62ea61f89209cd0186e))

### Chores & Maintenance

- release 0.46.1 ([#1916](https://github.com/Gusto/embedded-react-sdk/issues/1916)) ([3acabc3](https://github.com/Gusto/embedded-react-sdk/commit/3acabc3bcbae06c36fdd38a36bd6a675c7967c77))

## [0.46.1](https://github.com/Gusto/embedded-react-sdk/compare/v0.46.0...v0.46.1) (2026-05-22)

### Features & Enhancements

- Route the date field by job type when editing a pending compensation on the Employee Dashboard ([#1909](https://github.com/Gusto/embedded-react-sdk/issues/1909))
- Show a "Pending" badge on the Employee Dashboard job card and jobs table for compensations with a future effective date ([#1897](https://github.com/Gusto/embedded-react-sdk/issues/1897))
- Wire up the add-job and add-another-job compensation forms in the Employee Dashboard ([#1898](https://github.com/Gusto/embedded-react-sdk/issues/1898))

### Fixes

- Fix paystub download from the Employee Dashboard Job and Pay tab — the new tab no longer stays blank ([#1915](https://github.com/Gusto/embedded-react-sdk/issues/1915))
- Show the job title in pending compensation change alerts on the Employee Dashboard ([#1908](https://github.com/Gusto/embedded-react-sdk/issues/1908))
- Fall back to the first job's title when no primary job is flagged ([#1902](https://github.com/Gusto/embedded-react-sdk/issues/1902))
- Always show the Create Policy button in the time-off policy page header ([#1905](https://github.com/Gusto/embedded-react-sdk/issues/1905))
- Hide already-assigned employees from the time-off policy add-employees list ([#1843](https://github.com/Gusto/embedded-react-sdk/issues/1843))
- Preserve the date picker selection when switching the time-off policy balance back from unlimited ([#1904](https://github.com/Gusto/embedded-react-sdk/issues/1904))
- Show a descriptive error when a time-off balance update exceeds the policy maximum ([#1903](https://github.com/Gusto/embedded-react-sdk/issues/1903))
- Close the remove-employee modal on error and clear stale errors in the balance modal ([#1899](https://github.com/Gusto/embedded-react-sdk/issues/1899))

## [0.46.0](https://github.com/Gusto/embedded-react-sdk/compare/v0.45.0...v0.46.0) (2026-05-21)

### Features & Enhancements

- Add `EditCompensation` block for steady-state compensation edits from the Employee Dashboard ([#1861](https://github.com/Gusto/embedded-react-sdk/issues/1861))

### Fixes

- Fix React hydration error in the Employee Dashboard document viewer caused by the "download this document" link rendering as two nested `<a>` elements ([#1893](https://github.com/Gusto/embedded-react-sdk/issues/1893))
- Preserve the selected `DashboardFlow` tab when entering and leaving a sub-flow (Add bank account, Add deduction, Edit Federal/State taxes, View document); Cancel/Back now returns to the originating tab instead of resetting to Basic details ([#1893](https://github.com/Gusto/embedded-react-sdk/issues/1893))
- Show the compensation effective date instead of the hire date on the Employee Dashboard Job and Pay tab ([#1896](https://github.com/Gusto/embedded-react-sdk/issues/1896))
- Validate the time-off policy waiting period as an integer; reject decimal and non-numeric values ([#1863](https://github.com/Gusto/embedded-react-sdk/issues/1863))
- Replace Suspense-blocking queries on the Employee Dashboard with per-section skeleton states for faster perceived loading ([#1892](https://github.com/Gusto/embedded-react-sdk/issues/1892))

## [0.45.0](https://github.com/Gusto/embedded-react-sdk/compare/v0.44.2...v0.45.0) (2026-05-21)

### Features & Enhancements

- Employee Dashboard Compensation card now displays a multi-job table for nonexempt employees, a Deductions block, pending compensation change alerts, and an empty state with an Add Job CTA ([#1872](https://github.com/Gusto/embedded-react-sdk/issues/1872), [#1877](https://github.com/Gusto/embedded-react-sdk/issues/1877), [#1878](https://github.com/Gusto/embedded-react-sdk/issues/1878), [#1886](https://github.com/Gusto/embedded-react-sdk/issues/1886))
- Compensation editing is now routed through `DashboardFlow`, so users can edit job and pay details directly from the Employee Dashboard ([#1880](https://github.com/Gusto/embedded-react-sdk/issues/1880))
- Add `DocumentManager` block to `DashboardFlow` for viewing and managing employee documents from the dashboard ([#1852](https://github.com/Gusto/embedded-react-sdk/issues/1852))
- Payment method sub-flows (add/edit bank account, update payment method) are now available inside `DashboardFlow` ([#1821](https://github.com/Gusto/embedded-react-sdk/issues/1821))
- Download paystub PDFs from the Employee Dashboard Job and Pay tab ([#1842](https://github.com/Gusto/embedded-react-sdk/issues/1842))
- Migrate `EmployeeDeductions` to hook-based architecture, exposing `useEmployeeDeductions` for headless usage ([#1845](https://github.com/Gusto/embedded-react-sdk/issues/1845))
- Add `useClientPagination` hook for in-memory list pagination ([#1885](https://github.com/Gusto/embedded-react-sdk/issues/1885))

### Fixes

- Lazy-load Employee Dashboard tab data to reduce first-paint API requests ([#1890](https://github.com/Gusto/embedded-react-sdk/issues/1890))
- Stop sending `effective_date` in the compensation PUT body, which caused the API to reject updates in certain scenarios ([#1876](https://github.com/Gusto/embedded-react-sdk/issues/1876))
- Fix check-payment warning alert rendering in `PayrollOverview` ([#1884](https://github.com/Gusto/embedded-react-sdk/issues/1884))
- Display human-readable field names instead of raw `snake_case` keys in API error messages ([#1799](https://github.com/Gusto/embedded-react-sdk/issues/1799))
- Apply consistent spacing and supporting text styling to component headers ([#1847](https://github.com/Gusto/embedded-react-sdk/issues/1847))
- Fix back navigation from add-employees returning to the wrong step ([#1792](https://github.com/Gusto/embedded-react-sdk/issues/1792))
- Add missing confirmation dialog when adding employees to a policy in standalone mode ([#1798](https://github.com/Gusto/embedded-react-sdk/issues/1798))
- Add loading and disabled states to buttons across the Time Off flow to prevent double-submits ([#1812](https://github.com/Gusto/embedded-react-sdk/issues/1812))
- Cap policy settings number inputs at 20,000 and validate waiting period as an integer ([#1791](https://github.com/Gusto/embedded-react-sdk/issues/1791), [#1879](https://github.com/Gusto/embedded-react-sdk/issues/1879))
- Show a validation error when no policy type is selected ([#1802](https://github.com/Gusto/embedded-react-sdk/issues/1802))
- Always dismiss the delete-policy dialog after the API call completes, even on error ([#1793](https://github.com/Gusto/embedded-react-sdk/issues/1793))
- Clear stale policy reset date when switching accrual method to unlimited or per-anniversary-year ([#1801](https://github.com/Gusto/embedded-react-sdk/issues/1801), [#1850](https://github.com/Gusto/embedded-react-sdk/issues/1850))
- Send `accrualRateUnit: null` for non-hourly accrual methods so the API does not reject the request ([#1786](https://github.com/Gusto/embedded-react-sdk/issues/1786))
- Hide the balance column for unlimited accrual policies where it is not applicable ([#1789](https://github.com/Gusto/embedded-react-sdk/issues/1789), [#1822](https://github.com/Gusto/embedded-react-sdk/issues/1822))
- Filter non-numeric input on balance fields and default starting balance to "0" for new employees ([#1790](https://github.com/Gusto/embedded-react-sdk/issues/1790), [#1788](https://github.com/Gusto/embedded-react-sdk/issues/1788))
- Include employee balances in the wizard-mode add-employees API call so balances are not lost on submit ([#1787](https://github.com/Gusto/embedded-react-sdk/issues/1787))
- Send a separate PUT with `complete: true` after the final wizard step to properly mark the policy as complete ([#1800](https://github.com/Gusto/embedded-react-sdk/issues/1800))
- Display a friendly error message for `LIMIT_VIOLATION_MAX_HOURS` and de-duplicate repeated balance error messages on the policy settings screen ([#1831](https://github.com/Gusto/embedded-react-sdk/issues/1831), [#1851](https://github.com/Gusto/embedded-react-sdk/issues/1851))
- Surface errors inline inside the edit-balance modal instead of silently failing ([#1794](https://github.com/Gusto/embedded-react-sdk/issues/1794))
- Show the policy name in the heading when editing a time off policy ([#1811](https://github.com/Gusto/embedded-react-sdk/issues/1811))
- Show the reassignment warning only when selected employees actually have existing PTO balances ([#1797](https://github.com/Gusto/embedded-react-sdk/issues/1797))
- Show an empty-state CTA when a policy has no employees assigned ([#1813](https://github.com/Gusto/embedded-react-sdk/issues/1813))
- Show job title column in the policy detail employee table ([#1795](https://github.com/Gusto/embedded-react-sdk/issues/1795))
- Sort policies alphabetically by name for a stable display order ([#1796](https://github.com/Gusto/embedded-react-sdk/issues/1796))
- Fix responsive layout of policy detail cards so they follow the Tabs mode correctly ([#1810](https://github.com/Gusto/embedded-react-sdk/issues/1810))
- Constrain starting balance input width and center-align the empty search state in the employee table ([#1819](https://github.com/Gusto/embedded-react-sdk/issues/1819), [#1817](https://github.com/Gusto/embedded-react-sdk/issues/1817))
- Use `DetailViewLayout` back button with secondary variant for visual consistency ([#1808](https://github.com/Gusto/embedded-react-sdk/issues/1808))

### Chores & Maintenance

- Refactor `EditCompensation` to consume `useJobForm` + `useCompensationForm` hooks and organize compensation files by journey ([#1736](https://github.com/Gusto/embedded-react-sdk/issues/1736), [#1860](https://github.com/Gusto/embedded-react-sdk/issues/1860))
- Refactor `useSplitPaymentsForm` to align with canonical hook patterns ([#1866](https://github.com/Gusto/embedded-react-sdk/issues/1866))
- Bump `dompurify` from 3.4.2 to 3.4.5 (security fix) ([#1816](https://github.com/Gusto/embedded-react-sdk/issues/1816), [#1881](https://github.com/Gusto/embedded-react-sdk/issues/1881))
- Bump runtime dependencies (`i18next`, `react-hook-form`, `react-i18next`)
- Bump dev dependencies (`@storybook/*`, `vitest`, `@vitest/coverage-v8`, `typescript-eslint`, `lint-staged`, `tsx`, `@commitlint/*`, `@vitejs/plugin-react-swc`, `eslint-plugin-storybook`, `@types/react`)

## [0.44.2](https://github.com/Gusto/embedded-react-sdk/compare/v0.44.1...v0.44.2) (2026-05-12)

### Fixes

- Fix full-width layout of `EmployeeStateTaxesView` container ([#1782](https://github.com/Gusto/embedded-react-sdk/issues/1782))
- Prevent layout shift (skeleton flash) when `TransitionPayrollAlert` has no content to display ([#1773](https://github.com/Gusto/embedded-react-sdk/issues/1773))
- Fix UTC roundtrip bug in date picker field where dates near midnight would shift by one day ([#1767](https://github.com/Gusto/embedded-react-sdk/issues/1767))

### Chores & Maintenance

- Bump `i18next` to `26.1.0` ([#1778](https://github.com/Gusto/embedded-react-sdk/issues/1778))
- Bump dev dependencies (`@playwright/test`, `typescript-eslint`, `vitest`)

## 0.44.1

### Chores & Maintenance

- Upgrade `@gusto/embedded-api` to `0.13.0` (adapts SDK to renamed error class `UnprocessableEntityError`, `PayScheduleShow` rename, typed mutation bodies, and renamed response payload keys; no public SDK API changes)
- Bump various dev dependencies (`@commitlint/cli`, `@commitlint/config-conventional`, `lint-staged`, `msw`)
- Bump `fast-uri` to `3.1.2` (transitive npm/yarn security update)

## 0.44.0

### Breaking Changes

#### `UNSTABLE_TimeOff` namespace renamed to `TimeOff`

TimeOff components are now exported as `TimeOff.*` instead of `UNSTABLE_TimeOff.*`:

```tsx
// Before
import { UNSTABLE_TimeOff } from '@gusto/embedded-react-sdk'
;<UNSTABLE_TimeOff.TimeOffFlow companyId={companyId} onEvent={handleEvent} />

// After
import { TimeOff } from '@gusto/embedded-react-sdk'
;<TimeOff.TimeOffFlow companyId={companyId} onEvent={handleEvent} />
```

#### `useCompensationForm` split into `useJobForm` + `useCompensationForm`

The monolithic `useCompensationForm` has been decomposed into focused, steady-state hooks so partners can drive job and compensation lifecycles independently or together.

- `useJobForm` / `useCurrentJobForm`: create | update routing, error handling, and POST/PUT/DELETE wiring for the Jobs API.
- `useCompensationForm` / `useCurrentCompensationForm`: single create | update path covering both the onboarding stub-update case and steady-state effective-dated compensations, with optimistic-locking via version.

`useCompensationForm.actions.onSubmit` changed from `(callbacks?, options?)` to `(options?)`. The `CompensationSubmitCallbacks` export is removed. Read the saved compensation from the awaited `HookSubmitResult`'s `data` field instead of wiring `onCompensationCreated` / `onCompensationUpdated`.

#### `Employee.Profile` migrated to hook architecture with management variant

`Employee.Profile` has been rebuilt on the hook architecture and now supports steady-state edit mode. `useEmployeeDetailsForm` props are now a discriminated union on `companyId`/`employeeId`. `EmployeeOnboarding.Profile` and `EmployeeManagement.Profile` each point to their dedicated variant.

#### `Employee.FederalTaxes` split into onboarding + management variants

The `isOnboarding` prop has been replaced with two journey-scoped components:

- `EmployeeOnboarding.FederalTaxes` — Continue button, emits `EMPLOYEE_FEDERAL_TAXES_UPDATED` + `EMPLOYEE_FEDERAL_TAXES_DONE`.
- `EmployeeManagement.FederalTaxes` — Cancel + Save, dismissible success alert, emits `CANCEL` or `EMPLOYEE_FEDERAL_TAXES_UPDATED` (no `_DONE`).

`Employee.FederalTaxes` now resolves to the management variant (matching the WorkAddress/HomeAddress convention).

### Features & Enhancements

- Export `LocationForm` as standalone component
- Add `useEmployeeStateTaxesForm` hook and migrate `Employee.StateTaxes`
- Add `StateTaxes` management variant (onboarding/management split)
- Display `setup_status`, `default_rates_applied`, and `ready_to_run_payroll` in `StateTaxesList`
- Add time-off policy detail presentational and functional components with tests
- Add `HolidayPolicyDetail` presentational and functional components
- Add edit employee balance modal for time-off policy detail
- Pre-fill carry-over balances when adding employees to a time-off policy
- Surface `eligiblePaidTimeOff` via `Include.AllCompensations`
- Focus visually first invalid field across composed forms
- Update Company header styles with consistent spacing and supporting text variant

### Fixes

- Make sure to update for component adaptor
- Use component context for dialog buttons
- Workers comp rate inputs submit typed values (SDK-798)
- Improve accessibility: add `aria-labelledby` and `aria-controls` attributes to Time Off form landmarks, PolicySettings switches, and balance inputs
- Remove hardcoded colors in PolicySettings for theme compliance
- Correct policy settings visibility for fixed accrual methods
- Adjust day dropdown in policy reset date based on selected month
- Hide job title column on time-off policy detail page
- Use locale-aware date formatting in TimeOff components
- Use server-side search for employee selection in time-off flows
- Wire holiday policy edit, add-employees, and delete flows
- Keep delete confirmation dialog open when deletion fails
- Clear stale policyId when starting new create flow in TimeOff wizard
- Rename policy list menu item from "Edit policy" to "View policy"
- Improve error message when removing employees with pending time-off requests
- Make reset date type optional for hourly accrual methods
- Filter policy detail settings display by accrual method category
- Hide Edit balance menu item for unlimited time-off policies
- Emit SDK event on time off policy deletion
- Reset edit balance modal state when switching employees
- Use update mutation when editing existing time-off policies
- Hide holiday pay option when company already has a policy
- Filter time-off policy list to PTO, Sick, and Holiday only
- Hide deactivated policies from time-off policy list
- Display employee names in time-off policy detail
- Hide job title and balance columns for unlimited time-off policies
- Send `complete: false` when creating non-unlimited time-off policies
- Scope time-off reassignment warning per policy type
- Treat NaN as empty in form schema so required validation fires for cleared number inputs
- Improve validation error for net pay in off-cycle payroll (SDK-735)
- Reduce button padding and min-height to match input height
- Apply max length to information request text response (SDK-423)

### Chores & Maintenance

- Rebuild `Employee.Compensation` around a state machine + presentation/connected split
- Anchor `TimeOffPolicyType` to SDK `PolicyType` enum
- Remove dead code (`SelectEmployees`, `ViewPolicyDetails`/`ViewPolicyEmployees` stubs, unused i18n keys)
- Remove duplicate `contractorName` and clean up Street 2 labels
- Update README with missing docs and fix stale links
- Standardize workflows-overview structure and add missing components
- Validate Storybook and SDK app builds in CI
- Bump various dependencies (i18next, react-i18next, msw, lint-staged, vite-plugin-circular-dependency, react-router-dom, axios, typescript-eslint, globals, @commitlint/cli, react-hook-form, dompurify, @storybook/addon-docs, @storybook/addon-a11y, @storybook/addon-onboarding, @commitlint/config-conventional)

## 0.43.0

### Features & Enhancements

- Add `portalContainer` prop to `GustoProvider` for overlay positioning control
- Add contractor self-onboarding prototype
- Wire `SelectEmployees` into `TimeOffFlow` and add E2E tests
- Add `SelectEmployees` container for holiday pay policies (SDK-567)
- Add `SelectEmployees` container for time-off/sick policies (SDK-565)
- Wire `PolicySettings` into `TimeOff` state machine (SDK-579)
- Add `SelectEmployees` presentational component (SDK-563)

### Fixes

- Remove duplicate `SelectEmployees` container story
- Show full state names in state selects (I-9 preparer and home address)
- Improve contractor form layout and typography consistency
- Remove italic styling and normalize text size in company address list
- Remove default garnishment selection in deductions form
- Add `isWithinBox` support to `DataCards`
- Respect set-only contract for mailing/filing address flags (SDK-169)

### Chores & Maintenance

- Bump various dependencies (pixelmatch, eslint-plugin-storybook, @storybook/react-vite, msw, axe-core)
- Add empty sidebar categories for upcoming design prototypes

## 0.42.0

### Features & Enhancements

- Add employee home address management and dashboard integration
- Add employee work address management (SDK-640)
- Extend TextInput with HTML input constraints and add EmployeeTable search
- Add contractor management prototype with review, onboarding, and profile flows

### Fixes

- Contractor profile UX fixes, settings panel wiring, and skeleton loading state
- Validate integer percentages in payment method split (SDK-464)
- Add empty state to RecoveryCasesList (SDK-426)
- Normalize locale-format dateOfBirth defaultValues to ISO before form validation
- Use hook Fields in PayScheduleForm instead of raw Common field components

### Chores & Maintenance

- Consolidate Flow header chrome into a single discriminated `header` config (replaces internal `progressBarType`, `progressBarCta`, `currentBreadcrumbId` fields)
- Integrate useSignEmployeeForm hook into Employee DocumentSigner
- Remove Common/SignatureForm shared components
- Remove stale Hooks namespace from SDK Dev App
- Fix TimeOff storybook story titles to use Domain/ prefix
- Bump various dependencies (typescript-eslint, react-i18next, react-hook-form, i18next, msw, @commitlint/cli, postcss)

## 0.41.0

### Features & Enhancements

- Add contractor profile design prototype with payment method management
- Add Contractor List design prototype
- Add theme switcher (system/light/dark) to sdk-app

### Fixes

- Seed Start date from employee hire date in edit mode

### Chores & Maintenance

- Integrate useSignCompanyForm hook into Company DocumentSigner
- Migrate PaySchedule to usePayScheduleForm + Flow state machine (SDK-774)
- Add unit tests for PolicySettings presentation component
- Bump various dependencies (typescript-eslint, react-router-dom, @vitest/coverage-v8, dompurify, react-hook-form)

## 0.40.0

### Breaking Changes

#### `composeSubmitHandler` now returns `{ handleSubmit, errorHandling }`

`composeSubmitHandler` now returns an object with both the submit event handler
and an aggregated `errorHandling` bag built from the forms it receives, instead
of returning the submit handler directly. Partners who only need one shared error
surface across multiple forms no longer have to call `composeErrorHandler`
themselves.

- **Before**: `const handleSubmit = composeSubmitHandler([formA, formB], onAllValid)`
- **After**: `const { handleSubmit, errorHandling } = composeSubmitHandler([formA, formB], onAllValid)`

For screens that also need to combine extra `@gusto/embedded-api` queries into
the same error surface, pass the `composeSubmitHandler` result into
`composeErrorHandler` alongside those queries:

```tsx
const submitResult = composeSubmitHandler([formA, formB], onAllValid)
const errorHandling = composeErrorHandler([submitResult, extraQuery])
```

#### Hooks now exported from main entry point

All form hooks have graduated from experimental to stable. They are now available
directly from the main package entry:

- **Before**: `import { useCompensationForm } from '@gusto/embedded-react-sdk/UNSTABLE_Hooks'`
- **After**: `import { useCompensationForm } from '@gusto/embedded-react-sdk'`

The `@gusto/embedded-react-sdk/UNSTABLE_Hooks` entry point has been removed. All hook
exports are now available from the main package entry.

**Find and replace**: Search your codebase for
`from '@gusto/embedded-react-sdk/UNSTABLE_Hooks'`
and replace with `from '@gusto/embedded-react-sdk'`.

#### Prebuilt hook form components removed

The following prebuilt components have been removed: `CompensationForm`,
`EmployeeDetailsForm`, `WorkAddressForm`, `HomeAddressForm`, `PayScheduleForm`,
`SignCompanyForm`, `SignEmployeeForm`, `SignEmployeeI9Form`. These were internal
testing artifacts. Use the corresponding hooks directly (e.g., `useCompensationForm`)
to build custom form UI.

#### `Employee.ManagementEmployeeList` removed

`ManagementEmployeeList` is no longer exported from the `Employee` umbrella namespace. Use `EmployeeManagement.EmployeeList` instead:

```tsx
// Before
import { Employee } from '@gusto/embedded-react-sdk'
;<Employee.ManagementEmployeeList companyId={companyId} onEvent={handleEvent} />

// After
import { EmployeeManagement } from '@gusto/embedded-react-sdk'
;<EmployeeManagement.EmployeeList companyId={companyId} onEvent={handleEvent} />
```

#### `Employee.*`, `Company.*`, and `Contractor.*` umbrella namespaces deprecated

The flat `Employee`, `Company`, and `Contractor` namespace exports are now **deprecated** in favor of the new journey-based namespaces (`EmployeeOnboarding`, `EmployeeManagement`, `CompanyOnboarding`, `ContractorOnboarding`). Existing imports continue to work without changes, but partners should migrate at their convenience:

```tsx
// Deprecated (still works)
import { Employee } from '@gusto/embedded-react-sdk'
;<Employee.OnboardingFlow companyId={companyId} onEvent={handleEvent} />

// Recommended
import { EmployeeOnboarding } from '@gusto/embedded-react-sdk'
;<EmployeeOnboarding.OnboardingFlow companyId={companyId} onEvent={handleEvent} />
```

The `Employee`, `Company`, and `Contractor` umbrella namespaces will be removed in a future major version. The `Payroll` and `InformationRequests` namespaces are unaffected and remain the primary import path for those domains.

### Features & Enhancements

- Add journey-based export namespaces (`EmployeeOnboarding`, `EmployeeManagement`, `CompanyOnboarding`, `ContractorOnboarding`) grouping flows and components by integration use case
- Add PolicySettings presentation component for time-off policy creation
- Fetch and display holiday pay policy in PolicyList
- Add `useHomeAddressForm` unstable hook
- Merge `sdk-app` and `prototype-app` into a unified development environment

### Fixes

- Exclude `admin_onboarding_review` from contractor self-onboarding statuses
- Add flex properties to Box so content fills remaining space in parent
- Remove scroll-into-view behavior on alerts
- Remove overriding text instances in payroll receipt data views
- Add spacing between description list items when rendered without dividing lines
- Make PaySchedule create/edit tests more robust

### Chores & Maintenance

- Migrate Employee Profile to hook-based architecture
- Replace error-handling helpers with `composeErrorHandler`
- Partner hooks `BaseHookReady` typing (SDK-778)
- Restructure `EmployeeList` into a feature module layout (internal, no public API change)
- Update prototype app to use SDK components
- Add document requirements list to contractor submit view
- Add comprehensive Employee Profile component tests
- Add Cursor skill for migrating SDK components to hooks
- Add prototype-app design prototyping environment
- Add RFC for SDK hooks approach for partner flexibility
- Bump various dependencies (i18next, react-i18next, dompurify, @internationalized/date, @internationalized/number, eslint-plugin-react-hooks, msw, vite-plugin-checker, prettier, typescript-eslint, follow-redirects, react-router-dom, axe-core)

## 0.39.0

### Breaking Changes

#### Box component adapter (`header`, `withPadding` props)

The `Box` component now accepts a `header` prop (used for section titles and actions) and a `withPadding` prop. If you supply a custom **Box** via the [component adapter](./docs/component-adapter/component-adapter.md), update it to handle the new props:

```tsx
// Before
Box: ({ children, footer, className }) => (
  <div className={className}>
    <div className="box-body">{children}</div>
    {footer && <div className="box-footer">{footer}</div>}
  </div>
)

// After
Box: ({ children, header, footer, withPadding = true, className }) => (
  <div className={className}>
    {header && <div className="box-header">{header}</div>}
    <div className="box-body" style={withPadding ? undefined : { padding: 0 }}>
      {children}
    </div>
    {footer && <div className="box-footer">{footer}</div>}
  </div>
)
```

#### New `BoxHeader` component adapter

A new **BoxHeader** component has been added to the component adapter. It renders a title, optional description, and optional action (e.g. an "Edit" button) inside `Box` headers. If you provide a custom component adapter, add a `BoxHeader` implementation:

```tsx
BoxHeader: ({ title, description, action, headingLevel = 'h3' }) => {
  const Heading = headingLevel
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <Heading>{title}</Heading>
        {description && <p>{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
```

#### Table `variant` prop replaced with `isWithinBox`

The Table component's `variant` prop has been replaced with `isWithinBox`. The SDK sets `isWithinBox={true}` on tables that are rendered inside a `Box` layout element, so your adapter can remove redundant borders, shadows, or background colors to avoid visual doubling. If you supply a custom **Table** via the component adapter, update your implementation:

```tsx
// Before: variant?: 'default' | 'minimal'
Table: ({ variant = 'default', ...props }) => (
  <table style={variant === 'minimal' ? { border: 'none' } : undefined} {...props} />
)

// After: isWithinBox?: boolean — true when the table is inside a Box
Table: ({ isWithinBox = false, ...props }) => (
  <table
    style={
      isWithinBox
        ? { border: 'none', borderRadius: 0, boxShadow: 'none', background: 'transparent' }
        : undefined
    }
    {...props}
  />
)
```

#### DescriptionList new `layout` and `showSeparators` props

The `DescriptionList` component now accepts `layout` (`'stacked' | 'horizontal'`) and `showSeparators` (boolean) props. If you supply a custom **DescriptionList**, update it to handle these props for proper rendering in the Employee Dashboard and other views.

### Features & Enhancements

- Add Employee Dashboard component
- Add Time Off policy management: PolicyList, SelectPolicyType, SelectHolidays, and PolicyConfigurationForm (presentation and functional components)
- Wire PolicyConfigurationForm into TimeOff state machine
- Add usePayScheduleForm unstable hook
- Add useSignCompanyForm unstable hook
- Add useSignEmployeeForm hook with I-9 preparer support
- Add select-all header checkbox to DataView
- Streamline schema composition with unified buildFormSchema pattern
- Add holiday data helpers and i18n translations
- Add full-screen token expired overlay with periodic health polling (SDK App)

### Fixes

- Fix table text styles in contractors and payroll
- Fix date picker style improvements
- Align datepicker styles with date range picker styles
- Fix uncontrolled to controlled input warning
- Fix minor style updates to popover and menu UI
- Always show kebab menu in payroll list for consistent alignment
- Dynamic payment processing copy based on company ACH speed
- Use taxableAsScorp for Two Percent Shareholder visibility
- Add spacing to file input wrapper for error message

### Chores & Maintenance

- Refactor Box to expose Header, Footer, Content as subcomponents
- Migrate useWorkAddressForm and useEmployeeDetailsForm to buildFormSchema pattern
- Move EmployeeTable to UNSTABLE_TimeOff/shared and remove TimeOffManagement
- Remove legacy composeFormSchema, resolveRequiredFields, and deriveFieldsMetadata
- Add tests and Storybook stories for PolicyList, SelectPolicyType, and PolicyConfigurationForm
- Add component naming and organization RFC
- Upgrade @gusto/embedded-api from 0.12.4 to 0.12.5
- Upgrade react-aria-components from 1.13.0 to 1.16.0
- Upgrade GitHub Actions to Node.js 24-compatible versions
- Bump i18next from 26.0.3 to 26.0.4
- Bump Storybook packages to 10.3.5
- Bump various dev dependencies (vitest, msw, axios, typescript-eslint, ts-morph, prettier, dotenv, globals, and others)

## 0.38.0

### Features & Enhancements

- Add date range filter to PayrollList and PayrollHistory
- Add SDK Dev App for standalone component development
- Add ManagementEmployeeList component and refactor EmployeeList
- Add DetailViewLayout and EmployeeTable reusable components
- Add icon prop to Button component
- Update payroll breadcrumb labels
- Disable past dates in Pay Schedule first pay date picker
- Support prop-based field connection via formHookResult

### Fixes

- Fix breadcrumb navigation guards and post-submit flow
- Fix off-cycle, dismissal, and transition payroll bugs (breadcrumb display, cancel transitions, date range handling, employee selection, PTO labeling)
- Keep excluded employees visible in PayrollConfiguration after calculation
- Fix gross-up modal layout and calculate button alignment
- Fix payroll history sorting and pagination
- Treat blank time off fields as zero to prevent raw API error
- Hide direct deposit banner and ACH deadline messages for check-only payrolls
- Keep start/end date fields visible for check-only payrolls
- Sync contractor self-onboarding toggle with API status changes
- Wire up missing dictionary overrides in Contractor components
- Scope PaymentMethod loading spinner to the specific row being deleted
- Respect withReimbursements prop in off-cycle payroll configuration
- Update gross pay live when editing bonus and fixed compensation amounts
- Prevent dropdown flicker on rapid blur-focus in MultiSelectComboBox
- Fix NumberField onBlur value formatting
- Fix compensation base validators and child support required attributes
- Ensure all labels display in payroll receipt mobile layout
- Reduce spacing between input section title and description
- Clarify tax withholding rates copy

### Chores & Maintenance

- Add tests, Storybook stories, and documentation for new components
- Add icon assets (umbrella, search-lg, user-02, edit-02)
- Re-enable e2e tests on ubuntu-latest runners
- Bump i18next from 25.10.4 to 26.0.3
- Bump react-i18next from 16.6.6 to 17.0.2
- Bump Storybook packages to 10.3.4
- Bump various dev dependencies (sass-embedded, vite-plugin-svgr, @playwright/test, typescript-eslint, and others)

## 0.37.0

### Features & Enhancements

- Add core terminations functionality with DismissalFlow, DismissalPayPeriodSelection, and unused time off payout UI
- Add transition payroll support with TransitionCreation component, state machine, and landing page alert
- Embed DismissalFlow within TerminationFlow and add dismissal/transition states to payroll flows
- Show off-cycle payrolls in history tab and add off-cycle flow support with section dividers
- Introduce unified SDKError type and ObservabilityError extension
- Implement UNSTABLE_Hooks directory with uniform hook return types and form infrastructure
- Add useEmployeeDetailsForm hook with configurable required fields and NAME_REGEX validation
- Add useWorkAddressForm hook with prebuilt component
- Implement CompensationForm with useCompensationForm hook, including start date field and composeFormSchema alignment
- Add composeSubmitHandler for coordinated multi-form validation and cross-form focus management
- Add error code infrastructure, HookField reference components, and errorHandling pattern with retryQueries
- Add getFormSubmissionValues to form hooks
- Allow requiredFields to accept flat array or per-mode object
- Align hooks with stable component parity: optional employeeId with submit-time resolution, SwitchField FieldComponent support, requiredIf null coercion fix
- Add partner-facing hooks documentation

### Fixes

- Hide courtesy withholding checkbox from employee view
- Strip finalPayoutUnusedHoursInput from PTO on non-dismissal payrolls
- Include off-cycle and external payrolls in list and history views
- Only show hourly inputs for primary jobs with hourly compensations
- Fix off-cycle, dismissal, and transition payroll bugs
- Invalidate payroll-prepare cache after editing employee hours
- Improve PayrollConfiguration calculate/polling flow
- Mark dismissal pay period select as required
- Default employee selection to select-employees mode
- Convert throw sites in new components to SDKInternalError

### Chores & Maintenance

- Refactor Base infrastructure for hooks compatibility
- Payroll test infrastructure and label cleanup
- Add E2E tests for DismissalFlow and transition payroll
- Add Storybook stories for offcycle components
- Add workflow_dispatch trigger and CI badge to README
- Disable e2e tests in GitHub Actions
- Fix minimatch ReDoS vulnerability (CVE-2026-27903)
- Upgrade react-robot from 1.2.0 to 1.2.1
- Bump react-hook-form from 7.71.2 to 7.72.0
- Bump react-i18next from 16.5.8 to 16.6.6
- Bump i18next from 25.8.18 to 25.10.4
- Bump @storybook/react-vite from 10.2.19 to 10.3.1
- Bump @storybook/addon-docs from 10.2.19 to 10.3.3
- Bump @storybook/addon-a11y from 10.2.19 to 10.3.3
- Bump @storybook/addon-onboarding from 10.2.19 to 10.3.3
- Bump storybook from 10.3.0 to 10.3.1
- Bump eslint-plugin-storybook from 10.2.19 to 10.3.3
- Bump @storybook/test-runner from 0.24.2 to 0.24.3
- Bump @vitest/coverage-v8 from 4.1.0 to 4.1.1
- Bump vite-plugin-stylelint from 6.0.4 to 6.1.0
- Bump msw from 2.12.12 to 2.12.14
- Bump flatted from 3.3.3 to 3.4.2

## 0.36.0

### Features & Enhancements

- Integrate tax withholding config into off-cycle payroll creation
- Add gross up modal to PayrollConfiguration kebab menu
- Add observability hooks with PII protection

### Fixes

- Update payroll deadline time from 1PM to 4PM Pacific in calendar preview
- Adjust minimum wage controls for states without tip credits
- Updated to use correct translation keys
- Handle date field serialization in state taxes form
- Preset payment date based on company payment speed
- Revert react-aria upgrade and block in dependabot

### Chores & Maintenance

- Update embedded api to 0.12.4
- Convert Cursor commands to Claude Code skills
- Add comprehensive tests for rem conversion utilities
- Improve Cursor configuration for team productivity
- Upgrade vitest to v4, coverage-v8 to v4, and plugin-react-swc to v4
- Bump react-i18next from 16.5.4 to 16.5.8
- Bump i18next from 25.8.13 to 25.8.18
- Bump dompurify from 3.3.2 to 3.3.3
- Bump react-aria from 3.45.0 to 3.47.0
- Bump sass-embedded from 1.97.3 to 1.98.0
- Bump typescript-eslint from 8.56.1 to 8.57.1
- Bump eslint-plugin-storybook from 10.2.15 to 10.2.19
- Bump @storybook/react-vite from 10.2.15 to 10.2.19
- Bump @storybook/addon-docs from 10.2.14 to 10.2.19
- Bump @storybook/addon-a11y from 10.2.16 to 10.2.19
- Bump @storybook/addon-onboarding from 10.2.15 to 10.2.19
- Bump storybook from 10.2.16 to 10.2.19
- Bump lint-staged from 16.3.2 to 16.4.0
- Bump msw from 2.12.10 to 2.12.12
- Bump eslint from 9.39.3 to 9.39.4
- Bump @commitlint/cli from 20.4.3 to 20.5.0
- Bump @commitlint/config-conventional from 20.4.3 to 20.5.0

## 0.35.0 (unpublished)

> This version was unpublished from NPM due to a critical bug caused by a react-aria upgrade that required a rollback. All changes are included in 0.36.0.

## 0.34.0

### Features & Enhancements

- Integrate employee selection into OffCycleCreation
- Add wire-in confirmation alert and API version header
- Optimize ThemeProvider style tag injection and CSS generation
- Optimize rem conversion system with caching to improve performance

### Fixes

- Resolve double prepare API call in Off Cycle payroll flow

### Chores & Maintenance

- Architecture overview documentation
- Add stylelint rule to prevent manual SCSS helpers imports
- Upgrade zod from v3 to v4
- Bump @gusto/embedded-api from 0.12.0 to 0.12.2
- Bump @internationalized/date from 3.10.1 to 3.12.0
- Bump dompurify from 3.3.1 to 3.3.2
- Bump @storybook/addon-a11y from 10.2.14 to 10.2.15
- Bump @storybook/addon-onboarding from 10.2.14 to 10.2.15
- Bump @storybook/react-vite from 10.2.14 to 10.2.15
- Bump eslint-plugin-storybook from 10.2.14 to 10.2.15

## 0.33.0

### Features & Enhancements

- Add MultiSelectComboBox composed component
- Remove form validation for state taxes until API is fixed

### Fixes

- Add support for payroll blockers in contractor flow
- Fix duplicate payroll progress saved alerts

### Chores & Maintenance

- Update EmployeeDocuments with corrected copy
- Create cursor command to seed data
- Remove unnecessary MSW init from e2e-demo CI job
- Bump immutable from 5.1.4 to 5.1.5
- Bump @commitlint/cli from 20.4.2 to 20.4.3
- Bump @commitlint/config-conventional from 20.4.2 to 20.4.3
- Bump lint-staged from 16.3.1 to 16.3.2
- Bump @storybook/addon-onboarding from 10.2.13 to 10.2.14
- Bump @storybook/addon-a11y from 10.2.13 to 10.2.14
- Bump @storybook/addon-docs from 10.2.13 to 10.2.14
- Bump @storybook/react-vite from 10.2.13 to 10.2.14
- Bump eslint-plugin-storybook from 10.2.13 to 10.2.14

## 0.32.0

### Features & Enhancements

- Add OffCycleCreation component and wire into flow
- Add off-cycle deduction settings
- Add off-cycle tax withholding table and modal
- Add Box UI component
- Add footer support to Box, update landing component styles
- Add maxlength to text input, enforce auth document number values
- Add eligibility status alert with back navigation on I-9 signature form
- Remove helper text from RFI alert
- Auto-derived endpoint inventory with CI verification
- Introduce Playwright for e2e testing

### Fixes

- Remove needsI9Form from machine useMemo deps to prevent recreation after signing
- Wire up off-cycle deductions to presentation
- Fix contractor payment validation and ACH speed messaging
- Fix preparer remove buttons and restore form signing gate
- Handle payroll submit error when RFI blocker is active
- Update UX for non-blocking payrolls
- Always show navigation CTA for actionable payroll blockers
- Fix typo for form completion alert on employee documents
- Clean up error message handling and create fallbacks

### Chores & Maintenance

- Create a full dev reset command
- Bump globals from 17.3.0 to 17.4.0
- Bump lint-staged from 16.2.7 to 16.3.1
- Bump @storybook/addon-a11y from 10.2.12 to 10.2.13
- Bump @storybook/addon-docs from 10.2.12 to 10.2.13
- Bump @storybook/addon-onboarding from 10.2.12 to 10.2.13
- Bump @storybook/react-vite from 10.2.12 to 10.2.13
- Bump eslint-plugin-storybook from 10.2.12 to 10.2.13
- Bump minimatch from 3.1.2 to 3.1.5
- Bump rollup from 4.53.5 to 4.59.0

## 0.31.1

### Fixes

- Replace I9 auth query with forms list check in DocumentSigner to fix error boundary retry loop in published builds
- Updated dev setup to include react-dom

## 0.31.0

### Features & Enhancements

- Add EmploymentEligibility I-9 form to DocumentSigner and SelfOnboardingFlow
- Add I-9 signature form with preparer support
- Add EmployeeDocuments component for onboarding document configuration
- Add OffCycle flow skeleton with state machine

### Fixes

- Refactor EmployeeDocuments event handling and onboarding status guards
- Test fest followups
- Fix link in documentation
- Fix raw HTML displaying in RFI modal
- Fix apostrophe not escaped on employee self onboarding company name
- Remove disabled continue button from DocumentSigner

### Chores & Maintenance

- Add I-9 component documentation to employee onboarding guides
- Clean up PayPeriodDateForm and add payroll type labeling
- Upgrade @gusto/embedded-api to 0.12.0
- Bump @gusto/embedded-api from 0.12.0 to 0.12.1
- Bump @storybook/addon-a11y from 10.2.10 to 10.2.12
- Bump @storybook/addon-docs from 10.2.10 to 10.2.12
- Bump @storybook/addon-onboarding from 10.2.10 to 10.2.11
- Bump @storybook/react-vite from 10.2.10 to 10.2.12
- Bump eslint-plugin-storybook from 10.2.10 to 10.2.12
- Bump storybook from 10.2.11 to 10.2.12
- Bump typescript-eslint from 8.56.0 to 8.56.1
- Bump i18next from 25.8.11 to 25.8.13
- Bump react-hook-form from 7.71.1 to 7.71.2
- Bump eslint from 9.39.2 to 9.39.3
- Bump @commitlint/cli from 20.4.1 to 20.4.2
- Bump @commitlint/config-conventional from 20.4.1 to 20.4.2

## 0.30.0

### Features & Enhancements

- Extract PayrollExecutionFlow from PayrollFlow
- Export PayrollExecutionFlow for consumers

### Fixes

- Adjusting RCC rendering
- Pass staged filenames to format and lint commands in pre-commit hook

### Chores & Maintenance

- Speed up pre-commit hook
- Bump i18next from 25.8.10 to 25.8.11
- Bump eslint-plugin-storybook from 10.2.8 to 10.2.10
- Bump @storybook/react-vite from 10.2.9 to 10.2.10

## 0.29.0

### Features & Enhancements

- Export StateTaxesList and StateTaxesForm from Company API
- Add RFI alerts to contractor payment list

### Fixes

- Convert state tax percentage inputs from decimal to human-readable format
- Improve UI of tab component

### Chores & Maintenance

- Rewrite contractor onboarding documentation
- Implement semver-based PR title validation and auto-versioning
- Switch auto-version workflow to manual dispatch
- Add reusable pagination hook and refactor components
- Improve cursor commands for branch creation and PR defaults
- Bump @storybook/addon-a11y, addon-docs, addon-onboarding, react-vite from 10.2.8 to 10.2.9
- Bump typescript-eslint from 8.55.0 to 8.56.0
- Bump i18next from 25.8.5 to 25.8.8
- Bump react-error-boundary from 6.1.0 to 6.1.1
- Bump dotenv from 17.2.4 to 17.3.1

## 0.28.0

### Features & Enhancements

- Extend DataTable for radio selection mode
- Update InformationRequests empty state title and remove description

### Breaking changes

#### Card component adapter (selection props)

If you supply a custom **Card** via the [component adapter](./docs/component-adapter/component-adapter.md), update it to use the new API: the Card no longer receives `onSelect`. Selection UI (checkbox or radio) is now passed as the `action` prop.

```tsx
// Before: Card received onSelect and rendered its own checkbox
Card: ({ children, menu, className, onSelect }) => (
  <div className={className}>
    {onSelect && <input type="checkbox" onChange={e => onSelect(e.target.checked)} />}
    {children}
    {menu}
  </div>
)

// After: Card receives pre-rendered selection UI via action
Card: ({ children, menu, className, action }) => (
  <div className={className}>
    {action}
    {children}
    {menu}
  </div>
)
```

## 0.27.0

### Features & Enhancements

- Update top level RFI flow to show an alert on submission
- Add pay period configuration component
- Implement offcycle payroll selection component
- Deductions: only show county field when counties are selectable

### Fixes

- Add additional line heights and xs size to text component
- Deductions UI: remove back button, add cancel button, handle empty states, spacing, and county field visibility
- Update theme border colors and form component styles

### Chores & Maintenance

- Add PR template and create-pr command guidance
- Ignore ESLint 10 major version in dependabot
- Bump @types/react from 19.2.13 to 19.2.14
- Bump i18next from 25.8.4 to 25.8.5
- Bump msw from 2.12.8 to 2.12.10
- Bump @storybook/react-vite, addon-docs, addon-onboarding, addon-a11y from 10.2.7 to 10.2.8
- Bump eslint-plugin-storybook from 10.2.7 to 10.2.8
- Bump typescript-eslint from 8.54.0 to 8.55.0
- Bump @playwright/test from 1.58.1 to 1.58.2

### Breaking changes

#### Theme variable `fontLineHeight` removed

The theme variable `fontLineHeight` has been removed. Update your theme object to use the new line height variables:

```tsx
// Before
theme={{
  typography: {
    fontLineHeight: '24px',
  }
}}

// After
theme={{
  fontLineHeightRegular: '24px',
  // Optional: Add more specific line heights if needed
  fontLineHeightSmall: '20px',
  fontLineHeightLarge: '28px',
  fontLineHeightExtraSmall: '18px',
}}
```

#### Theme `colorBorder` replaced with `colorBorderPrimary` and `colorBorderSecondary`

The single `colorBorder` theme variable has been replaced with two variables for clearer border styling.

For a consistent experience, use the same color for both new variables:

```tsx
// Before
theme={{
  colorBorder: '#E0E0E0'
}}

// After
theme={{
  colorBorderPrimary: '#E0E0E0',
  colorBorderSecondary: '#E0E0E0'
}}
```

## 0.26.0

### Features & Enhancements

- Create generalized RFI component as top-level export
- Add employment eligibility presentation component
- Update PayrollBlockerAlerts component to include RFI and recovery cases
- Add Dismissable Payroll Cancelled Alert
- Add success alerts for recovery case and information request submissions
- Add recovery cases and RFIs to payroll blocker list
- Add recovery case table
- Implement recovery case redebit functionality
- Handle unsupported information request response types

### Fixes

- Replace custom fonts with system fonts
- Add placeholder for empty error code in recovery cases list
- Remove text components from payroll dataview
- Add extra padding to alert content
- Reduce unordered list spacing
- Only render alert content container when children are present
- Remove text components from dataview
- Fix modal overflow
- File upload UI updates

### Chores & Maintenance

- Add gh action to auto assign PR reviewers
- Add /wireframemode cursor command for designer prototyping
- Add starttechspec cursor command for tech spec workflow
- Upgrade @gusto/embedded-api to 0.11.8
- Optimize CI workflow with parallel jobs and caching
- Bump @storybook/react-vite from 10.2.0 to 10.2.7
- Bump @storybook/addon-a11y from 10.2.0 to 10.2.6
- Bump @storybook/addon-onboarding from 10.2.0 to 10.2.6
- Bump @storybook/addon-docs from 10.2.0 to 10.2.7
- Bump @types/react from 19.2.9 to 19.2.11
- Bump @gusto/embedded-api from 0.11.9 to 0.11.11
- Bump @commitlint/cli from 20.3.1 to 20.4.0
- Bump @commitlint/config-conventional from 20.3.1 to 20.4.1
- Bump eslint-plugin-storybook from 10.2.0 to 10.2.7
- Bump dotenv from 17.2.3 to 17.2.4
- Bump globals from 17.1.0 to 17.3.0
- Bump @playwright/test from 1.58.0 to 1.58.1
- Bump i18next from 25.8.0 to 25.8.4
- Bump msw from 2.12.7 to 2.12.8
- Bump react-i18next from 16.5.3 to 16.5.4

## 0.25.0

### Features & Enhancements

- Add functionality for information request form
- Add functionality to information request list
- Add FileInputField and adapter
- Add FileInput component
- Update payroll list to avoid wrapping text and improve button placement
- Update to display payroll blockers before submitting payroll
- Update to hide job titles in edit payroll
- Add payroll cancellation guards
- Add payment history view
- Add reusable usePagination hook
- Hide direct deposit for employees without account set up
- Add skeleton for recovery cases
- Add skeleton for information requests
- Add bank account number to preview

### Fixes

- Remove duplicate payroll alert on calculate payroll
- Update to show warning banner with correct dates for late payroll
- Show immediate loading state when Calculate payroll button is clicked
- Prevent double loading during PayrollConfiguration pagination
- Cancel payroll from overview causing error
- Update inputs to format currency correctly
- Add empty state to CreatePaymentPresentation for contractors
- Display correct amount on alert when payroll is submitted
- Change payroll deadline notice text to read "by" instead of "on"
- Fix pagination visibility based on totalCount
- Align payroll breadcrumbs with design
- Remove submission failed prefix from submission blockers
- Update copy on cancel payroll modal
- Fix alignment for pay stub text in table on payroll overview
- Prevent negative numbers in input fields
- Prevent duplicate loading state on payroll landing

### Chores & Maintenance

- Upgrade embedded api to 0.11.7
- Upgrade Storybook from 8.6.15 to 10.1.11
- Migrate from Ladle to Storybook
- FSM cleanup
- Bump @gusto/embedded-api from 0.11.5 to 0.11.6
- Bump typescript-eslint from 8.53.1 to 8.54.0
- Bump @storybook/addon-docs from 10.1.11 to 10.2.0
- Bump @storybook/addon-onboarding from 10.1.11 to 10.2.0
- Bump @playwright/test from 1.57.0 to 1.58.0
- Bump globals from 16.5.0 to 17.1.0
- Bump @storybook/react-vite from 10.1.11 to 10.2.0
- Bump eslint-plugin-storybook from 10.1.11 to 10.2.0
- Bump prettier from 3.7.4 to 3.8.1
- Bump sass-embedded from 1.97.1 to 1.97.3
- Bump lodash from 4.17.21 to 4.17.23
- Bump @storybook/addon-a11y from 10.1.11 to 10.2.0
- Bump i18next from 25.7.3 to 25.8.0
- Bump vite-plugin-stylelint from 6.0.2 to 6.0.4
- Bump @types/react from 19.2.7 to 19.2.9
- Bump react-error-boundary from 6.0.0 to 6.1.0
- Bump typescript-eslint from 8.51.0 to 8.54.0
- Bump @testing-library/react from 16.3.1 to 16.3.2
- Bump react-hook-form from 7.69.0 to 7.71.1
- Bump react-i18next from 16.5.1 to 16.5.3
- Bump @commitlint/cli from 20.2.0 to 20.3.1
- Bump @commitlint/config-conventional from 20.2.0 to 20.3.1
- Bump msw from 2.12.4 to 2.12.7
- Bump axe-core from 4.11.0 to 4.11.1

## 0.24.1

### Fixes

- Add DC to supported states list

### Chores & Maintenance

- Bump react-i18next from 16.5.0 to 16.5.1
- Bump typescript-eslint from 8.50.1 to 8.51.0

## 0.24.0

### Features & Enhancements

- Add ConfirmWireDetailsComponent prop for customization
- Add PayrollLoading component adapter
- Provide a withReimbursements flag to conditionally hide reimbursements

### Fixes

- Add currency format and min value to dependents amount field
- Correctly pass consumer query client

### Chores & Maintenance

- Update dependabot config to respect already ticketed upgrades
- Bump typescript-eslint from 8.50.0 to 8.50.1
- Bump react-hook-form from 7.68.0 to 7.69.0
- Bump sass-embedded from 1.97.0 to 1.97.1

## 0.23.1

### Chores & Maintenance

- Revert react aria components upgrade

## 0.23.0

### Features & Enhancements

- Add support for all garnishment types
- Update to include earned fast ach in submission blockers
- Add contractor payment progress and functionality

### Fixes

- Restore defaults to icon button
- Updated copy on payroll overview
- Updated payrollHistory to display complete instead of paid
- Prevent multiple progress saved alerts on payroll overview
- Updated the payroll state machine to get the payroll dates
- Updated icons in payroll history action menu

### Chores & Maintenance

- Fix tree shaking and add pagination to adapter docs
- Export signatory components and add docs
- Add docs for confirm wire details and export payroll blockers
- Remove ability for custom deduction to be court-ordered
- Bump react-aria-components from 1.13.0 to 1.14.0
- Bump typescript-eslint from 8.49.0 to 8.50.0
- Bump @gusto/embedded-api from 0.11.3 to 0.11.4
- Bump i18next from 25.7.2 to 25.7.3
- Bump react-i18next from 16.4.0 to 16.5.0
- Bump eslint from 9.39.1 to 9.39.2
- Bump sass-embedded from 1.93.3 to 1.96.0

## 0.22.0

### Features & Enhancements

- Add support for fed/state lien garnishments
- Add notification for wire payroll submitted
- Update employee federal taxes to support pre 2020 W4
- Implement payroll overview updates based on radio selection
- Add contractor payment walking skeleton with FSM scaffolding

### Fixes

- Clean up confirm wire details with correct selected wire in
- Add .md extensions to internal doc links for GitHub browsing
- Update readme to reference existing docs files

### Chores & Maintenance

- Upgrade embedded API to 0.11.2
- Bump embedded-api version to 0.11.1
- Bump typescript-eslint from 8.48.0 to 8.49.0
- Bump dompurify from 3.3.0 to 3.3.1
- Bump vite-plugin-checker from 0.11.0 to 0.12.0
- Bump i18next from 25.7.1 to 25.7.2
- Bump @commitlint/config-conventional from 20.0.0 to 20.2.0
- Bump react-i18next from 16.3.5 to 16.4.0
- Bump @commitlint/cli from 20.1.0 to 20.2.0
- Bump msw from 2.12.3 to 2.12.4
- Bump react-hook-form from 7.67.0 to 7.68.0
- Bump prettier from 3.6.2 to 3.7.3

## 0.21.0

### Features & Enhancements

- Update base submit to separate UI portions
- Implement advance payroll status badges
- Add wire transfer confirmation flow for payroll
- Add infrastructure for experimental payroll hooks
- Update wire in form to use selected wire in id
- Add Contractor Payment Create component
- Add Contractor Payment Detail component
- Add Contractor Payment Overview component
- Add Contractor Payment Edit component
- Add Contractor Payment History component

### Fixes

- Fixed modal button styling
- Update footer to right-align when single button

### Chores & Maintenance

- Swap in new deductions/child support form components
- Bump msw from 2.12.2 to 2.12.3
- Bump @types/react from 19.2.6 to 19.2.7
- Bump typescript-eslint from 8.47.0 to 8.48.0
- Bump react-hook-form from 7.66.1 to 7.67.0
- Bump i18next from 25.6.3 to 25.7.1
- Bump mdast-util-to-hast from 13.2.0 to 13.2.1
- Bump tsx from 4.20.6 to 4.21.0

## 0.20.0

### Features & Enhancements

- Update bank account to accept 1-17 digits

### Fixes

- Apply antialiasing globally

### Chores & Maintenance

- Bump react-i18next from 16.3.3 to 16.3.5
- Bump i18next from 25.6.2 to 25.6.3
- Bump lint-staged from 16.2.6 to 16.2.7
- Bump @types/react from 19.2.5 to 19.2.6

## 0.19.0

### Features & Enhancements

- Add Banner component for displaying important messages and alerts
- Update Badge component radius styling
- Remove ul from base.css and update components to use List component
- Restore spacing values to input groups
- Normalize translation keys and add translation guidelines

### Chores & Maintenance

- Upgrade to Gusto Embedded API v0.10.2
- Update custom deductions form to use latest input components
- Update documentation for Gusto API v2025-06-15 upgrade

### Breaking changes

#### Translation key normalization

Translation keys have been normalized to follow a consistent naming convention. If you have custom dictionary overrides, you may need to update your translation keys to match the new format. Going forward, all translation keys will maintain this normalized format for consistency across the SDK.

## 0.18.0

### Features & Enhancements

- Add Modal component
- Update Tabs to allow for responsive behavior
- Update to provide all profile fields on admin review
- Updates UI for deductions v2
- Update autogenerated component adapter props docs
- Add error handling for payroll processing

### Fixes

- Update to restore translations in federal taxes
- Fix responsive layouts in payroll components
- Fix clearing alerts when leaving overview step

### Refactoring

- Normalize date formatting and consolidate hooks into single location

### Chores & Maintenance

- Upgrade to Gusto Embedded API v2025-06-15
- Bump react-hook-form from 7.65.0 to 7.66.0
- Bump typescript-eslint from 8.46.2 to 8.46.3
- Bump @ladle/react from 5.1.0 to 5.1.1
- Bump react-i18next from 16.2.3 to 16.2.4
- Bump eslint from 9.39.0 to 9.39.1
- Bump @eslint/js from 9.39.0 to 9.39.1
- Bump eslint from 9.38.0 to 9.39.0
- Bump sass-embedded from 1.93.2 to 1.93.3
- Bump globals from 16.4.0 to 16.5.0
- Bump @eslint/js from 9.38.0 to 9.39.0
- Bump react-i18next from 16.2.1 to 16.2.3

## 0.17.0

### Features & Enhancements

- Add payroll deadline alert to payroll configuration
- Enable responsive breadcrumb behavior
- Add DescriptionList component with flexible term/description support
- Update payment method copy for self onboarding

### Fixes

- Remove base image styles in favor of emptydata styles
- Remove unused style from base.scss

### Chores & Maintenance

- Bump react-i18next from 16.1.0 to 16.2.1
- Bump lint-staged from 16.2.5 to 16.2.6

## 0.16.0

### Features & Enhancements

- Add breadcrumb navigation to payroll flow component
- Add CTA (Call to Action) functionality to payroll flow breadcrumbs
- Add translation support for pay schedule names
- Enable multiple resource file loading in useI18n hook

### Fixes

- Memoize employee UUID array and switch to API filtering for better performance

### Chores & Maintenance

- Add missing run payroll documentation
- Bump react-i18next from 16.0.1 to 16.1.0
- Bump eslint from 9.37.0 to 9.38.0
- Bump vite from 6.4.0 to 6.4.1
- Bump typescript-eslint from 8.46.1 to 8.46.2
- Bump lint-staged from 16.2.4 to 16.2.5
- Bump msw from 2.11.5 to 2.11.6

## 0.15.0

### Features & Enhancements

- Remove deprecated payroll flow and unstable prefix - Payroll components are now stable
- Implement pagination for payroll configuration
- Add logic to hide skip payroll functionality
- Add emptyState back to DataView component
- Sort payroll config by API instead of client for better performance

### Fixes

- Update PayrollHistory to include correct amount
- Fix twoPercentShareholder form integration and error handling

### Refactoring

- Refactor pagination control to uncontrolled component

### Chores & Maintenance

- Upgrade embedded client to latest 0.8.1
- Bump dompurify from 3.2.7 to 3.3.0
- Bump react-hook-form from 7.64.0 to 7.65.0
- Bump vite from 6.3.6 to 6.4.0
- Bump typescript-eslint from 8.46.0 to 8.46.1
- Bump eslint-plugin-react-refresh from 0.4.23 to 0.4.24

## 0.14.1

### Fixes

- Bug fixes and improvements

## 0.14.0

### Features & Enhancements

- Add LoadingSpinner component and normalize loading behavior across payroll components
- Implement payroll blockers for calculate payroll
- Add warning when employees are getting paid by check
- Add payroll receipt and summary navigation in PayrollHistory
- Add payroll totals for company pays
- Update FLSA minimum salary amount

### Fixes

- Update Text inside table cells to use span instead of div for proper HTML semantics

### Chores & Maintenance

- Upgrade embedded API client to latest version
- Upgrade various production and development dependencies for improved stability

## 0.13.4

### Fixes

- Patch release for bug fixes and improvements around finite state machines

## 0.13.3

### Fixes

- Apply system styles to alert UI for consistent styling
- Hide admin fields when self-onboarding and add form validation
- Update useField to correctly handle component props
- Replace self-onboarding checkbox with switchfield card component

### Chores & Maintenance

- Bump react-hook-form from 7.62.0 to 7.63.0
- Bump robot3 from 1.1.1 to 1.2.0
- Bump typescript-eslint from 8.44.0 to 8.44.1
- Bump eslint from 9.35.0 to 9.36.0
- Bump eslint-plugin-react-refresh from 0.4.20 to 0.4.21
- Bump tsx from 4.20.5 to 4.20.6
- Bump sass-embedded from 1.92.1 to 1.93.2
- Bump msw from 2.11.2 to 2.11.3
- Bump lint-staged from 16.1.6 to 16.2.0
- Bump @eslint/js from 9.35.0 to 9.36.0

## 0.13.2

### Features & Enhancements

- Add alert for edit payroll success
- Add payroll type and pay date to PayrollList
- Add comprehensive footer support to DataView components
- Implement PayrollHistory presentation layer
- Implement new deductions empty state UI

### Chores & Maintenance

- Upgrade embedded API to 0.6.11
- Bump dompurify from 3.2.6 to 3.2.7

## 0.13.1

### Fixes

- Patch release for bug fixes and improvements

## 0.13.0

### Features & Enhancements

- Infrastructural work to support eventual RunPayroll early access

## 0.12.3

### Features & Enhancements

- Separate `Employee.Taxes` into separate `Employee.StateTaxes` and `Employee.FederalTaxes` components and deprecate `Employee.Taxes` (See upgrade guide below)
- Add CTA (Call to Action) functionality to ProgressBar component
- Expose Payroll components as UNSTABLE for early access
- Add Payroll Submit API call functionality

### Fixes

- Fix documentation links ending with .md extension

### Chores & Maintenance

- Upgrade various development dependencies for improved stability
- Update embedded API to latest version

### Migrating `Employee.Taxes` to `Employee.StateTaxes` and `Employee.FederalTaxes`

We have split the `Employee.Taxes` component into dedicated `Employee.StateTaxes` and `Employee.FederalTaxes` components. The `Employee.Taxes` component is now deprecated and will be removed in a future version.

#### Component Usage

**Before (using combined Employee.Taxes):**

```tsx
import { Employee } from '@gusto/embedded-react-sdk'

// In employee onboarding flow
<Employee.Taxes
  employeeId="employee-id"
  isAdmin
  onEvent={(eventType) => {
    if (eventType === componentEvents.EMPLOYEE_TAXES_DONE) {
      // called when taxes is done
    }
  }}
/>

// In self-onboarding flow
<Employee.Taxes
  employeeId="employee-id"
  isAdmin={false}
  onEvent={(eventType) => {
    if (eventType === componentEvents.EMPLOYEE_TAXES_DONE) {
      // called when taxes is done
    }
  }}
/>
```

**After (using separate components):**

```tsx
import { Employee } from '@gusto/embedded-react-sdk'

// In employee onboarding flow - Federal Taxes step
<Employee.FederalTaxes
  employeeId="employee-id"
  onEvent={(eventType) => {
    if (eventType === componentEvents.EMPLOYEE_FEDERAL_TAXES_DONE) {
      // called when federal taxes is done
    }
  }}
/>

// In employee onboarding flow - State Taxes step
<Employee.StateTaxes
  employeeId="employee-id"
  isAdmin
  onEvent={(eventType) => {
    if (eventType === componentEvents.EMPLOYEE_STATE_TAXES_DONE) {
      // called when state taxes is done
    }
  }}
/>

// In self-onboarding flow - Federal Taxes step
<Employee.FederalTaxes
  employeeId="employee-id"
  onEvent={(eventType) => {
    if (eventType === componentEvents.EMPLOYEE_FEDERAL_TAXES_DONE) {
      // called when federal taxes is done
    }
  }}
/>

// In self-onboarding flow - State Taxes step
<Employee.StateTaxes
  employeeId="employee-id"
  isAdmin={false}
  onEvent={(eventType) => {
    if (eventType === componentEvents.EMPLOYEE_STATE_TAXES_DONE) {
      // called when state taxes is done
    }
  }}
/>
```

## 0.12.2

### Features & Enhancements

- Add CTA (Call to Action) functionality to ProgressBar component
- Expose Payroll components as UNSTABLE for early access
- Add Payroll Submit API call functionality

### Fixes

- Fix contractor payment details validation and display
- Fix contractor ID not being passed correctly from profile to submit
- Fix self onboarding switch with correct onboarding status

### Chores & Maintenance

- Upgrade react-i18next from 15.6.0 to 15.7.0
- Upgrade react-hook-form from 7.60.0 to 7.62.0
- Update embedded API to latest version

## 0.12.1

### Fixes

- Fix contractor payment details validation and display
- Fix contractor ID not being passed correctly from profile to submit

### Chores & Maintenance

- Upgrade react-i18next from 15.6.0 to 15.7.0
- Upgrade react-hook-form from 7.60.0 to 7.62.0
- Update embedded API to latest version

## 0.12.0

### Updated theming

We have updated our theming approach for the SDK which is a breaking change. See the breaking changes section for this release below for more information.

### Features & Enhancements

- Expose Speakeasy hooks to consumers of SDK for enhanced API interaction capabilities
- Navigate to add mode when payschedule list is empty
- Use virtualization to optimize comboboxes with long lists
- Update Button styling and variants

### Fixes

- Fix deductions state machine flow and auto-redirect behavior
- Fix deductions copy and export components
- Fix pay schedule preview component registration to react-hook-form
- Fix DatePicker timezone issue
- Fix react-aria select onChange behavior
- Fix vite CSS file name requirement on v6
- Fix console issues in readme publish and type issue in select
- Fix dependencies to satisfy dependabot
- Fix only update onboarding status for admin
- Fix eliminate flash between datacards and datatable
- Fix mark required fields as required to prevent optional label display

### Chores & Maintenance

- Update theming infrastructure and migrate all components to use new flat theme variables
- Change timeout for long running e2e test to 20s
- Add cursor rule files for AI assistance
- Fix docs publishing issues

### Breaking changes

> Note: We are pre alpha and are regularly iterating on the SDK as we learn more about our consumers and their needs which sometimes involves breaking changes. [Read more about our current versioning strategy here](./docs/04/01/versioning.md).

#### Legacy theming infrastructure has been removed in favor of simplified flat theme approach

The legacy theming system with nested objects and complex component-specific themes has been updated. The new system uses a flat theme object that is more straightforward and easier to use.

See the following docs for more context:

- [Theming overview](./docs/theming/theming.md)
- [Theme variables inventory](./docs/theming/theme-variables.md)

The following example provides a before and after with a mapping of the old theme object to the new equivalent.

**Before (nested structure):**

```tsx
<GustoProvider
  theme={{
    typography: {
      font: 'Geist', // Maps to fontFamily
      fontWeight: {
        regular: 400, // Maps to fontWeightRegular
        medium: 500, // Maps to fontWeightMedium
        semibold: 600, // Maps to fontWeightSemibold
        bold: 700, // Maps to fontWeightBold
      },
      fontSize: {
        small: '14px', // Maps to fontSizeSmall
        regular: '16px', // Maps to fontSizeRegular
        medium: '18px', // Maps to fontSizeLarge
      },
      headings: {
        1: '32px', // Maps to fontSizeHeading1
        2: '24px', // Maps to fontSizeHeading2
        3: '20px', // Maps to fontSizeHeading3
        4: '18px', // Maps to fontSizeHeading4
        5: '16px', // Maps to fontSizeHeading5
        6: '14px', // Maps to fontSizeHeading6
      },
      textColor: '#1C1C1C', // Maps to colorBodyContent
    },
    colors: {
      gray: {
        100: '#FFFFFF', // Maps to colorBody
        200: '#FBFAFA', // Maps to colorBodyAccent
        300: '#F4F4F3', // Maps to colorBodyAccent
        400: '#EAEAEA', // Maps to colorBorder
        500: '#DCDCDC', // Maps to inputBorderColor
        600: '#BABABC', // Maps to colorBodySubContent
        700: '#919197', // Maps to colorBodySubContent
        800: '#6C6C72', // Maps to colorBodySubContent
        900: '#525257', // Maps to colorPrimaryAccent
        1000: '#1C1C1C', // Maps to colorPrimary & colorBodyContent
      },
      error: {
        100: '#FFF7F5', // Maps to colorError
        500: '#D5351F', // Maps to colorErrorAccent
        800: '#B41D08', // Maps to colorErrorContent
      },
    },
    input: {
      fontSize: '14px', // Maps to inputLabelFontSize
      radius: '8px', // Maps to inputRadius
      textColor: '#1C1C1C', // Maps to inputContentColor
      borderColor: '#DCDCDC', // Maps to inputBorderColor
      background: '#FFFFFF', // Maps to inputBackgroundColor
    },
    button: {
      fontSize: '14px', // Maps to fontSizeSmall
      fontWeight: 500, // Maps to fontWeightMedium
      borderRadius: '6px', // Maps to buttonRadius
      primary: {
        color: '#FFFFFF', // Maps to colorPrimaryContent
        bg: '#1C1C1C', // Maps to colorPrimary
        borderColor: '#1C1C1C', // Maps to colorPrimary
      },
    },
    focus: {
      color: '#1C1C1C', // Maps to focusRingColor
      borderWidth: '2px', // Maps to focusRingWidth
    },
    shadow: {
      100: '0px 1px 2px 0px rgba(10, 13, 18, 0.05)', // Maps to shadowResting
      200: '0px 4px 6px 0px rgba(28, 28, 28, 0.05), 0px 10px 15px 0px rgba(28, 28, 28, 0.10)', // Maps to shadowTopmost
    },
    badge: {
      borderRadius: '16px', // Maps to badgeRadius
    },
    radius: '6px', // Maps to buttonRadius (default)
    transitionDuration: '200ms', // Maps to transitionDuration
  }}
>
  {children}
</GustoProvider>
```

**After (simplified flat structure):**

```tsx
<GustoProvider
  theme={{
    fontFamily: 'Geist',
    fontWeightRegular: '400',
    fontWeightMedium: '500',
    fontWeightSemibold: '600',
    fontWeightBold: '700',
    fontSizeSmall: '14px',
    fontSizeRegular: '16px',
    fontSizeLarge: '18px',
    fontSizeHeading1: '32px',
    fontSizeHeading2: '24px',
    fontSizeHeading3: '20px',
    fontSizeHeading4: '18px',
    fontSizeHeading5: '16px',
    fontSizeHeading6: '14px',
    colorBody: '#FFFFFF',
    colorBodyAccent: '#F4F4F3',
    colorBodyContent: '#1C1C1C',
    colorBodySubContent: '#6C6C72',
    colorBorder: '#EAEAEA',
    colorPrimary: '#1C1C1C',
    colorPrimaryAccent: '#525257',
    colorPrimaryContent: '#FFFFFF',
    colorError: '#FFF7F5',
    colorErrorAccent: '#D5351F',
    colorErrorContent: '#B41D08',
    inputRadius: '8px',
    inputBackgroundColor: '#FFFFFF',
    inputBorderColor: '#DCDCDC',
    inputContentColor: '#1C1C1C',
    inputLabelFontSize: '16px',
    buttonRadius: '8px',
    focusRingColor: '#1C1C1C',
    focusRingWidth: '2px',
    shadowResting: '0px 1px 2px 0px rgba(10, 13, 18, 0.05)',
    shadowTopmost:
      '0px 4px 6px 0px rgba(28, 28, 28, 0.05), 0px 10px 15px 0px rgba(28, 28, 28, 0.10)',
    badgeRadius: '16px',
    transitionDuration: '200ms',
  }}
>
  {children}
</GustoProvider>
```

## 0.11.3

- Minor release to assist in docs publishing

## 0.11.2

- Expose Speakeasy hooks to consumers of SDK for enhanced API interaction capabilities
- Update checkbox and checkboxgroup components to use new theme variables
- Update alert component to use new theme variables
- Update field components to use new theme variables
- Update input components to use new theme variables
- Update Button styling and variants
- Navigate to add mode when payschedule list is empty
- Use virtualization to optimize comboboxes with long lists
- Change timeout for long running e2e test to 20s
- Add cursor rule files for AI assistance

## 0.11.1

- Fix updating onboarding status for employee when self onboarding
- Fix eliminate flashing empty fields in compensation component
- Fix mark fields as required to match server validation
- Chore - Add github action to be utilized for readme deploy

## 0.11.0

- Update peer dependencies to support React 18
- Add contractor submit block
- Add contractor profile

### Breaking changes

> Note: We are pre alpha and are regularly iterating on the SDK as we learn more about our consumers and their needs which sometimes involves breaking changes. [Read more about our current versioning strategy here](./docs/04/01/versioning.md).

#### Remove exports for compound components

Previously we were exporting subcomponents such as `Employee.EmployeeList.Head` and `Employee.Compensation.Form` etc. We have removed those exports in favor of only exporting the blocks. Ex. only exporting `Employee.EmployeeList` and `Employee.Compensation` etc.

## 0.10.7

- Upgrade embedded api to fix state taxes validation issue
- Fix tax rate fields preventing form submission
- Remove unused docs tests
- Fix RC publish script to allow for branch selection

## 0.10.6

### Fixes

- Fixed company state taxes validation issue
- Fixed document signer state machine signatory issues

## 0.10.5

### Fixes

- Corrected an issue where Pay Schedule wasn't clearing errors on cancel navigation

## 0.10.4

### Fixes

- Fix pay preview functionality in PaySchedule component
- Fix translation type issues
- Restore missing EIN link

### Chores & Maintenance

- Polish contractor table component
- Add RC release and unpublish workflow
- Introduce frontmatter generator for docs
- Introduce preview environment for docs
- Remove inline styles in favor of CSS modules
- Remove axe tests from e2e to stabilize test runs

## 0.10.3

- Expose types for adapter and create a loading indicator provider
- Remove manual invalidation in favor of automatic invalidation after mutation
- Invalidate queryCache after running mutation API
- Produce lockfile for documentation to better organize frontmatter for Github Action
- Reorganize docs to match readme hierarchy

## 0.10.2

### Fixes

- Fix bank account not found error
- Fix ComboBox focus ring

### Chores & Maintenance

- Add reset to InternalError and clean up error handling
- Add initial contractor onboarding documentation
- Add contractor address tests

## 0.10.1

- Fixed work address being stale when editing an existing employee in employee onboarding

## 0.10.0

### Features & Enhancements

- Added contractor payment method with custom validation, including handling for masked account numbers
- Added `annualMaximum` field to DeductionForm with comprehensive tests
- Added PaymentMethod percentage validation tests

### Fixes

- Correctly set version for employee taxes
- Set correct mode on deductions cancel
- Skip state taxes for states that only have questions for admins
- Allow special characters in user name
- Fix split validation
- Fix withholding allowance of 0 causing error on state tax submission
- Restore proper SSN validation
- Update rate to not be labeled optional when it is required

### Chores & Maintenance

- Upgrade embedded API version to 0.6.4
- Update changelog with breaking changes and update docs

## 0.9.0

- Added new Contractor.Address form component for managing contractor address information
- Improved ComboBox accessibility and added comprehensive component tests
- Added accessibility testing infrastructure with foundational component coverage
- Added accessibility tests to complex interactive and data components
- Fixed state tax boolean validation issues
- Updated Gusto embedded-api version to the latest

### Breaking changes

Be sure to note the breaking change listed below for version 0.8.2 around component renaming and removal of the top level Flow component.

## 0.8.2

- Refactored employee flow components structure and improved organization within Employee namespace
- Added component-level dictionary override functionality for improved internationalization
- Updated state taxes component to support API-based validation messages
- Fixed commission Zod schema validation issues
- Fixed issue with headers not being passed properly through our API client

### Breaking changes

> Note: We are pre alpha and are regularly iterating on the SDK as we learn more about our consumers and their needs which sometimes involves breaking changes. [Read more about our current versioning strategy here](./docs/04/01/versioning.md).

#### Rename components to remove the "Flow" naming suffix

The following components have been updated to remove the "Flow" naming suffix.

| Old name                      | Updated name              |
| ----------------------------- | ------------------------- |
| `Employee.DocumentSignerFlow` | `Employee.DocumentSigner` |
| `Company.LocationsFlow`       | `Company.Locations`       |
| `Company.BankAccountFlow`     | `Company.BankAccount`     |
| `Company.StateTaxesFlow`      | `Company.StateTaxes`      |
| `Company.DocumentSignerFlow`  | `Company.DocumentSigner`  |

#### Removed top level Flow component and renamed flow subcomponents

We have removed the top level `Flow` component and have migrated the flow subcomponents to `Employee` and `Company` respectively.

| Old name                          | Updated name                  |
| --------------------------------- | ----------------------------- |
| `Flow.EmployeeOnboardingFlow`     | `Employee.OnboardingFlow`     |
| `Flow.EmployeeSelfOnboardingFlow` | `Employee.SelfOnboardingFlow` |

Some examples of before/after:

_Before_

```tsx
import { Flow } from '@gusto/embedded-react-sdk'

...

<Flow.EmployeeOnboardingFlow ... />
<Flow.EmployeeSelfOnboardingFlow ... />

```

_After_

```tsx
import { Employee } from '@gusto/embedded-react-sdk'

...

<Employee.OnboardingFlow ... />
<Employee.SelfOnboardingFlow ... />
```

## 0.8.1

- Replaced Valibot with Zod for bundle size reduction. Also included zod as a dependency
- Updated package.json to fix an issue with types being unavailable for consumers
- Misc style corrections and consistency fixes
- Updated component adapter documentation to include generated props
- bug: GWS-4966 headers not being set properly for requests when configured in GustoProvider
- moved APIProvider into `embedded-react-sdk` from `embedded-api` package

## 0.8.0

- Company Onboarding flow improvements and fixes:
  - Added comprehensive Company.OnboardingFlow component that guides users through the entire onboarding process
  - Introduced Company.OnboardingOverview component for tracking onboarding progress
  - Improved state management and context handling for onboarding components
  - Enhanced documentation for company onboarding workflow
- Added Company.StateTaxes component for managing state tax requirements
  - Support for state-specific tax forms and requirements
  - Ability to update state tax settings with validation
- Component Adapter initial implementation available with most components (Docs coming soon)
- Rework of exports to enable better tree shaking
- Breadcrumbs have been replaced with Progress Bar for improved user experience
- Common RequirementsList component added

### Breaking changes

> Note: We are pre alpha and are regularly iterating on the SDK as we learn more about our consumers and their needs which sometimes involves breaking changes. [Read more about our current versioning strategy here](./docs/04/01/versioning.md).

#### Deprecation of GustoApiProvider in favor of GustoProvider

`GustoApiProvider` has been deprecated and will be removed in a future version. Please update your code to use `GustoProvider` instead:

```tsx
// Before
<GustoApiProvider config={{ baseUrl: 'https://api.example.com' }}>
  {children}
</GustoApiProvider>

// After
<GustoProvider config={{ baseUrl: 'https://api.example.com' }}>
  {children}
</GustoProvider>
```

## 0.7.0

- Add company federal taxes component
- Refactor existing components to use generated speakeasy hooks and infrastructure
- Implement separation of form inputs from react hook form

### Breaking changes

> Note: We are pre alpha and are regularly iterating on the SDK as we learn more about our consumers and their needs which sometimes involves breaking changes. [Read more about our current versioning strategy here](./docs/04/01/versioning.md).

#### Update default values from snake case to camel case

For internal consistency in our codebase, we updated the `defaultValues` props for all Employee components from snake case values (ex. `first_name`) to be camel cased instead (ex. `firstName`). For example, where before you would do:

```tsx
<Employee.Profile
  defaultValues={{
    employee: {
      first_name: 'Angela',
      last_name: 'Martin'
    },
    homeAddress: {
      street_1: '123 Fake St'
    }
  }}
  ...
/>

// or

<Employee.Compensation
  defaultValues={{
    flsa_status: 'Exempt'
  }}
  ...
>
```

You would do the following instead::

```tsx
<Employee.Profile
  defaultValues={{
    employee: {
      firstName: 'Angela',
      lastName: 'Martin'
    },
    homeAddress: {
      street1: '123 Fake St'
    }
  }}
  ...
/>

// or

<Employee.Compensation
  defaultValues={{
    flsaStatus: 'Exempt'
  }}
  ...
>
```

#### DocumentSigner has been renamed to DocumentSignerFlow

> This was actually reverted in 0.8.2. If you have DocumentSigner as the component name, you can continue to use that if you are on 0.8.2 or later. Between 0.7.0 up until 0.8.2 the naming is DocumentSignerFlow

Where you would previously do

```tsx
<Employee.DocumentSigner employeeId="some-id" onEvent={() => {}} />
```

You should update the naming as follows:

```tsx
<Employee.DocumentSignerFlow employeeId="some-id" onEvent={() => {}} />
```

## 0.6.0

- Allow for default value for flsa_status (employment type field) in compensation
- The default font that ships with the SDK has been updated to 'Geist' so that will update if you do not have a default font specified in your theme
- Update company Industry component to use speakeasy
- Update Employee List component to use speakeasy
- Add a CalendarDisplay component and introduce it to Company PaySchedule component
- Add `isSelfOnboardingEnabled` prop to Employee profile components to disallow self onboarding
- Add company PaySchedule component
- Add styling to SDK internal error component

### Breaking changes

> Note: We are pre alpha and are regularly iterating on the SDK as we learn more about our consumers and their needs which sometimes involves breaking changes. [Read more about our current versioning strategy here](./docs/04/01/versioning.md).

#### Update GustoApiProvider `baseUrl` property to use an absolute URL

Ex. previously you could set a `baseUrl` to a relative URL as follows

```ts
<GustoApiProvider
  config={{
    baseUrl: `some/url/path/`,
  }}
  ...
>
...
</GustoApiProvider>
```

Moving forward, we require setting an absolute URL. Ex updating to be:

```ts
<GustoApiProvider
  config={{
    baseUrl: `https://api.example.com/some/url/path/`,
  }}
  ...
>
...
</GustoApiProvider>
```

#### fontWeight override for typography theme has been changed from `book` to `regular`

Ex. so if you were overriding the `fontWeight` property before using `book`

```ts
<GustoApiProvider
  theme={{
    typography: {
      fontWeight: {
        book: 400,
      },
    },
  }}
  ...
>
...
</GustoApiProvider>
```

You will want to update to use `regular` instead as follows

```ts
<GustoApiProvider
  theme={{
    typography: {
      fontWeight: {
        regular: 400,
      },
    },
  }}
  ...
>
...
</GustoApiProvider>
```

## 0.5.0

- Update to require proxy to add IP address via `x-gusto-client-ip` header
- Responsive table style updates
- Initial speakeasy integration
- Addition of company document signer

## 0.4.1

- Fix for self onboarding profile form validation

## 0.4.0

- Added responsive behavior to foundational components
- Tables now adapt to small viewports using a card-based UI
- Adjusted theme colors for a more neutral appearance
- Fixed layout inconsistencies in buttons and modals
- Add company assign signatory form
- Add company documents list

## 0.3.0

- Updated README to include more comprehensive documentation
- Pagination for EmployeeList
- Responsive theme updates
- Increased stability

## 0.2.0

- Upgraded React to v19
