<!-- Partner-facing guide content, published to the SDK docs site. -->

# PayrollFlow

## Step flow <!-- slot: appendix -->

`PayrollFlow` opens on the landing page (`PayrollLanding`), which lists pending and calculated payrolls and acts as the hub: every path launches from it and returns to it, so the flow has no terminal step. Selecting a payroll to run (`runPayroll/selected`) or reviewing a calculated one (`payroll/review`) hands off to `PayrollExecutionFlow`; starting an off-cycle payroll (`runPayroll/offCycle/start`) hands off to `OffCycleFlow`; running a transition payroll from the alert (`transition/runPayroll`) or the payroll list (`transition/payrollSelected`) opens `TransitionConfiguration`, and saving its settings (`transition/configured`) hands off to `PayrollExecutionFlow` for the same payroll; and viewing all blockers (`runPayroll/blockers/viewAll`) opens `PayrollBlockerList`.

```mermaid
flowchart LR
  start@{ shape: sm-circ } --> Landing["PayrollLanding"]
  Landing <--> Execution["PayrollExecutionFlow"]
  Landing <--> OffCycle["OffCycleFlow"]
  Landing <--> Transition["TransitionConfiguration"]
  Landing <--> Blockers["PayrollBlockerList"]
  Transition --> Execution
  Execution --> SubmittedOverview["PayrollOverview"]
  OffCycle --> SubmittedOverview
  SubmittedOverview --> SubmittedReceipts["PayrollReceipts"]
  SubmittedOverview --> Landing
  SubmittedReceipts --> Landing
  class Execution flow
  class OffCycle flow
  linkStyle 1,2,3,4 stroke-width:2.5px
```

When any run path finishes processing (`runPayroll/processed`), the flow lands on the submitted overview (`PayrollOverview`), which can drill into receipts (`runPayroll/receipt/get` → `PayrollReceipts`). Returning to the landing hub happens via the breadcrumb header (`breadcrumb/navigate`) or **Save & exit** (`payroll/saveAndExit`) — here both are handled internally, returning to landing rather than exiting. A submitted payroll that is later cancelled (`runPayroll/cancelled`) also returns to landing, where a cancellation alert is shown. If the overview finds the payroll is no longer calculated (for example, it was cancelled in another session), it shows an error state whose **Back to payrolls** action (`runPayroll/notCalculated/backToList`) returns to landing.
