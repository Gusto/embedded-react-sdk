<!-- Documentation for the Payroll domain. This will be included in docs/reference/payroll/index.md. -->

# Payroll

The Payroll domain provides flows for running and managing payroll. It supports regular payroll runs, off-cycle payments, contractor dismissal payrolls, and payroll transitions.

Use `PayrollFlow` to embed a complete end-to-end payroll run experience — selecting pay period, reviewing employee hours and compensation, and submitting for processing. `PayrollExecutionFlow` covers the post-submission execution step separately. Additional flows handle off-cycle runs (`OffCycleFlow`), transition payrolls (`TransitionFlow`), and dismissal payrolls (`DismissalFlow`).
