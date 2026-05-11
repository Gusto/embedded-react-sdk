# SDK-810: Date Normalization

Every UTC bug in this codebase has the same root cause: `Date` carries a time and timezone component, but we use it to represent calendar dates that have neither. All the workarounds — `normalizeDateToLocal`, the regex-parse path in `normalizeToDate`, the `getFullYear/getMonth/getDate` read pattern — exist because of this mismatch.

The fix has two phases. Phase 1 eliminates all known bugs by hardening the existing convention. Phase 2 migrates the internal type to `CalendarDate`, which makes correct behavior structural rather than conventional. Phase 1 is a prerequisite for Phase 2 — the callsite fixes done in Phase 1 are required work either way.

---

## Audit

### Libraries

| Library                   | Purpose                                                    |
| ------------------------- | ---------------------------------------------------------- |
| `@internationalized/date` | `CalendarDate` / `DateValue` — react-aria picker internals |
| `@gusto/embedded-api`     | `RFCDate` — wraps dates for API submission                 |
| _(none)_                  | No date-fns, dayjs, moment, or luxon                       |

All date manipulation outside the picker layer uses native JS `Date` and `Intl` APIs.

### Date Types in Use

#### 1. JavaScript `Date` Object

Primary internal representation. Used for state, props, business logic, and class properties throughout the codebase.

Key serialization operations and their timezone safety:

| Operation              | Method                                        | Timezone-safe? |
| ---------------------- | --------------------------------------------- | -------------- |
| Extract year/month/day | `.getFullYear()`, `.getMonth()`, `.getDate()` | ✅ Local       |
| Convert to YYYY-MM-DD  | `.toISOString().split('T')[0]`                | ⚠️ Reads UTC   |
| Locale-aware display   | `.toLocaleDateString(locale, options)`        | ✅ Local       |
| Set time to midnight   | `.setHours(0, 0, 0, 0)`                       | ✅ Local       |

#### 2. `CalendarDate` / `DateValue` (`@internationalized/date`)

Used **only inside picker components** as the format required by react-aria. `CalendarDate` is `{ year, month, day }` with no timezone.

Both `DatePicker.tsx` and `DateRangePicker.tsx` define identical local bridge functions (duplicated):

```
Date → getFullYear/getMonth/getDate → "YYYY-MM-DD" → parseDate() → CalendarDate
CalendarDate → { year, month, day } → new Date(year, month-1, day) → Date
```

`CalendarPreview.tsx` has two unsafe patterns: `formatDateToStringDate(highlight.date)` and `formatDateToStringDate(dateRange.start/end)` use `.toISOString()` ⚠️; the `isInRange` helper does `new Date(date.toString())` where `date` is a `DateValue` — `CalendarDate.toString()` yields `"YYYY-MM-DD"`, which `new Date()` parses as UTC midnight, making the range comparison wrong for UTC+ users ⚠️.

#### 3. Date Strings (`YYYY-MM-DD`)

The API boundary format. Functions that produce them:

| Function                                                   | Method                         | Safe? |
| ---------------------------------------------------------- | ------------------------------ | ----- |
| `normalizeToISOString`                                     | `getFullYear/getMonth/getDate` | ✅    |
| `formatDateToStringDate`                                   | `.toISOString().split('T')[0]` | ⚠️    |
| `coerceToISODate`, `toISODateString`, several inline sites | `.toISOString().split('T')[0]` | ⚠️    |

Functions that parse them: `normalizeToDate` handles `YYYY-MM-DD` safely via regex + local-midnight constructor. Inline `new Date(apiString)` elsewhere reads UTC midnight ⚠️.

#### 4. `RFCDate` (`@gusto/embedded-api`)

Wraps dates for API write mutations. Serializes internally via `.toISOString().slice(0, 10)` (UTC).

- **Safe:** `new RFCDate("YYYY-MM-DD")` — string input is UTC midnight; serializes back correctly
- **Safe (but redundant):** `new RFCDate(new Date("YYYY-MM-DD"))` — `new Date` parses the string as UTC midnight; `RFCDate` serializes back via UTC; roundtrip is correct. The intermediate `Date` is unnecessary and confusing, but not buggy.
- **Unsafe:** `new RFCDate(new Date(localMidnightDate))` — if the `Date` was constructed via `new Date(year, month, day)` (local midnight), then UTC serialization reads the previous day for UTC+ users ⚠️

Three files use `new RFCDate(new Date(string))`: `useEmployeeDetailsForm` (`dateOfBirth`), `useHomeAddressForm` (`effectiveDate`), `useWorkAddressForm` (`effectiveDate`). Because these fields are typed as `z.iso.date()` in their Zod schemas, the value is always a `YYYY-MM-DD` string — so the UTC roundtrip cancels and no data-integrity bug occurs. The pattern is redundant noise, not a bug.

### Central Utilities

**`src/helpers/dateFormatting.ts`** — all date utilities. Notable:

- `normalizeToDate` — parses `YYYY-MM-DD` to local-midnight `Date` ✅; falls through to `new Date(string)` for other formats (e.g. ISO timestamps) ⚠️ — callers that pass non-date strings inherit UTC parsing
- `normalizeToISOString` — safe serialization via local getters ✅; only accepts `string`, not `Date`
- `formatDateToStringDate` — unsafe serialization via `.toISOString()` ⚠️
- `normalizeDateToLocal` — patches UTC-midnight `Date` to local; exists solely to work around `formatDateToStringDate`

**`src/hooks/useDateFormatter.ts`** — React hook wrapping all display formatters with the current locale.

### Known Timezone Issues

| Location                                                             | Issue                                                                                                                                          |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `formatDateToStringDate` (`dateFormatting.ts:171`)                   | `.toISOString()` reads UTC                                                                                                                     |
| `coerceToISODate` (`preprocessors.ts:10`)                            | `.toISOString()` reads UTC                                                                                                                     |
| `toISODateString` (`useDateRangeFilter.ts:26`)                       | `.toISOString()` reads UTC                                                                                                                     |
| `PaymentsList.tsx:34-35`                                             | Inline `.toISOString()` reads UTC                                                                                                              |
| `useEmployeeStateTaxesForm.tsx:289`                                  | `.toISOString()` reads UTC                                                                                                                     |
| `PayPeriod.fromPayPeriodData`                                        | `new Date(YYYY-MM-DD)` → UTC midnight                                                                                                          |
| `Payroll/helpers.ts` (compensation effective dates)                  | `new Date(effectiveDate)` on string → UTC midnight                                                                                             |
| `useEmployeeStateTaxesForm` deserialization                          | `new Date(trimmed)` on string → UTC midnight                                                                                                   |
| `CalendarPreview.tsx:32`                                             | `new Date(dateValue.toString())` — behavior varies                                                                                             |
| `useEmployeeDetailsForm`, `useHomeAddressForm`, `useWorkAddressForm` | `new RFCDate(new Date(string))` — redundant UTC roundtrip, but **not a bug**: fields are `z.iso.date()` strings so UTC→UTC conversion cancels correctly |
| `getHoursUntil`, `getDaysUntil` (`dateFormatting.ts`)                | Pass string to `normalizeToDate`, which falls through to `new Date(string)` for ISO timestamps → UTC parsing; arithmetic is off for UTC+ users |

### Notable Domain Patterns

**Payroll (`canCancelPayroll`):** Hand-rolled DST-aware Pacific Time offset for a 4 PM PT deadline check. The implementation offsets both `now` and `deadline` into a "fake PT" coordinate system (subtracting 7 or 8 hours from their UTC timestamps), then calls `.setUTCHours(16, 0, 0, 0)` on the pre-shifted deadline to pin the cutoff to fake-4-PM. Because both sides of the comparison are in the same shifted system, the comparison is self-consistent and produces the correct 4 PM PT cutoff in the common case. However, the logic is fragile in two ways: (1) the DST boundary check uses midnight local time rather than 2 AM, so the PT offset can be wrong by 1 hour in a narrow window around the transition; (2) if `now` and `payrollDeadline` straddle a DST transition they receive different offsets (-7 vs -8), introducing a 1-hour error. These edge cases need explicit investigation and test coverage before any migration touches this function.

**`PayPeriod` model:** Stores `Date` via `new Date(data.start_date)` (⚠️ UTC midnight). Display via `toLocaleDateString` reads local time, so UTC+ users may see the previous day.

**Off-cycle min check date:** `new Date()` + `setHours(0,0,0,0)` + `addBusinessDays` — local midnight consistently ✅.

**Address pending-change detection:** `normalizeToDate` + `startOfLocalDay` comparison — timezone-safe ✅.

**Holiday math:** Pure `new Date(year, month, day)` arithmetic with no string parsing — correct ✅.

### Summary

| Date type           | Where used                                | Notes                       |
| ------------------- | ----------------------------------------- | --------------------------- |
| `Date`              | Everywhere — state, props, business logic | Primary internal type       |
| `CalendarDate`      | Picker UI layer only                      | react-aria internal         |
| `DateValue`         | Picker UI layer only                      | react-aria callback type    |
| `RFCDate`           | API write boundary                        | Safe only with string input |
| `YYYY-MM-DD` string | API boundary, form state                  | To/from API                 |
| ISO timestamp       | `payrollDeadline` and some API fields     | Includes time component     |

---

## Phase 1: Harden the Existing `Date` Convention

### What Changes

**Clean up `new RFCDate(new Date(string))` patterns** — replace with `new RFCDate(string)` in 3 files: `useEmployeeDetailsForm` (`dateOfBirth`), `useHomeAddressForm` (`effectiveDate`), `useWorkAddressForm` (`effectiveDate`). These fields are `z.iso.date()` strings, so the intermediate `Date` is a harmless UTC roundtrip rather than a live bug. The change is optional cleanup for clarity — not a correctness fix.

**Extend `normalizeToISOString`** to accept `Date | string | null` (currently only `string | null`). Implementation reads `getFullYear/getMonth/getDate` for both input types — no UTC.

**Delete `formatDateToStringDate`** and **`normalizeDateToLocal`** (only ever called to work around `formatDateToStringDate`).

**Replace ~12 broken serialization callsites:**

| File                                                                    | Was                                                       | Becomes                                          |
| ----------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------ |
| `DatePickerField.tsx`                                                   | `normalizeDateToLocal(v)` → `formatDateToStringDate(...)` | `normalizeToISOString(v)`                        |
| `DatePicker.tsx`                                                        | `formatDateToStringDate(value)` → `parseDate(...)`        | `normalizeToISOString(value)` → `parseDate(...)` |
| `CalendarPreview.tsx`                                                   | `formatDateToStringDate(date)`                            | `normalizeToISOString(date)`                     |
| `preprocessors.ts`                                                      | `val.toISOString().split('T')[0]`                         | `normalizeToISOString(val)`                      |
| `useDateRangeFilter.ts`                                                 | `date.toISOString().split('T')[0]`                        | `normalizeToISOString(date)`                     |
| `PaymentsList.tsx`                                                      | `new Date().toISOString().split('T')[0]`                  | `normalizeToISOString(new Date())`               |
| `useEmployeeStateTaxesForm.tsx`                                         | `formValue.toISOString().split('T')[0]`                   | `normalizeToISOString(formValue)`                |
| _(+ 4 more: signatory, pay schedule, contractor profile, payroll list)_ | —                                                         | —                                                |

**Fix `new Date(YYYY-MM-DD)` deserialization patterns** — replace with `normalizeToDate(apiString)` in `PayPeriod.fromPayPeriodData`, compensation sorting, and state taxes deserialization.

**Fix `normalizeToDate` fallthrough** — the function parses `YYYY-MM-DD` safely but falls through to `new Date(string)` for all other formats. Callers that pass ISO timestamps (`getHoursUntil`, `getDaysUntil`) inherit UTC parsing. Either restrict the function to `YYYY-MM-DD` only and reject other strings, or add an explicit safe path for timestamps via a separate `normalizeToDateTime` utility.

### What Stays the Same

All type signatures, partner hook APIs, `DatePickerProps`, arithmetic helpers, `PayPeriod` model shape. No breaking changes.

### Implementation Order

1. Extend `normalizeToISOString`; delete `formatDateToStringDate` and `normalizeDateToLocal`; replace serialization callsites
2. Fix `new Date(YYYY-MM-DD)` deserialization callsites
3. Address `normalizeToDate` fallthrough for timestamp strings
4. _(Optional cleanup)_ `new RFCDate(new Date(string))` → `new RFCDate(string)` in 3 employee form files — not a bug, but removes confusing indirection

---

## Phase 2: `CalendarDate` as the Internal Date Type

Phase 1 fixes current bugs by convention. Phase 2 makes the correct behavior impossible to violate: `CalendarDate` has no time component and no UTC methods, so the class of bug cannot arise.

### Adapter Boundary Is Fixed

`DatePickerProps` and `DateRangePickerProps` are the partner-facing API and must keep `Date` at the boundary. Everything above this boundary is internal and can change.

Conversions happen at two edges:

- **Inbound** (adapter → form): `value.getFullYear/getMonth/getDate` → `new CalendarDate(...)` — reads local, safe
- **Outbound** (form → adapter): `new Date(cd.year, cd.month - 1, cd.day)` — local midnight, safe
- **Display**: `cd.toDate(getLocalTimeZone()).toLocaleDateString(...)`

### What Changes

**`PayPeriod` model:** `parseDate(data.start_date)` → `CalendarDate` instead of `new Date(data.start_date)` (UTC midnight).

**Compensation sorting:** `parseDate(a.effectiveDate).compare(parseDate(b.effectiveDate))` instead of `new Date(effectiveDate).getTime()`.

**Address pending-change detection:** `parseDate(raw).compare(today(getLocalTimeZone())) > 0` replaces `normalizeToDate` + `startOfLocalDay`.

**`useDateRangeFilter`:** State becomes `CalendarDate | null`; arithmetic via `.add({ months: n })`; serialization via `.toString()`.

**State taxes date fields:** Deserialization via `parseDate(trimmed)`, serialization via `formValue.toString()`.

**`canCancelPayroll`** — the current implementation must be investigated before this migration. The hand-rolled DST logic shifts both `now` and `deadline` into a "fake PT" coordinate system (subtracting 7 or 8 hours), then uses `.setUTCHours(16, 0, 0, 0)` to pin the cutoff to 4 PM in that shifted system. This is self-consistent in the common case but has two edge-case failure modes: the DST boundary is computed at midnight local (not 2 AM), and if `now` and `payrollDeadline` straddle a DST transition they get different offsets, producing a 1-hour error. Once the intended semantics and failure modes are confirmed against tests and the API contract, the correct replacement is:

```ts
const nowPT = now('America/Los_Angeles')
const deadlinePT = parseAbsolute(payroll.payrollDeadline.toISOString(), 'America/Los_Angeles')
const cutoffPT = deadlinePT.set({ hour: 16, minute: 0, second: 0, millisecond: 0 })
return nowPT.compare(cutoffPT) < 0
```

Note: `deadlinePT.set({ hour: 16 })` sets 4 PM on the deadline's _date in PT_. This is only correct if the intent is "4 PM on the same calendar date as `payrollDeadline` in PT" — confirm this against the API contract before adopting this replacement.

### What Gets Removed

- `normalizeDateToLocal` — already removed in Phase 1
- `formatDateToStringDate` — already removed in Phase 1
- `normalizeToISOString` — replaced by `parseDate(s).toString()`
- `getPacificTimeOffset` — replaced by `ZonedDateTime`
- `addDays`, `isWeekend` — replaced by `.add({ days: n })` and `dayOfWeek >= 6`
- `startOfLocalDay` (duplicated in two address files)
- Duplicated `dateToCalendarDate` / `calendarDateValueToDate` in both picker files

### Risks

**1. Form value type change could be breaking.** If `DatePickerField`'s generic changes from `Date | null` to `CalendarDate | null`, partners reading form values directly would see a type change. _Mitigation: use `CalendarDate` as a safe intermediate, keep `Date` stored in form state — fixes all bugs with zero breaking changes._

**2. `dayOfWeek` indexing differs.** `CalendarDate.dayOfWeek`: Mon=1, Sun=7. `Date.getDay()`: Sun=0, Sat=6. A direct port of `isWeekend` gets this wrong. _Mitigation: a single `isCalendarWeekend` utility._

**3. Large migration surface.** Touches nearly every date-handling file. Requires test coverage before migrating each area.

### Open Question: Where Does `CalendarDate` Live in Form State?

- **Conservative:** use `CalendarDate` as a safe intermediate only; keep `Date` in form state. Fixes all bugs, zero breaking changes, `isStringMode` survives unchanged.
- **Progressive:** store `CalendarDate` in form state. Eliminates `isStringMode`, cleaner long-term, but is technically a breaking change.

`isStringMode` exists because `DatePickerField` is generic over `Date | null` _or_ `string | null`. Partners that bind date fields to a Zod schema where values round-trip as strings rely on the string output path. Before taking the progressive path, confirm no partner uses `DatePickerField<string>` — check SDK documentation and partner-facing examples.

### Implementation Order

`DatePickerField` → `PayPeriod` → address utilities → `canCancelPayroll` (after bug investigation) → remaining form files
