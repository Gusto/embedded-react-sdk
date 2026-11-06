# TransitionConfiguration

This component shares copy and behavior with `OffCycleCreation`. When you change one, check the other.

Shared:

- Deductions choice. The copy lives in `deductions.*` here and in `Payroll.OffCycleDeductionsSetting`.
- Tax withholding table and modal. The copy lives in `wageTypeGroups.*` here and in `Payroll.OffCycleTaxWithholding`. In both, "supplemental" sets `fixedWithholdingRate: true`.

Different on purpose:

- This component never creates a payroll. It saves with prepare, then update (PUT).
- The payment date is read only, because the update call can't change it.
