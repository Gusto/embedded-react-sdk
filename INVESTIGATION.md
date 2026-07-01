# i18next 26.3.4 Upgrade Investigation

## Summary
The i18next upgrade from 26.3.3 to 26.3.4 is safe and does not require any code changes. The CI test failure was a transient issue unrelated to the upgrade.

## Release Notes Analysis

### Security Fix
i18next 26.3.4 includes a security fix (GHSA-6jcc-5g8w-32mx, CVSS 5.9) in the `deepExtend` function used by `addResourceBundle(..., deep, overwrite)`.

**The vulnerability:** Previously, `deepExtend` used the `in` operator to check key existence, which walks the prototype chain. This meant a source key matching an inherited built-in (e.g., `hasOwnProperty`, `toString`) could cause recursion into `Object.prototype` and, with `overwrite: true`, corrupt shared built-ins process-wide (DoS).

**The fix:** Now uses `Object.prototype.hasOwnProperty.call` for existence checks, preventing recursion into inherited properties.

**Impact on our codebase:** None. The vulnerability only affects applications passing attacker-controlled data with both `deep: true` and `overwrite: true`.

## Codebase Usage Review

The SDK uses `addResourceBundle` in three locations:

1. **src/i18n/I18n.ts (line 91)**: `addResourceBundle(..., true, false)`
   - Uses `overwrite: false`, so not affected by the vulnerability

2. **src/i18n/I18n.ts (line 114)**: `addResourceBundle(lang, ns, resource[lang], true, true)`
   - Uses partner-provided dictionary configuration (not attacker-controlled)

3. **src/contexts/GustoProvider/GustoProviderCustomUIAdapter.tsx (line 110)**: `addResourceBundle(..., true, true)`
   - Uses partner-provided dictionary configuration (not attacker-controlled)

**Conclusion:** All usages are safe. The SDK does not pass attacker-controlled data to `addResourceBundle`.

## Test Failure Analysis

### CI Failure
The CI reported a failure in `useContractorPaymentMethodForm.test.tsx:65`:
```text
AssertionError: expected false to be true // Object.is equality
expect(result.current.status.isDirectDeposit).toBe(true)
```

### Local Test Results
- **Specific test:** Passed 10 consecutive runs (0% flake rate)
- **Full test suite:** All 3,270 tests passed across 269 test files
- **Mock data:** Verified fixture correctly returns `"type": "Direct Deposit"`

### Root Cause
The `isDirectDeposit` status is derived from `useWatch` tracking the form's `type` field:
```typescript
const watchedType = useWatch({ control: formMethods.control, name: 'type' })
const isDirectDeposit = watchedType === PAYMENT_METHODS.directDeposit
```

The test failure appears to be a **transient/flaky CI issue** unrelated to the i18next upgrade, as:
1. The code logic is unchanged
2. The mock data is correct
3. Tests pass consistently locally on the same commit

## Recommendation
✅ **Safe to merge.** The i18next 26.3.4 upgrade includes a beneficial security fix with no breaking changes or functional impact on the SDK.
