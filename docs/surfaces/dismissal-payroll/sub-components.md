---
title: Sub-components
description: Dismissal payroll is delivered as a single orchestrated flow and reuses the standard payroll processing sub-components for execution.
order: 2
---

# Dismissal Payroll sub-components

The Dismissal Payroll workflow is delivered as a single orchestrated flow ([`Payroll.DismissalFlow`](./workflow)) and does not export its own standalone sub-components. After the dismissal payroll is created, the flow internally renders [`Payroll.PayrollExecutionFlow`](../run-payroll/sub-components#execution-flow) with `isDismissalPayroll` enabled to deliver the standard configuration → overview → submission → receipts experience.

---

## Building a custom dismissal experience

If you want to build a custom dismissal-creation step in front of the standard execution UI:

1. Create the off-cycle payroll yourself with `off_cycle_reason: "Dismissed employee"` via the [Create off-cycle payroll endpoint](https://docs.gusto.com/embedded-payroll/reference/post-v1-companies-company_id-payrolls).
2. Render [`Payroll.PayrollExecutionFlow`](../run-payroll/sub-components#execution-flow) directly with the resulting `payrollId` and `isDismissalPayroll={true}`.

For the individual execution sub-components, see the [Payroll Processing sub-components](../run-payroll/sub-components):

- [Configuration](../run-payroll/sub-components#configuration)
- [Overview](../run-payroll/sub-components#overview)
- [Receipts](../run-payroll/sub-components#receipts)
