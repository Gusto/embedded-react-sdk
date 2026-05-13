# SDK-810: Date Normalization

Every UTC bug in this codebase has the same root cause: `Date` carries a time and timezone component, but we use it to represent calendar dates that have neither. All the workarounds — `normalizeDateToLocal`, the regex-parse path in `normalizeToDate`, the `getFullYear/getMonth/getDate` read pattern — exist because of this mismatch.

The fix has three phases. Phase 1 eliminates all known bugs by hardening the existing convention. Phase 2 introduces an internal `ISODate` class that wraps a `YYYY-MM-DD` string, replacing unsafe `Date` construction in models, form state, and utilities — no partner-facing changes. Phase 3 extends the string contract to the partner-facing API as a breaking change, exposing lightweight `ISOString` utilities for cases where partners need to construct date strings. Phase 1 is a prerequisite for the rest — the callsite fixes done in Phase 1 are required work either way.

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
| `CalendarPreview.tsx:32`                                             | `new Date(dateValue.toString())` — `CalendarDate.toString()` yields `YYYY-MM-DD`, parsed as UTC midnight; off by one for UTC+ users           |
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

- [ ] Extend `normalizeToISOString` to accept `Date | string | null`; delete `formatDateToStringDate` and `normalizeDateToLocal`; replace serialization callsites (see table above)
- [ ] Fix `new Date(YYYY-MM-DD)` deserialization in `PayPeriod.fromPayPeriodData`, compensation sorting, and state taxes
- [ ] Address `normalizeToDate` fallthrough for ISO timestamp strings
- [ ] _(Optional)_ Replace `new RFCDate(new Date(string))` → `new RFCDate(string)` in `useEmployeeDetailsForm`, `useHomeAddressForm`, `useWorkAddressForm` — not a bug, removes confusing indirection

---

## Phase 2: `ISODate` as the Internal Date Type

Phase 1 fixes current bugs by convention. Phase 2 introduces a lightweight internal `ISODate` class that stores a `YYYY-MM-DD` string and acts as a translation layer between date formats — providing safe construction from strings, `Date` objects, and `CalendarDate`, and converting back to any of those formats or to `RFCDate` for API calls. When arithmetic is needed (e.g. adding days or months), callsites go through `toCalendarDate()`: `isoDate.toCalendarDate().add({ days: n }).toString()`. `ISODate` itself does not perform arithmetic.

### Adapter Boundary

`DatePickerProps` and `DateRangePickerProps` are the partner-facing API. Phase 2 keeps `Date` at the boundary to preserve zero breaking changes. Phase 3 replaces `Date` with `string` at this boundary — see Phase 3 for details.

`CalendarDate` from `@internationalized/date` remains strictly inside the picker components as the format required by react-aria. It does not appear in form state, models, or business logic. The picker adapter converts at two edges, unchanged from Phase 1:

- **Inbound** (props → react-aria): `value.getFullYear/getMonth/getDate` → `new CalendarDate(...)` — reads local, safe
- **Outbound** (react-aria → props): `new Date(cd.year, cd.month - 1, cd.day)` — local midnight, safe

`DatePickerField` bridges the `Date` boundary and the `ISODate` form state:

- **Inbound** (picker `onChange` → form state): `ISODate.fromDate(date)`
- **Outbound** (form state → picker `value`): `isoDate.toLocalDate()`

### `ISODate` Class

`ISODate` is a private SDK-internal class — not exported. It wraps a `YYYY-MM-DD` string and provides a controlled API that makes the unsafe operations impossible:

```ts
class ISODate {
  private constructor(private readonly value: string) {}

  static from(value: string): ISODate        // validates YYYY-MM-DD format, throws on invalid input
  static fromDate(date: Date): ISODate       // safe conversion via local getters (no UTC)
  static fromCalendarDate(date: CalendarDate): ISODate

  static today(): ISODate                    // today in local timezone

  toString(): string                         // returns YYYY-MM-DD
  toCalendarDate(): CalendarDate             // parseDate(this.value)
  toLocalDate(): Date                        // toCalendarDate().toDate(getLocalTimeZone())
  toRFCDate(): RFCDate                       // new RFCDate(this.value) — direct, no Date intermediary

  isAfter(other: ISODate): boolean           // lexicographic string compare
  isBefore(other: ISODate): boolean
  equals(other: ISODate): boolean
}
```

`toRFCDate()` is the key ergonomic benefit: it eliminates the `new RFCDate(new Date(str))` anti-pattern (which is both redundant and potentially buggy) that appears across the codebase. The correct path becomes `isoDate.toRFCDate()`.

Zod schemas gain `.transform(ISODate.from)` where date fields flow through validation, making form state `ISODate | null` automatically.

### What Changes

**`PayPeriod` model:** Store `data.start_date` as `ISODate.from(data.start_date)` instead of `new Date(data.start_date)` (UTC midnight).

**Compensation sorting:** `a.effectiveDate.toString() <= b.effectiveDate.toString()` — ISO strings sort lexicographically — or `a.effectiveDate.isBefore(b.effectiveDate)`.

**Address pending-change detection:** `data.effectiveDate.isAfter(ISODate.today())` replaces `normalizeToDate` + `startOfLocalDay`.

**`useDateRangeFilter`:** State becomes `ISODate | null`. Arithmetic goes through `toCalendarDate()`: `ISODate.fromCalendarDate(isoDate.toCalendarDate().add({ months: n }))` when storing back as state, or `.toString()` when only the string is needed.

**State taxes date fields:** Zod schemas gain `.transform(ISODate.from)`. Deserialization changes from `new Date(trimmed)` to `ISODate.from(trimmed)`.

**`new RFCDate(...)` callsites:** All `new RFCDate(dateValue)` and `new RFCDate(new Date(str))` callsites become `isoDate.toRFCDate()`.

**`canCancelPayroll`** — the current implementation must be investigated before this migration. The hand-rolled DST logic shifts both `now` and `deadline` into a "fake PT" coordinate system (subtracting 7 or 8 hours), then uses `.setUTCHours(16, 0, 0, 0)` to pin the cutoff to 4 PM in that shifted system. This is self-consistent in the common case but has two edge-case failure modes: the DST boundary is computed at midnight local (not 2 AM), and if `now` and `payrollDeadline` straddle a DST transition they get different offsets, producing a 1-hour error. Once the intended semantics and failure modes are confirmed against tests and the API contract, the correct replacement is:

```ts
const nowPT = now('America/Los_Angeles')
const deadlinePT = parseAbsolute(payroll.payrollDeadline.toISOString(), 'America/Los_Angeles')
const cutoffPT = deadlinePT.set({ hour: 16, minute: 0, second: 0, millisecond: 0 })
return nowPT.compare(cutoffPT) < 0
```

Note: `deadlinePT.set({ hour: 16 })` sets 4 PM on the deadline's _date in PT_. This is only correct if the intent is "4 PM on the same calendar date as `payrollDeadline` in PT" — confirm this against the API contract before adopting this replacement.

### What Gets Removed

- `normalizeToISOString` — replaced by `ISODate.fromDate(date).toString()` or `ISODate.fromDate(date)` depending on context
- `getPacificTimeOffset` — replaced by `now` / `parseAbsolute` from `@internationalized/date`
- `addDays`, `isWeekend` — `addBusinessDays` uses both internally; update `addBusinessDays` to use `@internationalized/date` before removing these helpers
- `startOfLocalDay` (duplicated in two address files)
- Duplicated `dateToCalendarDate` / `calendarDateValueToDate` in both picker files

### Risks

**Large migration surface.** Touches nearly every date-handling file. Requires test coverage before migrating each area. `isStringMode` and `DatePickerField`'s `TValue` generic are untouched — those are Phase 3 concerns.

### Implementation Order

- [ ] Implement `ISODate` class
- [ ] Replace `new RFCDate(...)` callsites with `isoDate.toRFCDate()`
- [ ] Migrate `PayPeriod` model
- [ ] Migrate compensation sorting
- [ ] Migrate address utilities (`startOfLocalDay`, pending-change detection)
- [ ] Migrate `useDateRangeFilter`
- [ ] Migrate state taxes date fields
- [ ] Investigate `canCancelPayroll` DST edge cases; migrate after semantics are confirmed
- [ ] Remove `addDays`, `isWeekend`, `normalizeToISOString`, `getPacificTimeOffset`; deduplicate picker bridge functions

---

## Phase 3: `string` as the Partner-Facing Date Type (Breaking Change)

Phase 2 adopts `ISODate` as the internal date type. Phase 3 closes the partner-facing surface by removing `Date` from all public APIs. The external contract is plain `YYYY-MM-DD` strings — the same format the Gusto API already uses — so for the common case partners pass API strings directly with no conversion.

### Motivation

The Gusto API returns dates as `YYYY-MM-DD` strings. The current `DatePickerProps` API requires `Date`, so partners must convert — and the obvious conversion, `new Date(apiString)`, parses as UTC midnight and produces the wrong calendar date for UTC+ users. A partner following the natural integration path introduces a UTC bug without doing anything unusual.

`Date` as a boundary type has no mechanism to distinguish a safely-constructed `Date` (local midnight, via `new Date(year, month-1, day)`) from an unsafe one (UTC midnight, via `new Date(string)`). The two look identical from the outside. Switching to `YYYY-MM-DD` strings eliminates the conversion step entirely: partners pass the API string directly, and the unsafe construction path does not exist.

### What Changes

**`DatePickerProps`:**

| Prop | Before | After |
| --- | --- | --- |
| `value` | `Date \| null` | `string \| null` |
| `onChange` | `(value: Date \| null) => void` | `(value: string \| null) => void` |
| `minDate` | `Date` | `string` |
| `maxDate` | `Date` | `string` |
| `isDateDisabled` | `(date: Date) => boolean` | `(date: string) => boolean` |

**`DateRangePickerProps`:**

| Prop | Before | After |
| --- | --- | --- |
| `value` | `{ start: Date, end: Date } \| null` | `{ start: string, end: string } \| null` |
| `onChange` | `(range: { start: Date, end: Date } \| null) => void` | `(range: { start: string, end: string } \| null) => void` |
| `minValue` | `Date` | `string` |
| `maxValue` | `Date` | `string` |

**Form `defaultValues`:** Date fields in hook `defaultValues` change from `Date` to `string`.

**`DatePickerField` and `isStringMode`:** `DatePickerField` is currently generic over `TValue extends Date | null | string | null`. Phase 3 removes the generic — the type is always `string | null`. `isStringMode` is removed.

### Adapter Simplification

In Phase 2 the picker adapter is unchanged — it still converts `Date ↔ CalendarDate` using local getters. Phase 3 switches the partner boundary to `string` and introduces `ISODate` into the picker itself:

| | Before Phase 3 | Phase 3 |
| --- | --- | --- |
| Inbound (props → react-aria) | `Date` → local getters → `CalendarDate` | `ISODate.from(value)` → `isoDate.toCalendarDate()` |
| Outbound (react-aria → props) | `new Date(cd.year, cd.month - 1, cd.day)` | `cd.toString()` |

The last timezone-sensitive operation in the adapter layer is removed in Phase 3.

### Format Contract

The accepted format is `YYYY-MM-DD`. Strings with time components are not valid input. The SDK should warn in dev mode if a non-date string is passed. As a belt-and-suspenders measure, internal parsing can guard with `.split('T')[0]` when consuming partner-supplied strings.

### Partner Utilities

The partner-facing type is plain `string`. When passing values from the API directly, no conversion is needed. For cases where a string must be constructed (e.g. `minDate`, `defaultValues` from a `Date` the partner already has), the SDK exports an `ISOString` namespace:

```ts
ISOString.today(): string           // today in local timezone — replaces minDate={new Date()}
ISOString.from(date: Date): string  // safe Date → YYYY-MM-DD using local getters
ISOString.isValid(s: string): boolean
```

`ISOString` is a plain object — not a class, not a type. Partners import it like any other utility. The internal `ISODate` class is not exported.

### Implementation Order

- [ ] Update `DatePickerProps` and `DateRangePickerProps` type signatures
- [ ] Update adapter conversions in `DatePicker.tsx` and `DateRangePicker.tsx` — inbound `ISODate.from(value)` → `isoDate.toCalendarDate()`, outbound `isoDate.toString()`
- [ ] Remove `TValue` generic and `isStringMode` from `DatePickerField`
- [ ] Update all exported hook `defaultValues` types for date fields
- [ ] Export `ISOString` namespace
