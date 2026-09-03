# RRoP UNSTABLE_PayrollEditEmployee — UI handoff

Strict UI changes only. Two files:
- src/components/Payroll/UNSTABLE_PayrollEditEmployee/UNSTABLE_PayrollEditEmployee.tsx
- src/components/Payroll/UNSTABLE_PayrollEditEmployee/UNSTABLE_PayrollEditEmployee.module.scss

## Apply
`git apply rrop-edit-employee-ui.patch` (baseline is the pre-UI stub component).
If it conflicts, just copy the two files verbatim from branch `rrop-edit-employee-ui`.

## Depends on (must already exist on the target branch)
Hook `usePayrollEditEmployeeForm` returning:
- `data.employee`, `data.employeeCompensation`, `data.preparedPayroll`, `data.isOvertimeEligible`
- `form.Fields.jobs[]` (`{ jobUuid, title?, hours, additionalEarnings }`), `form.Fields.other`,
  `form.Fields.timeOff`, `form.Fields.finalPayout?`, `form.Fields.paymentMethod?`
- `isSplitByWorkweek`, `HourEntry`, `TimeOffEntry` from the hook's `fields`
- `PayrollEditEmployeeFormData` type from the hook

i18n keys used in `Payroll.UNSTABLE_PayrollEditEmployee`:
`pageTitle, grossPayLabel, cancelCta, saveCta, hoursUnit, hourTypeColumn, typeColumn,
amountColumn, hoursColumn, otherTitle, regularHoursTitle, regularHoursTitleWithoutOvertime,
additionalEarningsTitle, timeOffTitle, timeOffTitleDismissal, finalPayoutTitle,
finalPayoutDescription, timeOffBalance.remaining, paymentMethodTitle, paymentMethodLabel,
paymentMethodDescription, paymentMethodOptions.{directDeposit,check}, compensationNames.*,
fixedCompensationNames.*, validations.negativeAmount`
