# OffCycleCreation

`TransitionConfiguration` shares copy and behavior with this component. When you change one, check the other.

Shared:

- Deductions choice (`Payroll.OffCycleDeductionsSetting`). The same copy is in `Payroll.TransitionConfiguration` under `deductions.*`.
- Tax withholding table and modal (`Payroll.OffCycleTaxWithholding`). The same copy is in `Payroll.TransitionConfiguration` under `wageTypeGroups.*`. In both, "supplemental" sets `fixedWithholdingRate: true`.
