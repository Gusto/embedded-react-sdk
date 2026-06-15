# Block Components

## Block Components

<a id="compensation"></a>

### Compensation

Self-contained block for viewing and managing an employee's jobs and compensation — the same experience the dashboard surfaces, but as a drop-in component that doesn't require the surrounding dashboard chrome.

#### Parameters

| Parameter | Type                                                                                                         | Description                                  |
| --------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| `props`   | [`CompensationProps`](#compensationprops) & `BaseComponentInterface`\<`"Employee.Management.Compensation"`\> | See [CompensationProps](#compensationprops). |

#### Remarks

Renders a read-only card showing the employee's job(s), pay type, wage, and effective date, along with affordances to edit a job's compensation, add a first job from the empty state, add another job (when the primary job is Nonexempt), delete a non-primary job, and cancel a scheduled future-dated change. Choosing to edit or add a job swaps the card for the corresponding form; a successful add returns to the card with a dismissible "Job successfully added." alert, an edit returns to the card without an alert, and cancelling returns without saving. Wraps everything in error and suspense boundaries.

The card and form surfaces ([CompensationCard](#compensationcard), [CompensationEditForm](#compensationeditform), [CompensationAddJobForm](#compensationaddjobform), [CompensationAddAnotherJobForm](#compensationaddanotherjobform)) are also exported individually for cases where that orchestration is the wrong fit — for example, when a form needs to render in a modal or drawer, when the card needs to appear read-only with no edit/add affordances, or when the swap is driven by a router. Using them directly means owning the swap, the alert, and any cross-component state yourself.

| Event                                                          | Description                                                                                                            | Data                                             |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `employee/management/compensation/card/editRequested`          | Fired when an "Edit" CTA is clicked for a job; the block opens the edit form for that job                              | `{ employeeId: string, jobId: string }`          |
| `employee/management/compensation/card/addRequested`           | Fired when the "Add job" CTA is clicked from the card's empty state; the block opens the add-first-job form            | `{ employeeId: string }`                         |
| `employee/management/compensation/card/addAnotherRequested`    | Fired when the "Add another job" CTA is clicked; the block opens the add-another-job form                              | `{ employeeId: string }`                         |
| `employee/management/compensation/card/jobDeleted`             | Fired after a non-primary job is deleted via the card's confirm dialog; the block stays on the card                    | `{ employeeId: string, jobId: string }`          |
| `employee/management/compensation/card/changeCancelled`        | Fired after a scheduled future-dated change is cancelled from the card; the block stays on the card                    | `{ employeeId: string, compensationId: string }` |
| `employee/management/compensation/editForm/submitted`          | Fired after an edit-compensation save completes; the block returns to the card view                                    | Updated `Compensation` entity                    |
| `employee/management/compensation/editForm/cancelled`          | Fired when the user cancels the edit form; the block returns to the card view                                          | —                                                |
| `employee/management/compensation/addJobForm/submitted`        | Fired after the first job + compensation are saved; the block returns to the card and surfaces the "Job added" alert   | Updated `Compensation` entity                    |
| `employee/management/compensation/addJobForm/cancelled`        | Fired when the user cancels the add-job form; the block returns to the card view                                       | —                                                |
| `employee/management/compensation/addAnotherJobForm/submitted` | Fired after a secondary job + compensation are saved; the block returns to the card and surfaces the "Job added" alert | Updated `Compensation` entity                    |
| `employee/management/compensation/addAnotherJobForm/cancelled` | Fired when the user cancels the add-another-job form; the block returns to the card view                               | —                                                |
| `employee/management/compensation/alertDismissed`              | Fired when the user dismisses the "Job added" success alert above the card                                             | `null`                                           |

---

<a id="compensationaddanotherjobform"></a>

### CompensationAddAnotherJobForm

Standalone form for adding a secondary job and compensation to an employee from the management surface.

#### CompensationAddAnotherJobFormProps

<a id="compensationaddanotherjobformprops"></a>

Props for [CompensationAddAnotherJobForm](#compensationaddanotherjobform).

| Property         | Type                                                                  | Description                                                                                                                                                                                                                                                              |
| ---------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `children?`      | `ReactNode`                                                           | Optional child content rendered inside the component's layout.                                                                                                                                                                                                           |
| `className?`     | `string`                                                              | CSS class name applied to the component's root element.                                                                                                                                                                                                                  |
| `defaultValues?` | `unknown`                                                             | Initial values pre-populated into the component's form fields before the user interacts. The exact shape depends on the specific component — refer to each component's own props type.                                                                                   |
| `dictionary?`    | `Record`\<`"en"`, `DeepPartial`\<`EmployeeManagementCompensation`\>\> | Overrides for the component's i18n strings. Supply a partial object whose keys match the component's resource namespace — any omitted keys fall back to SDK defaults. See the [Translation guide](https://docs.gusto.com/embedded-payroll/docs/translation) for details. |
| `employeeId`     | `string`                                                              | The associated employee identifier.                                                                                                                                                                                                                                      |
| `onEvent`        | `OnEventType`\<[`EventType`](../../index.md#eventtype), `unknown`\>   | Callback invoked when the form emits an event. See the events table on [CompensationAddAnotherJobForm](#compensationaddanotherjobform) for the available event types and payloads.                                                                                       |

#### Remarks

Routed from [CompensationCard](#compensationcard)'s `employee/management/compensation/card/addAnotherRequested` event. Emits its own scoped `submitted` and `cancelled` events — both are your cue to return to the card. [Compensation](#compensation) bundles the card, this form, and the swap and alert wiring as a single drop-in; reach for this form directly only when that orchestration is the wrong fit.

| Event                                                          | Description                                                                            | Data                        |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------- |
| `employee/management/compensation/addAnotherJobForm/submitted` | Fired after the secondary job and compensation are saved; use it to return to the card | Saved `Compensation` entity |
| `employee/management/compensation/addAnotherJobForm/cancelled` | Fired when the user clicks Cancel; use it to return to the card                        | —                           |

---

<a id="compensationaddjobform"></a>

### CompensationAddJobForm

Standalone form for adding an employee's first job and compensation from the management surface.

#### CompensationAddJobFormProps

<a id="compensationaddjobformprops"></a>

Props for [CompensationAddJobForm](#compensationaddjobform).

| Property         | Type                                                                  | Description                                                                                                                                                                                                                                                              |
| ---------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `children?`      | `ReactNode`                                                           | Optional child content rendered inside the component's layout.                                                                                                                                                                                                           |
| `className?`     | `string`                                                              | CSS class name applied to the component's root element.                                                                                                                                                                                                                  |
| `defaultValues?` | `unknown`                                                             | Initial values pre-populated into the component's form fields before the user interacts. The exact shape depends on the specific component — refer to each component's own props type.                                                                                   |
| `dictionary?`    | `Record`\<`"en"`, `DeepPartial`\<`EmployeeManagementCompensation`\>\> | Overrides for the component's i18n strings. Supply a partial object whose keys match the component's resource namespace — any omitted keys fall back to SDK defaults. See the [Translation guide](https://docs.gusto.com/embedded-payroll/docs/translation) for details. |
| `employeeId`     | `string`                                                              | The associated employee identifier.                                                                                                                                                                                                                                      |
| `onEvent`        | `OnEventType`\<[`EventType`](../../index.md#eventtype), `unknown`\>   | Callback invoked when the form emits an event. See the events table on [CompensationAddJobForm](#compensationaddjobform) for the available event types and payloads.                                                                                                     |

#### Remarks

Routed from [CompensationCard](#compensationcard)'s `employee/management/compensation/card/addRequested` event. Emits its own scoped `submitted` and `cancelled` events — both are your cue to return to the card. [Compensation](#compensation) bundles the card, this form, and the swap and alert wiring as a single drop-in; reach for this form directly only when that orchestration is the wrong fit.

| Event                                                   | Description                                                                  | Data                        |
| ------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------- |
| `employee/management/compensation/addJobForm/submitted` | Fired after the job and compensation are saved; use it to return to the card | Saved `Compensation` entity |
| `employee/management/compensation/addJobForm/cancelled` | Fired when the user clicks Cancel; use it to return to the card              | —                           |

---

<a id="compensationcard"></a>

### CompensationCard

Standalone "Compensation" management card that displays an employee's current jobs and compensation, surfaces pending future-dated changes, and exposes edit, add, and delete affordances.

#### CompensationCardProps

<a id="compensationcardprops"></a>

Props for [CompensationCard](#compensationcard).

| Property     | Type                                                                | Description                                                                                                                                              |
| ------------ | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `employeeId` | `string`                                                            | The associated employee identifier.                                                                                                                      |
| `onEvent`    | `OnEventType`\<[`EventType`](../../index.md#eventtype), `unknown`\> | Callback invoked when the card emits an event. See the events table on [CompensationCard](#compensationcard) for the available event types and payloads. |

#### Remarks

The card owns its own data fetch, the pending-change alerts and review modal, and the delete-job confirm dialog. It does not render the compensation edit or add-job forms — instead, it emits a distinct request event for each action, and the consumer routes those to [CompensationEditForm](#compensationeditform), [CompensationAddJobForm](#compensationaddjobform), or [CompensationAddAnotherJobForm](#compensationaddanotherjobform) and renders any post-save success alerts. [Compensation](#compensation) bundles the card, the three form surfaces, and the swap and alert wiring as a single drop-in; reach for the card directly only when that orchestration is the wrong fit (for example, when a form needs to render in a modal or drawer, or when the swap is driven by a router).

| Event                                                       | Description                                                            | Data                                             |
| ----------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------ |
| `employee/management/compensation/card/editRequested`       | Fired when an "Edit" CTA is clicked for a job                          | `{ employeeId: string, jobId: string }`          |
| `employee/management/compensation/card/addRequested`        | Fired when the "Add job" CTA is clicked from the empty state           | `{ employeeId: string }`                         |
| `employee/management/compensation/card/addAnotherRequested` | Fired when the "Add another job" CTA is clicked                        | `{ employeeId: string }`                         |
| `employee/management/compensation/card/jobDeleted`          | Fired after a non-primary job is deleted via the card's confirm dialog | `{ employeeId: string, jobId: string }`          |
| `employee/management/compensation/card/changeCancelled`     | Fired after a scheduled future-dated change is cancelled from the card | `{ employeeId: string, compensationId: string }` |

---

<a id="compensationeditform"></a>

### CompensationEditForm

Standalone form that edits the compensation for a single job, branching automatically between editing the current compensation and an already-scheduled future-dated change.

#### CompensationEditFormProps

<a id="compensationeditformprops"></a>

Props for [CompensationEditForm](#compensationeditform).

| Property         | Type                                                                  | Description                                                                                                                                                                                                                                                                                                                             |
| ---------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `children?`      | `ReactNode`                                                           | Optional child content rendered inside the component's layout.                                                                                                                                                                                                                                                                          |
| `className?`     | `string`                                                              | CSS class name applied to the component's root element.                                                                                                                                                                                                                                                                                 |
| `defaultValues?` | `unknown`                                                             | Initial values pre-populated into the component's form fields before the user interacts. The exact shape depends on the specific component — refer to each component's own props type.                                                                                                                                                  |
| `dictionary?`    | `Record`\<`"en"`, `DeepPartial`\<`EmployeeManagementCompensation`\>\> | Overrides for the component's i18n strings. Supply a partial object whose keys match the component's resource namespace — any omitted keys fall back to SDK defaults. See the [Translation guide](https://docs.gusto.com/embedded-payroll/docs/translation) for details.                                                                |
| `employeeId`     | `string`                                                              | The associated employee identifier.                                                                                                                                                                                                                                                                                                     |
| `jobId`          | `string`                                                              | The id of the job whose compensation is being edited (for example, the `jobId` from the [CompensationCard](#compensationcard) `employee/management/compensation/card/editRequested` payload). The form inspects the job's compensations to decide whether to edit the current compensation or an already-scheduled future-dated change. |
| `onEvent`        | `OnEventType`\<[`EventType`](../../index.md#eventtype), `unknown`\>   | Callback invoked when the form emits an event. See the events table on [CompensationEditForm](#compensationeditform) for the available event types and payloads.                                                                                                                                                                        |

#### Remarks

Pair with [CompensationCard](#compensationcard) to route its `employee/management/compensation/card/editRequested` event to this form. [Compensation](#compensation) bundles the card, the three form surfaces (edit, add job, add another job), and the swap and alert wiring as a single drop-in; reach for this form directly only when that orchestration is the wrong fit (for example, when the form needs to render in a modal or drawer, or when the swap is driven by a router).

| Event                                                 | Description                                                                | Data                              |
| ----------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------- |
| `employee/management/compensation/editForm/submitted` | Fired after the compensation change is saved; use it to return to the card | The updated `Compensation` entity |
| `employee/management/compensation/editForm/cancelled` | Fired when the user clicks Cancel; use it to return to the card            | —                                 |

---

<a id="deductionscard"></a>

### DeductionsCard

Standalone "Deductions" management card. Owns its own data fetch via
`useDeductionsList`, plus the delete confirm dialog, and emits
`EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_ADD_REQUESTED` /
`EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_EDIT_REQUESTED` /
`EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_DELETED` events. The card has no
alert API — alert rendering is the orchestrator's responsibility (block's
`DeductionsCardContextual` for standalone consumption, dashboard chrome
for dashboard consumption).

#### DeductionsCardProps

<a id="deductionscardprops"></a>

Props for [DeductionsCard](#deductionscard)

| Property     | Type                                                                |
| ------------ | ------------------------------------------------------------------- |
| `employeeId` | `string`                                                            |
| `onEvent`    | `OnEventType`\<[`EventType`](../../index.md#eventtype), `unknown`\> |

---

<a id="deductionseditform"></a>

### DeductionsEditForm

Standalone add/edit surface for a single deduction. Renders the shared
`DeductionsForm` with management's own translation dictionary so partner
overrides on `Employee.Management.Deductions` flow into the form text.
Looks up the row to edit by id and translates the form's `onSaved` /
`onCancel` callbacks into the management block's scoped events
(`EMPLOYEE_MANAGEMENT_DEDUCTIONS_EDIT_FORM_CREATED` / `_UPDATED` /
`_CANCELLED`).

#### Parameters

| Parameter           | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `__namedParameters` | `DeductionsEditFormProps` & `Pick`\<`BaseComponentInterface`\<`"common"` \| `"Company.Addresses"` \| `"Company.AssignSignatory"` \| `"Company.BankAccount"` \| `"Company.DocumentList"` \| `"Company.FederalTaxes"` \| `"Company.Industry"` \| `"Company.Locations"` \| `"Company.OnboardingOverview"` \| `"Company.PaySchedule"` \| `"Company.SignatureForm"` \| `"Company.StateTaxes"` \| `"Company.TimeOff.CreateTimeOffPolicy"` \| `"Company.TimeOff.EmployeeTable"` \| `"Company.TimeOff.HolidayPolicy"` \| `"Company.TimeOff.PolicyDetail"` \| `"Company.TimeOff.SelectEmployees"` \| `"Company.TimeOff.SelectPolicyType"` \| `"Company.TimeOff.TimeOffPolicies"` \| `"Company.TimeOff.TimeOffPolicyDetails"` \| `"Company.TimeOff.TimeOffRequests"` \| `"Contractor.Address"` \| `"Contractor.ContractorList"` \| `"Contractor.NewHireReport"` \| `"Contractor.PaymentMethod"` \| `"Contractor.Payments.CreatePayment"` \| `"Contractor.Payments.PaymentHistory"` \| `"Contractor.Payments.PaymentStatement"` \| `"Contractor.Payments.PaymentSummary"` \| `"Contractor.Payments.PaymentsList"` \| `"Contractor.Profile"` \| `"Contractor.Submit"` \| `"Employee.BankAccount"` \| `"Employee.BankFormBody"` \| `"Employee.Compensation"` \| `"Employee.Dashboard"` \| `"Employee.Deductions"` \| `"Employee.DeductionsForm"` \| `"Employee.DocumentManager"` \| `"Employee.DocumentSigner"` \| `"Employee.EmployeeDocuments"` \| `"Employee.EmployeeList"` \| `"Employee.EmploymentEligibility"` \| `"Employee.FederalTaxes"` \| `"Employee.FederalTaxesView"` \| `"Employee.HomeAddress"` \| `"Employee.I9SignatureForm"` \| `"Employee.Landing"` \| `"Employee.Management.Compensation"` \| `"Employee.Management.Deductions"` \| `"Employee.Management.Documents"` \| `"Employee.Management.FederalTaxes"` \| `"Employee.Management.HomeAddress"` \| `"Employee.Management.PaymentMethod"` \| `"Employee.Management.PaymentMethodBankForm"` \| `"Employee.Management.PaymentMethodSplitForm"` \| `"Employee.Management.Paystubs"` \| `"Employee.Management.Profile"` \| `"Employee.Management.StateTaxes"` \| `"Employee.Management.WorkAddress"` \| `"Employee.ManagementEmployeeList"` \| `"Employee.OnboardingSummary"` \| `"Employee.PaySchedules"` \| `"Employee.PaymentMethod"` \| `"Employee.Profile"` \| `"Employee.SplitPaycheck"` \| `"Employee.SplitPaymentsFormBody"` \| `"Employee.StateTaxes"` \| `"Employee.StateTaxesView"` \| `"Employee.Terminations.TerminateEmployee"` \| `"Employee.Terminations.TerminationFlow"` \| `"Employee.Terminations.TerminationSummary"` \| `"InformationRequests.InformationRequestForm"` \| `"InformationRequests.InformationRequestList"` \| `"InformationRequests"` \| `"Payroll.Common"` \| `"Payroll.ConfirmWireDetailsBanner"` \| `"Payroll.ConfirmWireDetailsForm"` \| `"Payroll.Dismissal"` \| `"Payroll.EmployeeSelection"` \| `"Payroll.GrossUpModal"` \| `"Payroll.OffCycle"` \| `"Payroll.OffCycleCreation"` \| `"Payroll.OffCycleDeductionsSetting"` \| `"Payroll.OffCyclePayPeriodDateForm"` \| `"Payroll.OffCycleReasonSelection"` \| `"Payroll.OffCycleTaxWithholding"` \| `"Payroll.PayrollBlocker"` \| `"Payroll.PayrollConfiguration"` \| `"Payroll.PayrollEditEmployee"` \| `"Payroll.PayrollFlow"` \| `"Payroll.PayrollHistory"` \| `"Payroll.PayrollLanding"` \| `"Payroll.PayrollList"` \| `"Payroll.PayrollOverview"` \| `"Payroll.PayrollReceipts"` \| `"Payroll.RecoveryCasesList"` \| `"Payroll.RecoveryCasesResubmit"` \| `"Payroll.Transition"` \| `"Payroll.TransitionCreation"` \| `"Payroll.TransitionPayrollAlert"` \| `"Payroll.WireInstructions"`\>, `"FallbackComponent"`\> |

---

<a id="documentmanager"></a>

### DocumentManager

Read-only document viewer for the admin-facing employee dashboard. Renders the
selected form's PDF — including unsigned forms, which are shown as-is.
Signing is intentionally not offered here; forms are signed by the employee
during onboarding, not by an admin viewing the dashboard.

#### Parameters

| Parameter | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `props`   | `DocumentManagerProps` & `BaseComponentInterface`\<`"common"` \| `"Company.Addresses"` \| `"Company.AssignSignatory"` \| `"Company.BankAccount"` \| `"Company.DocumentList"` \| `"Company.FederalTaxes"` \| `"Company.Industry"` \| `"Company.Locations"` \| `"Company.OnboardingOverview"` \| `"Company.PaySchedule"` \| `"Company.SignatureForm"` \| `"Company.StateTaxes"` \| `"Company.TimeOff.CreateTimeOffPolicy"` \| `"Company.TimeOff.EmployeeTable"` \| `"Company.TimeOff.HolidayPolicy"` \| `"Company.TimeOff.PolicyDetail"` \| `"Company.TimeOff.SelectEmployees"` \| `"Company.TimeOff.SelectPolicyType"` \| `"Company.TimeOff.TimeOffPolicies"` \| `"Company.TimeOff.TimeOffPolicyDetails"` \| `"Company.TimeOff.TimeOffRequests"` \| `"Contractor.Address"` \| `"Contractor.ContractorList"` \| `"Contractor.NewHireReport"` \| `"Contractor.PaymentMethod"` \| `"Contractor.Payments.CreatePayment"` \| `"Contractor.Payments.PaymentHistory"` \| `"Contractor.Payments.PaymentStatement"` \| `"Contractor.Payments.PaymentSummary"` \| `"Contractor.Payments.PaymentsList"` \| `"Contractor.Profile"` \| `"Contractor.Submit"` \| `"Employee.BankAccount"` \| `"Employee.BankFormBody"` \| `"Employee.Compensation"` \| `"Employee.Dashboard"` \| `"Employee.Deductions"` \| `"Employee.DeductionsForm"` \| `"Employee.DocumentManager"` \| `"Employee.DocumentSigner"` \| `"Employee.EmployeeDocuments"` \| `"Employee.EmployeeList"` \| `"Employee.EmploymentEligibility"` \| `"Employee.FederalTaxes"` \| `"Employee.FederalTaxesView"` \| `"Employee.HomeAddress"` \| `"Employee.I9SignatureForm"` \| `"Employee.Landing"` \| `"Employee.Management.Compensation"` \| `"Employee.Management.Deductions"` \| `"Employee.Management.Documents"` \| `"Employee.Management.FederalTaxes"` \| `"Employee.Management.HomeAddress"` \| `"Employee.Management.PaymentMethod"` \| `"Employee.Management.PaymentMethodBankForm"` \| `"Employee.Management.PaymentMethodSplitForm"` \| `"Employee.Management.Paystubs"` \| `"Employee.Management.Profile"` \| `"Employee.Management.StateTaxes"` \| `"Employee.Management.WorkAddress"` \| `"Employee.ManagementEmployeeList"` \| `"Employee.OnboardingSummary"` \| `"Employee.PaySchedules"` \| `"Employee.PaymentMethod"` \| `"Employee.Profile"` \| `"Employee.SplitPaycheck"` \| `"Employee.SplitPaymentsFormBody"` \| `"Employee.StateTaxes"` \| `"Employee.StateTaxesView"` \| `"Employee.Terminations.TerminateEmployee"` \| `"Employee.Terminations.TerminationFlow"` \| `"Employee.Terminations.TerminationSummary"` \| `"InformationRequests.InformationRequestForm"` \| `"InformationRequests.InformationRequestList"` \| `"InformationRequests"` \| `"Payroll.Common"` \| `"Payroll.ConfirmWireDetailsBanner"` \| `"Payroll.ConfirmWireDetailsForm"` \| `"Payroll.Dismissal"` \| `"Payroll.EmployeeSelection"` \| `"Payroll.GrossUpModal"` \| `"Payroll.OffCycle"` \| `"Payroll.OffCycleCreation"` \| `"Payroll.OffCycleDeductionsSetting"` \| `"Payroll.OffCyclePayPeriodDateForm"` \| `"Payroll.OffCycleReasonSelection"` \| `"Payroll.OffCycleTaxWithholding"` \| `"Payroll.PayrollBlocker"` \| `"Payroll.PayrollConfiguration"` \| `"Payroll.PayrollEditEmployee"` \| `"Payroll.PayrollFlow"` \| `"Payroll.PayrollHistory"` \| `"Payroll.PayrollLanding"` \| `"Payroll.PayrollList"` \| `"Payroll.PayrollOverview"` \| `"Payroll.PayrollReceipts"` \| `"Payroll.RecoveryCasesList"` \| `"Payroll.RecoveryCasesResubmit"` \| `"Payroll.Transition"` \| `"Payroll.TransitionCreation"` \| `"Payroll.TransitionPayrollAlert"` \| `"Payroll.WireInstructions"`\> |

---

<a id="documentscard"></a>

### DocumentsCard

Standalone "Documents" (forms) card. Owns its own data fetch via
useDocumentsList and renders the employee's forms in a table with a
per-row "View" action. Emits the management block's scoped event
(`EMPLOYEE_MANAGEMENT_DOCUMENTS_CARD_VIEW_REQUESTED`) when a row's View CTA is
clicked. The card is read-only — viewing or signing a form happens in the
`DocumentManager` screen the orchestrator routes to — and has no alert API:
alert rendering is the orchestrator's responsibility (the block's
`DocumentsCardContextual` for standalone consumption; the dashboard chrome
for dashboard consumption).

#### DocumentsCardProps

<a id="documentscardprops"></a>

Props for [DocumentsCard](#documentscard)

| Property     | Type                                                                |
| ------------ | ------------------------------------------------------------------- |
| `employeeId` | `string`                                                            |
| `onEvent`    | `OnEventType`\<[`EventType`](../../index.md#eventtype), `unknown`\> |

---

<a id="federaltaxescard"></a>

### FederalTaxesCard

Standalone "Federal taxes" card. Owns its own data fetch via
`useFederalTaxesSummary` and emits
`EMPLOYEE_MANAGEMENT_FEDERAL_TAXES_CARD_EDIT_REQUESTED` when the Edit
button is clicked. The card has no alert API — alert rendering (when
introduced) is the orchestrator's responsibility.

#### FederalTaxesCardProps

<a id="federaltaxescardprops"></a>

Props for [FederalTaxesCard](#federaltaxescard)

| Property     | Type                                                                |
| ------------ | ------------------------------------------------------------------- |
| `employeeId` | `string`                                                            |
| `onEvent`    | `OnEventType`\<[`EventType`](../../index.md#eventtype), `unknown`\> |

---

<a id="homeaddresscard"></a>

### HomeAddressCard

Standalone "Home address" card. Owns its own data fetch via
`useHomeAddressSummary` and emits
`EMPLOYEE_MANAGEMENT_HOME_ADDRESS_EDIT_REQUESTED` when the Manage
button is clicked. The card has no alert API — alert rendering
(when introduced) is the orchestrator's responsibility.

#### HomeAddressCardProps

<a id="homeaddresscardprops"></a>

Props for [HomeAddressCard](#homeaddresscard)

| Property     | Type                                                                |
| ------------ | ------------------------------------------------------------------- |
| `employeeId` | `string`                                                            |
| `onEvent`    | `OnEventType`\<[`EventType`](../../index.md#eventtype), `unknown`\> |

---

<a id="paymentmethodbankform"></a>

### PaymentMethodBankForm

Standalone bank-account form for the management flow. Renders the shared
BankFormBody and emits the per-component scoped events
`EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_BANK_FORM_SUBMITTED` and
`EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_BANK_FORM_CANCELLED`. Reads its copy from
the dedicated `Employee.Management.PaymentMethodBankForm` namespace so partner
overrides on the management bank form don't leak into the onboarding form.

#### PaymentMethodBankFormProps

<a id="paymentmethodbankformprops"></a>

Props for [PaymentMethodBankForm](#paymentmethodbankform)

| Property                   | Type                                                                   |
| -------------------------- | ---------------------------------------------------------------------- |
| `defaultValues?`           | `Partial`\<`BankFormData`\>                                            |
| `employeeId`               | `string`                                                               |
| `onEvent`                  | `OnEventType`\<[`EventType`](../../index.md#eventtype), `unknown`\>    |
| `optionalFieldsToRequire?` | `BankFormOptionalFieldsToRequire`                                      |
| `shouldFocusError?`        | `boolean`                                                              |
| `validationMode?`          | `"onChange"` \| `"onBlur"` \| `"onSubmit"` \| `"onTouched"` \| `"all"` |

---

<a id="paymentmethodcard"></a>

### PaymentMethodCard

Standalone "Payment" card. Owns its own data fetch via
usePaymentMethodList and emits the management block's scoped events
(`EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_*`) when the user clicks the card's
CTAs or confirms a bank-account deletion. The card has no alert API — alert
rendering is the orchestrator's responsibility (the block's
`PaymentMethodCardContextual` for standalone consumption; the dashboard
chrome for dashboard consumption).

#### PaymentMethodCardProps

<a id="paymentmethodcardprops"></a>

Props for [PaymentMethodCard](#paymentmethodcard)

| Property     | Type                                                                |
| ------------ | ------------------------------------------------------------------- |
| `employeeId` | `string`                                                            |
| `onEvent`    | `OnEventType`\<[`EventType`](../../index.md#eventtype), `unknown`\> |

---

<a id="paymentmethodsplitform"></a>

### PaymentMethodSplitForm

Standalone split-paycheck form for the management flow. Renders the shared
SplitPaymentsFormBody and emits the per-component scoped events
`EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_SPLIT_FORM_SUBMITTED` and
`EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_SPLIT_FORM_CANCELLED`. Reads its copy from
the dedicated `Employee.Management.PaymentMethodSplitForm` namespace so partner
overrides on the management split form don't leak into the onboarding form.

#### PaymentMethodSplitFormProps

<a id="paymentmethodsplitformprops"></a>

Props for [PaymentMethodSplitForm](#paymentmethodsplitform)

| Property                   | Type                                                                   |
| -------------------------- | ---------------------------------------------------------------------- |
| `employeeId`               | `string`                                                               |
| `onEvent`                  | `OnEventType`\<[`EventType`](../../index.md#eventtype), `unknown`\>    |
| `optionalFieldsToRequire?` | `SplitPaymentsFormOptionalFieldsToRequire`                             |
| `shouldFocusError?`        | `boolean`                                                              |
| `validationMode?`          | `"onChange"` \| `"onBlur"` \| `"onSubmit"` \| `"onTouched"` \| `"all"` |

---

<a id="paystubscard"></a>

### PaystubsCard

Standalone "Paystubs" card. Owns its own data fetch via
usePaystubsList and renders the paginated paystubs table with a
per-row PDF download action. Emits the management block's scoped events
(`EMPLOYEE_MANAGEMENT_PAYSTUBS_CARD_*`) on download request and on
download success. The card has no edit transitions and no alert API —
paystubs is a read-only surface whose only action is a download side
effect that opens the PDF in a new tab.

#### PaystubsCardProps

<a id="paystubscardprops"></a>

Props for [PaystubsCard](#paystubscard)

| Property     | Type                                                                |
| ------------ | ------------------------------------------------------------------- |
| `employeeId` | `string`                                                            |
| `onEvent`    | `OnEventType`\<[`EventType`](../../index.md#eventtype), `unknown`\> |

---

<a id="profilecard"></a>

### ProfileCard

Standalone "Basic details" card. Owns its own data fetch via
`useEmployeeProfileSummary` and emits
`EMPLOYEE_MANAGEMENT_PROFILE_EDIT_REQUESTED` when the Edit button is
clicked. The card has no alert API — alert rendering is the
orchestrator's responsibility (block's `CardContextual` for standalone
consumption, dashboard chrome for dashboard consumption).

#### ProfileCardProps

<a id="profilecardprops"></a>

Props for [ProfileCard](#profilecard)

| Property     | Type                                                                |
| ------------ | ------------------------------------------------------------------- |
| `employeeId` | `string`                                                            |
| `onEvent`    | `OnEventType`\<[`EventType`](../../index.md#eventtype), `unknown`\> |

---

<a id="statetaxescard"></a>

### StateTaxesCard

Standalone "State taxes" card. Owns its own data fetch via
`useStateTaxesSummary` and emits
`EMPLOYEE_MANAGEMENT_STATE_TAXES_EDIT_REQUESTED` when the Edit
button is clicked. The Edit button is hidden when no state on
record has any tax-withholding questions (e.g. WA), matching the
product rule that a state with no income tax has nothing to edit.

#### StateTaxesCardProps

<a id="statetaxescardprops"></a>

Props for [StateTaxesCard](#statetaxescard)

| Property     | Type                                                                |
| ------------ | ------------------------------------------------------------------- |
| `employeeId` | `string`                                                            |
| `onEvent`    | `OnEventType`\<[`EventType`](../../index.md#eventtype), `unknown`\> |

---

<a id="statetaxeseditform"></a>

### StateTaxesEditForm

Standalone state-tax edit screen for the management flow. Wraps the shared
useEmployeeStateTaxesForm hook with scoped events and the
`Employee.Management.StateTaxes` namespace; the shared `EmployeeStateTaxesView`
resolves its text through `useManagementStateTaxesViewDictionary` so partner
overrides on the management namespace don't leak into onboarding.

Emits `EMPLOYEE_MANAGEMENT_STATE_TAXES_UPDATED` on a successful save and
`EMPLOYEE_MANAGEMENT_STATE_TAXES_EDIT_CANCELLED` on Cancel. The orchestrator
(the block or the dashboard) handles both by returning to the card surface.

#### Parameters

| Parameter           | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `__namedParameters` | `Omit`\<`CommonComponentInterface`\<`"Employee.Management.StateTaxes"`\>, `"children"`\> & `object` & `Pick`\<`BaseComponentInterface`\<`"common"` \| `"Company.Addresses"` \| `"Company.AssignSignatory"` \| `"Company.BankAccount"` \| `"Company.DocumentList"` \| `"Company.FederalTaxes"` \| `"Company.Industry"` \| `"Company.Locations"` \| `"Company.OnboardingOverview"` \| `"Company.PaySchedule"` \| `"Company.SignatureForm"` \| `"Company.StateTaxes"` \| `"Company.TimeOff.CreateTimeOffPolicy"` \| `"Company.TimeOff.EmployeeTable"` \| `"Company.TimeOff.HolidayPolicy"` \| `"Company.TimeOff.PolicyDetail"` \| `"Company.TimeOff.SelectEmployees"` \| `"Company.TimeOff.SelectPolicyType"` \| `"Company.TimeOff.TimeOffPolicies"` \| `"Company.TimeOff.TimeOffPolicyDetails"` \| `"Company.TimeOff.TimeOffRequests"` \| `"Contractor.Address"` \| `"Contractor.ContractorList"` \| `"Contractor.NewHireReport"` \| `"Contractor.PaymentMethod"` \| `"Contractor.Payments.CreatePayment"` \| `"Contractor.Payments.PaymentHistory"` \| `"Contractor.Payments.PaymentStatement"` \| `"Contractor.Payments.PaymentSummary"` \| `"Contractor.Payments.PaymentsList"` \| `"Contractor.Profile"` \| `"Contractor.Submit"` \| `"Employee.BankAccount"` \| `"Employee.BankFormBody"` \| `"Employee.Compensation"` \| `"Employee.Dashboard"` \| `"Employee.Deductions"` \| `"Employee.DeductionsForm"` \| `"Employee.DocumentManager"` \| `"Employee.DocumentSigner"` \| `"Employee.EmployeeDocuments"` \| `"Employee.EmployeeList"` \| `"Employee.EmploymentEligibility"` \| `"Employee.FederalTaxes"` \| `"Employee.FederalTaxesView"` \| `"Employee.HomeAddress"` \| `"Employee.I9SignatureForm"` \| `"Employee.Landing"` \| `"Employee.Management.Compensation"` \| `"Employee.Management.Deductions"` \| `"Employee.Management.Documents"` \| `"Employee.Management.FederalTaxes"` \| `"Employee.Management.HomeAddress"` \| `"Employee.Management.PaymentMethod"` \| `"Employee.Management.PaymentMethodBankForm"` \| `"Employee.Management.PaymentMethodSplitForm"` \| `"Employee.Management.Paystubs"` \| `"Employee.Management.Profile"` \| `"Employee.Management.StateTaxes"` \| `"Employee.Management.WorkAddress"` \| `"Employee.ManagementEmployeeList"` \| `"Employee.OnboardingSummary"` \| `"Employee.PaySchedules"` \| `"Employee.PaymentMethod"` \| `"Employee.Profile"` \| `"Employee.SplitPaycheck"` \| `"Employee.SplitPaymentsFormBody"` \| `"Employee.StateTaxes"` \| `"Employee.StateTaxesView"` \| `"Employee.Terminations.TerminateEmployee"` \| `"Employee.Terminations.TerminationFlow"` \| `"Employee.Terminations.TerminationSummary"` \| `"InformationRequests.InformationRequestForm"` \| `"InformationRequests.InformationRequestList"` \| `"InformationRequests"` \| `"Payroll.Common"` \| `"Payroll.ConfirmWireDetailsBanner"` \| `"Payroll.ConfirmWireDetailsForm"` \| `"Payroll.Dismissal"` \| `"Payroll.EmployeeSelection"` \| `"Payroll.GrossUpModal"` \| `"Payroll.OffCycle"` \| `"Payroll.OffCycleCreation"` \| `"Payroll.OffCycleDeductionsSetting"` \| `"Payroll.OffCyclePayPeriodDateForm"` \| `"Payroll.OffCycleReasonSelection"` \| `"Payroll.OffCycleTaxWithholding"` \| `"Payroll.PayrollBlocker"` \| `"Payroll.PayrollConfiguration"` \| `"Payroll.PayrollEditEmployee"` \| `"Payroll.PayrollFlow"` \| `"Payroll.PayrollHistory"` \| `"Payroll.PayrollLanding"` \| `"Payroll.PayrollList"` \| `"Payroll.PayrollOverview"` \| `"Payroll.PayrollReceipts"` \| `"Payroll.RecoveryCasesList"` \| `"Payroll.RecoveryCasesResubmit"` \| `"Payroll.Transition"` \| `"Payroll.TransitionCreation"` \| `"Payroll.TransitionPayrollAlert"` \| `"Payroll.WireInstructions"`\>, `"FallbackComponent"`\> |

---

<a id="workaddresscard"></a>

### WorkAddressCard

Standalone "Work address" card. Owns its own data fetch via
`useEmployeeWorkAddressSummary` and emits
`EMPLOYEE_MANAGEMENT_WORK_ADDRESS_EDIT_REQUESTED` when the Manage button
is clicked. The card has no alert API — alert rendering is the
orchestrator's responsibility (block's `WorkAddressCardContextual` for
standalone consumption, dashboard chrome for dashboard consumption).

#### WorkAddressCardProps

<a id="workaddresscardprops"></a>

Props for [WorkAddressCard](#workaddresscard)

| Property     | Type                                                                |
| ------------ | ------------------------------------------------------------------- |
| `employeeId` | `string`                                                            |
| `onEvent`    | `OnEventType`\<[`EventType`](../../index.md#eventtype), `unknown`\> |

## Interfaces

<a id="compensationprops"></a>

### CompensationProps

Props for [Compensation](#compensation).

#### Extends

- `CommonComponentInterface`\<`"Employee.Management.Compensation"`\>

#### Properties

| Property         | Type                                                                  | Description                                                                                                                                                                                                                                                              |
| ---------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `children?`      | `ReactNode`                                                           | Optional child content rendered inside the component's layout.                                                                                                                                                                                                           |
| `className?`     | `string`                                                              | CSS class name applied to the component's root element.                                                                                                                                                                                                                  |
| `defaultValues?` | `unknown`                                                             | Initial values pre-populated into the component's form fields before the user interacts. The exact shape depends on the specific component — refer to each component's own props type.                                                                                   |
| `dictionary?`    | `Record`\<`"en"`, `DeepPartial`\<`EmployeeManagementCompensation`\>\> | Overrides for the component's i18n strings. Supply a partial object whose keys match the component's resource namespace — any omitted keys fall back to SDK defaults. See the [Translation guide](https://docs.gusto.com/embedded-payroll/docs/translation) for details. |
| `employeeId`     | `string`                                                              | The associated employee identifier.                                                                                                                                                                                                                                      |
| `onEvent`        | `OnEventType`\<[`EventType`](../../index.md#eventtype), `unknown`\>   | Callback invoked when the block emits an event. See the events table on [Compensation](#compensation) for the available event types and payloads.                                                                                                                        |
