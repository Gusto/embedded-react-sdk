# @gusto/embedded-react-sdk - Internal README

This project is licensed under the Apache License 2.0. By submitting a contribution (for example, a pull request) for inclusion in this repository, you agree that your contribution is provided under the Apache License 2.0 — consistent with Section 5 of that license — and you represent that you have the right to submit it under those terms. A signed Contributor License Agreement (CLA) may be required for contributions going forward; we'll update this file if and when that process is in place.

To install dependencies:

```bash
npm install
```

To run:

```bash
npm run dev
```

## Local development

### For components

If you just need to develop a component outside of its context within a workflow, you can use Storybook:

```bash
npm run storybook
```

### For workflows

If you need to test your component within the larger context of a workflow, you'll need to setup Zenpayroll + GWS-Flows.

- Follow setup instructions for [Zenpayroll](https://github.com/Gusto/zenpayroll) and start local dev server
  - In another tab run the following commands in Zenpayroll directory(these generate necessary partner account for `gws-flows`) :

  ```bash
  bundle exec rails runner "DevAccountCreator.new.create_dev_accounts"
  rake partners_api:dev_setup_for_gws_onboarding
  ```

- Follow setup instructions in the readme for [GWS Flows](https://github.com/Gusto/gws-flows)
- in SDK, Run `npm run dev:setup`; if that fails, follow the instructions below to setup manually:
  - Run `npm link ../gws-flows/node_modules/react` in sdk folder - this is needed to avoid duplicate react instances in local development due to using [npm/yarn link](https://legacy.reactjs.org/warnings/invalid-hook-call-warning.html)
  - In GWS-Flows project folder, run `yarn link -r ../embedded-react-sdk`
- In SDK, run `npm run dev`

Now your local changes appear in GWS Flows.

To see the SDK running in GWS Flows, visit it [locally](http://localhost:7777/demos?react_sdk=true) and choose `React SDK (New company)` or `React SDK (Company Onboarded)` under `Select a Type` and click `Create Demo`

Components and Flows will be shown at the top of the page in a `nav`. Company Components will automatically appear as they are added.
Select a Flow or Component to view it

## API client 0.3.2 migration (SDK-1443)

This migration updates `@gusto/embedded-api` from
`npm:@gusto/embedded-api-v-2026-06-15@0.3.1` to `0.3.2` to expose
`paid_time_off[].approved_request_hours`. The 0.3.1 client strips this field during
response validation, so a local TypeScript cast would not recover it. The backend
change is [zenpayroll PR #384412](https://github.com/Gusto/zenpayroll/pull/384412).

This is a client package patch within the same dated API. `API_VERSION` and
`API_QUERY_NAMESPACE` stay on `2026-06-15`; changing either would alter the request
contract or break matching between generated and hand-written query keys.

### Why the related files change

| Related change                                                                          | Why it is required                                                                                                                                                                                                                                                                        | Regression coverage                                                                                                                                                                                                                        |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Employee GET consumers read `employeeShow`                                              | The generated GET response wrapper changed from `employee` to `employeeShow`. Leaving a consumer on the old key yields undefined employee data. Create/update responses still use `employee`; their consumers must keep that key. The HTTP response body itself is unchanged.             | `apiClient032Compatibility.test.tsx` exercises a real GET, update, and automatic refetch through `ApiProvider`; existing employee form/flow tests verify the rendered consumers.                                                           |
| Contractor GET/list consumers read `contractorShow` / `showContractors`                 | The generated wrappers changed from `contractor` / `contractors`. Detail, list, payment selection, and pagination consumers need the new keys. Create/update responses still use `contractor`.                                                                                            | The compatibility test verifies individual/business rows, pagination headers, an update response, and refetch of both detail and list. `useSelectContractors` pagination and multi-page tests retain their existing behavioral assertions. |
| Payroll imports move from `payrollshow` to `unprocessedpayroll`                         | The old generated module was removed. Most symbol names are unchanged, but payroll `EmployeeCompensations` is now `PayrollShowEmployeeCompensations`. These imports support payroll lists, editing, summaries, receipts, and response-normalization hooks.                                | Full typecheck, existing payroll suites, and compatibility tests for prepare/update/GET preserve the runtime response shapes.                                                                                                              |
| Pay-schedule imports move from `payscheduleshow` to `payschedulelistitem`               | The old module was removed. `PayScheduleShow` remains available in the new module; list responses now use `PayScheduleListItem`. Consumers retain their existing behavior and date/automatic-payroll fields.                                                                              | Typecheck, pay-schedule suites, and a real-client list-response test cover these fields.                                                                                                                                                   |
| Shared employee/contractor nested types and onboarding constants use new upstream names | The generated client prefixes names such as `Address`, `OnboardingStatus`, `CurrentEmploymentStatus`, and `OnboardingDocumentsConfig`. `shared/constants.ts` consumes the contractor onboarding enum at runtime, so it requires the renamed value export as well as updated type imports. | Typecheck, onboarding/status suites, and public-model compatibility assertions.                                                                                                                                                            |
| Receipt employee-row imports change                                                     | The receipt model renamed `PayrollReceiptEmployeeCompensations` to `EmployeeCompensations`. That name previously identified payroll compensation rows in a different module. Treating the two as interchangeable would expose the wrong public shape.                                     | A real-client receipt test verifies employee names and net pay; public-model tests distinguish payroll rows from receipt rows.                                                                                                             |
| `build/deriveExternalModels.ts` supplies compatibility aliases                          | Regeneration would otherwise remove seven existing `APIModels` names and repurpose `APIModels.EmployeeCompensations`. The payroll breakdown names also swap their hours/amount meanings upstream. The generator preserves the existing public names and meanings across regeneration.     | `src/models/external.test.ts` imports the public `APIModels` namespace, checks the aliases, and rejects the swapped shapes; `npm run models:verify` checks the generated barrel.                                                           |
| SDK-app imports and response selectors change                                           | Prototypes consume the same installed client as the SDK. They must follow its new module locations and GET wrappers, including contractor self-onboarding and payroll prototypes.                                                                                                         | SDK-app typecheck compared against main with 0.3.1: the same 21 pre-existing errors remain, with no new file/error-code pairs.                                                                                                             |
| Mocked hook responses change                                                            | Mocks that replace generated React Query hooks must return the new client-side wrappers. Raw MSW HTTP fixtures remain flat server responses and must not be wrapped in `employeeShow` or `contractorShow`.                                                                                | Full SDK unit suite, plus real-client tests that mock only the HTTP boundary.                                                                                                                                                              |
| API reports and reference docs regenerate                                               | Public aliases and the upstream model changes need to be reflected in the checked-in generated output. Upstream source links also change from client 0.3.1 to 0.3.2.                                                                                                                      | `npm run derive`, documentation frontmatter lint, and the production docs build.                                                                                                                                                           |

The GET wrapper changes are internal to the generated client. They do not rename
the SDK headless hooks' existing `data.employee`, `data.contractor`, or
`data.contractors` properties, and do not change the raw HTTP JSON bodies.

Federal/state withholding types also change which generated enum names they
reference. Their `fixed` / `percent` values are unchanged; there is no new
withholding calculation or submission rule in this migration.

The generator's `PUBLIC_MODEL_ALIASES` map preserves the SDK compatibility contract.
Do not remove the public aliases when updating this client again simply because the
upstream names have changed. Preserve the published `APIModels` surface, or handle
any intentional removal as an SDK breaking change. Change the generator rather than
editing `src/models/external.ts` by hand.

### Verification commands

```bash
npm run test -- --run --maxWorkers=4
npx tsc --noEmit
npm run derive
npm run models:verify
npm run docs:lint
npm run docs:build
npx tsc --noEmit -p sdk-app/tsconfig.json
```

`src/contexts/ApiProvider/apiClient032Compatibility.test.tsx` exercises the real
client, serializers, response validation, providers, and query invalidation against
MSW HTTP handlers. It intentionally does not mock the generated React Query hooks.
PTO presentation and form behavior are implemented separately in the dependent
SDK-1443 feature PR.

Browser verification uses the existing Demo canaries:

- `e2e/tests/employee/03-update-reentry.spec.ts`: employee GET data reaches the edit form.
- `e2e/tests/contractor/01-mixed-roster.spec.ts`: contractor list data renders both entity types.
- `e2e/tests/contractor/03-onboarding-edit.spec.ts`: contractor GET data reaches the edit form.
- `e2e/tests/payroll/01-regular-landing.spec.ts`: payroll and schedule data render the entry surface.
- `e2e/tests/payroll/06-review-existing.spec.ts`: payroll detail data renders the execution surface.

Run those files with `npm run test:e2e:demo -- <spec paths> --retries=0`. The Demo
backend and valid scenario provisioning are required; a skipped or blocked run is
not evidence of API compatibility. Test results and any remaining blockers should
be recorded with the change when it is reviewed.

### Verification results before the PR split (2026-10-23)

These results cover the original combined migration and PTO change. Each split PR
also records its own validation results in its description.

- Full SDK unit suite: **404 test files passed, 4,656 tests passed, one expected failure**.
- Focused follow-up after strengthening compatibility assertions: **132 tests passed**
  across the client contract, public models, both payroll editors, and headless payroll
  form. These overlap the full suite and are not an additional suite-wide total.
- Real-client migration contract tests: **six passed**, including nullable approved
  hours, GET/update response differences, automatic refetch, and read-only serialization.
- SDK typecheck, production build, derived-model verification, API report generation,
  documentation frontmatter lint, and production documentation build: **passed**.
- Repository ESLint: **zero errors, 24 warnings**. Formatting of changed project files
  passes. The unmodified full format command additionally finds 11 pre-existing,
  untracked `.agents` skill files; those files were left untouched.
- SDK-app typecheck: **21 existing errors**. A clean main checkout with API client
  0.3.1 produces the same file/error-code pairs; the migration introduces none.
- Demo browser run: **three passed, four failed, none skipped**. Employee edit,
  contractor list, and contractor edit passed. The four payroll tests fail during
  accessibility checks with `label-content-name-mismatch`. A separate run of the
  payroll landing canary against clean main with client 0.3.1 reproduces that same
  violation. This is an outstanding baseline accessibility defect, not a passing
  payroll E2E result; the accessibility checks have not been disabled or weakened.

## How to leverage Translations

Translations are stored in [/src/i18n](/src/i18n).

The are broken out by locale (e.g. `en`), then by namespace, which is usually the name of the component they are used in. The source of truth is the `en` locale - the rest will be autogenerated by translation service.

After writing the new translations, run `npm run i18n:generate` to regenerate the checked-in `src/i18n/types.d.ts` (the `Translations` namespace and `Resources` map that type i18next and back the browsable [Translations reference](/docs/reference/Translations)). Commit the regenerated file alongside your JSON — CI's `derive-check-i18n` check fails if it is stale.

In your components, first use `useI18n` hook, which takes in component namespace and loads appropriate resource file into dictionary. After that use the `useTranslation` hook to access the translations in that component and any child components.

### Translation Key Guidelines

Follow these conventions when creating or modifying translation keys:

#### Naming Convention

**Use camelCase for all translation key names:**

```json
{
  "pageTitle": "Federal Tax Information",
  "federalEinLabel": "Federal EIN",
  "federalEinDescription": "Your company's Federal Employer Identification Number",
  "continueCta": "Continue"
}
```

#### Standard Suffixes

Use consistent suffixes to indicate the purpose of each key:

- **`Cta`** - Call-to-action buttons (e.g., `submitCta`, `continueCta`, `cancelCta`)
- **`Label`** - Form field labels (e.g., `firstNameLabel`, `emailLabel`)
- **`Description`** - Help text or descriptions (e.g., `federalEinDescription`)
- **`Title`** - Page or section headings (e.g., `pageTitle`, `sectionTitle`)
- **`Placeholder`** - Input placeholders (e.g., `emailPlaceholder`)
- **`Error`** - Error messages (e.g., `requiredFieldError`, `invalidEmailError`)

#### Grouping Related Keys

Group related keys using nested objects for better organization:

```json
{
  "validations": {
    "firstName": "First name is required",
    "lastName": "Last name is required",
    "email": "Email address is required and must be valid",
    "address": {
      "street1": "Street address is required",
      "city": "City is required",
      "state": "State is required"
    }
  },
  "labels": {
    "openMenu": "Open menu",
    "menuLabel": "Menu"
  },
  "alerts": {
    "progressSaved": "Your progress has been saved",
    "errorEncountered": "There was a problem with your submission"
  }
}
```

Common grouping patterns:

- **`validations`** - Form validation error messages
- **`labels`** - Accessibility labels and field labels
- **`alerts`** - Alert and notification messages
- **`icons`** - Icon accessibility labels
- **`table`** - Table-related labels (column headers, actions)

#### When to Use snake_case

**Only use snake_case when required by external contracts:**

1. **API Enum Values** - When keys match backend API responses:

```json
{
  "onboardingStatus": {
    "admin_onboarding_incomplete": "Admin-onboarding Incomplete",
    "self_onboarding_invited": "Self-onboarding: Invited"
  }
}
```

1. **i18next Pluralization** - Required by i18next for plural forms:

```json
{
  "priority_one": "{{count}}st",
  "priority_two": "{{count}}nd",
  "priority_few": "{{count}}rd",
  "priority_other": "{{count}}th"
}
```

1. **Programmatic Identifiers** - When used as flow/step identifiers that match API:

```json
{
  "stepTitles": {
    "add_addresses": "Add company addresses",
    "federal_tax_setup": "Company federal tax information"
  }
}
```

#### Examples

**Good:**

```json
{
  "pageTitle": "Employee Profile",
  "continueCta": "Continue",
  "cancelCta": "Cancel",
  "validations": {
    "firstName": "First name is required",
    "emailFormat": "Email must be valid format"
  },
  "labels": {
    "personalInfo": "Personal Information"
  }
}
```

**Avoid:**

```json
{
  "page_title": "Employee Profile", // ❌ Don't use snake_case
  "ContinueCTA": "Continue", // ❌ Don't capitalize suffix
  "validation_first_name": "First name...", // ❌ Don't use snake_case
  "first_name_validation": "First name...", // ❌ Poor grouping
  "lbl_personal_info": "Personal Info" // ❌ Don't abbreviate
}
```

## Syncing translations with Lokalise

Source strings and reviewed translations flow to and from [Lokalise](https://lokalise.com/) via two workflows:

- **[Push Sources](https://github.com/Gusto/embedded-react-sdk/actions/workflows/push-sources.yaml)** — runs automatically on every push to `main` that touches `src/i18n/en/**.json`. Pushes the `en` source strings to Lokalise. No PR involved, so it's not affected by anything below.
- **[Pull Translations](https://github.com/Gusto/embedded-react-sdk/actions/workflows/pull-translations.yaml)** — manual (`workflow_dispatch` only, run a few times a month as translations get reviewed in Lokalise). Downloads reviewed `es_US` strings and opens a PR (branch `lokalise-update-<hash>`, labeled `lokalise-translation`) via `Gusto/embedded-i18n-actions/pull_translations`.

Both workflows, plus `check-for-manual-translations` (below), live in `Gusto/embedded-i18n-actions` and this repo's `.github/workflows/`.

### Merging a Pull Translations PR

The PR the workflow opens needs one manual step before it can merge — **`ci.yaml`'s required checks (`build`, `format`, `lint`, etc.) never run on it automatically.** Root cause: `ci.yaml` only triggers on `push`/`merge_group`, and the PR's branch is pushed using the default `GITHUB_TOKEN` — GitHub's built-in anti-recursion rule means a `GITHUB_TOKEN`-authenticated push never triggers other push-triggered workflows. (We tried minting a GitHub App token instead to work around this — see #2680 — but the app available to this repo only has `contents: write`, not `pull_requests: write`, so PR creation itself failed outright. Reverted in #2706. Fixing this for real needs either that app's permissions extended or a dedicated PAT — both blocked on org/app-admin access at the time of writing. If you have that access, revisiting this is worthwhile so the step below can be removed.)

To merge a Pull Translations PR:

1. Trigger the workflow: Actions tab → **Pull Translations** → **Run workflow**.
2. Wait for the `lokalise-update-<hash>` PR to appear (labeled `lokalise-translation`).
3. **Check out the branch locally and push it yourself:**

   ```bash
   git fetch origin
   git checkout lokalise-update-<hash>
   git merge origin/main   # or rebase — either works, see note below
   git push origin lokalise-update-<hash>
   ```

   A push made with your own credentials isn't subject to the anti-recursion rule, so it fires `ci.yaml` normally. If the branch is already up to date with `main` (`git merge` reports "Already up to date"), there's nothing to merge — push an empty commit instead so a `push` event still fires: `git commit --allow-empty -m "chore: trigger CI" && git push`.

4. **Check `format`.** The Lokalise CLI export doesn't add a trailing newline to the downloaded JSON files, which Prettier requires — `format` will fail on any file Lokalise actually changed. Run `npx prettier --write` on the flagged files, commit, and push again:

   ```bash
   npx prettier <path-to-flagged-file> --write
   git add <path-to-flagged-file>
   git commit -m "style: add trailing newline to Lokalise-exported translation files"
   git push
   ```

5. Once all required checks pass, review and merge as usual.

### `check-for-manual-translations`

A separate check (`.github/workflows/check-manual-translations.yaml`) blocks manual hand-edits to `src/i18n/es_US/**` in any PR — those files should only ever be updated by the Pull Translations workflow. It skips validation when the `lokalise-translation` label is present (checked live via `gh pr view`, not the webhook event payload, which is stale by the time these bot-created PRs are evaluated — see #2674 if this check ever regresses). This check is already fixed and working; it's unrelated to the manual step above.

## Creating components

### Block components

Block components are focused, reusable components that serve specific functionality. They follow these patterns:

- **Single Purpose**: Each component should generally handle a specific task (e.g., list, form, etc.)
- **Base Component**: Uses [BaseComponent](./src/components/Base/Base.tsx) for consistent behavior and error handling
- **Compound Pattern**: Exposes subcomponents (Head, List, Actions) for flexibility and composition

#### Examples

- [DocumentList](./src/components/Company/DocumentSigner/DocumentList/DocumentList.tsx)
- [LocationForm](./src/components/Company/Locations/LocationForm/LocationForm.tsx)

### Flow components

Flow components compose block components and other flow components together using state machines to manage transitions. They follow these patterns:

- **State Management**: Uses the [Flow](./src/components/Flow/Flow.tsx) component with a state machine to handle transitions
- **Component Composition**: Can compose both block components (e.g., list → form) and other flow components
- **Naming**: Suffix with "Flow" (e.g., `DocumentSigner`, `Locations`)

For example, `EmployeeOnboardingFlow` composes both block components (profile, taxes) and other flow components (document signer) to create a complete onboarding experience.

#### Examples

- [DocumentSigner](./src/components/Company/DocumentSigner/DocumentSigner.tsx)
- [Locations](./src/components/Company/Locations/Locations.tsx)
- [EmployeeSelfOnboardingFlow](./src/components/Flow/EmployeeSelfOnboardingFlow/EmployeeSelfOnboardingFlow.tsx)

## Testing locally

You can run the test suite locally with the following command:

```bash
npm run test
```

### Accessibility testing

Every test that renders a component is automatically checked for accessibility violations — a global `afterEach` hook (`src/test/setup.ts`) runs [axe](https://github.com/dequelabs/axe-core) against the rendered DOM before cleanup. You don't need to add anything to a new test to get this coverage, and CI fails on any violation (zero-tolerance threshold) since this runs inside the same `test:ci` job that already gates PRs.

The global check uses a relaxed rule set (see `INTEGRATION_TEST_DISABLED_RULES` in `src/test/accessibility.ts`) that ignores page-level rules like `region` and `heading-order` — an isolated component rendered outside a real page layout will always trip those, since it has no surrounding landmarks or document title to check against.

Components with dedicated accessibility test cases can still opt in to a stricter, narrower check via `expectNoAxeViolations(container)` (from `src/test/accessibility.ts`, available globally in tests) scoped to just that component's render output — this catches real issues like missing landmark roles or bad heading order that the relaxed global check intentionally skips. Keep these where they already exist; they're checking something the global gate doesn't.

If a violation is a genuine false positive rather than a real bug, disable only that specific rule with a comment explaining why (following the existing entries in `DEFAULT_DISABLED_RULES`/`INTEGRATION_TEST_DISABLED_RULES`) — don't reach for a broader escape hatch.

## Pull requests

When creating a pull request, use the provided PR template (`.github/PULL_REQUEST_TEMPLATE.md`). Here are the guidelines:

### PR title format

Use conventional commits format for your PR title. **PR titles are validated by CI.** When a release is prepared with `npm run release`, commit history (which uses squash-merge PR titles) determines the version bump and populates the changelog — so PR title format directly affects how releases are documented.

> **Note:** Commitlint runs in two places: as a pre-commit hook (via husky) validating individual commit messages, and as a CI check validating the PR title, which becomes the squash merge commit message.

#### Semantic versioning (semver) mapping

PR titles determine the version bump and changelog entry when a release is prepared, following [semver.org](https://semver.org/) specification:

**During 0.x.x (pre-1.0 development):**

| Commit Type                                                                   | Version Bump              | When to Use                   |
| ----------------------------------------------------------------------------- | ------------------------- | ----------------------------- |
| `feat`                                                                        | **MINOR** (0.1.0 → 0.2.0) | New features or functionality |
| `fix`                                                                         | **PATCH** (0.1.0 → 0.1.1) | Bug fixes                     |
| `feat!` or `fix!` (with `!`)                                                  | **MINOR** (0.1.0 → 0.2.0) | Breaking changes\*            |
| `docs`, `chore`, `refactor`, `test`, `ci`, `style`, `perf`, `build`, `revert` | No bump                   | Non-functional changes        |

\*Per semver spec, during 0.x.x the API is considered unstable, so breaking changes bump MINOR instead of MAJOR. The jump to 1.0.0 will be an intentional decision when we're ready to declare a stable API.

#### Title examples

- `feat: add new component` - New feature → MINOR bump
- `fix: resolve issue with form validation` - Bug fix → PATCH bump
- `feat!: redesign JSX component props` - Breaking change → MINOR bump (during 0.x.x)
- `chore: update dependencies` - Maintenance → no version bump
- `refactor: simplify state machine logic` - Code refactoring → no version bump
- `docs: update README` - Documentation → no version bump

For work tied to a Jira ticket, include the ticket in the scope so the title still follows conventional commits:

- `feat(SDK-123): add payroll blocker alerts` - MINOR bump
- `fix(SDK-456): correct date formatting` - PATCH bump

### PR description sections

- **Summary**: Brief description of what the PR does and why
- **Changes**: Briefly list only the most important changes (high-level only; do not enumerate every file-level change)
- **Demo**: Screenshots or screen recordings showing the changes (when applicable)
- **Related**: Links to Jira tickets, Figma designs, or related PRs
- **Testing**: Instructions for reviewers to test the changes

### Best practices

- Keep PRs focused on a single concern when possible
- Include visual demos (screenshots/videos) for UI changes
- Link to relevant Jira tickets using the format `[SDK-XXX](https://gustohq.atlassian.net/browse/SDK-XXX)`
- Add Storybook stories for new components
- Include unit tests for new functionality
- Run `npm run test` and `npm run lint` before submitting

## Commits

All commits must follow `commitlint` enforced format: `type(scope?): subject  #scope is optional; multiple scopes are supported (current delimiter options: "/", "\" and ",")`
Following types are currently defined:

```text
'build',
'chore',
'ci',
'docs',
'feat',
'fix',
'perf',
'refactor',
'revert',
'style',
'test'
```

[Read more about conventional commits here](https://www.conventionalcommits.org/en/v1.0.0/)

## Documentation

You can find documentation on building with the Gusto Embedded React SDK [in the `docs` directory within this repo](./docs/).

## Cutting a new release

Releases are prepared with [`release-it`](https://github.com/release-it/release-it), which reads commits since the last release, proposes a semver bump, updates `package.json` and `CHANGELOG.md`, and creates a release branch ready for review.

### Option 1: locally

From a clean `main` branch:

```bash
npm run release
```

`release-it` will:

1. Show you the commits since the last release grouped by type
2. Propose a version based on conventional commit prefixes (`feat` → MINOR, `fix` → PATCH, `feat!`/`fix!` → MINOR during 0.x.x)
3. Ask you to confirm or override the target version
4. Bump `package.json`, update `package-lock.json`, and prepend a new section to `CHANGELOG.md`
5. Commit the changes and check out a `chore/release-<version>` branch automatically

Then push and open a PR:

```bash
git push -u origin chore/release-<version>
gh pr create --title "chore: release <version>"
```

### Option 2: via GitHub Actions

Trigger the [Prepare Release](https://github.com/Gusto/embedded-react-sdk/actions/workflows/prepare-release.yaml) workflow from the Actions UI (`Run workflow`). It accepts an optional version override; if left blank it auto-detects from commits. The workflow creates the branch, commits the changes, and opens a PR automatically.

### Stable releases

PRs that change the root `package.json` version are checked by `release-readiness`, regardless of branch name or PR title. Update the branch with the latest `main`, refresh the changelog, then get approval from another maintainer on the final commit. Any subsequent commit, including a merge from `main`, requires fresh approval. PRs without a version change pass this check without additional review requirements.

The check updates independently of the build when a PR or review changes, or when `main` advances. Merge queue checks use approvals of the original PR commits. To refresh the result manually, run [Release Readiness](https://github.com/Gusto/embedded-react-sdk/actions/workflows/release-readiness.yaml) from `main`.

After a release PR merges to `main` with a `chore: release` commit and CI passes, [Publish to NPM](https://github.com/Gusto/embedded-react-sdk/actions/workflows/publish.yaml) starts automatically. The workflow uses `npm-release` to publish to npm, create a Git tag and GitHub Release with changelog notes, and send the release notification.

The intended configuration for `npm-release` allows workflows from `main` without a separate publishing approval once `release-readiness` is enforced. During rollout, keep the existing publishing approval until the new check is verified and required.

### One-off builds

Use [Publish RC to NPM](https://github.com/Gusto/embedded-react-sdk/actions/workflows/publish-rc.yaml) for a one-off build from a branch or commit. Run the workflow from `main` and choose the source using its inputs. It publishes under `rc`, leaving `latest` unchanged, with no Git tag or GitHub Release.

When finished, use [Retire RC](https://github.com/Gusto/embedded-react-sdk/actions/workflows/retire-rc.yaml), supplying the version currently tagged `rc`. It removes the tag; exact-version installs remain available. Both flows support `dry_run`; retirement defaults to preview, so set `dry_run=false` to remove the tag.

Both RC publishing and retirement use `npm-release-manual` and wait for another member of the Embedded SDK team to approve through the workflow run's **Review deployments** prompt. The release owner arranges this approval. Before approving, check the selected source commit and version in the run summary, or the expected version for retirement.

### Manual stable release

[Publish to NPM (Manual)](https://github.com/Gusto/embedded-react-sdk/actions/workflows/publish-manual.yaml) is the escape hatch for when the automatic [Publish to NPM](https://github.com/Gusto/embedded-react-sdk/actions/workflows/publish.yaml) path doesn't fire even though the release itself is fine — e.g. a release commit's CI run got cancelled by merge-queue churn, or failed on a flaky/unrelated job. It is not a way to bypass a real CI failure.

Run it from `main`, supplying the exact commit SHA of the `chore: release` commit to publish. It refuses anything that isn't an already-merged `chore: release` commit on `main`, and like automatic publishing, no-ops if that version is already on npm. It shares the `npm-release-manual` environment with RC publishing/retirement, so it needs the same Embedded SDK team approval through **Review deployments** — check the commit, message, and version in the run summary before approving.

### Retiring a stable version

Stable versions should normally remain available. If one needs to be retired, ask an npm maintainer to deprecate the version and coordinate any GitHub Release cleanup.

### Removing a harmful version

If a version accidentally contains secrets or malicious content, ask an npm maintainer to fully unpublish that version, subject to [npm's unpublish policy](https://docs.npmjs.com/policies/unpublish). RC retirement leaves the package downloadable and is insufficient for this case. Rotate any exposed credentials and coordinate GitHub Release cleanup.

### Testing release workflows

Publishing helpers live in `.github/scripts/`; each helper documents its invocation. Run the publishing helper tests locally with:

```bash
bash .github/scripts/publish-helpers.test.sh
```

These tests exercise inline publishing commands and helpers using mocked npm and HTTP responses plus local Git repositories, without publishing or sending notifications. CI also runs input validation, workflow guards, GitHub Release creation tests, and RC retirement tests. Live workflow runs are still needed to verify npm trust, environment approvals, and runner configuration.

Run release readiness tests without installing dependencies:

```bash
node --test .github/scripts/release-readiness.test.cjs
```

The event workflow is read-only; the evaluator runs trusted code from `main` and reads candidate files through the GitHub API without executing them.

To roll out the approval changes:

1. Configure `npm-release-manual` to require another Embedded SDK team member's approval and prevent self-approval. All three environments must permit workflows from `main` only; RC and manual-publish sources are selected through workflow inputs. Update the npm trusted publisher configuration for RC publishing, retirement, and manual stable publishing to match `npm-release-manual`, then verify all three workflows' OIDC and approval behavior.
2. After the readiness workflows land on `main`, verify PR push, review approval/dismissal, `main` advancement, and merge queue events. Add `release-readiness` as a required check on `main`, selecting GitHub Actions as its source.
3. Only after the check is verified and required, remove the stable publishing approval from `npm-release`. Keep approval required in `npm-release-manual`.

### Documentation versioning

The published docs site uses Docusaurus versioning so partners on older SDK versions can read the docs that match their installed version. **All versioned content lives in `Gusto/embedded-sdk-docs`, not this repo.** This repo only ever carries the live (current) docs in `docs/`; versioned snapshots (`versioned_docs/version-X.Y/`, `versions.json`, `versioned_sidebars/`) accumulate in the downstream repo as releases land.

Snapshots are **keyed by minor**, not by patch. A new minor creates a new snapshot in downstream; patch releases refresh the existing minor's snapshot content. The dropdown stays clean (`0.47`, `0.48`, …).

#### What happens automatically

The [Sync Docs Source](https://github.com/Gusto/embedded-react-sdk/actions/workflows/publish-docs.yaml) workflow does all the work:

- **After Publish to NPM completes** (release): if the released minor isn't in downstream's `versions.json` yet, the workflow runs `npx docusaurus docs:version <minor>` inside the freshly-synced downstream working tree — copying the new `docs/` into `versioned_docs/version-<minor>/`, capturing the sidebar, and prepending the minor to `versions.json`. If the minor is already there (patch release), the workflow refreshes the existing snapshot's file contents from the synced `docs/`.
- **On any push to `docs/**`or`docs-site/**`** on `main`: source is synced to downstream so the live (`current`) docs refresh. Versioned snapshots are not touched.
- **On manual workflow_dispatch**: same as push by default. If downstream's `versions.json` is missing the current `package.json` minor (e.g., bootstrapping a clean downstream), the snapshot is created.

`docs-site/docusaurus.config.ts` is the same file in both places. It reads `versions.json` at config-load time: if absent (this repo), versioning is disabled and the build serves only the live docs; if present (downstream), versioning is active, `lastVersion` is derived from `versions.json[0]`, and the navbar dropdown appears.

#### Editing docs in a released version

To change content for a partner on an older minor:

- For a typo / clarification that should propagate on the **next patch release** of that minor: edit `docs/` here. The next patch refresh will copy the change into the versioned snapshot in downstream.
- To add, remove, or rename a doc in an already-released minor: edit `versioned_docs/version-X.Y/` directly in [Gusto/embedded-sdk-docs](https://github.com/Gusto/embedded-sdk-docs). The patch refresh is content-only — it won't add new files or remove orphaned ones from a versioned snapshot.
- After any such manual edit downstream, also update `versioned_sidebars/version-X.Y-sidebars.json` there if the change affects navigation. Patch refresh does not regenerate the versioned sidebar.

#### When does the variable matter

When the repo variable `DOCS_PUBLISH_ENABLED=true` is set (the current default), the `workflow_run` and `push` triggers above fire automatically. If unset, only manual `workflow_dispatch` runs publish docs. `workflow_dispatch` is allowed any time, so the pipeline can be exercised end-to-end before flipping the variable.

#### Markdown links

Inside `docs/`, use relative links between files (e.g. `[link](../getting-started/index.md)`), not `/docs/...` absolute links. Absolute links don't resolve correctly when the same file is served at a versioned URL like `/docs/0.47/...`.

```md
<!-- Good -->

See the [Getting Started guide](../getting-started/index.md).

<!-- Bad — breaks when served at /docs/0.47/... -->

See the [Getting Started guide](/docs/getting-started/index.md).
```
