# Payroll Blocker Translation Fix

## Problem

The payroll blocker system was falling back to string manipulation and API messages instead of using proper i18n translations. This happened because:

1. **Incorrect Translation Key Format**: The `getBlockerTranslationKeys` function was generating keys with an incorrect namespace prefix (`PayrollBlocker:blockers.${key}.title`) that didn't match the actual translation structure
2. **Fallback Behavior**: When translations weren't found, the code fell back to:
   - Title: String manipulation converting `pending_recovery_case` → "Pending Recovery Case"
   - Description: Using raw API message strings directly
3. **Duplicate Blockers**: Multiple instances of the same blocker type (e.g., 2 pending information requests) were displayed as separate blocker entries instead of being consolidated

## Solution

### 1. Fixed Translation Key Generation

**File**: `src/components/Payroll/PayrollBlocker/payrollHelpers.ts`

Changed from:

```typescript
titleKey: `PayrollBlocker:blockers.${key}.title`
```

To:

```typescript
titleKey: `blockers.${key}.title`
```

The namespace (`Payroll.PayrollBlocker`) is already set via `useTranslation('Payroll.PayrollBlocker')`, so the keys should be relative to that namespace.

### 2. Improved Fallback Defaults

**Files**:

- `src/components/Payroll/PayrollBlocker/components/PayrollBlockerAlerts.tsx`
- `src/components/Payroll/PayrollBlocker/PayrollBlocker.tsx`

Changed from using string manipulation as the primary fallback:

```typescript
defaultValue: blocker.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
```

To using a proper fallback translation:

```typescript
defaultValue: t('defaultBlockerDescription')
```

The API message is still used as a secondary fallback for descriptions:

```typescript
defaultValue: blocker.message || t('defaultBlockerDescription')
```

### 3. Added Blocker Deduplication

**Files**:

- `src/components/Payroll/PayrollBlocker/components/PayrollBlockerAlerts.tsx`
- `src/components/Payroll/PayrollBlocker/PayrollBlocker.tsx`

Added logic to deduplicate blockers by their `key` field using a `Map`:

```typescript
const uniqueBlockersMap = new Map<string, ApiPayrollBlocker>()
allBlockers.forEach(blocker => {
  if (!uniqueBlockersMap.has(blocker.key)) {
    uniqueBlockersMap.set(blocker.key, blocker)
  }
})
const uniqueBlockers = Array.from(uniqueBlockersMap.values())
```

**Why this matters:**

- If there are 3 pending information requests, only 1 "Request for information pending" blocker is displayed
- If there are 2 recovery cases with status "open", only 1 "Recovery case pending" blocker is displayed
- If the API returns duplicate blocker keys for any reason, they are consolidated into a single entry

### 4. Added Comprehensive Test Coverage

**File**: `src/components/Payroll/PayrollBlocker/components/PayrollBlockerAlerts.test.tsx`

Added tests to validate:

- ✅ Known blockers (e.g., `pending_recovery_case`, `pending_information_request`) use translations correctly
- ✅ Translation text is displayed, NOT API message strings
- ✅ Unknown blockers fall back gracefully to default translations
- ✅ Synthetic blockers from information requests and recovery cases are handled correctly
- ✅ Multiple information requests only display one blocker entry
- ✅ Multiple recovery cases only display one blocker entry
- ✅ Duplicate blocker keys from API are deduplicated

### 5. Added Test Fixture

**File**: `src/test/mocks/fixtures/get-v1-companies-company_uuid-payrolls-blockers-with-pending.json`

Created a fixture that includes the specific blocker types mentioned in the requirements.

## Data Flow Validation

### API Response Structure

The blockers endpoint returns:

```json
[
  {
    "key": "pending_recovery_case",
    "message": "You have unresolved recovery cases blocking payroll."
  }
]
```

### Translation Lookup Process

1. API returns blocker with `key: "pending_recovery_case"`
2. `getBlockerTranslationKeys("pending_recovery_case")` generates:
   - `titleKey: "blockers.pending_recovery_case.title"`
   - `descriptionKey: "blockers.pending_recovery_case.description"`
3. `t()` looks up in `Payroll.PayrollBlocker` namespace
4. Finds match in `src/i18n/en/Payroll.PayrollBlocker.json`:
   ```json
   {
     "blockers": {
       "pending_recovery_case": {
         "title": "Recovery case pending",
         "description": "You have unresolved recovery cases. Resolve them to unblock your account."
       }
     }
   }
   ```
5. UI displays: "Recovery case pending" (NOT "Pending Recovery Case" from string manipulation)

## Verified Blockers

The following blocker types now correctly use translations:

### Explicitly in translations:

- ✅ `pending_recovery_case` → "Recovery case pending"
- ✅ `pending_information_request` → "Request for information pending"
- ✅ `missing_signatory` → "Signatory Required"
- ✅ `missing_bank_info` → "Bank Account Required"
- ✅ All other blockers listed in `Payroll.PayrollBlocker.json`

### Synthetic blockers (generated from API data):

- ✅ Pending information requests (when `blocking_payroll: true`)
- ✅ Unresolved recovery cases (when status is `open`, `redebit_initiated`, or `wire_initiated`)

## Test Results

All tests passing:

- ✅ PayrollBlockerAlerts: 14 tests passed (added 3 deduplication tests)
- ✅ PayrollBlockerList: 14 tests passed
- ✅ payrollHelpers: 7 tests passed
- ✅ PayrollConfiguration: 10 tests passed

Total: 45 tests passed with no failures.

### Deduplication Test Coverage

New tests added to verify:

1. **Multiple information requests → Single blocker**: 3 pending RFIs display as 1 "Request for information pending"
2. **Multiple recovery cases → Single blocker**: 3 open recovery cases display as 1 "Recovery case pending"
3. **Duplicate API blocker keys → Deduplicated**: API returning duplicate keys shows only 1 entry
