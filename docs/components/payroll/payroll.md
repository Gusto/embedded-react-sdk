---
title: Payroll
sidebar_position: 1
---

The Payroll domain provides components for running payroll on Gusto's embedded payroll platform. These components handle payroll preparation, employee compensation editing, payroll review and submission, off-cycle payrolls, dismissal payrolls, transition payrolls, and payment receipts.

## Flows

| Component | Description |
| --- | --- |
| [Payroll.PayrollFlow](./payroll-flow.md) | End-to-end payroll workflow from landing through submission and receipts. |
| [Payroll.PayrollExecutionFlow](./payroll-execution-flow.md) | Full payroll execution from configuration through submission for a specific payroll. |
| [Payroll.OffCycleFlow](./off-cycle-flow.md) | Workflow for creating and running off-cycle payrolls such as bonuses. |
| [Payroll.DismissalFlow](./dismissal-flow.md) | Workflow for processing dismissal (termination) payrolls. |
| [Payroll.TransitionFlow](./transition-flow.md) | Workflow for creating transition payrolls when changing pay schedules. |

## Blocks

| Component | Description |
| --- | --- |
| [Payroll.PayrollLanding](./payroll-landing.md) | Landing page combining the payroll list with action options. |
| [Payroll.PayrollList](./payroll-list.md) | Displays a list of payrolls for a company with status and actions. |
| [Payroll.PayrollHistory](./payroll-history.md) | Displays historical payroll runs with summary and receipt access. |
| [Payroll.PayrollConfiguration](./payroll-configuration.md) | Payroll preparation step for configuring employee hours, earnings, and deductions. |
| [Payroll.PayrollEditEmployee](./payroll-edit-employee.md) | Form for editing an individual employee's payroll details. |
| [Payroll.PayrollOverview](./payroll-overview.md) | Review and submission step showing payroll totals and confirmation. |
| [Payroll.PayrollReceipts](./payroll-receipts.md) | Displays payroll receipts and payment details after submission. |
| [Payroll.PayrollBlockerList](./payroll-blocker.md) | Displays blocking issues that must be resolved before running payroll. |
| [Payroll.ConfirmWireDetails](./confirm-wire-details.md) | Wire transfer confirmation step for verifying payment details. |
| [Payroll.OffCycleCreation](./off-cycle-creation.md) | Form for creating an off-cycle payroll with type and employee selection. |
| [Payroll.OffCycleDeductionsSetting](./off-cycle-deductions-setting.md) | Configuration for deductions in off-cycle payrolls. |
| [Payroll.OffCycleReasonSelection](./off-cycle-reason-selection.md) | Selection of the reason for running an off-cycle payroll. |
| [Payroll.TransitionCreation](./transition-creation.md) | Form for creating a transition payroll when changing pay schedules. |
| [Payroll.RecoveryCases](./recovery-cases.md) | Displays and manages payroll recovery cases requiring action. |
