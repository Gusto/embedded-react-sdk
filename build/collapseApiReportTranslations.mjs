// Collapse the generated `namespace Translations` body in the API report.
//
// `namespace Translations` is a type-level recreation of the SDK's i18n JSON:
// one `interface` per translation namespace (~105 of them, thousands of keys),
// each key re-declared as `string` with its English default in an
// `@defaultValue` tag. It exists purely so each namespace has a browsable
// Translations reference page — the source of truth is the translation JSON, and
// the whole structure is regenerated into src/i18n/types.d.ts (checked in,
// verified by the derive-check-i18n CI job). Expanded inline by api-extractor it
// adds ~5,500 lines and ~1,400 `// (undocumented)` markers to the report with
// zero review signal.
//
// We collapse ONLY the namespace. The sibling `interface Resources` — the
// namespace→key-interface map backing `keyof Resources` and i18next's `t()`
// typing — is the real, hand-meaningful API contract and stays expanded.
//
// The `// @public export namespace Translations` line is kept (so the report
// still records that the namespace is exported) and its body is replaced with a
// single placeholder. Runs as the last step of `api-report:derive`, so both
// local derives and CI's derive-check-dist (which calls the same script) produce
// the identical collapsed report.

import { readFileSync, writeFileSync } from 'node:fs'

const REPORT_PATH = new URL('../.reports/embedded-react-sdk.api.md', import.meta.url)

const OPEN = 'export namespace Translations {'
const PLACEHOLDER =
  'export namespace Translations { /* per-namespace i18n key interfaces, recreated from the translation JSON — body omitted from report; see src/i18n/types.d.ts and the Translations reference */ }'

const lines = readFileSync(REPORT_PATH, 'utf8').split('\n')
const start = lines.indexOf(OPEN)

// Not present (already collapsed on an idempotent re-run, or removed).
if (start === -1) process.exit(0)

// api-extractor closes a top-level namespace with a column-0 `}`; it is the only
// such line inside the block.
let end = -1
for (let i = start + 1; i < lines.length; i++) {
  if (lines[i] === '}') {
    end = i
    break
  }
}

if (end === -1) {
  throw new Error(
    'collapseApiReportTranslations: found the `namespace Translations` opening but not ' +
      'its closing brace. Has the API report format changed? Update this script.',
  )
}

lines.splice(start, end - start + 1, PLACEHOLDER)
writeFileSync(REPORT_PATH, lines.join('\n'))
