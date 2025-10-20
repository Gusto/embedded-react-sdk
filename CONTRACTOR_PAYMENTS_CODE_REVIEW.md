# Contractor Payments - Code Review vs Payroll Components

## Issues Found & Recommendations

### 1. ❌ Currency Formatting - Inconsistent with Payroll

**Issue:** ContractorPayment uses inline `Intl.NumberFormat` throughout components.
**Payroll Pattern:** Uses `useNumberFormatter('currency')` hook or `formatNumberAsCurrency()` helper.

**Current (ContractorPayment):**

```typescript
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}
```

**Should Be (Like Payroll):**

```typescript
import useNumberFormatter from '@/components/Common/hooks/useNumberFormatter'
const formatCurrency = useNumberFormatter('currency')
```

**Affected Files:**

- `CreatePaymentPresentation.tsx`
- `OverviewPresentation.tsx`
- `DetailPresentation.tsx`
- `EditModal.tsx`

---

### 2. ❌ Layout Containers - Unnecessary max-width Wrapping

**Issue:** CreatePaymentPresentation wraps content in inline style `<div>` with `maxWidth`.

**Current (ContractorPayment):**

```typescript
return (
  <div style={{ maxWidth: 1040, margin: '0 auto', width: '100%' }}>
    <Flex flexDirection="column" gap={32}>
```

**Payroll Pattern:** Uses Flex directly, lets design system handle layout.

```typescript
return (
  <Flex flexDirection="column" alignItems="stretch">
```

**Should Change:** Remove the wrapper div and let Flex handle layout naturally.

**Affected Files:**

- `CreatePaymentPresentation.tsx` (has two divs wrapping content)
- `EditModal.tsx` (also wraps content)

---

### 3. ❌ Flex Gap Values - Inconsistent Units

**Issue:** Uses different gap value types: `gap={32}`, `gap={16}`, `gap={8}`, `gap="m"`, `gap="l"`.

**Payroll Pattern:** Uses consistent numeric values only (16, 24, 32, etc.) OR uses spacing tokens.

**Current (ContractorPayment):**

```typescript
<Flex flexDirection="column" gap={32}>  // numeric
<Flex flexDirection="column" gap={16}>  // numeric
<Flex flexDirection="column" gap={8}>   // numeric
<Flex gap="m">                          // string token - INCONSISTENT!
<Flex gap="l">                          // string token - INCONSISTENT!
```

**Should Be:** Use numeric values consistently:

```typescript
<Flex gap={24}>  // "m" = 24px
<Flex gap={32}>  // "l" = 32px
```

**Affected Files:**

- `PaymentHistoryPresentation.tsx` (uses gap="m", gap="l")

---

### 4. ⚠️ Alert/Banner Components - Pattern Mismatch

**Issue:** ContractorPayment manually handles alerts in markup. Payroll uses proper Alert component more consistently.

**Current (ContractorPayment):**

```typescript
{bannerMessage && (
  <Alert status={bannerType} label={t('title')}>
    {bannerMessage}
  </Alert>
)}
```

**Better Payroll Pattern:** Uses alerts at top-level with more structured approach.

**Recommendation:** The current pattern is acceptable, but make sure ALL alerts use the Alert component consistently (not inline HTML).

---

### 5. ❌ Number Formatting - Should Use Helper Functions

**Issue:** ContractorPayment duplicates number formatting logic in each component.

**Payroll Pattern:** Uses centralized helpers like:

```typescript
import { formatNumberAsCurrency } from '@/helpers/formattedStrings'
```

**Current (ContractorPayment):** Each component has its own `formatCurrency` function.

**Should Consolidate:** Use `formatNumberAsCurrency()` helper from `/src/helpers/formattedStrings.ts`

**Affected Files:**

- All presentation components

---

### 6. ❌ Empty State Pattern - Should Use Consistent Component

**Issue:** Only PaymentHistory uses `EmptyData` + `ActionsLayout` pattern. Others don't handle empty states clearly.

**Payroll Pattern:** Uses proper empty state component throughout.

**Current (ContractorPayment):**

```typescript
// PaymentHistoryPresentation - Good ✅
<EmptyData title={t('noPaymentsFound')} description={t('noPaymentsDescription')}>
  <ActionsLayout justifyContent="center">
    <Button variant="primary" onClick={onCreatePayment}>
      {t('createPayment')}
    </Button>
  </ActionsLayout>
</EmptyData>
```

**Other components don't have this.** Recommendation: Use this pattern consistently.

---

### 7. ❌ useDataView Hook - Inconsistent Usage

**Issue:** Only PaymentHistoryPresentation uses `useDataView` hook properly. Other components pass columns directly to DataView.

**Current (Inconsistent):**

```typescript
// PaymentHistoryPresentation - Uses useDataView ✅
const { ...dataViewProps } = useDataView({
  data: paymentHistory,
  columns: [...],
  emptyState: () => (...)
})
return <DataView label={t('subtitle')} {...dataViewProps} />

// CreatePaymentPresentation - Direct props ❌
return (
  <DataView
    columns={[...]}
    data={tableData}
    label={t('title')}
  />
)
```

**Recommendation:** Use `useDataView` hook consistently OR use direct props consistently. Payroll tends toward direct props for simple cases.

---

### 8. ⚠️ Date Formatting - Locale Awareness

**Issue:** ContractorPayment uses `formatDateNamedWeekdayShortPlusDate()` (good!), but Payroll uses various date formatting approaches.

**Current:** This is fine, but make sure `useLocale()` is imported if needed for localization.

**Status:** ✅ Actually doing this correctly in Detail.tsx

---

### 9. ❌ Component Context Destructuring - Inconsistent

**Issue:** Inconsistent in how many components are destructured at once.

**Current (ContractorPayment):**

```typescript
// Different amounts per file
const { Button, Text, Heading } = useComponentContext()
const { Button, Text, Heading, TextInput } = useComponentContext()
const { Button, Text, Heading, Card, RadioGroup, NumberInput } = useComponentContext()
```

**Recommendation:** This is actually fine - destructure what you need per file. Payroll does the same.

---

### 10. ⚠️ SelectField vs Select Component

**Issue:** ContractorPayment uses `Select` but should probably use `SelectField` for form consistency (per your guidelines [[memory:10135007]]).

**Current (ContractorPayment):**

```typescript
<Select
  value={selectedDateRange}
  onChange={value => onDateRangeChange(value)}
  options={dateRangeOptions}
/>
```

**Should Be (If in a form):**

```typescript
<SelectField
  value={selectedDateRange}
  onChange={value => onDateRangeChange(value)}
  options={dateRangeOptions}
/>
```

**Status:** This particular one is fine (date range filter, not a form field). But check EditModal - it uses `RadioGroup` directly instead of form-wrapped components where applicable.

---

## Summary of Changes Needed

| Priority  | Issue                                                          | Files     | Effort  |
| --------- | -------------------------------------------------------------- | --------- | ------- |
| 🔴 High   | Replace inline Intl.NumberFormat with `useNumberFormatter`     | 4 files   | 30 mins |
| 🔴 High   | Remove unnecessary `<div>` wrappers with inline styles         | 2 files   | 15 mins |
| 🟡 Medium | Convert gap string tokens to numeric values                    | 1 file    | 5 mins  |
| 🟡 Medium | Consolidate number formatting to helper functions              | 4 files   | 20 mins |
| 🟡 Medium | Use `useDataView` hook consistently (if choosing that pattern) | 2-3 files | 20 mins |
| 🟢 Low    | Add empty state components to Detail view                      | 1 file    | 10 mins |

---

## Action Plan

### Phase 1 (Critical - 1 hour):

1. Replace all `formatCurrency` implementations with `useNumberFormatter` hook
2. Remove inline `<div>` style wrappers
3. Update gap values from strings to numbers

### Phase 2 (Important - 1 hour):

1. Import and use `formatNumberAsCurrency` helper
2. Ensure DataView usage is consistent across all components
3. Add proper empty states where missing

### Phase 3 (Polish - 30 mins):

1. Audit component context destructuring
2. Verify all Alert/Banner patterns match Payroll
3. Final consistency check

---

## Payroll Component Reference Files

- `/src/components/Payroll/PayrollOverview/PayrollOverviewPresentation.tsx` - Layout pattern
- `/src/components/Payroll/PayrollHistory/PayrollHistoryPresentation.tsx` - Empty state + DataView
- `/src/helpers/formattedStrings.ts` - Number/currency formatting
