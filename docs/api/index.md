---
title: API Reference
description: API reference for @gusto/embedded-react-sdk — components, hooks, and utilities for Gusto Embedded Payroll.
custom_edit_url: null
---

# @gusto/embedded-react-sdk

## Namespaces

|Namespace|Description|
|-|-|
|[EmployeeManagement](Employee/EmployeeManagement/flows.md)|-|
|[Payroll](Payroll/index.md)|-|

## Components

<a id="apiprovider"></a>

### ApiProvider

Wires the `@gusto/embedded-api-v-2025-11-15` client and a React Query client into the React tree.

#### ApiProviderProps

<a id="apiproviderprops"></a>

Props for [ApiProvider](#apiprovider).

|Property|Type|Description|
|-|-|-|
|<a id="property-apiproviderpropschildren"></a> `children`|`ReactNode`|Subtree that renders inside the API + React Query providers.|
|<a id="property-apiproviderpropsheaders"></a> `headers?`|`HeadersInit`|Default headers applied to every SDK request, in addition to the `X-Gusto-API-Version` header set automatically.|
|<a id="property-apiproviderpropshooks"></a> `hooks?`|[`SDKHooks`](#sdkhooks)|Lifecycle hooks for intercepting and modifying SDK requests and responses.|
|<a id="property-apiproviderpropsqueryclient"></a> `queryClient?`|`QueryClient`|Optional React Query client. When omitted, a client is created with the SDK's defaults (auto-invalidation on mutation success).|
|<a id="property-apiproviderpropsurl"></a> `url`|`string`|Base URL the SDK uses for all `@gusto/embedded-api-v-2025-11-15` requests.|

#### Remarks

Registers the SDK's `X-Gusto-API-Version` header on every request, applies any default `headers`,
and registers user-supplied lifecycle hooks (`beforeCreateRequest`, `beforeRequest`, `afterSuccess`,
`afterError`). When no `queryClient` is supplied, one is created with the SDK's defaults so
successful mutations under the `['@gusto/embedded-api-v-2025-11-15']` key invalidate every SDK
query automatically. Partners who supply their own `QueryClient` are responsible for matching that
contract.

Typically wrapped by [GustoProvider](#gustoprovider); use directly only when composing the provider stack
manually.

---

<a id="sdkformprovider"></a>

### SDKFormProvider

Provides form context to field components so they can read metadata, control,
and error state without an explicit `formHookResult` prop on each field.
Server-side field errors are automatically synced onto their corresponding fields.

#### Type Parameters

|Type Parameter|Default type|
|-|-|
|`TFormData` _extends_ `FieldValues`|`FieldValues`|
|`TFieldsMetadata` _extends_ \{ \[K in string \| number \| symbol\]: FieldMetadata \| FieldMetadataWithOptions\<unknown\> \}|`Record`\<`string`, [`FieldMetadata`](#fieldmetadata) \| [`FieldMetadataWithOptions`](#fieldmetadatawithoptions)\<`unknown`\>\>|

#### Parameters

|Parameter|Type|
|-|-|
|`__namedParameters`|`SDKFormProviderProps`\<`TFormData`, `TFieldsMetadata`\>|

#### Example

```tsx
const formHookResult = useEmployeeDetailsForm({ employeeId })
const { Fields } = formHookResult.form

// SDKFormProvider supplies context only — wire up submission and render the
// <form> element yourself.
const handleSubmit = () =>
  formHookResult.actions.onSubmit({ onEmployeeUpdated: (emp) => { ... } })

return (
  <SDKFormProvider formHookResult={formHookResult}>
    <form onSubmit={handleSubmit}>
      <Fields.FirstName label="First name" />
      <Fields.LastName label="Last name" />
      <button type="submit">Save</button>
    </form>
  </SDKFormProvider>
)
```

## Functions

<a id="composeerrorhandler"></a>

### composeErrorHandler()

> **composeErrorHandler**(`sources`, `submitState?`): [`HookErrorHandling`](#hookerrorhandling)

Merges multiple error sources into a single [HookErrorHandling](#hookerrorhandling).

#### Parameters

|Parameter|Type|Description|
|-|-|-|
|`sources`|[`MixedErrorSource`](#mixederrorsource)[]|Error sources to merge. Each entry is either a React Query result or an object with an `errorHandling` property.|
|`submitState?`|[`SubmitStateForErrorHandling`](#submitstateforerrorhandling)|Optional screen-level submit state to fold into the result.|

#### Returns

[`HookErrorHandling`](#hookerrorhandling)

A single `HookErrorHandling` covering every source.

#### Remarks

Accepts any mix of `@gusto/embedded-api-v-2025-11-15` React Query results and SDK hook
results that already expose an `errorHandling` object (including the value returned by
[composeSubmitHandler](#composesubmithandler)). Query errors are normalized to `SDKError`, nested hook
errors are flattened in, and an optional submit-state argument adds a submit error to
the same list.

The returned `retryQueries` refetches every failed query and delegates into each nested
hook so their retries fire too. `clearSubmitError` clears the optional submit state and
delegates into each nested hook.

Pairs with [composeSubmitHandler](#composesubmithandler) by name only — this composes error state and
recovery, not a submit callback.

#### Example

```tsx
import { composeErrorHandler, useEmployeeDetailsForm } from '@gusto/embedded-react-sdk'
import { useEmployeeFormsList } from '@gusto/embedded-api-v-2025-11-15/react-query/employeeFormsList'

function EmployeeProfileView({ companyId, employeeId }: { companyId: string; employeeId: string }) {
  const employeeDetails = useEmployeeDetailsForm({ companyId, employeeId })
  const formsListQuery = useEmployeeFormsList({ employeeId })

  const errorHandling = composeErrorHandler([employeeDetails, formsListQuery])

  if (errorHandling.errors.length > 0) {
    return (
      <div role="alert">
        {errorHandling.errors.map((error, i) => (
          <p key={i}>{error.message}</p>
        ))}
        <button onClick={errorHandling.retryQueries}>Retry</button>
      </div>
    )
  }

  return null
}
```

---

<a id="composesubmithandler"></a>

### composeSubmitHandler()

> **composeSubmitHandler**\<`TForms`\>(`forms`, `onAllValid`): `ComposeSubmitHandlerResult`

Coordinates validation and submission across multiple form hooks on the same page.

#### Type Parameters

|Type Parameter|Description|
|-|-|
|`TForms` _extends_ readonly `FieldValues`[]|Tuple of form value shapes, one per slot of `forms`.|

#### Parameters

|Parameter|Type|Description|
|-|-|-|
|`forms`|readonly \[\{ \[K in string \| number \| symbol\]: ComposeSubmitInput\<TForms\[K\]\> \}\]|Form hook results and/or raw `UseFormReturn` instances to coordinate.|
|`onAllValid`|() => `Promise`\<`void`\>|Async callback invoked once every form has passed validation.|

#### Returns

`ComposeSubmitHandlerResult`

A ComposeSubmitHandlerResult with a unified `handleSubmit` and aggregated `errorHandling`.

#### Remarks

Validates all forms simultaneously via `handleSubmit()`, then focuses the visually first
invalid field across all forms (sorted by `getBoundingClientRect()`). Only calls
`onAllValid` when every form passes.

Uses `handleSubmit` rather than `trigger` so that react-hook-form sets
`formState.isSubmitted = true`, which enables `reValidateMode` (default: `onChange`).
Without this, errors set by manual `trigger()` calls would never clear as the user types.

Each hook passed to `forms` should be initialized with `shouldFocusError: false` so that
react-hook-form's built-in per-form focus is disabled and `composeSubmitHandler` can manage
cross-form focus instead.

The returned `errorHandling` is the same shape every SDK hook returns, so the whole result
can be passed back into [composeErrorHandler](#composeerrorhandler) when you need to add extra
`@gusto/embedded-api-v-2025-11-15` queries or screen-level submit state.

#### Example

```tsx
const detailsForm = useEmployeeDetailsForm({ employeeId, shouldFocusError: false })
const addressForm = useHomeAddressForm({ employeeId, shouldFocusError: false })

const { handleSubmit, errorHandling } = composeSubmitHandler(
  [detailsForm, addressForm],
  async () => {
    await detailsForm.actions.onSubmit()
    await addressForm.actions.onSubmit()
  },
)

return <form onSubmit={handleSubmit}>...</form>
```

## Variables

<a id="componentevents"></a>

### componentEvents

> `const` **componentEvents**: `object`

Catalog of every event key that an SDK component can emit through `onEvent`.

#### Type Declaration

|Name|Type|Default value|
|-|-|-|
|<a id="property-componenteventsbreadcrumb_navigate"></a> `BREADCRUMB_NAVIGATE`|`"breadcrumb/navigate"`|`'breadcrumb/navigate'`|
|<a id="property-componenteventscancel"></a> `CANCEL`|`"CANCEL"`|`'CANCEL'`|
|<a id="property-componenteventscompany_assign_signatory_done"></a> `COMPANY_ASSIGN_SIGNATORY_DONE`|`"company/signatory/assignSignatory/done"`|`'company/signatory/assignSignatory/done'`|
|<a id="property-componenteventscompany_assign_signatory_mode_updated"></a> `COMPANY_ASSIGN_SIGNATORY_MODE_UPDATED`|`"company/signatory/assignSignatory/modeUpdated"`|`'company/signatory/assignSignatory/modeUpdated'`|
|<a id="property-componenteventscompany_bank_account_cancel"></a> `COMPANY_BANK_ACCOUNT_CANCEL`|`"company/bankAccount/cancel"`|`'company/bankAccount/cancel'`|
|<a id="property-componenteventscompany_bank_account_change"></a> `COMPANY_BANK_ACCOUNT_CHANGE`|`"company/bankAccount/change"`|`'company/bankAccount/change'`|
|<a id="property-componenteventscompany_bank_account_created"></a> `COMPANY_BANK_ACCOUNT_CREATED`|`"company/bankAccount/created"`|`'company/bankAccount/created'`|
|<a id="property-componenteventscompany_bank_account_done"></a> `COMPANY_BANK_ACCOUNT_DONE`|`"company/bankAccount/done"`|`'company/bankAccount/done'`|
|<a id="property-componenteventscompany_bank_account_verified"></a> `COMPANY_BANK_ACCOUNT_VERIFIED`|`"company/bankAccount/verified"`|`'company/bankAccount/verified'`|
|<a id="property-componenteventscompany_bank_account_verify"></a> `COMPANY_BANK_ACCOUNT_VERIFY`|`"company/bankAccount/verify"`|`'company/bankAccount/verify'`|
|<a id="property-componenteventscompany_create_signatory_done"></a> `COMPANY_CREATE_SIGNATORY_DONE`|`"company/signatory/createSignatory/done"`|`'company/signatory/createSignatory/done'`|
|<a id="property-componenteventscompany_federal_taxes_done"></a> `COMPANY_FEDERAL_TAXES_DONE`|`"company/federalTaxes/done"`|`'company/federalTaxes/done'`|
|<a id="property-componenteventscompany_federal_taxes_updated"></a> `COMPANY_FEDERAL_TAXES_UPDATED`|`"company/federalTaxes/updated"`|`'company/federalTaxes/updated'`|
|<a id="property-componenteventscompany_form_edit_signatory"></a> `COMPANY_FORM_EDIT_SIGNATORY`|`"company/forms/editSignatory"`|`'company/forms/editSignatory'`|
|<a id="property-componenteventscompany_forms_done"></a> `COMPANY_FORMS_DONE`|`"company/forms/done"`|`'company/forms/done'`|
|<a id="property-componenteventscompany_industry"></a> `COMPANY_INDUSTRY`|`"company/industry"`|`'company/industry'`|
|<a id="property-componenteventscompany_industry_selected"></a> `COMPANY_INDUSTRY_SELECTED`|`"company/industry/selected"`|`'company/industry/selected'`|
|<a id="property-componenteventscompany_invite_signatory_done"></a> `COMPANY_INVITE_SIGNATORY_DONE`|`"company/signatory/inviteSignatory/done"`|`'company/signatory/inviteSignatory/done'`|
|<a id="property-componenteventscompany_location_create"></a> `COMPANY_LOCATION_CREATE`|`"company/location/add"`|`'company/location/add'`|
|<a id="property-componenteventscompany_location_created"></a> `COMPANY_LOCATION_CREATED`|`"company/location/add/done"`|`'company/location/add/done'`|
|<a id="property-componenteventscompany_location_done"></a> `COMPANY_LOCATION_DONE`|`"company/location/done"`|`'company/location/done'`|
|<a id="property-componenteventscompany_location_edit"></a> `COMPANY_LOCATION_EDIT`|`"company/location/edit"`|`'company/location/edit'`|
|<a id="property-componenteventscompany_location_updated"></a> `COMPANY_LOCATION_UPDATED`|`"company/location/edit/done"`|`'company/location/edit/done'`|
|<a id="property-componenteventscompany_overview_continue"></a> `COMPANY_OVERVIEW_CONTINUE`|`"company/overview/continue"`|`'company/overview/continue'`|
|<a id="property-componenteventscompany_overview_done"></a> `COMPANY_OVERVIEW_DONE`|`"company/overview/done"`|`'company/overview/done'`|
|<a id="property-componenteventscompany_sign_form"></a> `COMPANY_SIGN_FORM`|`"company/forms/sign/signForm"`|`'company/forms/sign/signForm'`|
|<a id="property-componenteventscompany_sign_form_back"></a> `COMPANY_SIGN_FORM_BACK`|`"company/forms/sign/back"`|`'company/forms/sign/back'`|
|<a id="property-componenteventscompany_sign_form_done"></a> `COMPANY_SIGN_FORM_DONE`|`"company/forms/sign/done"`|`'company/forms/sign/done'`|
|<a id="property-componenteventscompany_signatory_created"></a> `COMPANY_SIGNATORY_CREATED`|`"company/signatory/created"`|`'company/signatory/created'`|
|<a id="property-componenteventscompany_signatory_invited"></a> `COMPANY_SIGNATORY_INVITED`|`"company/signatory/invited"`|`'company/signatory/invited'`|
|<a id="property-componenteventscompany_signatory_updated"></a> `COMPANY_SIGNATORY_UPDATED`|`"company/signatory/updated"`|`'company/signatory/updated'`|
|<a id="property-componenteventscompany_state_tax_done"></a> `COMPANY_STATE_TAX_DONE`|`"company/stateTaxes/done"`|`'company/stateTaxes/done'`|
|<a id="property-componenteventscompany_state_tax_edit"></a> `COMPANY_STATE_TAX_EDIT`|`"company/stateTaxes/edit"`|`'company/stateTaxes/edit'`|
|<a id="property-componenteventscompany_state_tax_updated"></a> `COMPANY_STATE_TAX_UPDATED`|`"company/stateTaxes/updated"`|`'company/stateTaxes/updated'`|
|<a id="property-componenteventscompany_view_form_to_sign"></a> `COMPANY_VIEW_FORM_TO_SIGN`|`"company/forms/view"`|`'company/forms/view'`|
|<a id="property-componenteventscontractor_address_done"></a> `CONTRACTOR_ADDRESS_DONE`|`"contractor/address/done"`|`'contractor/address/done'`|
|<a id="property-componenteventscontractor_address_updated"></a> `CONTRACTOR_ADDRESS_UPDATED`|`"contractor/address/updated"`|`'contractor/address/updated'`|
|<a id="property-componenteventscontractor_bank_account_created"></a> `CONTRACTOR_BANK_ACCOUNT_CREATED`|`"contractor/bankAccount/created"`|`'contractor/bankAccount/created'`|
|<a id="property-componenteventscontractor_create"></a> `CONTRACTOR_CREATE`|`"contractor/create"`|`'contractor/create'`|
|<a id="property-componenteventscontractor_created"></a> `CONTRACTOR_CREATED`|`"contractor/created"`|`'contractor/created'`|
|<a id="property-componenteventscontractor_deleted"></a> `CONTRACTOR_DELETED`|`"contractor/deleted"`|`'contractor/deleted'`|
|<a id="property-componenteventscontractor_invite_contractor"></a> `CONTRACTOR_INVITE_CONTRACTOR`|`"contractor/invite/selfOnboarding"`|`'contractor/invite/selfOnboarding'`|
|<a id="property-componenteventscontractor_new_hire_report_done"></a> `CONTRACTOR_NEW_HIRE_REPORT_DONE`|`"contractor/newHireReport/done"`|`'contractor/newHireReport/done'`|
|<a id="property-componenteventscontractor_new_hire_report_updated"></a> `CONTRACTOR_NEW_HIRE_REPORT_UPDATED`|`"contractor/newHireReport/updated"`|`'contractor/newHireReport/updated'`|
|<a id="property-componenteventscontractor_onboarding_continue"></a> `CONTRACTOR_ONBOARDING_CONTINUE`|`"contractor/onboarding/continue"`|`'contractor/onboarding/continue'`|
|<a id="property-componenteventscontractor_onboarding_status_updated"></a> `CONTRACTOR_ONBOARDING_STATUS_UPDATED`|`"contractor/onboardingStatus/updated"`|`'contractor/onboardingStatus/updated'`|
|<a id="property-componenteventscontractor_payment_back_to_edit"></a> `CONTRACTOR_PAYMENT_BACK_TO_EDIT`|`"contractor/payments/backToEdit"`|`'contractor/payments/backToEdit'`|
|<a id="property-componenteventscontractor_payment_cancel"></a> `CONTRACTOR_PAYMENT_CANCEL`|`"contractor/payments/cancel"`|`'contractor/payments/cancel'`|
|<a id="property-componenteventscontractor_payment_create"></a> `CONTRACTOR_PAYMENT_CREATE`|`"contractor/payments/create"`|`'contractor/payments/create'`|
|<a id="property-componenteventscontractor_payment_created"></a> `CONTRACTOR_PAYMENT_CREATED`|`"contractor/payments/created"`|`'contractor/payments/created'`|
|<a id="property-componenteventscontractor_payment_edit"></a> `CONTRACTOR_PAYMENT_EDIT`|`"contractor/payments/edit"`|`'contractor/payments/edit'`|
|<a id="property-componenteventscontractor_payment_exit"></a> `CONTRACTOR_PAYMENT_EXIT`|`"contractor/payments/exit"`|`'contractor/payments/exit'`|
|<a id="property-componenteventscontractor_payment_method_done"></a> `CONTRACTOR_PAYMENT_METHOD_DONE`|`"contractor/paymentMethod/done"`|`'contractor/paymentMethod/done'`|
|<a id="property-componenteventscontractor_payment_method_updated"></a> `CONTRACTOR_PAYMENT_METHOD_UPDATED`|`"contractor/paymentMethod/updated"`|`'contractor/paymentMethod/updated'`|
|<a id="property-componenteventscontractor_payment_preview"></a> `CONTRACTOR_PAYMENT_PREVIEW`|`"contractor/payments/preview"`|`'contractor/payments/preview'`|
|<a id="property-componenteventscontractor_payment_rfi_respond"></a> `CONTRACTOR_PAYMENT_RFI_RESPOND`|`"contractor/payments/rfi/respond"`|`'contractor/payments/rfi/respond'`|
|<a id="property-componenteventscontractor_payment_submit"></a> `CONTRACTOR_PAYMENT_SUBMIT`|`"contractor/payments/submit"`|`'contractor/payments/submit'`|
|<a id="property-componenteventscontractor_payment_update"></a> `CONTRACTOR_PAYMENT_UPDATE`|`"contractor/payments/update"`|`'contractor/payments/update'`|
|<a id="property-componenteventscontractor_payment_view"></a> `CONTRACTOR_PAYMENT_VIEW`|`"contractor/payments/view"`|`'contractor/payments/view'`|
|<a id="property-componenteventscontractor_payment_view_details"></a> `CONTRACTOR_PAYMENT_VIEW_DETAILS`|`"contractor/payments/view/details"`|`'contractor/payments/view/details'`|
|<a id="property-componenteventscontractor_profile_done"></a> `CONTRACTOR_PROFILE_DONE`|`"contractor/profile/done"`|`'contractor/profile/done'`|
|<a id="property-componenteventscontractor_submit_done"></a> `CONTRACTOR_SUBMIT_DONE`|`"contractor/submit/done"`|`'contractor/submit/done'`|
|<a id="property-componenteventscontractor_update"></a> `CONTRACTOR_UPDATE`|`"contractor/update"`|`'contractor/update'`|
|<a id="property-componenteventscontractor_updated"></a> `CONTRACTOR_UPDATED`|`"contractor/updated"`|`'contractor/updated'`|
|<a id="property-componenteventsdismissal_pay_period_selected"></a> `DISMISSAL_PAY_PERIOD_SELECTED`|`"dismissal/payPeriod/selected"`|`'dismissal/payPeriod/selected'`|
|<a id="property-componenteventsemployee_bank_account_create"></a> `EMPLOYEE_BANK_ACCOUNT_CREATE`|`"employee/bankAccount/create"`|`'employee/bankAccount/create'`|
|<a id="property-componenteventsemployee_bank_account_created"></a> `EMPLOYEE_BANK_ACCOUNT_CREATED`|`"employee/bankAccount/created"`|`'employee/bankAccount/created'`|
|<a id="property-componenteventsemployee_bank_account_deleted"></a> `EMPLOYEE_BANK_ACCOUNT_DELETED`|`"employee/bankAccount/deleted"`|`'employee/bankAccount/deleted'`|
|<a id="property-componenteventsemployee_change_eligibility_status"></a> `EMPLOYEE_CHANGE_ELIGIBILITY_STATUS`|`"employee/employmentEligibility/change"`|`'employee/employmentEligibility/change'`|
|<a id="property-componenteventsemployee_compensation_cancel"></a> `EMPLOYEE_COMPENSATION_CANCEL`|`"employee/compensations/cancel"`|`'employee/compensations/cancel'`|
|<a id="property-componenteventsemployee_compensation_change_cancelled"></a> `EMPLOYEE_COMPENSATION_CHANGE_CANCELLED`|`"employee/compensations/changeCancelled"`|`'employee/compensations/changeCancelled'`|
|<a id="property-componenteventsemployee_compensation_create"></a> `EMPLOYEE_COMPENSATION_CREATE`|`"employee/compensations/create"`|`'employee/compensations/create'`|
|<a id="property-componenteventsemployee_compensation_created"></a> `EMPLOYEE_COMPENSATION_CREATED`|`"employee/compensations/created"`|`'employee/compensations/created'`|
|<a id="property-componenteventsemployee_compensation_done"></a> `EMPLOYEE_COMPENSATION_DONE`|`"employee/compensations/done"`|`'employee/compensations/done'`|
|<a id="property-componenteventsemployee_compensation_return_to_list"></a> `EMPLOYEE_COMPENSATION_RETURN_TO_LIST`|`"employee/compensations/returnToList"`|`'employee/compensations/returnToList'`|
|<a id="property-componenteventsemployee_compensation_updated"></a> `EMPLOYEE_COMPENSATION_UPDATED`|`"employee/compensations/updated"`|`'employee/compensations/updated'`|
|<a id="property-componenteventsemployee_create"></a> `EMPLOYEE_CREATE`|`"employee/create"`|`'employee/create'`|
|<a id="property-componenteventsemployee_created"></a> `EMPLOYEE_CREATED`|`"employee/created"`|`'employee/created'`|
|<a id="property-componenteventsemployee_dashboard_tab_change"></a> `EMPLOYEE_DASHBOARD_TAB_CHANGE`|`"employee/dashboard/tabChange"`|`'employee/dashboard/tabChange'`|
|<a id="property-componenteventsemployee_deduction_add"></a> `EMPLOYEE_DEDUCTION_ADD`|`"employee/deductions/add"`|`'employee/deductions/add'`|
|<a id="property-componenteventsemployee_deduction_cancel"></a> `EMPLOYEE_DEDUCTION_CANCEL`|`"employee/deductions/cancel"`|`'employee/deductions/cancel'`|
|<a id="property-componenteventsemployee_deduction_cancel_empty"></a> `EMPLOYEE_DEDUCTION_CANCEL_EMPTY`|`"employee/deductions/cancelEmpty"`|`'employee/deductions/cancelEmpty'`|
|<a id="property-componenteventsemployee_deduction_created"></a> `EMPLOYEE_DEDUCTION_CREATED`|`"employee/deductions/created"`|`'employee/deductions/created'`|
|<a id="property-componenteventsemployee_deduction_deleted"></a> `EMPLOYEE_DEDUCTION_DELETED`|`"employee/deductions/deleted"`|`'employee/deductions/deleted'`|
|<a id="property-componenteventsemployee_deduction_deleted_empty"></a> `EMPLOYEE_DEDUCTION_DELETED_EMPTY`|`"employee/deductions/deletedEmpty"`|`'employee/deductions/deletedEmpty'`|
|<a id="property-componenteventsemployee_deduction_done"></a> `EMPLOYEE_DEDUCTION_DONE`|`"employee/deductions/done"`|`'employee/deductions/done'`|
|<a id="property-componenteventsemployee_deduction_edit"></a> `EMPLOYEE_DEDUCTION_EDIT`|`"employee/deductions/edit"`|`'employee/deductions/edit'`|
|<a id="property-componenteventsemployee_deduction_include_no"></a> `EMPLOYEE_DEDUCTION_INCLUDE_NO`|`"employee/deductions/include/no"`|`'employee/deductions/include/no'`|
|<a id="property-componenteventsemployee_deduction_include_yes"></a> `EMPLOYEE_DEDUCTION_INCLUDE_YES`|`"employee/deductions/include/yes"`|`'employee/deductions/include/yes'`|
|<a id="property-componenteventsemployee_deduction_updated"></a> `EMPLOYEE_DEDUCTION_UPDATED`|`"employee/deductions/updated"`|`'employee/deductions/updated'`|
|<a id="property-componenteventsemployee_deleted"></a> `EMPLOYEE_DELETED`|`"employee/deleted"`|`'employee/deleted'`|
|<a id="property-componenteventsemployee_dismiss"></a> `EMPLOYEE_DISMISS`|`"employee/dismiss"`|`'employee/dismiss'`|
|<a id="property-componenteventsemployee_documents_done"></a> `EMPLOYEE_DOCUMENTS_DONE`|`"employee/documents/done"`|`'employee/documents/done'`|
|<a id="property-componenteventsemployee_employment_eligibility_done"></a> `EMPLOYEE_EMPLOYMENT_ELIGIBILITY_DONE`|`"employee/employmentEligibility/done"`|`'employee/employmentEligibility/done'`|
|<a id="property-componenteventsemployee_federal_taxes_done"></a> `EMPLOYEE_FEDERAL_TAXES_DONE`|`"employee/federalTaxes/done"`|`'employee/federalTaxes/done'`|
|<a id="property-componenteventsemployee_federal_taxes_edit"></a> `EMPLOYEE_FEDERAL_TAXES_EDIT`|`"employee/federalTaxes/edit"`|`'employee/federalTaxes/edit'`|
|<a id="property-componenteventsemployee_federal_taxes_updated"></a> `EMPLOYEE_FEDERAL_TAXES_UPDATED`|`"employee/federalTaxes/updated"`|`'employee/federalTaxes/updated'`|
|<a id="property-componenteventsemployee_forms_done"></a> `EMPLOYEE_FORMS_DONE`|`"employee/forms/done"`|`'employee/forms/done'`|
|<a id="property-componenteventsemployee_home_address_created"></a> `EMPLOYEE_HOME_ADDRESS_CREATED`|`"employee/addresses/home/created"`|`'employee/addresses/home/created'`|
|<a id="property-componenteventsemployee_home_address_updated"></a> `EMPLOYEE_HOME_ADDRESS_UPDATED`|`"employee/addresses/home/updated"`|`'employee/addresses/home/updated'`|
|<a id="property-componenteventsemployee_job_add"></a> `EMPLOYEE_JOB_ADD`|`"employee/job/add"`|`'employee/job/add'`|
|<a id="property-componenteventsemployee_job_add_another"></a> `EMPLOYEE_JOB_ADD_ANOTHER`|`"employee/job/addAnother"`|`'employee/job/addAnother'`|
|<a id="property-componenteventsemployee_job_created"></a> `EMPLOYEE_JOB_CREATED`|`"employee/job/created"`|`'employee/job/created'`|
|<a id="property-componenteventsemployee_job_deleted"></a> `EMPLOYEE_JOB_DELETED`|`"employee/job/deleted"`|`'employee/job/deleted'`|
|<a id="property-componenteventsemployee_job_edit"></a> `EMPLOYEE_JOB_EDIT`|`"employee/job/edit"`|`'employee/job/edit'`|
|<a id="property-componenteventsemployee_job_updated"></a> `EMPLOYEE_JOB_UPDATED`|`"employee/job/updated"`|`'employee/job/updated'`|
|<a id="property-componenteventsemployee_management_compensation_add_another_job_form_cancelled"></a> `EMPLOYEE_MANAGEMENT_COMPENSATION_ADD_ANOTHER_JOB_FORM_CANCELLED`|`"employee/management/compensation/addAnotherJobForm/cancelled"`|`'employee/management/compensation/addAnotherJobForm/cancelled'`|
|<a id="property-componenteventsemployee_management_compensation_add_another_job_form_submitted"></a> `EMPLOYEE_MANAGEMENT_COMPENSATION_ADD_ANOTHER_JOB_FORM_SUBMITTED`|`"employee/management/compensation/addAnotherJobForm/submitted"`|`'employee/management/compensation/addAnotherJobForm/submitted'`|
|<a id="property-componenteventsemployee_management_compensation_add_job_form_cancelled"></a> `EMPLOYEE_MANAGEMENT_COMPENSATION_ADD_JOB_FORM_CANCELLED`|`"employee/management/compensation/addJobForm/cancelled"`|`'employee/management/compensation/addJobForm/cancelled'`|
|<a id="property-componenteventsemployee_management_compensation_add_job_form_submitted"></a> `EMPLOYEE_MANAGEMENT_COMPENSATION_ADD_JOB_FORM_SUBMITTED`|`"employee/management/compensation/addJobForm/submitted"`|`'employee/management/compensation/addJobForm/submitted'`|
|<a id="property-componenteventsemployee_management_compensation_alert_dismissed"></a> `EMPLOYEE_MANAGEMENT_COMPENSATION_ALERT_DISMISSED`|`"employee/management/compensation/alertDismissed"`|`'employee/management/compensation/alertDismissed'`|
|<a id="property-componenteventsemployee_management_compensation_card_add_another_requested"></a> `EMPLOYEE_MANAGEMENT_COMPENSATION_CARD_ADD_ANOTHER_REQUESTED`|`"employee/management/compensation/card/addAnotherRequested"`|`'employee/management/compensation/card/addAnotherRequested'`|
|<a id="property-componenteventsemployee_management_compensation_card_add_requested"></a> `EMPLOYEE_MANAGEMENT_COMPENSATION_CARD_ADD_REQUESTED`|`"employee/management/compensation/card/addRequested"`|`'employee/management/compensation/card/addRequested'`|
|<a id="property-componenteventsemployee_management_compensation_card_change_cancelled"></a> `EMPLOYEE_MANAGEMENT_COMPENSATION_CARD_CHANGE_CANCELLED`|`"employee/management/compensation/card/changeCancelled"`|`'employee/management/compensation/card/changeCancelled'`|
|<a id="property-componenteventsemployee_management_compensation_card_edit_requested"></a> `EMPLOYEE_MANAGEMENT_COMPENSATION_CARD_EDIT_REQUESTED`|`"employee/management/compensation/card/editRequested"`|`'employee/management/compensation/card/editRequested'`|
|<a id="property-componenteventsemployee_management_compensation_card_job_deleted"></a> `EMPLOYEE_MANAGEMENT_COMPENSATION_CARD_JOB_DELETED`|`"employee/management/compensation/card/jobDeleted"`|`'employee/management/compensation/card/jobDeleted'`|
|<a id="property-componenteventsemployee_management_compensation_edit_form_cancelled"></a> `EMPLOYEE_MANAGEMENT_COMPENSATION_EDIT_FORM_CANCELLED`|`"employee/management/compensation/editForm/cancelled"`|`'employee/management/compensation/editForm/cancelled'`|
|<a id="property-componenteventsemployee_management_compensation_edit_form_submitted"></a> `EMPLOYEE_MANAGEMENT_COMPENSATION_EDIT_FORM_SUBMITTED`|`"employee/management/compensation/editForm/submitted"`|`'employee/management/compensation/editForm/submitted'`|
|<a id="property-componenteventsemployee_management_deductions_alert_dismissed"></a> `EMPLOYEE_MANAGEMENT_DEDUCTIONS_ALERT_DISMISSED`|`"employee/management/deductions/alertDismissed"`|`'employee/management/deductions/alertDismissed'`|
|<a id="property-componenteventsemployee_management_deductions_card_add_requested"></a> `EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_ADD_REQUESTED`|`"employee/management/deductions/card/addRequested"`|`'employee/management/deductions/card/addRequested'`|
|<a id="property-componenteventsemployee_management_deductions_card_deleted"></a> `EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_DELETED`|`"employee/management/deductions/card/deleted"`|`'employee/management/deductions/card/deleted'`|
|<a id="property-componenteventsemployee_management_deductions_card_edit_requested"></a> `EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_EDIT_REQUESTED`|`"employee/management/deductions/card/editRequested"`|`'employee/management/deductions/card/editRequested'`|
|<a id="property-componenteventsemployee_management_deductions_edit_form_cancelled"></a> `EMPLOYEE_MANAGEMENT_DEDUCTIONS_EDIT_FORM_CANCELLED`|`"employee/management/deductions/editForm/cancelled"`|`'employee/management/deductions/editForm/cancelled'`|
|<a id="property-componenteventsemployee_management_deductions_edit_form_created"></a> `EMPLOYEE_MANAGEMENT_DEDUCTIONS_EDIT_FORM_CREATED`|`"employee/management/deductions/editForm/created"`|`'employee/management/deductions/editForm/created'`|
|<a id="property-componenteventsemployee_management_deductions_edit_form_updated"></a> `EMPLOYEE_MANAGEMENT_DEDUCTIONS_EDIT_FORM_UPDATED`|`"employee/management/deductions/editForm/updated"`|`'employee/management/deductions/editForm/updated'`|
|<a id="property-componenteventsemployee_management_documents_card_view_requested"></a> `EMPLOYEE_MANAGEMENT_DOCUMENTS_CARD_VIEW_REQUESTED`|`"employee/management/documents/card/viewRequested"`|`'employee/management/documents/card/viewRequested'`|
|<a id="property-componenteventsemployee_management_federal_taxes_alert_dismissed"></a> `EMPLOYEE_MANAGEMENT_FEDERAL_TAXES_ALERT_DISMISSED`|`"employee/management/federalTaxes/alertDismissed"`|`'employee/management/federalTaxes/alertDismissed'`|
|<a id="property-componenteventsemployee_management_federal_taxes_card_edit_requested"></a> `EMPLOYEE_MANAGEMENT_FEDERAL_TAXES_CARD_EDIT_REQUESTED`|`"employee/management/federalTaxes/card/editRequested"`|`'employee/management/federalTaxes/card/editRequested'`|
|<a id="property-componenteventsemployee_management_federal_taxes_edit_form_cancelled"></a> `EMPLOYEE_MANAGEMENT_FEDERAL_TAXES_EDIT_FORM_CANCELLED`|`"employee/management/federalTaxes/editForm/cancelled"`|`'employee/management/federalTaxes/editForm/cancelled'`|
|<a id="property-componenteventsemployee_management_federal_taxes_edit_form_submitted"></a> `EMPLOYEE_MANAGEMENT_FEDERAL_TAXES_EDIT_FORM_SUBMITTED`|`"employee/management/federalTaxes/editForm/submitted"`|`'employee/management/federalTaxes/editForm/submitted'`|
|<a id="property-componenteventsemployee_management_home_address_created"></a> `EMPLOYEE_MANAGEMENT_HOME_ADDRESS_CREATED`|`"employee/management/homeAddress/created"`|`'employee/management/homeAddress/created'`|
|<a id="property-componenteventsemployee_management_home_address_deleted"></a> `EMPLOYEE_MANAGEMENT_HOME_ADDRESS_DELETED`|`"employee/management/homeAddress/deleted"`|`'employee/management/homeAddress/deleted'`|
|<a id="property-componenteventsemployee_management_home_address_edit_cancelled"></a> `EMPLOYEE_MANAGEMENT_HOME_ADDRESS_EDIT_CANCELLED`|`"employee/management/homeAddress/editCancelled"`|`'employee/management/homeAddress/editCancelled'`|
|<a id="property-componenteventsemployee_management_home_address_edit_requested"></a> `EMPLOYEE_MANAGEMENT_HOME_ADDRESS_EDIT_REQUESTED`|`"employee/management/homeAddress/editRequested"`|`'employee/management/homeAddress/editRequested'`|
|<a id="property-componenteventsemployee_management_home_address_updated"></a> `EMPLOYEE_MANAGEMENT_HOME_ADDRESS_UPDATED`|`"employee/management/homeAddress/updated"`|`'employee/management/homeAddress/updated'`|
|<a id="property-componenteventsemployee_management_payment_method_alert_dismissed"></a> `EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_ALERT_DISMISSED`|`"employee/management/paymentMethod/alertDismissed"`|`'employee/management/paymentMethod/alertDismissed'`|
|<a id="property-componenteventsemployee_management_payment_method_bank_form_cancelled"></a> `EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_BANK_FORM_CANCELLED`|`"employee/management/paymentMethod/bankForm/cancelled"`|`'employee/management/paymentMethod/bankForm/cancelled'`|
|<a id="property-componenteventsemployee_management_payment_method_bank_form_submitted"></a> `EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_BANK_FORM_SUBMITTED`|`"employee/management/paymentMethod/bankForm/submitted"`|`'employee/management/paymentMethod/bankForm/submitted'`|
|<a id="property-componenteventsemployee_management_payment_method_card_add_requested"></a> `EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_CARD_ADD_REQUESTED`|`"employee/management/paymentMethod/card/addRequested"`|`'employee/management/paymentMethod/card/addRequested'`|
|<a id="property-componenteventsemployee_management_payment_method_card_bank_account_deleted"></a> `EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_CARD_BANK_ACCOUNT_DELETED`|`"employee/management/paymentMethod/card/bankAccountDeleted"`|`'employee/management/paymentMethod/card/bankAccountDeleted'`|
|<a id="property-componenteventsemployee_management_payment_method_card_split_requested"></a> `EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_CARD_SPLIT_REQUESTED`|`"employee/management/paymentMethod/card/splitRequested"`|`'employee/management/paymentMethod/card/splitRequested'`|
|<a id="property-componenteventsemployee_management_payment_method_split_form_cancelled"></a> `EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_SPLIT_FORM_CANCELLED`|`"employee/management/paymentMethod/splitForm/cancelled"`|`'employee/management/paymentMethod/splitForm/cancelled'`|
|<a id="property-componenteventsemployee_management_payment_method_split_form_submitted"></a> `EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_SPLIT_FORM_SUBMITTED`|`"employee/management/paymentMethod/splitForm/submitted"`|`'employee/management/paymentMethod/splitForm/submitted'`|
|<a id="property-componenteventsemployee_management_paystubs_card_download_requested"></a> `EMPLOYEE_MANAGEMENT_PAYSTUBS_CARD_DOWNLOAD_REQUESTED`|`"employee/management/paystubs/card/downloadRequested"`|`'employee/management/paystubs/card/downloadRequested'`|
|<a id="property-componenteventsemployee_management_paystubs_card_downloaded"></a> `EMPLOYEE_MANAGEMENT_PAYSTUBS_CARD_DOWNLOADED`|`"employee/management/paystubs/card/downloaded"`|`'employee/management/paystubs/card/downloaded'`|
|<a id="property-componenteventsemployee_management_profile_alert_dismissed"></a> `EMPLOYEE_MANAGEMENT_PROFILE_ALERT_DISMISSED`|`"employee/management/profile/alertDismissed"`|`'employee/management/profile/alertDismissed'`|
|<a id="property-componenteventsemployee_management_profile_edit_cancelled"></a> `EMPLOYEE_MANAGEMENT_PROFILE_EDIT_CANCELLED`|`"employee/management/profile/editCancelled"`|`'employee/management/profile/editCancelled'`|
|<a id="property-componenteventsemployee_management_profile_edit_requested"></a> `EMPLOYEE_MANAGEMENT_PROFILE_EDIT_REQUESTED`|`"employee/management/profile/editRequested"`|`'employee/management/profile/editRequested'`|
|<a id="property-componenteventsemployee_management_profile_updated"></a> `EMPLOYEE_MANAGEMENT_PROFILE_UPDATED`|`"employee/management/profile/updated"`|`'employee/management/profile/updated'`|
|<a id="property-componenteventsemployee_management_state_taxes_alert_dismissed"></a> `EMPLOYEE_MANAGEMENT_STATE_TAXES_ALERT_DISMISSED`|`"employee/management/stateTaxes/alertDismissed"`|`'employee/management/stateTaxes/alertDismissed'`|
|<a id="property-componenteventsemployee_management_state_taxes_edit_cancelled"></a> `EMPLOYEE_MANAGEMENT_STATE_TAXES_EDIT_CANCELLED`|`"employee/management/stateTaxes/editCancelled"`|`'employee/management/stateTaxes/editCancelled'`|
|<a id="property-componenteventsemployee_management_state_taxes_edit_requested"></a> `EMPLOYEE_MANAGEMENT_STATE_TAXES_EDIT_REQUESTED`|`"employee/management/stateTaxes/editRequested"`|`'employee/management/stateTaxes/editRequested'`|
|<a id="property-componenteventsemployee_management_state_taxes_updated"></a> `EMPLOYEE_MANAGEMENT_STATE_TAXES_UPDATED`|`"employee/management/stateTaxes/updated"`|`'employee/management/stateTaxes/updated'`|
|<a id="property-componenteventsemployee_management_work_address_created"></a> `EMPLOYEE_MANAGEMENT_WORK_ADDRESS_CREATED`|`"employee/management/workAddress/created"`|`'employee/management/workAddress/created'`|
|<a id="property-componenteventsemployee_management_work_address_deleted"></a> `EMPLOYEE_MANAGEMENT_WORK_ADDRESS_DELETED`|`"employee/management/workAddress/deleted"`|`'employee/management/workAddress/deleted'`|
|<a id="property-componenteventsemployee_management_work_address_edit_cancelled"></a> `EMPLOYEE_MANAGEMENT_WORK_ADDRESS_EDIT_CANCELLED`|`"employee/management/workAddress/editCancelled"`|`'employee/management/workAddress/editCancelled'`|
|<a id="property-componenteventsemployee_management_work_address_edit_requested"></a> `EMPLOYEE_MANAGEMENT_WORK_ADDRESS_EDIT_REQUESTED`|`"employee/management/workAddress/editRequested"`|`'employee/management/workAddress/editRequested'`|
|<a id="property-componenteventsemployee_management_work_address_updated"></a> `EMPLOYEE_MANAGEMENT_WORK_ADDRESS_UPDATED`|`"employee/management/workAddress/updated"`|`'employee/management/workAddress/updated'`|
|<a id="property-componenteventsemployee_onboarding_documents_config_updated"></a> `EMPLOYEE_ONBOARDING_DOCUMENTS_CONFIG_UPDATED`|`"employee/onboardingDocumentsConfig/updated"`|`'employee/onboardingDocumentsConfig/updated'`|
|<a id="property-componenteventsemployee_onboarding_done"></a> `EMPLOYEE_ONBOARDING_DONE`|`"employee/onboarding/done"`|`'employee/onboarding/done'`|
|<a id="property-componenteventsemployee_onboarding_status_updated"></a> `EMPLOYEE_ONBOARDING_STATUS_UPDATED`|`"employee/onboardingStatus/updated"`|`'employee/onboardingStatus/updated'`|
|<a id="property-componenteventsemployee_payment_method_done"></a> `EMPLOYEE_PAYMENT_METHOD_DONE`|`"employee/paymentMethod/done"`|`'employee/paymentMethod/done'`|
|<a id="property-componenteventsemployee_payment_method_reset"></a> `EMPLOYEE_PAYMENT_METHOD_RESET`|`"employee/paymentMethod/reset"`|`'employee/paymentMethod/reset'`|
|<a id="property-componenteventsemployee_payment_method_updated"></a> `EMPLOYEE_PAYMENT_METHOD_UPDATED`|`"employee/paymentMethod/updated"`|`'employee/paymentMethod/updated'`|
|<a id="property-componenteventsemployee_profile_done"></a> `EMPLOYEE_PROFILE_DONE`|`"employee/profile/done"`|`'employee/profile/done'`|
|<a id="property-componenteventsemployee_rehire"></a> `EMPLOYEE_REHIRE`|`"employee/rehire"`|`'employee/rehire'`|
|<a id="property-componenteventsemployee_return_to_list"></a> `EMPLOYEE_RETURN_TO_LIST`|`"employee/returnToList"`|`'employee/returnToList'`|
|<a id="property-componenteventsemployee_self_onboarding_start"></a> `EMPLOYEE_SELF_ONBOARDING_START`|`"employee/selfOnboarding/start"`|`'employee/selfOnboarding/start'`|
|<a id="property-componenteventsemployee_sign_form"></a> `EMPLOYEE_SIGN_FORM`|`"employee/forms/sign"`|`'employee/forms/sign'`|
|<a id="property-componenteventsemployee_split_paycheck"></a> `EMPLOYEE_SPLIT_PAYCHECK`|`"employee/bankAccount/split"`|`'employee/bankAccount/split'`|
|<a id="property-componenteventsemployee_split_payment"></a> `EMPLOYEE_SPLIT_PAYMENT`|`"employee/paymentMethod/split"`|`'employee/paymentMethod/split'`|
|<a id="property-componenteventsemployee_state_taxes_done"></a> `EMPLOYEE_STATE_TAXES_DONE`|`"employee/stateTaxes/done"`|`'employee/stateTaxes/done'`|
|<a id="property-componenteventsemployee_state_taxes_updated"></a> `EMPLOYEE_STATE_TAXES_UPDATED`|`"employee/stateTaxes/updated"`|`'employee/stateTaxes/updated'`|
|<a id="property-componenteventsemployee_summary_view"></a> `EMPLOYEE_SUMMARY_VIEW`|`"employee/summary"`|`'employee/summary'`|
|<a id="property-componenteventsemployee_termination_cancelled"></a> `EMPLOYEE_TERMINATION_CANCELLED`|`"employee/termination/cancelled"`|`'employee/termination/cancelled'`|
|<a id="property-componenteventsemployee_termination_created"></a> `EMPLOYEE_TERMINATION_CREATED`|`"employee/termination/created"`|`'employee/termination/created'`|
|<a id="property-componenteventsemployee_termination_done"></a> `EMPLOYEE_TERMINATION_DONE`|`"employee/termination/done"`|`'employee/termination/done'`|
|<a id="property-componenteventsemployee_termination_edit"></a> `EMPLOYEE_TERMINATION_EDIT`|`"employee/termination/edit"`|`'employee/termination/edit'`|
|<a id="property-componenteventsemployee_termination_payroll_created"></a> `EMPLOYEE_TERMINATION_PAYROLL_CREATED`|`"employee/termination/payroll/created"`|`'employee/termination/payroll/created'`|
|<a id="property-componenteventsemployee_termination_payroll_failed"></a> `EMPLOYEE_TERMINATION_PAYROLL_FAILED`|`"employee/termination/payroll/failed"`|`'employee/termination/payroll/failed'`|
|<a id="property-componenteventsemployee_termination_run_off_cycle_payroll"></a> `EMPLOYEE_TERMINATION_RUN_OFF_CYCLE_PAYROLL`|`"employee/termination/runOffCyclePayroll"`|`'employee/termination/runOffCyclePayroll'`|
|<a id="property-componenteventsemployee_termination_run_payroll"></a> `EMPLOYEE_TERMINATION_RUN_PAYROLL`|`"employee/termination/runPayroll"`|`'employee/termination/runPayroll'`|
|<a id="property-componenteventsemployee_termination_updated"></a> `EMPLOYEE_TERMINATION_UPDATED`|`"employee/termination/updated"`|`'employee/termination/updated'`|
|<a id="property-componenteventsemployee_termination_view_summary"></a> `EMPLOYEE_TERMINATION_VIEW_SUMMARY`|`"employee/termination/viewSummary"`|`'employee/termination/viewSummary'`|
|<a id="property-componenteventsemployee_update"></a> `EMPLOYEE_UPDATE`|`"employee/update"`|`'employee/update'`|
|<a id="property-componenteventsemployee_updated"></a> `EMPLOYEE_UPDATED`|`"employee/updated"`|`'employee/updated'`|
|<a id="property-componenteventsemployee_view_form_to_sign"></a> `EMPLOYEE_VIEW_FORM_TO_SIGN`|`"employee/forms/view"`|`'employee/forms/view'`|
|<a id="property-componenteventsemployee_work_address"></a> `EMPLOYEE_WORK_ADDRESS`|`"employee/addresses/work"`|`'employee/addresses/work'`|
|<a id="property-componenteventsemployee_work_address_created"></a> `EMPLOYEE_WORK_ADDRESS_CREATED`|`"employee/addresses/work/created"`|`'employee/addresses/work/created'`|
|<a id="property-componenteventsemployee_work_address_deleted"></a> `EMPLOYEE_WORK_ADDRESS_DELETED`|`"employee/addresses/work/deleted"`|`'employee/addresses/work/deleted'`|
|<a id="property-componenteventsemployee_work_address_update"></a> `EMPLOYEE_WORK_ADDRESS_UPDATE`|`"employee/addresses/work/update"`|`'employee/addresses/work/update'`|
|<a id="property-componenteventsemployee_work_address_updated"></a> `EMPLOYEE_WORK_ADDRESS_UPDATED`|`"employee/addresses/work/updated"`|`'employee/addresses/work/updated'`|
|<a id="property-componenteventsemployees_list"></a> `EMPLOYEES_LIST`|`"company/employees"`|`'company/employees'`|
|<a id="property-componenteventserror"></a> `ERROR`|`"ERROR"`|`'ERROR'`|
|<a id="property-componenteventsinformation_request_form_cancel"></a> `INFORMATION_REQUEST_FORM_CANCEL`|`"informationRequest/form/cancel"`|`'informationRequest/form/cancel'`|
|<a id="property-componenteventsinformation_request_form_done"></a> `INFORMATION_REQUEST_FORM_DONE`|`"informationRequest/form/done"`|`'informationRequest/form/done'`|
|<a id="property-componenteventsinformation_request_form_submit"></a> `INFORMATION_REQUEST_FORM_SUBMIT`|`"informationRequest/form/submit"`|`'informationRequest/form/submit'`|
|<a id="property-componenteventsinformation_request_respond"></a> `INFORMATION_REQUEST_RESPOND`|`"informationRequest/respond"`|`'informationRequest/respond'`|
|<a id="property-componenteventsoff_cycle_created"></a> `OFF_CYCLE_CREATED`|`"offCycle/created"`|`'offCycle/created'`|
|<a id="property-componenteventsoff_cycle_deductions_change"></a> `OFF_CYCLE_DEDUCTIONS_CHANGE`|`"offCycle/deductionsChange"`|`'offCycle/deductionsChange'`|
|<a id="property-componenteventsoff_cycle_select_reason"></a> `OFF_CYCLE_SELECT_REASON`|`"offCycle/selectReason"`|`'offCycle/selectReason'`|
|<a id="property-componenteventspay_schedule_create"></a> `PAY_SCHEDULE_CREATE`|`"paySchedule/create"`|`'paySchedule/create'`|
|<a id="property-componenteventspay_schedule_created"></a> `PAY_SCHEDULE_CREATED`|`"paySchedule/created"`|`'paySchedule/created'`|
|<a id="property-componenteventspay_schedule_delete"></a> `PAY_SCHEDULE_DELETE`|`"paySchedule/delete"`|`'paySchedule/delete'`|
|<a id="property-componenteventspay_schedule_deleted"></a> `PAY_SCHEDULE_DELETED`|`"paySchedule/deleted"`|`'paySchedule/deleted'`|
|<a id="property-componenteventspay_schedule_done"></a> `PAY_SCHEDULE_DONE`|`"paySchedule/done"`|`'paySchedule/done'`|
|<a id="property-componenteventspay_schedule_update"></a> `PAY_SCHEDULE_UPDATE`|`"paySchedule/update"`|`'paySchedule/update'`|
|<a id="property-componenteventspay_schedule_updated"></a> `PAY_SCHEDULE_UPDATED`|`"paySchedule/updated"`|`'paySchedule/updated'`|
|<a id="property-componenteventspayroll_deleted"></a> `PAYROLL_DELETED`|`"payroll/deleted"`|`'payroll/deleted'`|
|<a id="property-componenteventspayroll_exit_flow"></a> `PAYROLL_EXIT_FLOW`|`"payroll/saveAndExit"`|`'payroll/saveAndExit'`|
|<a id="property-componenteventspayroll_skipped"></a> `PAYROLL_SKIPPED`|`"payroll/skipped"`|`'payroll/skipped'`|
|<a id="property-componenteventspayroll_wire_form_cancel"></a> `PAYROLL_WIRE_FORM_CANCEL`|`"payroll/wire/form/cancel"`|`'payroll/wire/form/cancel'`|
|<a id="property-componenteventspayroll_wire_form_done"></a> `PAYROLL_WIRE_FORM_DONE`|`"payroll/wire/form/done"`|`'payroll/wire/form/done'`|
|<a id="property-componenteventspayroll_wire_instructions_cancel"></a> `PAYROLL_WIRE_INSTRUCTIONS_CANCEL`|`"payroll/wire/instructions/cancel"`|`'payroll/wire/instructions/cancel'`|
|<a id="property-componenteventspayroll_wire_instructions_done"></a> `PAYROLL_WIRE_INSTRUCTIONS_DONE`|`"payroll/wire/instructions/done"`|`'payroll/wire/instructions/done'`|
|<a id="property-componenteventspayroll_wire_instructions_select"></a> `PAYROLL_WIRE_INSTRUCTIONS_SELECT`|`"payroll/wire/instructions/select"`|`'payroll/wire/instructions/select'`|
|<a id="property-componenteventspayroll_wire_start_transfer"></a> `PAYROLL_WIRE_START_TRANSFER`|`"payroll/wire/startTransfer"`|`'payroll/wire/startTransfer'`|
|<a id="property-componenteventsrecovery_case_resolve"></a> `RECOVERY_CASE_RESOLVE`|`"recoveryCase/resolve"`|`'recoveryCase/resolve'`|
|<a id="property-componenteventsrecovery_case_resubmit"></a> `RECOVERY_CASE_RESUBMIT`|`"recoveryCase/resubmit"`|`'recoveryCase/resubmit'`|
|<a id="property-componenteventsrecovery_case_resubmit_cancel"></a> `RECOVERY_CASE_RESUBMIT_CANCEL`|`"recoveryCase/resubmit/cancel"`|`'recoveryCase/resubmit/cancel'`|
|<a id="property-componenteventsrecovery_case_resubmit_done"></a> `RECOVERY_CASE_RESUBMIT_DONE`|`"recoveryCase/resubmit/done"`|`'recoveryCase/resubmit/done'`|
|<a id="property-componenteventsreview_payroll"></a> `REVIEW_PAYROLL`|`"payroll/review"`|`'payroll/review'`|
|<a id="property-componenteventsrobot_machine_done"></a> `ROBOT_MACHINE_DONE`|`"done"`|`'done'`|
|<a id="property-componenteventsrun_off_cycle_payroll"></a> `RUN_OFF_CYCLE_PAYROLL`|`"runPayroll/offCycle/start"`|`'runPayroll/offCycle/start'`|
|<a id="property-componenteventsrun_payroll_back"></a> `RUN_PAYROLL_BACK`|`"runPayroll/back"`|`'runPayroll/back'`|
|<a id="property-componenteventsrun_payroll_blocker_resolution_attempted"></a> `RUN_PAYROLL_BLOCKER_RESOLUTION_ATTEMPTED`|`"runPayroll/blocker/resolutionAttempted"`|`'runPayroll/blocker/resolutionAttempted'`|
|<a id="property-componenteventsrun_payroll_blockers_detected"></a> `RUN_PAYROLL_BLOCKERS_DETECTED`|`"runPayroll/blockers/detected"`|`'runPayroll/blockers/detected'`|
|<a id="property-componenteventsrun_payroll_blockers_view_all"></a> `RUN_PAYROLL_BLOCKERS_VIEW_ALL`|`"runPayroll/blockers/viewAll"`|`'runPayroll/blockers/viewAll'`|
|<a id="property-componenteventsrun_payroll_calculated"></a> `RUN_PAYROLL_CALCULATED`|`"runPayroll/calculated"`|`'runPayroll/calculated'`|
|<a id="property-componenteventsrun_payroll_cancelled"></a> `RUN_PAYROLL_CANCELLED`|`"runPayroll/cancelled"`|`'runPayroll/cancelled'`|
|<a id="property-componenteventsrun_payroll_cancelled_alert_dismissed"></a> `RUN_PAYROLL_CANCELLED_ALERT_DISMISSED`|`"runPayroll/cancelled/alertDismissed"`|`'runPayroll/cancelled/alertDismissed'`|
|<a id="property-componenteventsrun_payroll_dates_configured"></a> `RUN_PAYROLL_DATES_CONFIGURED`|`"runPayroll/dates/configured"`|`'runPayroll/dates/configured'`|
|<a id="property-componenteventsrun_payroll_edit"></a> `RUN_PAYROLL_EDIT`|`"runPayroll/edit"`|`'runPayroll/edit'`|
|<a id="property-componenteventsrun_payroll_employee_cancelled"></a> `RUN_PAYROLL_EMPLOYEE_CANCELLED`|`"runPayroll/employee/cancelled"`|`'runPayroll/employee/cancelled'`|
|<a id="property-componenteventsrun_payroll_employee_edit"></a> `RUN_PAYROLL_EMPLOYEE_EDIT`|`"runPayroll/employee/edit"`|`'runPayroll/employee/edit'`|
|<a id="property-componenteventsrun_payroll_employee_saved"></a> `RUN_PAYROLL_EMPLOYEE_SAVED`|`"runPayroll/employee/saved"`|`'runPayroll/employee/saved'`|
|<a id="property-componenteventsrun_payroll_employee_skip"></a> `RUN_PAYROLL_EMPLOYEE_SKIP`|`"runPayroll/employee/skip"`|`'runPayroll/employee/skip'`|
|<a id="property-componenteventsrun_payroll_gross_up_calculated"></a> `RUN_PAYROLL_GROSS_UP_CALCULATED`|`"runPayroll/grossUp/calculated"`|`'runPayroll/grossUp/calculated'`|
|<a id="property-componenteventsrun_payroll_gross_up_selected"></a> `RUN_PAYROLL_GROSS_UP_SELECTED`|`"runPayroll/grossUp/selected"`|`'runPayroll/grossUp/selected'`|
|<a id="property-componenteventsrun_payroll_pdf_paystub_viewed"></a> `RUN_PAYROLL_PDF_PAYSTUB_VIEWED`|`"runPayroll/pdfPaystub/viewed"`|`'runPayroll/pdfPaystub/viewed'`|
|<a id="property-componenteventsrun_payroll_processed"></a> `RUN_PAYROLL_PROCESSED`|`"runPayroll/processed"`|`'runPayroll/processed'`|
|<a id="property-componenteventsrun_payroll_processing_failed"></a> `RUN_PAYROLL_PROCESSING_FAILED`|`"runPayroll/processingFailed"`|`'runPayroll/processingFailed'`|
|<a id="property-componenteventsrun_payroll_receipt_get"></a> `RUN_PAYROLL_RECEIPT_GET`|`"runPayroll/receipt/get"`|`'runPayroll/receipt/get'`|
|<a id="property-componenteventsrun_payroll_receipt_viewed"></a> `RUN_PAYROLL_RECEIPT_VIEWED`|`"runPayroll/receipt/viewed"`|`'runPayroll/receipt/viewed'`|
|<a id="property-componenteventsrun_payroll_selected"></a> `RUN_PAYROLL_SELECTED`|`"runPayroll/selected"`|`'runPayroll/selected'`|
|<a id="property-componenteventsrun_payroll_submitted"></a> `RUN_PAYROLL_SUBMITTED`|`"runPayroll/submitted"`|`'runPayroll/submitted'`|
|<a id="property-componenteventsrun_payroll_submitting"></a> `RUN_PAYROLL_SUBMITTING`|`"runPayroll/submitting"`|`'runPayroll/submitting'`|
|<a id="property-componenteventsrun_payroll_summary_viewed"></a> `RUN_PAYROLL_SUMMARY_VIEWED`|`"runPayroll/summary/viewed"`|`'runPayroll/summary/viewed'`|
|<a id="property-componenteventsrun_transition_payroll"></a> `RUN_TRANSITION_PAYROLL`|`"transition/runPayroll"`|`'transition/runPayroll'`|
|<a id="property-componenteventstime_off_add_employees_back"></a> `TIME_OFF_ADD_EMPLOYEES_BACK`|`"timeOff/addEmployees/back"`|`'timeOff/addEmployees/back'`|
|<a id="property-componenteventstime_off_add_employees_done"></a> `TIME_OFF_ADD_EMPLOYEES_DONE`|`"timeOff/addEmployees/done"`|`'timeOff/addEmployees/done'`|
|<a id="property-componenteventstime_off_add_employees_error"></a> `TIME_OFF_ADD_EMPLOYEES_ERROR`|`"timeOff/addEmployees/error"`|`'timeOff/addEmployees/error'`|
|<a id="property-componenteventstime_off_add_employees_to_policy"></a> `TIME_OFF_ADD_EMPLOYEES_TO_POLICY`|`"timeOff/addEmployeesToPolicy"`|`'timeOff/addEmployeesToPolicy'`|
|<a id="property-componenteventstime_off_back_to_list"></a> `TIME_OFF_BACK_TO_LIST`|`"timeOff/backToList"`|`'timeOff/backToList'`|
|<a id="property-componenteventstime_off_change_settings"></a> `TIME_OFF_CHANGE_SETTINGS`|`"timeOff/changeSettings"`|`'timeOff/changeSettings'`|
|<a id="property-componenteventstime_off_create_policy"></a> `TIME_OFF_CREATE_POLICY`|`"timeOff/createPolicy"`|`'timeOff/createPolicy'`|
|<a id="property-componenteventstime_off_delete_policy_done"></a> `TIME_OFF_DELETE_POLICY_DONE`|`"timeOff/deletePolicy/done"`|`'timeOff/deletePolicy/done'`|
|<a id="property-componenteventstime_off_edit_holiday_policy"></a> `TIME_OFF_EDIT_HOLIDAY_POLICY`|`"timeOff/editHolidayPolicy"`|`'timeOff/editHolidayPolicy'`|
|<a id="property-componenteventstime_off_edit_policy"></a> `TIME_OFF_EDIT_POLICY`|`"timeOff/editPolicy"`|`'timeOff/editPolicy'`|
|<a id="property-componenteventstime_off_holiday_add_employees"></a> `TIME_OFF_HOLIDAY_ADD_EMPLOYEES`|`"timeOff/holidayAddEmployees"`|`'timeOff/holidayAddEmployees'`|
|<a id="property-componenteventstime_off_holiday_add_employees_done"></a> `TIME_OFF_HOLIDAY_ADD_EMPLOYEES_DONE`|`"timeOff/holidayAddEmployees/done"`|`'timeOff/holidayAddEmployees/done'`|
|<a id="property-componenteventstime_off_holiday_add_employees_error"></a> `TIME_OFF_HOLIDAY_ADD_EMPLOYEES_ERROR`|`"timeOff/holidayAddEmployees/error"`|`'timeOff/holidayAddEmployees/error'`|
|<a id="property-componenteventstime_off_holiday_create_error"></a> `TIME_OFF_HOLIDAY_CREATE_ERROR`|`"timeOff/holidayCreate/error"`|`'timeOff/holidayCreate/error'`|
|<a id="property-componenteventstime_off_holiday_selection_done"></a> `TIME_OFF_HOLIDAY_SELECTION_DONE`|`"timeOff/holidaySelection/done"`|`'timeOff/holidaySelection/done'`|
|<a id="property-componenteventstime_off_holiday_selection_edit_done"></a> `TIME_OFF_HOLIDAY_SELECTION_EDIT_DONE`|`"timeOff/holidaySelection/editDone"`|`'timeOff/holidaySelection/editDone'`|
|<a id="property-componenteventstime_off_policy_create_error"></a> `TIME_OFF_POLICY_CREATE_ERROR`|`"timeOff/policyCreate/error"`|`'timeOff/policyCreate/error'`|
|<a id="property-componenteventstime_off_policy_details_done"></a> `TIME_OFF_POLICY_DETAILS_DONE`|`"timeOff/policyDetails/done"`|`'timeOff/policyDetails/done'`|
|<a id="property-componenteventstime_off_policy_settings_back"></a> `TIME_OFF_POLICY_SETTINGS_BACK`|`"timeOff/policySettings/back"`|`'timeOff/policySettings/back'`|
|<a id="property-componenteventstime_off_policy_settings_done"></a> `TIME_OFF_POLICY_SETTINGS_DONE`|`"timeOff/policySettings/done"`|`'timeOff/policySettings/done'`|
|<a id="property-componenteventstime_off_policy_settings_error"></a> `TIME_OFF_POLICY_SETTINGS_ERROR`|`"timeOff/policySettings/error"`|`'timeOff/policySettings/error'`|
|<a id="property-componenteventstime_off_policy_type_selected"></a> `TIME_OFF_POLICY_TYPE_SELECTED`|`"timeOff/policyTypeSelected"`|`'timeOff/policyTypeSelected'`|
|<a id="property-componenteventstime_off_view_holiday_employees"></a> `TIME_OFF_VIEW_HOLIDAY_EMPLOYEES`|`"timeOff/viewHolidayEmployees"`|`'timeOff/viewHolidayEmployees'`|
|<a id="property-componenteventstime_off_view_holiday_schedule"></a> `TIME_OFF_VIEW_HOLIDAY_SCHEDULE`|`"timeOff/viewHolidaySchedule"`|`'timeOff/viewHolidaySchedule'`|
|<a id="property-componenteventstime_off_view_policy"></a> `TIME_OFF_VIEW_POLICY`|`"timeOff/viewPolicy"`|`'timeOff/viewPolicy'`|
|<a id="property-componenteventstime_off_view_policy_details"></a> `TIME_OFF_VIEW_POLICY_DETAILS`|`"timeOff/viewPolicyDetails"`|`'timeOff/viewPolicyDetails'`|
|<a id="property-componenteventstime_off_view_policy_employees"></a> `TIME_OFF_VIEW_POLICY_EMPLOYEES`|`"timeOff/viewPolicyEmployees"`|`'timeOff/viewPolicyEmployees'`|
|<a id="property-componenteventstransition_created"></a> `TRANSITION_CREATED`|`"transition/created"`|`'transition/created'`|
|<a id="property-componenteventstransition_payroll_skipped"></a> `TRANSITION_PAYROLL_SKIPPED`|`"transition/payrollSkipped"`|`'transition/payrollSkipped'`|

#### Remarks

Components surface user actions and lifecycle transitions to the integrating
application through an `onEvent(type, data)` callback. The `type` argument is
always one of the string values in this object. Use this map to compare
against the incoming `type` rather than hard-coding strings.

All domain-specific event groups are spread into this object alongside
a few cross-cutting keys: `ERROR`, `CANCEL`, and `BREADCRUMB_NAVIGATE`.

#### Example

```tsx
import { componentEvents, EmployeeOnboarding } from '@gusto/embedded-react-sdk'
;<EmployeeOnboarding
  companyId={companyId}
  onEvent={(type, data) => {
    if (type === componentEvents.EMPLOYEE_ONBOARDING_DONE) {
      navigate('/employees')
    }
  }}
/>
```

---

<a id="contractoronboardingstatus"></a>

### ContractorOnboardingStatus

> `const` **ContractorOnboardingStatus**: `object`

Map of contractor onboarding status values returned by the Gusto API.

#### Type Declaration

|Name|Type|Default value|
|-|-|-|
|<a id="property-contractoronboardingstatusadmin_onboarding_incomplete"></a> `ADMIN_ONBOARDING_INCOMPLETE`|`"admin_onboarding_incomplete"`|`ContractorOnboardingStatus1.AdminOnboardingIncomplete`|
|<a id="property-contractoronboardingstatusadmin_onboarding_review"></a> `ADMIN_ONBOARDING_REVIEW`|`"admin_onboarding_review"`|`ContractorOnboardingStatus1.AdminOnboardingReview`|
|<a id="property-contractoronboardingstatusonboarding_completed"></a> `ONBOARDING_COMPLETED`|`"onboarding_completed"`|`ContractorOnboardingStatus1.OnboardingCompleted`|
|<a id="property-contractoronboardingstatusself_onboarding_invited"></a> `SELF_ONBOARDING_INVITED`|`"self_onboarding_invited"`|`ContractorOnboardingStatus1.SelfOnboardingInvited`|
|<a id="property-contractoronboardingstatusself_onboarding_not_invited"></a> `SELF_ONBOARDING_NOT_INVITED`|`"self_onboarding_not_invited"`|`ContractorOnboardingStatus1.SelfOnboardingNotInvited`|
|<a id="property-contractoronboardingstatusself_onboarding_review"></a> `SELF_ONBOARDING_REVIEW`|`"self_onboarding_review"`|`ContractorOnboardingStatus1.SelfOnboardingReview`|
|<a id="property-contractoronboardingstatusself_onboarding_started"></a> `SELF_ONBOARDING_STARTED`|`"self_onboarding_started"`|`ContractorOnboardingStatus1.SelfOnboardingStarted`|

#### Remarks

Use these keys to compare against the `onboardingStatus` field on a contractor
record. The values mirror the strings returned by the API.

---

<a id="contractorselfonboardingstatuses"></a>

### ContractorSelfOnboardingStatuses

> `const` **ContractorSelfOnboardingStatuses**: `Set`\<`"self_onboarding_invited"` \| `"self_onboarding_not_invited"` \| `"self_onboarding_started"` \| `"self_onboarding_review"`\>

Set of [ContractorOnboardingStatus](#contractoronboardingstatus) values that indicate the contractor
is completing self-onboarding.

#### Remarks

Use this set to check whether a contractor is currently in a self-onboarding
flow (not invited, invited, started, or under review) versus an admin-driven
onboarding flow.

---

<a id="employeeonboardingstatus"></a>

### EmployeeOnboardingStatus

> `const` **EmployeeOnboardingStatus**: `object`

Map of employee onboarding status values returned by the Gusto API.

#### Type Declaration

|Name|Type|Default value|
|-|-|-|
|<a id="property-employeeonboardingstatusadmin_onboarding_incomplete"></a> `ADMIN_ONBOARDING_INCOMPLETE`|`"admin_onboarding_incomplete"`|`OnboardingStatus.AdminOnboardingIncomplete`|
|<a id="property-employeeonboardingstatusonboarding_completed"></a> `ONBOARDING_COMPLETED`|`"onboarding_completed"`|`OnboardingStatus.OnboardingCompleted`|
|<a id="property-employeeonboardingstatusself_onboarding_awaiting_admin_review"></a> `SELF_ONBOARDING_AWAITING_ADMIN_REVIEW`|`"self_onboarding_awaiting_admin_review"`|`OnboardingStatus.SelfOnboardingAwaitingAdminReview`|
|<a id="property-employeeonboardingstatusself_onboarding_completed_by_employee"></a> `SELF_ONBOARDING_COMPLETED_BY_EMPLOYEE`|`"self_onboarding_completed_by_employee"`|`OnboardingStatus.SelfOnboardingCompletedByEmployee`|
|<a id="property-employeeonboardingstatusself_onboarding_invited"></a> `SELF_ONBOARDING_INVITED`|`"self_onboarding_invited"`|`OnboardingStatus.SelfOnboardingInvited`|
|<a id="property-employeeonboardingstatusself_onboarding_invited_overdue"></a> `SELF_ONBOARDING_INVITED_OVERDUE`|`"self_onboarding_invited_overdue"`|`OnboardingStatus.SelfOnboardingInvitedOverdue`|
|<a id="property-employeeonboardingstatusself_onboarding_invited_started"></a> `SELF_ONBOARDING_INVITED_STARTED`|`"self_onboarding_invited_started"`|`OnboardingStatus.SelfOnboardingInvitedStarted`|
|<a id="property-employeeonboardingstatusself_onboarding_pending_invite"></a> `SELF_ONBOARDING_PENDING_INVITE`|`"self_onboarding_pending_invite"`|`OnboardingStatus.SelfOnboardingPendingInvite`|

#### Remarks

Use these keys to compare against the `onboardingStatus` field on an employee
record. The values mirror the strings returned by the API.

---

<a id="employeeselfonboardingstatuses"></a>

### EmployeeSelfOnboardingStatuses

> `const` **EmployeeSelfOnboardingStatuses**: `Set`\<`"self_onboarding_invited"` \| `"self_onboarding_invited_started"` \| `"self_onboarding_invited_overdue"`\>

Set of [EmployeeOnboardingStatus](#employeeonboardingstatus) values that indicate the employee is
completing self-onboarding.

#### Remarks

Use this set to check whether an employee is currently in a self-onboarding
flow (invited, started, or overdue) versus an admin-driven onboarding flow.

---

<a id="gustoprovider"></a>

### GustoProvider

> `const` **GustoProvider**: `React.FC`\<[`GustoApiProps`](#gustoapiprops)\>

Top-level provider that configures the SDK at the application level.

#### Remarks

Wrap your application's component tree with `GustoProvider` so that any SDK component below it
has access to the API client, theme, locale, translations, and UI components. Components you
provide via the `components` prop override the SDK's React Aria defaults; any component you do
not supply uses the default.

For full UI control without the bundled React Aria defaults, use [GustoProviderCustomUIAdapter](#gustoprovidercustomuiadapter)
instead and supply a complete component map.

#### Param

**props**

See [GustoApiProps](#gustoapiprops).

#### Returns

The configured provider tree wrapping `children`.

---

<a id="gustoprovidercustomuiadapter"></a>

### GustoProviderCustomUIAdapter

> `const` **GustoProviderCustomUIAdapter**: `React.FC`\<[`GustoProviderCustomUIAdapterProps`](#gustoprovidercustomuiadapterprops)\>

Top-level provider that requires a complete component map and ships no UI defaults.

#### Remarks

Use this adapter when you want full control over every UI primitive the SDK renders, or when
you want to avoid the React Aria dependency for tree-shaking. Unlike [GustoProvider](#gustoprovider), the
`components` prop on [GustoProviderProps](#gustoproviderprops) is required and must supply every component the
SDK renders.

#### Param

**props**

See [GustoProviderCustomUIAdapterProps](#gustoprovidercustomuiadapterprops).

#### Returns

The configured provider tree wrapping `children`.

## Interfaces

<a id="alertprops"></a>

### AlertProps

Props your `Alert` implementation must accept from the component adapter.
Renders a status message with an optional dismiss action; used for errors, warnings, success confirmations, and informational messages.

#### Properties

|Property|Type|Default value|Description|
|-|-|-|-|
|<a id="property-alertpropsaction"></a> `action?`|`ReactNode`|`undefined`|Optional action node (e.g. a Button) rendered inline beside the label, before the dismiss button. Use this for compact alerts that need a single call-to-action next to the heading (e.g. a "Review" button summarising details available in a modal). Multi-line supporting copy should still pass through `children`.|
|<a id="property-alertpropschildren"></a> `children?`|`ReactNode`|`undefined`|Optional children to be rendered inside the alert|
|<a id="property-alertpropsclassname"></a> `className?`|`string`|`undefined`|CSS className to be applied|
|<a id="property-alertpropsdisablescrollintoview"></a> `disableScrollIntoView?`|`boolean`|`undefined`|Whether to disable scrolling the alert into view and focusing it on mount. Set to true when using inside modals.|
|<a id="property-alertpropsicon"></a> `icon?`|`ReactNode`|`undefined`|Optional custom icon component to override the default icon|
|<a id="property-alertpropslabel"></a> `label`|`string`|`undefined`|The label text for the alert|
|<a id="property-alertpropsondismiss"></a> `onDismiss?`|() => `void`|`undefined`|Optional callback function called when the dismiss button is clicked|
|<a id="property-alertpropsstatus"></a> `status?`|`"error"` \| `"success"` \| `"warning"` \| `"info"`|`'info'`|The visual status that the alert should convey|

---

<a id="apiconfig"></a>

### APIConfig

API client configuration passed to [GustoProvider](#gustoprovider) (and [GustoProviderCustomUIAdapter](#gustoprovidercustomuiadapter)).

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-apiconfigbaseurl"></a> `baseUrl`|`string`|URL of your backend proxy that forwards SDK requests to the Gusto Embedded API. SDK components never call Gusto directly.|
|<a id="property-apiconfigheaders"></a> `headers?`|`HeadersInit`|Extra headers applied to every API request. Combined with any headers your proxy adds.|
|<a id="property-apiconfighooks"></a> `hooks?`|[`SDKHooks`](#sdkhooks)|Request interceptor hooks. Use these to inspect, modify, or react to requests and responses. See [SDKHooks](#sdkhooks).|
|<a id="property-apiconfigobservability"></a> `observability?`|[`ObservabilityHook`](#observabilityhook)|Observability hook for surfacing errors and metrics from the SDK to your monitoring stack. See [ObservabilityHook](#observabilityhook).|

---

<a id="badgeprops"></a>

### BadgeProps

Props your `Badge` implementation must accept from the component adapter.
Renders a small inline label for status, counts, or tags; optionally dismissible.

#### Extends

- `Pick`\<`HTMLAttributes`\<`HTMLSpanElement`\>, `"className"` \| `"id"` \| `"aria-label"`\>

#### Properties

|Property|Type|Default value|Description|
|-|-|-|-|
|<a id="property-badgepropsaria-label"></a> `aria-label?`|`string`|`undefined`|Defines a string value that labels the current element. **See** aria-labelledby.|
|<a id="property-badgepropschildren"></a> `children`|`ReactNode`|`undefined`|Content to be displayed inside the badge|
|<a id="property-badgepropsdismissarialabel"></a> `dismissAriaLabel?`|`string`|`undefined`|Accessible label for the dismiss button|
|<a id="property-badgepropsisdisabled"></a> `isDisabled?`|`boolean`|`undefined`|Whether the badge interaction is disabled|
|<a id="property-badgepropsondismiss"></a> `onDismiss?`|() => `void`|`undefined`|Optional callback when the dismiss button is clicked. When provided, a dismiss button is rendered inside the badge.|
|<a id="property-badgepropsstatus"></a> `status?`|`"error"` \| `"success"` \| `"warning"` \| `"info"`|`'info'`|Visual style variant of the badge|

---

<a id="bannerprops"></a>

### BannerProps

Props your `Banner` implementation must accept from the component adapter.
Renders a full-width notification banner with a colored header and body content area; used for prominent warnings and errors.

#### Extends

- `Pick`\<`HTMLAttributes`\<`HTMLDivElement`\>, `"className"` \| `"id"` \| `"aria-label"`\>

#### Properties

|Property|Type|Default value|Description|
|-|-|-|-|
|<a id="property-bannerpropsaria-label"></a> `aria-label?`|`string`|`undefined`|Defines a string value that labels the current element. **See** aria-labelledby.|
|<a id="property-bannerpropschildren"></a> `children`|`ReactNode`|`undefined`|Content to be displayed in the main content area|
|<a id="property-bannerpropsstatus"></a> `status?`|`"error"` \| `"warning"`|`'warning'`|Visual status variant of the banner|
|<a id="property-bannerpropstitle"></a> `title`|`ReactNode`|`undefined`|Title content displayed in the colored header section|

---

<a id="basefieldprops"></a>

### BaseFieldProps

Common presentation props accepted by every hook field component.

#### Extended by

- [`TextInputHookFieldProps`](#textinputhookfieldprops)
- [`SelectHookFieldProps`](#selecthookfieldprops)
- [`CheckboxHookFieldProps`](#checkboxhookfieldprops)
- [`NumberInputHookFieldProps`](#numberinputhookfieldprops)
- [`DatePickerHookFieldProps`](#datepickerhookfieldprops)
- [`RadioGroupHookFieldProps`](#radiogrouphookfieldprops)
- [`SwitchHookFieldProps`](#switchhookfieldprops)

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-basefieldpropsdescription"></a> `description?`|`ReactNode`|Optional helper text rendered below the field.|
|<a id="property-basefieldpropslabel"></a> `label`|`string`|Visible label rendered above the field.|

---

<a id="baseformhookready"></a>

### BaseFormHookReady

Base ready-state shape for form hooks.

#### Remarks

Each concrete hook narrows `data`, `actions`, and `form.Fields` to its own
domain. `status.mode` matches [HookSubmitResult](#hooksubmitresult) — `'create'` when no
existing entity was loaded, `'update'` when editing one. Document-sign hooks
always surface `mode: 'create'`, which reflects the underlying submit
contract rather than a domain-level distinction. `form.Fields` carries the
pre-bound field components, `form.fieldsMetadata` carries per-field
presentation flags, and `form.getFormSubmissionValues` returns the current
parsed values (or `undefined` if invalid).

#### Extended by

- [`UseCompensationFormReady`](Employee/hooks.md#usecompensationformready)
- [`UseJobFormReady`](Employee/hooks.md#usejobformready)

#### Type Parameters

|Type Parameter|Default type|Description|
|-|-|-|
|`TFieldsMetadata` _extends_ [`FieldsMetadata`](#fieldsmetadata)|[`FieldsMetadata`](#fieldsmetadata)|Shape of the per-field metadata exposed by the hook.|
|`TFormData` _extends_ `FieldValues`|`FieldValues`|Shape of the form values managed by react-hook-form.|
|`TFields` _extends_ `object`|`Record`\<`string`, `unknown`\>|Shape of the pre-bound `Fields` component map.|

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-baseformhookreadyactions"></a> `actions`|`Record`\<`string`, `unknown`\>|Hook-specific submit actions; shape is narrowed by each concrete hook.|
|<a id="property-baseformhookreadydata"></a> `data`|`Record`\<`string`, `unknown`\>|Hook-specific data payload; shape is narrowed by each concrete hook.|
|<a id="property-baseformhookreadyerrorhandling"></a> `errorHandling`|[`HookErrorHandling`](#hookerrorhandling)|Error state and recovery actions.|
|<a id="property-baseformhookreadyform"></a> `form`|`object`|Form bindings: pre-bound field components, per-field metadata, submission values, and react-hook-form internals.|
|`form.Fields`|`TFields`|-|
|`form.fieldsMetadata`|`TFieldsMetadata`|-|
|`form.getFormSubmissionValues`|() => `Record`\<`string`, `unknown`\> \| `undefined`|-|
|`form.hookFormInternals`|[`HookFormInternals`](#hookforminternals)\<`TFormData`\>|-|
|<a id="property-baseformhookreadyisloading"></a> `isLoading`|`false`|Always `false` in this branch; discriminates from [HookLoadingResult](#hookloadingresult).|
|<a id="property-baseformhookreadystatus"></a> `status`|`object`|Submission state; `isPending` is `true` while a mutation is in flight, `mode` reflects whether the hook will create or update.|
|`status.isPending`|`boolean`|-|
|`status.mode`|`"create"` \| `"update"`|-|

---

<a id="basehookready"></a>

### BaseHookReady

Base ready-state shape for non-form hooks (data-fetching or action hooks without a form).

#### Remarks

Each concrete hook substitutes its own `data` and `status` shape via the
type parameters so consumers see fully-typed payloads without manual
narrowing. `isLoading: false` discriminates this branch from
[HookLoadingResult](#hookloadingresult).

#### Type Parameters

|Type Parameter|Default type|Description|
|-|-|-|
|`TData` _extends_ `Record`\<`string`, `unknown`\>|`Record`\<`string`, `unknown`\>|Shape of the data the hook exposes once loaded.|
|`TStatus` _extends_ `Record`\<`string`, `unknown`\>|`Record`\<`string`, `unknown`\>|Shape of the status flags the hook exposes.|

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-basehookreadydata"></a> `data`|`TData`|Hook-specific data payload; shape is narrowed by each concrete hook via `TData`.|
|<a id="property-basehookreadyerrorhandling"></a> `errorHandling`|[`HookErrorHandling`](#hookerrorhandling)|Error state and recovery actions.|
|<a id="property-basehookreadyisloading"></a> `isLoading`|`false`|Always `false` in this branch; discriminates from [HookLoadingResult](#hookloadingresult).|
|<a id="property-basehookreadystatus"></a> `status`|`TStatus`|Hook-specific status flags; shape is narrowed by each concrete hook via `TStatus`.|

---

<a id="boxheaderprops"></a>

### BoxHeaderProps

Props your `BoxHeader` implementation must accept from the component adapter.
Renders the header section of a Box, combining a title, optional description, and an optional inline action slot.

#### Properties

|Property|Type|Default value|Description|
|-|-|-|-|
|<a id="property-boxheaderpropsaction"></a> `action?`|`ReactNode`|`undefined`|Optional action content (e.g. a Button) rendered inline opposite the title.|
|<a id="property-boxheaderpropsdescription"></a> `description?`|`ReactNode`|`undefined`|Optional supporting description rendered below the title.|
|<a id="property-boxheaderpropsheadinglevel"></a> `headingLevel?`|`"h1"` \| `"h2"` \| `"h3"` \| `"h4"` \| `"h5"` \| `"h6"`|`'h3'`|Semantic heading level for the title. Defaults to `h3`.|
|<a id="property-boxheaderpropstitle"></a> `title`|`ReactNode`|`undefined`|Title content rendered as the heading.|

---

<a id="boxprops"></a>

### BoxProps

Props your `Box` implementation must accept from the component adapter.
Renders a sectioned layout container with distinct header, body, and footer areas.

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-boxpropschildren"></a> `children`|`ReactNode`|Content rendered inside the box body.|
|<a id="property-boxpropsclassname"></a> `className?`|`string`|CSS className to be applied to the root element.|
|<a id="property-boxpropsfooter"></a> `footer?`|`ReactNode`|Optional content rendered below the body in the box footer section.|
|<a id="property-boxpropsheader"></a> `header?`|`ReactNode`|Optional content rendered above the body in the box header section.|
|<a id="property-boxpropswithpadding"></a> `withPadding?`|`boolean`|Whether the body should apply the default inner padding. Defaults to true; set to false for content that needs to be flush with the box edges.|

---

<a id="breadcrumbsprops"></a>

### BreadcrumbsProps

Props your `Breadcrumbs` implementation must accept from the component adapter.
Renders a navigation breadcrumb trail showing the user's position in a multi-step flow.

#### Properties

|Property|Type|Default value|Description|
|-|-|-|-|
|<a id="property-breadcrumbspropsaria-label"></a> `aria-label?`|`string`|`'Breadcrumbs'`|Accessibility label for the breadcrumbs|
|<a id="property-breadcrumbspropsbreadcrumbs"></a> `breadcrumbs`|`Breadcrumb`[]|`undefined`|Array of breadcrumbs|
|<a id="property-breadcrumbspropsclassname"></a> `className?`|`string`|`undefined`|Additional CSS class name for the breadcrumbs container|
|<a id="property-breadcrumbspropscurrentbreadcrumbid"></a> `currentBreadcrumbId?`|`string`|`undefined`|Current breadcrumb id|
|<a id="property-breadcrumbspropsissmallcontainer"></a> `isSmallContainer?`|`boolean`|`false`|Passed to the breadcrumbs when the container size is small (640px and below) At this size, the breadcrumb typically does not have sufficient size to render completely. In our implementation, we switch to a condensed mobile version of the breadcrumbs|
|<a id="property-breadcrumbspropsonclick"></a> `onClick?`|(`id`) => `void`|`undefined`|Event handler for breadcrumb navigation|

---

<a id="buttonprops"></a>

### ButtonProps

Props your `Button` implementation must accept from the component adapter.
Renders an HTML button (`<button>`) with primary, secondary, tertiary, and error variants, a loading state, and an optional leading icon.

#### Extends

- `Pick`\<`ButtonHTMLAttributes`\<`HTMLButtonElement`\>, `"name"` \| `"id"` \| `"className"` \| `"type"` \| `"onClick"` \| `"onKeyDown"` \| `"onKeyUp"` \| `"aria-label"` \| `"aria-labelledby"` \| `"aria-describedby"` \| `"form"` \| `"title"` \| `"tabIndex"`\>

#### Properties

|Property|Type|Default value|Description|
|-|-|-|-|
|<a id="property-buttonpropsaria-describedby"></a> `aria-describedby?`|`string`|`undefined`|Identifies the element (or elements) that describes the object. **See** aria-labelledby|
|<a id="property-buttonpropsaria-label"></a> `aria-label?`|`string`|`undefined`|Defines a string value that labels the current element. **See** aria-labelledby.|
|<a id="property-buttonpropsaria-labelledby"></a> `aria-labelledby?`|`string`|`undefined`|Identifies the element (or elements) that labels the current element. **See** aria-describedby.|
|<a id="property-buttonpropsbuttonref"></a> `buttonRef?`|`Ref`\<`HTMLButtonElement`\>|`undefined`|React ref for the button element|
|<a id="property-buttonpropschildren"></a> `children?`|`ReactNode`|`undefined`|Content to be rendered inside the button|
|<a id="property-buttonpropsicon"></a> `icon?`|`ReactNode`|`undefined`|Optional leading icon rendered before children|
|<a id="property-buttonpropsisdisabled"></a> `isDisabled?`|`boolean`|`false`|Disables the button and prevents interaction|
|<a id="property-buttonpropsisloading"></a> `isLoading?`|`boolean`|`false`|Shows a loading spinner and disables the button|
|<a id="property-buttonpropsonblur"></a> `onBlur?`|(`e`) => `void`|`undefined`|Handler for blur events|
|<a id="property-buttonpropsonfocus"></a> `onFocus?`|(`e`) => `void`|`undefined`|Handler for focus events|
|<a id="property-buttonpropsvariant"></a> `variant?`|`"error"` \| `"primary"` \| `"secondary"` \| `"tertiary"`|`'primary'`|Visual style variant of the button|

---

<a id="cardprops"></a>

### CardProps

Props your `Card` implementation must accept from the component adapter.
Renders a content container with an optional overflow menu and a leading action slot.

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-cardpropsaction"></a> `action?`|`ReactNode`|Optional action element (e.g., checkbox, radio) to be displayed on the left side|
|<a id="property-cardpropschildren"></a> `children`|`ReactNode`|Content to be displayed inside the card|
|<a id="property-cardpropsclassname"></a> `className?`|`string`|CSS className to be applied|
|<a id="property-cardpropsmenu"></a> `menu?`|`ReactNode`|Optional menu component to be displayed on the right side of the card|

---

<a id="checkboxgroupoption"></a>

### CheckboxGroupOption

Option entry rendered as a single checkbox within a [CheckboxGroup](#checkboxgroupprops).

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-checkboxgroupoptiondescription"></a> `description?`|`ReactNode`|Optional description text for the checkbox option|
|<a id="property-checkboxgroupoptionisdisabled"></a> `isDisabled?`|`boolean`|Disables this specific checkbox option|
|<a id="property-checkboxgroupoptionlabel"></a> `label`|`ReactNode`|Label text or content for the checkbox option|
|<a id="property-checkboxgroupoptionvalue"></a> `value`|`string`|Value of the option that will be passed to onChange|

---

<a id="checkboxgroupprops"></a>

### CheckboxGroupProps

Props your `CheckboxGroup` implementation must accept from the component adapter.
Renders a form field wrapping multiple `<input type="checkbox" />` elements with a label, optional description, and error message.

#### Extends

- [`SharedFieldLayoutProps`](#sharedfieldlayoutprops).`Pick`\<`FieldsetHTMLAttributes`\<`HTMLFieldSetElement`\>, `"className"`\>

#### Properties

|Property|Type|Default value|Description|
|-|-|-|-|
|<a id="property-checkboxgrouppropsdescription"></a> `description?`|`ReactNode`|`undefined`|Optional description text for the field|
|<a id="property-checkboxgrouppropserrormessage"></a> `errorMessage?`|`string`|`undefined`|Error message to display when the field is invalid|
|<a id="property-checkboxgrouppropsinputref"></a> `inputRef?`|`Ref`\<`HTMLInputElement`\>|`undefined`|React ref for the first checkbox input element|
|<a id="property-checkboxgrouppropsisdisabled"></a> `isDisabled?`|`boolean`|`false`|Disables all checkbox options in the group|
|<a id="property-checkboxgrouppropsisinvalid"></a> `isInvalid?`|`boolean`|`false`|Indicates if the checkbox group is in an invalid state|
|<a id="property-checkboxgrouppropsisrequired"></a> `isRequired?`|`boolean`|`undefined`|Indicates if the field is required|
|<a id="property-checkboxgrouppropslabel"></a> `label`|`ReactNode`|`undefined`|Label text for the field|
|<a id="property-checkboxgrouppropsonchange"></a> `onChange?`|(`value`) => `void`|`undefined`|Callback when selection changes|
|<a id="property-checkboxgrouppropsoptions"></a> `options`|[`CheckboxGroupOption`](#checkboxgroupoption)[]|`undefined`|Array of checkbox options to display|
|<a id="property-checkboxgrouppropsshouldvisuallyhidelabel"></a> `shouldVisuallyHideLabel?`|`boolean`|`undefined`|Hides the label visually while keeping it accessible to screen readers|
|<a id="property-checkboxgrouppropsvalue"></a> `value?`|`string`[]|`undefined`|Array of currently selected values|

---

<a id="checkboxhookfieldprops"></a>

### CheckboxHookFieldProps

Props accepted by a checkbox field surfaced through a form hook.
Exposes `validationMessages` for custom error text alongside the shared base
field attributes (`label`, `description`).

#### Extends

- [`BaseFieldProps`](#basefieldprops)

#### Type Parameters

|Type Parameter|Default type|Description|
|-|-|-|
|`TErrorCode` _extends_ `string`|`never`|Validation error code keys mapped via `validationMessages`.|

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-checkboxhookfieldpropsdescription"></a> `description?`|`ReactNode`|Optional helper text rendered below the field.|
|<a id="property-checkboxhookfieldpropsfieldcomponent"></a> `FieldComponent?`|`ComponentType`\<[`CheckboxProps`](#checkboxprops)\>|Replaces the default checkbox UI component; must accept the same props as `CheckboxProps`.|
|<a id="property-checkboxhookfieldpropsformhookresult"></a> `formHookResult?`|[`FormHookResult`](#formhookresult)|Form hook result to connect to; falls back to the nearest `SDKFormProvider` when omitted.|
|<a id="property-checkboxhookfieldpropslabel"></a> `label`|`string`|Visible label rendered above the field.|
|<a id="property-checkboxhookfieldpropsname"></a> `name`|`string`|The field name; must match the corresponding key in the form schema.|
|<a id="property-checkboxhookfieldpropsvalidationmessages"></a> `validationMessages?`|[`ValidationMessages`](#validationmessages)\<`TErrorCode`\>|Custom error text keyed by validation error code.|

---

<a id="checkboxprops"></a>

### CheckboxProps

Props your `Checkbox` implementation must accept from the component adapter.
Renders a form field wrapping an `<input type="checkbox" />` with a label, optional description, and error message.

#### Extends

- [`SharedHorizontalFieldLayoutProps`](#sharedhorizontalfieldlayoutprops).`Pick`\<`InputHTMLAttributes`\<`HTMLInputElement`\>, `"name"` \| `"id"` \| `"className"`\>

#### Properties

|Property|Type|Default value|Description|
|-|-|-|-|
|<a id="property-checkboxpropsdescription"></a> `description?`|`ReactNode`|`undefined`|Optional description text for the field|
|<a id="property-checkboxpropserrormessage"></a> `errorMessage?`|`string`|`undefined`|Error message to display when the field is invalid|
|<a id="property-checkboxpropsinputref"></a> `inputRef?`|`Ref`\<`HTMLInputElement`\>|`undefined`|React ref for the checkbox input element|
|<a id="property-checkboxpropsisdisabled"></a> `isDisabled?`|`boolean`|`false`|Disables the checkbox and prevents interaction|
|<a id="property-checkboxpropsisinvalid"></a> `isInvalid?`|`boolean`|`false`|Indicates if the checkbox is in an invalid state|
|<a id="property-checkboxpropsisrequired"></a> `isRequired?`|`boolean`|`undefined`|Indicates if the field is required|
|<a id="property-checkboxpropslabel"></a> `label`|`ReactNode`|`undefined`|Label text for the field|
|<a id="property-checkboxpropsonblur"></a> `onBlur?`|() => `void`|`undefined`|Handler for blur events|
|<a id="property-checkboxpropsonchange"></a> `onChange?`|(`value`) => `void`|`undefined`|Callback when checkbox state changes|
|<a id="property-checkboxpropsshouldvisuallyhidelabel"></a> `shouldVisuallyHideLabel?`|`boolean`|`undefined`|Hides the label visually while keeping it accessible to screen readers|
|<a id="property-checkboxpropsvalue"></a> `value?`|`boolean`|`undefined`|Current checked state of the checkbox|

---

<a id="comboboxoption"></a>

### ComboBoxOption

Option entry for the ComboBox dropdown list.

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-comboboxoptionlabel"></a> `label`|`string`|Display text for the option|
|<a id="property-comboboxoptionvalue"></a> `value`|`string`|Value of the option that will be passed to onChange|

---

<a id="comboboxprops"></a>

### ComboBoxProps

Props your `ComboBox` implementation must accept from the component adapter.
Renders a form field wrapping a filterable `<input />` for single-option selection, optionally allowing free-form values.

#### See

[MultiSelectComboBoxProps](#multiselectcomboboxprops)

#### Extends

- [`SharedFieldLayoutProps`](#sharedfieldlayoutprops).`Pick`\<`InputHTMLAttributes`\<`HTMLInputElement`\>, `"className"` \| `"id"` \| `"name"` \| `"placeholder"`\>

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-comboboxpropsallowscustomvalue"></a> `allowsCustomValue?`|`boolean`|Allows the user to type any value, not just options in the list. The options list becomes a suggestion helper rather than a strict constraint.|
|<a id="property-comboboxpropsdescription"></a> `description?`|`ReactNode`|Optional description text for the field|
|<a id="property-comboboxpropserrormessage"></a> `errorMessage?`|`string`|Error message to display when the field is invalid|
|<a id="property-comboboxpropsinputref"></a> `inputRef?`|`Ref`\<`HTMLInputElement`\>|React ref for the combo box input element|
|<a id="property-comboboxpropsisdisabled"></a> `isDisabled?`|`boolean`|Disables the combo box and prevents interaction|
|<a id="property-comboboxpropsisinvalid"></a> `isInvalid?`|`boolean`|Indicates that the field has an error|
|<a id="property-comboboxpropsisrequired"></a> `isRequired?`|`boolean`|Indicates if the field is required|
|<a id="property-comboboxpropslabel"></a> `label`|`string`|Label text for the combo box field|
|<a id="property-comboboxpropsonblur"></a> `onBlur?`|() => `void`|Handler for blur events|
|<a id="property-comboboxpropsonchange"></a> `onChange?`|(`value`) => `void`|Callback when selection changes|
|<a id="property-comboboxpropsoptions"></a> `options`|[`ComboBoxOption`](#comboboxoption)[]|Array of options to display in the dropdown|
|<a id="property-comboboxpropsportalcontainer"></a> `portalContainer?`|`HTMLElement`|Element to use as the portal container for the dropdown popover. Overrides the default SDK root container from context.|
|<a id="property-comboboxpropsshouldvisuallyhidelabel"></a> `shouldVisuallyHideLabel?`|`boolean`|Hides the label visually while keeping it accessible to screen readers|
|<a id="property-comboboxpropsvalue"></a> `value?`|`string` \| `null`|Currently selected value|

---

<a id="componentscontexttype"></a>

### ComponentsContextType

Full map of UI components used by the SDK. Every property is a React component that the
SDK renders internally — override any of them to substitute your own design system.

Pass a `Partial<ComponentsContextType>` to `GustoProvider` via the `components` prop to
replace specific components while keeping SDK defaults for the rest.

To take full control of every UI component (and eliminate the React Aria dependency),
pass a complete `ComponentsContextType` to `GustoProviderCustomUIAdapter` instead.
All properties are then required except `PaginationControl` and `PayrollLoading`,
which fall back to built-in SDK implementations when omitted.

#### Examples

**Partial override with GustoProvider**

```tsx
import { GustoProvider } from '@gusto/embedded-react-sdk'

function App() {
  return (
    <GustoProvider
      config={{ baseUrl: '/api/gusto/' }}
      components={{
        Button: MyButton,
        TextInput: MyTextInput,
      }}
    >
      <EmployeeOnboardingFlow companyId="company_123" />
    </GustoProvider>
  )
}
```

**Full replacement with GustoProviderCustomUIAdapter**

```tsx
import { GustoProviderCustomUIAdapter, type ComponentsContextType } from '@gusto/embedded-react-sdk'

const myComponents: ComponentsContextType = {
  Alert: props => <MyAlert {...props} />,
  Button: props => <MyButton {...props} />,
  // ... all required components
}

function App() {
  return (
    <GustoProviderCustomUIAdapter config={{ baseUrl: '/api/gusto/' }} components={myComponents}>
      <EmployeeOnboardingFlow companyId="company_123" />
    </GustoProviderCustomUIAdapter>
  )
}
```

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-componentscontexttypealert"></a> `Alert`|(`props`) => `Element` \| `null`|Status message with an optional dismiss action; used for errors, warnings, success, and info.|
|<a id="property-componentscontexttypebadge"></a> `Badge`|(`props`) => `Element` \| `null`|Small inline label for status, counts, or tags; optionally dismissible.|
|<a id="property-componentscontexttypebanner"></a> `Banner`|(`props`) => `Element` \| `null`|Full-width notification banner for prominent warnings and errors.|
|<a id="property-componentscontexttypebox"></a> `Box`|(`props`) => `Element` \| `null`|Sectioned layout container with distinct header, body, and footer areas.|
|<a id="property-componentscontexttypeboxheader"></a> `BoxHeader`|(`props`) => `Element` \| `null`|Header section of a Box with a title, optional description, and optional inline action.|
|<a id="property-componentscontexttypebreadcrumbs"></a> `Breadcrumbs`|(`props`) => `Element` \| `null`|Navigation breadcrumb trail showing the user's position in a multi-step flow.|
|<a id="property-componentscontexttypebutton"></a> `Button`|(`props`) => `Element` \| `null`|HTML `<button>` with primary, secondary, tertiary, and error variants.|
|<a id="property-componentscontexttypebuttonicon"></a> `ButtonIcon`|(`props`) => `Element` \| `null`|Icon-only `<button>`; requires `aria-label` since there is no visible text for assistive technologies.|
|<a id="property-componentscontexttypecalendarpreview"></a> `CalendarPreview`|(`props`) => `Element` \| `null`|Read-only calendar for visualizing a date range with optional highlighted dates.|
|<a id="property-componentscontexttypecard"></a> `Card`|(`props`) => `Element` \| `null`|Content container with an optional overflow menu and a leading action slot.|
|<a id="property-componentscontexttypecheckbox"></a> `Checkbox`|(`props`) => `Element` \| `null`|Form field wrapping a single `<input type="checkbox" />`.|
|<a id="property-componentscontexttypecheckboxgroup"></a> `CheckboxGroup`|(`props`) => `Element` \| `null`|Form field grouping `<input type="checkbox" />` elements for multi-option selection.|
|<a id="property-componentscontexttypecombobox"></a> `ComboBox`|(`props`) => `Element` \| `null`|Form field wrapping a typeahead `<input />` for single-option selection.|
|<a id="property-componentscontexttypedatepicker"></a> `DatePicker`|(`props`) => `Element` \| `null`|Form field wrapping an `<input type="date" />` with a calendar picker popover.|
|<a id="property-componentscontexttypedaterangepicker"></a> `DateRangePicker`|(`props`) => `Element` \| `null`|Form field wrapping paired `<input type="date" />` elements for a date range.|
|<a id="property-componentscontexttypedescriptionlist"></a> `DescriptionList`|(`props`) => `Element` \| `null`|HTML `<dl>` of term/description pairs in stacked or horizontal layout.|
|<a id="property-componentscontexttypedialog"></a> `Dialog`|(`props`) => `Element` \| `null`|Modal confirmation dialog with a primary action and a cancel action.|
|<a id="property-componentscontexttypefileinput"></a> `FileInput`|(`props`) => `Element` \| `null`|Form field wrapping an `<input type="file" />`.|
|<a id="property-componentscontexttypeheading"></a> `Heading`|(`props`) => `Element` \| `null`|HTML `<h1>`–`<h6>` with visual style controlled independently from semantic level.|
|<a id="property-componentscontexttypelink"></a> `Link`|(`props`) => `Element` \| `null`|HTML `<a>` for inline navigation.|
|<a id="property-componentscontexttypeloadingspinner"></a> `LoadingSpinner`|(`props`) => `Element` \| `null`|Spinner shown while data or an action is pending.|
|<a id="property-componentscontexttypemenu"></a> `Menu`|(`props`) => `Element` \| `null`|Popover menu of actions anchored to a trigger element.|
|<a id="property-componentscontexttypemodal"></a> `Modal`|(`props`) => `Element` \| `null`|Overlay modal with customizable body content and footer.|
|<a id="property-componentscontexttypemultiselectcombobox"></a> `MultiSelectComboBox`|(`props`) => `Element` \| `null`|Form field wrapping a typeahead `<input />` for multi-option selection.|
|<a id="property-componentscontexttypenumberinput"></a> `NumberInput`|(`props`) => `Element` \| `null`|Form field wrapping a numeric `<input />` for currency, decimal, or percent values.|
|<a id="property-componentscontexttypeorderedlist"></a> `OrderedList`|(`props`) => `Element` \| `null`|HTML `<ol>` for a numbered list of items.|
|<a id="property-componentscontexttypepaginationcontrol"></a> `PaginationControl?`|(`props`) => `Element` \| `null`|Pagination controls for list views. Defaults to the SDK's built-in pagination UI when omitted.|
|<a id="property-componentscontexttypepayrollloading"></a> `PayrollLoading?`|(`props`) => `Element` \| `null`|Loading indicator for payroll calculation. Defaults to the SDK's built-in loading state when omitted.|
|<a id="property-componentscontexttypeprogressbar"></a> `ProgressBar`|(`props`) => `Element` \| `null`|Step-based progress indicator for multi-step flows.|
|<a id="property-componentscontexttyperadio"></a> `Radio`|(`props`) => `Element` \| `null`|Form field wrapping a single `<input type="radio" />`.|
|<a id="property-componentscontexttyperadiogroup"></a> `RadioGroup`|(`props`) => `Element` \| `null`|Form field grouping `<input type="radio" />` elements for single-option selection.|
|<a id="property-componentscontexttypeselect"></a> `Select`|(`props`) => `Element` \| `null`|Form field wrapping a single-select dropdown.|
|<a id="property-componentscontexttypeswitch"></a> `Switch`|(`props`) => `Element` \| `null`|Form field wrapping an `<input type="checkbox" />` styled as a toggle.|
|<a id="property-componentscontexttypetable"></a> `Table`|(`props`) => `Element` \| `null`|Tabular data display with headers, rows, optional footer, and empty state.|
|<a id="property-componentscontexttypetabs"></a> `Tabs`|(`props`) => `Element` \| `null`|Tabbed navigation with associated content panels.|
|<a id="property-componentscontexttypetext"></a> `Text`|(`props`) => `Element` \| `null`|Body text element rendered as `<p>`, `<span>`, `<div>`, or `<pre>`.|
|<a id="property-componentscontexttypetextarea"></a> `TextArea`|(`props`) => `Element` \| `null`|Form field wrapping a `<textarea>`.|
|<a id="property-componentscontexttypetextinput"></a> `TextInput`|(`props`) => `Element` \| `null`|Form field wrapping an `<input />`.|
|<a id="property-componentscontexttypeunorderedlist"></a> `UnorderedList`|(`props`) => `Element` \| `null`|HTML `<ul>` for an unordered list of items.|

---

<a id="datepickerhookfieldprops"></a>

### DatePickerHookFieldProps

Props accepted by a date picker field surfaced through a form hook.
Exposes `minDate` and `maxDate` bounds (override server-provided constraints when
supplied), `portalContainer` for correct stacking inside modals, and
`validationMessages` for custom error text alongside the shared base field
attributes (`label`, `description`).

#### Extends

- [`BaseFieldProps`](#basefieldprops).`Pick`\<[`DatePickerProps`](#datepickerprops), `"portalContainer"` \| `"minDate"` \| `"maxDate"`\>

#### Type Parameters

|Type Parameter|Default type|Description|
|-|-|-|
|`TErrorCode` _extends_ `string`|`never`|Validation error code keys mapped via `validationMessages`.|

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-datepickerhookfieldpropsdescription"></a> `description?`|`ReactNode`|Optional helper text rendered below the field.|
|<a id="property-datepickerhookfieldpropsfieldcomponent"></a> `FieldComponent?`|`ComponentType`\<[`DatePickerProps`](#datepickerprops)\>|Replaces the default date picker UI component; must accept the same props as `DatePickerProps`.|
|<a id="property-datepickerhookfieldpropsformhookresult"></a> `formHookResult?`|[`FormHookResult`](#formhookresult)|Form hook result to connect to; falls back to the nearest `SDKFormProvider` when omitted.|
|<a id="property-datepickerhookfieldpropslabel"></a> `label`|`string`|Visible label rendered above the field.|
|<a id="property-datepickerhookfieldpropsmaxdate"></a> `maxDate?`|`Date`|Maximum selectable date. Dates after this will be disabled.|
|<a id="property-datepickerhookfieldpropsmindate"></a> `minDate?`|`Date`|Minimum selectable date. Dates before this will be disabled.|
|<a id="property-datepickerhookfieldpropsname"></a> `name`|`string`|The field name; must match the corresponding key in the form schema.|
|<a id="property-datepickerhookfieldpropsportalcontainer"></a> `portalContainer?`|`HTMLElement`|When used inside a modal, pass the modal backdrop ref's element so the calendar popover stacks correctly.|
|<a id="property-datepickerhookfieldpropsvalidationmessages"></a> `validationMessages?`|[`ValidationMessages`](#validationmessages)\<`TErrorCode`\>|Custom error text keyed by validation error code.|

---

<a id="datepickerprops"></a>

### DatePickerProps

Props your `DatePicker` implementation must accept from the component adapter.
Renders a form field wrapping an `<input type="date" />` with a calendar picker popover, optional min/max bounds, and per-date disabling.

#### Extends

- [`SharedFieldLayoutProps`](#sharedfieldlayoutprops).`Pick`\<`InputHTMLAttributes`\<`HTMLInputElement`\>, `"className"` \| `"id"` \| `"name"`\>

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-datepickerpropsdescription"></a> `description?`|`ReactNode`|Optional description text for the field|
|<a id="property-datepickerpropserrormessage"></a> `errorMessage?`|`string`|Error message to display when the field is invalid|
|<a id="property-datepickerpropsinputref"></a> `inputRef?`|`Ref`\<`HTMLInputElement`\>|React ref for the date input element|
|<a id="property-datepickerpropsisdatedisabled"></a> `isDateDisabled?`|(`date`) => `boolean`|Callback to determine if a specific date should be disabled. Return true to disable the date.|
|<a id="property-datepickerpropsisdisabled"></a> `isDisabled?`|`boolean`|Disables the date picker and prevents interaction|
|<a id="property-datepickerpropsisinvalid"></a> `isInvalid?`|`boolean`|Indicates that the field has an error|
|<a id="property-datepickerpropsisrequired"></a> `isRequired?`|`boolean`|Indicates if the field is required|
|<a id="property-datepickerpropslabel"></a> `label`|`string`|Label text for the date picker field|
|<a id="property-datepickerpropsmaxdate"></a> `maxDate?`|`Date`|Maximum selectable date. Dates after this will be disabled.|
|<a id="property-datepickerpropsmindate"></a> `minDate?`|`Date`|Minimum selectable date. Dates before this will be disabled.|
|<a id="property-datepickerpropsonblur"></a> `onBlur?`|() => `void`|Handler for blur events|
|<a id="property-datepickerpropsonchange"></a> `onChange?`|(`value`) => `void`|Callback when selected date changes|
|<a id="property-datepickerpropsplaceholder"></a> `placeholder?`|`string`|Placeholder text when no date is selected|
|<a id="property-datepickerpropsportalcontainer"></a> `portalContainer?`|`HTMLElement`|Element to use as the portal container|
|<a id="property-datepickerpropsshouldvisuallyhidelabel"></a> `shouldVisuallyHideLabel?`|`boolean`|Hides the label visually while keeping it accessible to screen readers|
|<a id="property-datepickerpropsvalue"></a> `value?`|`Date` \| `null`|Currently selected date value|

---

<a id="daterange"></a>

### DateRange

Inclusive start/end pair representing a selected date range.

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-daterangeend"></a> `end`|`Date`|Last date in the range, inclusive.|
|<a id="property-daterangestart"></a> `start`|`Date`|First date in the range, inclusive.|

---

<a id="daterangepickerprops"></a>

### DateRangePickerProps

Props your `DateRangePicker` implementation must accept from the component adapter.
Renders a form field wrapping paired `<input type="date" />` elements for selecting an inclusive date range.

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-daterangepickerpropsenddatelabel"></a> `endDateLabel`|`string`|Accessible label for the end-date input.|
|<a id="property-daterangepickerpropslabel"></a> `label`|`string`|Label text for the date range field.|
|<a id="property-daterangepickerpropsmaxvalue"></a> `maxValue?`|`Date`|Latest selectable date. Dates after this are disabled.|
|<a id="property-daterangepickerpropsminvalue"></a> `minValue?`|`Date`|Earliest selectable date. Dates before this are disabled.|
|<a id="property-daterangepickerpropsonchange"></a> `onChange`|(`range`) => `void`|Callback fired when the selected range changes. Receives null when the range is cleared.|
|<a id="property-daterangepickerpropsshouldvisuallyhidelabel"></a> `shouldVisuallyHideLabel?`|`boolean`|Hides the label visually while keeping it accessible to screen readers.|
|<a id="property-daterangepickerpropsstartdatelabel"></a> `startDateLabel`|`string`|Accessible label for the start-date input.|
|<a id="property-daterangepickerpropsvalue"></a> `value`|[`DateRange`](#daterange) \| `null`|Currently selected date range, or null when nothing is selected.|

---

<a id="descriptionlistprops"></a>

### DescriptionListProps

Props your `DescriptionList` implementation must accept from the component adapter.
Renders an HTML `<dl>` of term/description pairs in either a stacked or horizontal layout.

#### Properties

|Property|Type|Default value|Description|
|-|-|-|-|
|<a id="property-descriptionlistpropsclassname"></a> `className?`|`string`|`undefined`|Additional class name applied to the root `<dl>`.|
|<a id="property-descriptionlistpropsitems"></a> `items`|`DescriptionListItem`[]|`undefined`|Term/description pairs to render in order.|
|<a id="property-descriptionlistpropslayout"></a> `layout?`|`"stacked"` \| `"horizontal"`|`'stacked'`|Visual arrangement of each term/description pair. Defaults to `'stacked'`.|
|<a id="property-descriptionlistpropsshowseparators"></a> `showSeparators?`|`boolean`|`true`|Whether to render dividers between rows. Defaults to `true`.|

---

<a id="dialogprops"></a>

### DialogProps

Props your `Dialog` implementation must accept from the component adapter.
Renders a modal confirmation dialog with a primary action and a cancel action.

#### Properties

|Property|Type|Default value|Description|
|-|-|-|-|
|<a id="property-dialogpropschildren"></a> `children?`|`ReactNode`|`undefined`|Optional children content to be rendered in the dialog body|
|<a id="property-dialogpropscloseactionlabel"></a> `closeActionLabel`|`string`|`undefined`|Text label for the close/cancel action button|
|<a id="property-dialogpropsisdestructive"></a> `isDestructive?`|`boolean`|`false`|Whether the primary action is destructive (changes button style to error variant)|
|<a id="property-dialogpropsisopen"></a> `isOpen?`|`boolean`|`false`|Controls whether the dialog is open or closed|
|<a id="property-dialogpropsisprimaryactionloading"></a> `isPrimaryActionLoading?`|`boolean`|`false`|Whether the primary action button is in loading state|
|<a id="property-dialogpropsonclose"></a> `onClose?`|() => `void`|`undefined`|Callback function called when the dialog should be closed|
|<a id="property-dialogpropsonprimaryactionclick"></a> `onPrimaryActionClick?`|() => `void`|`undefined`|Callback function called when the primary action button is clicked|
|<a id="property-dialogpropsprimaryactionlabel"></a> `primaryActionLabel`|`string`|`undefined`|Text label for the primary action button|
|<a id="property-dialogpropsshouldcloseonbackdropclick"></a> `shouldCloseOnBackdropClick?`|`boolean`|`false`|Whether clicking the backdrop should close the dialog|
|<a id="property-dialogpropstitle"></a> `title?`|`ReactNode`|`undefined`|Optional title content to be displayed at the top of the dialog|

---

<a id="fieldmetadata"></a>

### FieldMetadata

Per-field metadata published by a form hook for the matching field component.

#### Remarks

Carries the field's registered `name` plus presentation flags (required, disabled,
redacted server-side value) and optional date bounds. Consumed by hook field
components to render labels, inline validation, and bounded date pickers.

#### Extended by

- [`FieldMetadataWithOptions`](#fieldmetadatawithoptions)

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-fieldmetadatahasredactedvalue"></a> `hasRedactedValue?`|`boolean`|Whether the server returned a redacted placeholder instead of the real value.|
|<a id="property-fieldmetadataisdisabled"></a> `isDisabled?`|`boolean`|Whether the field should be rendered in a non-interactive state.|
|<a id="property-fieldmetadataisrequired"></a> `isRequired?`|`boolean`|Whether the field must have a value for the form to submit.|
|<a id="property-fieldmetadatamaxdate"></a> `maxDate?`|`string` \| `null`|ISO date string upper bound for date picker fields. Set by hooks; consumed by DatePickerHookField.|
|<a id="property-fieldmetadatamindate"></a> `minDate?`|`string` \| `null`|ISO date string lower bound for date picker fields. Set by hooks; consumed by DatePickerHookField.|
|<a id="property-fieldmetadataname"></a> `name`|`string`|Field name as registered with react-hook-form.|

---

<a id="fieldmetadatawithoptions"></a>

### FieldMetadataWithOptions

[FieldMetadata](#fieldmetadata) extended with the option list for select-like fields.

#### Remarks

Includes the `label`/`value` pairs used to render the control and, when
available, the raw `entries` (typed via `TEntry`) the options were derived
from so callers can read additional attributes off the originating record.

#### Extends

- [`FieldMetadata`](#fieldmetadata)

#### Type Parameters

|Type Parameter|Default type|Description|
|-|-|-|
|`TEntry`|`unknown`|Shape of the underlying records that produced `options`.|

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-fieldmetadatawithoptionsentries"></a> `entries?`|readonly `TEntry`[]|Raw records the options were derived from; present when the hook supplies them for callers that need additional attributes.|
|<a id="property-fieldmetadatawithoptionshasredactedvalue"></a> `hasRedactedValue?`|`boolean`|Whether the server returned a redacted placeholder instead of the real value.|
|<a id="property-fieldmetadatawithoptionsisdisabled"></a> `isDisabled?`|`boolean`|Whether the field should be rendered in a non-interactive state.|
|<a id="property-fieldmetadatawithoptionsisrequired"></a> `isRequired?`|`boolean`|Whether the field must have a value for the form to submit.|
|<a id="property-fieldmetadatawithoptionsmaxdate"></a> `maxDate?`|`string` \| `null`|ISO date string upper bound for date picker fields. Set by hooks; consumed by DatePickerHookField.|
|<a id="property-fieldmetadatawithoptionsmindate"></a> `minDate?`|`string` \| `null`|ISO date string lower bound for date picker fields. Set by hooks; consumed by DatePickerHookField.|
|<a id="property-fieldmetadatawithoptionsname"></a> `name`|`string`|Field name as registered with react-hook-form.|
|<a id="property-fieldmetadatawithoptionsoptions"></a> `options`|`object`[]|Display options as `label`/`value` pairs used to render the select-like control.|

---

<a id="fileinputprops"></a>

### FileInputProps

Props your `FileInput` implementation must accept from the component adapter.
Renders a form field wrapping an `<input type="file" />` with a label, description, error message, and optional file type restrictions.

#### Extends

- `Omit`\<[`SharedFieldLayoutProps`](#sharedfieldlayoutprops), `"shouldVisuallyHideLabel"`\>

#### Properties

|Property|Type|Default value|Description|
|-|-|-|-|
|<a id="property-fileinputpropsaccept"></a> `accept?`|`string`[]|`undefined`|Accepted file types (MIME types or extensions) **Examples** `['image/jpeg', 'image/png', 'application/pdf']` `['.jpg', '.png', '.pdf']`|
|<a id="property-fileinputpropsaria-describedby"></a> `aria-describedby?`|`string`|`undefined`|Aria-describedby attribute for accessibility|
|<a id="property-fileinputpropsclassname"></a> `className?`|`string`|`undefined`|Additional CSS class name|
|<a id="property-fileinputpropsdescription"></a> `description?`|`ReactNode`|`undefined`|Optional description text for the field|
|<a id="property-fileinputpropserrormessage"></a> `errorMessage?`|`string`|`undefined`|Error message to display when the field is invalid|
|<a id="property-fileinputpropsid"></a> `id?`|`string`|`undefined`|ID for the file input element|
|<a id="property-fileinputpropsisdisabled"></a> `isDisabled?`|`boolean`|`false`|Disables the input and prevents interaction|
|<a id="property-fileinputpropsisinvalid"></a> `isInvalid?`|`boolean`|`false`|Indicates that the field has an error|
|<a id="property-fileinputpropsisrequired"></a> `isRequired?`|`boolean`|`undefined`|Indicates if the field is required|
|<a id="property-fileinputpropslabel"></a> `label`|`ReactNode`|`undefined`|Label text for the field|
|<a id="property-fileinputpropsonblur"></a> `onBlur?`|() => `void`|`undefined`|Handler for blur events|
|<a id="property-fileinputpropsonchange"></a> `onChange`|(`file`) => `void`|`undefined`|Callback when file selection changes|
|<a id="property-fileinputpropsvalue"></a> `value`|`File` \| `null`|`undefined`|Currently selected file|

---

<a id="gustoapiprops"></a>

### GustoApiProps

Props for [GustoProvider](#gustoprovider).

#### Remarks

Extends [GustoProviderProps](#gustoproviderprops) but makes `components` optional and partial: any components
you do not supply fall back to the SDK's built-in React Aria implementations.

#### Extends

- `Omit`\<[`GustoProviderProps`](#gustoproviderprops), `"components"`\>

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-gustoapipropschildren"></a> `children?`|`ReactNode`|The application tree that should have access to the SDK.|
|<a id="property-gustoapipropscomponents"></a> `components?`|`Partial`\<[`ComponentsContextType`](#componentscontexttype)\>|Partial component overrides. Any component you do not supply uses the SDK's default React Aria implementation.|
|<a id="property-gustoapipropsconfig"></a> `config`|[`APIConfig`](#apiconfig)|API client configuration, including the proxy `baseUrl`, request hooks, and observability. See [APIConfig](#apiconfig).|
|<a id="property-gustoapipropscurrency"></a> `currency?`|`string`|ISO 4217 currency code used for monetary formatting. Defaults to `'USD'`.|
|<a id="property-gustoapipropsdictionary"></a> `dictionary?`|`Record`\<`"en"`, `Partial`\<\{ `common`: `common`; `Company.Addresses`: `CompanyAddresses`; `Company.AssignSignatory`: `CompanyAssignSignatory`; `Company.BankAccount`: `CompanyBankAccount`; `Company.DocumentList`: `CompanyDocumentList`; `Company.FederalTaxes`: `CompanyFederalTaxes`; `Company.Industry`: `CompanyIndustry`; `Company.Locations`: `CompanyLocations`; `Company.OnboardingOverview`: `CompanyOnboardingOverview`; `Company.PaySchedule`: `CompanyPaySchedule`; `Company.SignatureForm`: `CompanySignatureForm`; `Company.StateTaxes`: `CompanyStateTaxes`; `Company.TimeOff.CreateTimeOffPolicy`: `CompanyTimeOffCreateTimeOffPolicy`; `Company.TimeOff.EmployeeTable`: `CompanyTimeOffEmployeeTable`; `Company.TimeOff.HolidayPolicy`: `CompanyTimeOffHolidayPolicy`; `Company.TimeOff.PolicyDetail`: `CompanyTimeOffPolicyDetail`; `Company.TimeOff.SelectEmployees`: `CompanyTimeOffSelectEmployees`; `Company.TimeOff.SelectPolicyType`: `CompanyTimeOffSelectPolicyType`; `Company.TimeOff.TimeOffPolicies`: `CompanyTimeOffTimeOffPolicies`; `Company.TimeOff.TimeOffPolicyDetails`: `CompanyTimeOffTimeOffPolicyDetails`; `Company.TimeOff.TimeOffRequests`: `CompanyTimeOffTimeOffRequests`; `Contractor.Address`: `ContractorAddress`; `Contractor.ContractorList`: `ContractorContractorList`; `Contractor.NewHireReport`: `ContractorNewHireReport`; `Contractor.PaymentMethod`: `ContractorPaymentMethod`; `Contractor.Payments.CreatePayment`: `ContractorPaymentsCreatePayment`; `Contractor.Payments.PaymentHistory`: `ContractorPaymentsPaymentHistory`; `Contractor.Payments.PaymentsList`: `ContractorPaymentsPaymentsList`; `Contractor.Payments.PaymentStatement`: `ContractorPaymentsPaymentStatement`; `Contractor.Payments.PaymentSummary`: `ContractorPaymentsPaymentSummary`; `Contractor.Profile`: `ContractorProfile`; `Contractor.Submit`: `ContractorSubmit`; `Employee.BankAccount`: `EmployeeBankAccount`; `Employee.BankFormBody`: `EmployeeBankFormBody`; `Employee.Compensation`: `EmployeeCompensation`; `Employee.Dashboard`: `EmployeeDashboard`; `Employee.Deductions`: `EmployeeDeductions`; `Employee.DeductionsForm`: `EmployeeDeductionsForm`; `Employee.DocumentManager`: `EmployeeDocumentManager`; `Employee.DocumentSigner`: `EmployeeDocumentSigner`; `Employee.EmployeeDocuments`: `EmployeeEmployeeDocuments`; `Employee.EmployeeList`: `EmployeeEmployeeList`; `Employee.EmploymentEligibility`: `EmployeeEmploymentEligibility`; `Employee.FederalTaxes`: `EmployeeFederalTaxes`; `Employee.FederalTaxesView`: `EmployeeFederalTaxesView`; `Employee.HomeAddress`: `EmployeeHomeAddress`; `Employee.I9SignatureForm`: `EmployeeI9SignatureForm`; `Employee.Landing`: `EmployeeLanding`; `Employee.Management.Compensation`: `EmployeeManagementCompensation`; `Employee.Management.Deductions`: `EmployeeManagementDeductions`; `Employee.Management.Documents`: `EmployeeManagementDocuments`; `Employee.Management.FederalTaxes`: `EmployeeManagementFederalTaxes`; `Employee.Management.HomeAddress`: `EmployeeManagementHomeAddress`; `Employee.Management.PaymentMethod`: `EmployeeManagementPaymentMethod`; `Employee.Management.PaymentMethodBankForm`: `EmployeeManagementPaymentMethodBankForm`; `Employee.Management.PaymentMethodSplitForm`: `EmployeeManagementPaymentMethodSplitForm`; `Employee.Management.Paystubs`: `EmployeeManagementPaystubs`; `Employee.Management.Profile`: `EmployeeManagementProfile`; `Employee.Management.StateTaxes`: `EmployeeManagementStateTaxes`; `Employee.Management.WorkAddress`: `EmployeeManagementWorkAddress`; `Employee.ManagementEmployeeList`: `EmployeeManagementEmployeeList`; `Employee.OnboardingSummary`: `EmployeeOnboardingSummary`; `Employee.PaymentMethod`: `EmployeePaymentMethod`; `Employee.PaySchedules`: `EmployeePaySchedules`; `Employee.Profile`: `EmployeeProfile`; `Employee.SplitPaycheck`: `EmployeeSplitPaycheck`; `Employee.SplitPaymentsFormBody`: `EmployeeSplitPaymentsFormBody`; `Employee.StateTaxes`: `EmployeeStateTaxes`; `Employee.StateTaxesView`: `EmployeeStateTaxesView`; `Employee.Terminations.TerminateEmployee`: `EmployeeTerminationsTerminateEmployee`; `Employee.Terminations.TerminationFlow`: `EmployeeTerminationsTerminationFlow`; `Employee.Terminations.TerminationSummary`: `EmployeeTerminationsTerminationSummary`; `InformationRequests`: `InformationRequests`; `InformationRequests.InformationRequestForm`: `InformationRequestsInformationRequestForm`; `InformationRequests.InformationRequestList`: `InformationRequestsInformationRequestList`; `Payroll.Common`: `PayrollCommon`; `Payroll.ConfirmWireDetailsBanner`: `PayrollConfirmWireDetailsBanner`; `Payroll.ConfirmWireDetailsForm`: `PayrollConfirmWireDetailsForm`; `Payroll.Dismissal`: `PayrollDismissal`; `Payroll.EmployeeSelection`: `PayrollEmployeeSelection`; `Payroll.GrossUpModal`: `PayrollGrossUpModal`; `Payroll.OffCycle`: `PayrollOffCycle`; `Payroll.OffCycleCreation`: `PayrollOffCycleCreation`; `Payroll.OffCycleDeductionsSetting`: `PayrollOffCycleDeductionsSetting`; `Payroll.OffCyclePayPeriodDateForm`: `PayrollOffCyclePayPeriodDateForm`; `Payroll.OffCycleReasonSelection`: `PayrollOffCycleReasonSelection`; `Payroll.OffCycleTaxWithholding`: `PayrollOffCycleTaxWithholding`; `Payroll.PayrollBlocker`: `PayrollPayrollBlocker`; `Payroll.PayrollConfiguration`: `PayrollPayrollConfiguration`; `Payroll.PayrollEditEmployee`: `PayrollPayrollEditEmployee`; `Payroll.PayrollFlow`: `PayrollPayrollFlow`; `Payroll.PayrollHistory`: `PayrollPayrollHistory`; `Payroll.PayrollLanding`: `PayrollPayrollLanding`; `Payroll.PayrollList`: `PayrollPayrollList`; `Payroll.PayrollOverview`: `PayrollPayrollOverview`; `Payroll.PayrollReceipts`: `PayrollPayrollReceipts`; `Payroll.RecoveryCasesList`: `PayrollRecoveryCasesList`; `Payroll.RecoveryCasesResubmit`: `PayrollRecoveryCasesResubmit`; `Payroll.Transition`: `PayrollTransition`; `Payroll.TransitionCreation`: `PayrollTransitionCreation`; `Payroll.TransitionPayrollAlert`: `PayrollTransitionPayrollAlert`; `Payroll.WireInstructions`: `PayrollWireInstructions`; \}\>\>|Translation overrides keyed by language and i18next namespace. Strings supplied here replace the SDK defaults for the matching keys.|
|<a id="property-gustoapipropslng"></a> `lng?`|`string`|Active i18next language. Defaults to `'en'`.|
|<a id="property-gustoapipropsloadercomponent"></a> `LoaderComponent?`|(`__namedParameters`) => `Element`|Loading indicator rendered while SDK queries are pending. Overrides the SDK default spinner.|
|<a id="property-gustoapipropslocale"></a> `locale?`|`string`|BCP 47 locale used for number, date, and currency formatting throughout the SDK. Defaults to `'en-US'`.|
|<a id="property-gustoapipropsportalcontainer"></a> `portalContainer?`|`HTMLElement`|Element to use as the portal container for SDK popovers and dropdowns. Useful when rendering inside a modal or shadow root.|
|<a id="property-gustoapipropsqueryclient"></a> `queryClient?`|`QueryClient`|Optional TanStack Query `QueryClient` to share with the rest of your app. When omitted, the SDK creates its own client configured for Gusto's API.|
|<a id="property-gustoapipropstheme"></a> `theme?`|`Partial`\<[`GustoSDKTheme`](#gustosdktheme)\>|Theme overrides applied to SDK components. See [GustoSDKTheme](#gustosdktheme).|

---

<a id="gustoprovidercustomuiadapterprops"></a>

### GustoProviderCustomUIAdapterProps

Props for [GustoProviderCustomUIAdapter](#gustoprovidercustomuiadapter).

#### Extends

- [`GustoProviderProps`](#gustoproviderprops)

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-gustoprovidercustomuiadapterpropschildren"></a> `children?`|`ReactNode`|The application tree that should have access to the SDK.|
|<a id="property-gustoprovidercustomuiadapterpropscomponents"></a> `components`|[`ComponentsContextType`](#componentscontexttype)|Complete map of UI components the SDK renders. Required because this adapter ships no defaults.|
|<a id="property-gustoprovidercustomuiadapterpropsconfig"></a> `config`|[`APIConfig`](#apiconfig)|API client configuration, including the proxy `baseUrl`, request hooks, and observability. See [APIConfig](#apiconfig).|
|<a id="property-gustoprovidercustomuiadapterpropscurrency"></a> `currency?`|`string`|ISO 4217 currency code used for monetary formatting. Defaults to `'USD'`.|
|<a id="property-gustoprovidercustomuiadapterpropsdictionary"></a> `dictionary?`|`Record`\<`"en"`, `Partial`\<\{ `common`: `common`; `Company.Addresses`: `CompanyAddresses`; `Company.AssignSignatory`: `CompanyAssignSignatory`; `Company.BankAccount`: `CompanyBankAccount`; `Company.DocumentList`: `CompanyDocumentList`; `Company.FederalTaxes`: `CompanyFederalTaxes`; `Company.Industry`: `CompanyIndustry`; `Company.Locations`: `CompanyLocations`; `Company.OnboardingOverview`: `CompanyOnboardingOverview`; `Company.PaySchedule`: `CompanyPaySchedule`; `Company.SignatureForm`: `CompanySignatureForm`; `Company.StateTaxes`: `CompanyStateTaxes`; `Company.TimeOff.CreateTimeOffPolicy`: `CompanyTimeOffCreateTimeOffPolicy`; `Company.TimeOff.EmployeeTable`: `CompanyTimeOffEmployeeTable`; `Company.TimeOff.HolidayPolicy`: `CompanyTimeOffHolidayPolicy`; `Company.TimeOff.PolicyDetail`: `CompanyTimeOffPolicyDetail`; `Company.TimeOff.SelectEmployees`: `CompanyTimeOffSelectEmployees`; `Company.TimeOff.SelectPolicyType`: `CompanyTimeOffSelectPolicyType`; `Company.TimeOff.TimeOffPolicies`: `CompanyTimeOffTimeOffPolicies`; `Company.TimeOff.TimeOffPolicyDetails`: `CompanyTimeOffTimeOffPolicyDetails`; `Company.TimeOff.TimeOffRequests`: `CompanyTimeOffTimeOffRequests`; `Contractor.Address`: `ContractorAddress`; `Contractor.ContractorList`: `ContractorContractorList`; `Contractor.NewHireReport`: `ContractorNewHireReport`; `Contractor.PaymentMethod`: `ContractorPaymentMethod`; `Contractor.Payments.CreatePayment`: `ContractorPaymentsCreatePayment`; `Contractor.Payments.PaymentHistory`: `ContractorPaymentsPaymentHistory`; `Contractor.Payments.PaymentsList`: `ContractorPaymentsPaymentsList`; `Contractor.Payments.PaymentStatement`: `ContractorPaymentsPaymentStatement`; `Contractor.Payments.PaymentSummary`: `ContractorPaymentsPaymentSummary`; `Contractor.Profile`: `ContractorProfile`; `Contractor.Submit`: `ContractorSubmit`; `Employee.BankAccount`: `EmployeeBankAccount`; `Employee.BankFormBody`: `EmployeeBankFormBody`; `Employee.Compensation`: `EmployeeCompensation`; `Employee.Dashboard`: `EmployeeDashboard`; `Employee.Deductions`: `EmployeeDeductions`; `Employee.DeductionsForm`: `EmployeeDeductionsForm`; `Employee.DocumentManager`: `EmployeeDocumentManager`; `Employee.DocumentSigner`: `EmployeeDocumentSigner`; `Employee.EmployeeDocuments`: `EmployeeEmployeeDocuments`; `Employee.EmployeeList`: `EmployeeEmployeeList`; `Employee.EmploymentEligibility`: `EmployeeEmploymentEligibility`; `Employee.FederalTaxes`: `EmployeeFederalTaxes`; `Employee.FederalTaxesView`: `EmployeeFederalTaxesView`; `Employee.HomeAddress`: `EmployeeHomeAddress`; `Employee.I9SignatureForm`: `EmployeeI9SignatureForm`; `Employee.Landing`: `EmployeeLanding`; `Employee.Management.Compensation`: `EmployeeManagementCompensation`; `Employee.Management.Deductions`: `EmployeeManagementDeductions`; `Employee.Management.Documents`: `EmployeeManagementDocuments`; `Employee.Management.FederalTaxes`: `EmployeeManagementFederalTaxes`; `Employee.Management.HomeAddress`: `EmployeeManagementHomeAddress`; `Employee.Management.PaymentMethod`: `EmployeeManagementPaymentMethod`; `Employee.Management.PaymentMethodBankForm`: `EmployeeManagementPaymentMethodBankForm`; `Employee.Management.PaymentMethodSplitForm`: `EmployeeManagementPaymentMethodSplitForm`; `Employee.Management.Paystubs`: `EmployeeManagementPaystubs`; `Employee.Management.Profile`: `EmployeeManagementProfile`; `Employee.Management.StateTaxes`: `EmployeeManagementStateTaxes`; `Employee.Management.WorkAddress`: `EmployeeManagementWorkAddress`; `Employee.ManagementEmployeeList`: `EmployeeManagementEmployeeList`; `Employee.OnboardingSummary`: `EmployeeOnboardingSummary`; `Employee.PaymentMethod`: `EmployeePaymentMethod`; `Employee.PaySchedules`: `EmployeePaySchedules`; `Employee.Profile`: `EmployeeProfile`; `Employee.SplitPaycheck`: `EmployeeSplitPaycheck`; `Employee.SplitPaymentsFormBody`: `EmployeeSplitPaymentsFormBody`; `Employee.StateTaxes`: `EmployeeStateTaxes`; `Employee.StateTaxesView`: `EmployeeStateTaxesView`; `Employee.Terminations.TerminateEmployee`: `EmployeeTerminationsTerminateEmployee`; `Employee.Terminations.TerminationFlow`: `EmployeeTerminationsTerminationFlow`; `Employee.Terminations.TerminationSummary`: `EmployeeTerminationsTerminationSummary`; `InformationRequests`: `InformationRequests`; `InformationRequests.InformationRequestForm`: `InformationRequestsInformationRequestForm`; `InformationRequests.InformationRequestList`: `InformationRequestsInformationRequestList`; `Payroll.Common`: `PayrollCommon`; `Payroll.ConfirmWireDetailsBanner`: `PayrollConfirmWireDetailsBanner`; `Payroll.ConfirmWireDetailsForm`: `PayrollConfirmWireDetailsForm`; `Payroll.Dismissal`: `PayrollDismissal`; `Payroll.EmployeeSelection`: `PayrollEmployeeSelection`; `Payroll.GrossUpModal`: `PayrollGrossUpModal`; `Payroll.OffCycle`: `PayrollOffCycle`; `Payroll.OffCycleCreation`: `PayrollOffCycleCreation`; `Payroll.OffCycleDeductionsSetting`: `PayrollOffCycleDeductionsSetting`; `Payroll.OffCyclePayPeriodDateForm`: `PayrollOffCyclePayPeriodDateForm`; `Payroll.OffCycleReasonSelection`: `PayrollOffCycleReasonSelection`; `Payroll.OffCycleTaxWithholding`: `PayrollOffCycleTaxWithholding`; `Payroll.PayrollBlocker`: `PayrollPayrollBlocker`; `Payroll.PayrollConfiguration`: `PayrollPayrollConfiguration`; `Payroll.PayrollEditEmployee`: `PayrollPayrollEditEmployee`; `Payroll.PayrollFlow`: `PayrollPayrollFlow`; `Payroll.PayrollHistory`: `PayrollPayrollHistory`; `Payroll.PayrollLanding`: `PayrollPayrollLanding`; `Payroll.PayrollList`: `PayrollPayrollList`; `Payroll.PayrollOverview`: `PayrollPayrollOverview`; `Payroll.PayrollReceipts`: `PayrollPayrollReceipts`; `Payroll.RecoveryCasesList`: `PayrollRecoveryCasesList`; `Payroll.RecoveryCasesResubmit`: `PayrollRecoveryCasesResubmit`; `Payroll.Transition`: `PayrollTransition`; `Payroll.TransitionCreation`: `PayrollTransitionCreation`; `Payroll.TransitionPayrollAlert`: `PayrollTransitionPayrollAlert`; `Payroll.WireInstructions`: `PayrollWireInstructions`; \}\>\>|Translation overrides keyed by language and i18next namespace. Strings supplied here replace the SDK defaults for the matching keys.|
|<a id="property-gustoprovidercustomuiadapterpropslng"></a> `lng?`|`string`|Active i18next language. Defaults to `'en'`.|
|<a id="property-gustoprovidercustomuiadapterpropsloadercomponent"></a> `LoaderComponent?`|(`__namedParameters`) => `Element`|Loading indicator rendered while SDK queries are pending. Overrides the SDK default spinner.|
|<a id="property-gustoprovidercustomuiadapterpropslocale"></a> `locale?`|`string`|BCP 47 locale used for number, date, and currency formatting throughout the SDK. Defaults to `'en-US'`.|
|<a id="property-gustoprovidercustomuiadapterpropsportalcontainer"></a> `portalContainer?`|`HTMLElement`|Element to use as the portal container for SDK popovers and dropdowns. Useful when rendering inside a modal or shadow root.|
|<a id="property-gustoprovidercustomuiadapterpropsqueryclient"></a> `queryClient?`|`QueryClient`|Optional TanStack Query `QueryClient`. When omitted, the SDK creates its own client configured for Gusto's API.|
|<a id="property-gustoprovidercustomuiadapterpropstheme"></a> `theme?`|`Partial`\<[`GustoSDKTheme`](#gustosdktheme)\>|Theme overrides applied to SDK components. See [GustoSDKTheme](#gustosdktheme).|

---

<a id="gustoproviderprops"></a>

### GustoProviderProps

Shared configuration props accepted by [GustoProvider](#gustoprovider) and [GustoProviderCustomUIAdapter](#gustoprovidercustomuiadapter).

#### Extended by

- [`GustoProviderCustomUIAdapterProps`](#gustoprovidercustomuiadapterprops)

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-gustoproviderpropscomponents"></a> `components`|[`ComponentsContextType`](#componentscontexttype)|Complete map of UI components the SDK renders. Required because this adapter ships no defaults.|
|<a id="property-gustoproviderpropsconfig"></a> `config`|[`APIConfig`](#apiconfig)|API client configuration, including the proxy `baseUrl`, request hooks, and observability. See [APIConfig](#apiconfig).|
|<a id="property-gustoproviderpropscurrency"></a> `currency?`|`string`|ISO 4217 currency code used for monetary formatting. Defaults to `'USD'`.|
|<a id="property-gustoproviderpropsdictionary"></a> `dictionary?`|`Record`\<`"en"`, `Partial`\<\{ `common`: `common`; `Company.Addresses`: `CompanyAddresses`; `Company.AssignSignatory`: `CompanyAssignSignatory`; `Company.BankAccount`: `CompanyBankAccount`; `Company.DocumentList`: `CompanyDocumentList`; `Company.FederalTaxes`: `CompanyFederalTaxes`; `Company.Industry`: `CompanyIndustry`; `Company.Locations`: `CompanyLocations`; `Company.OnboardingOverview`: `CompanyOnboardingOverview`; `Company.PaySchedule`: `CompanyPaySchedule`; `Company.SignatureForm`: `CompanySignatureForm`; `Company.StateTaxes`: `CompanyStateTaxes`; `Company.TimeOff.CreateTimeOffPolicy`: `CompanyTimeOffCreateTimeOffPolicy`; `Company.TimeOff.EmployeeTable`: `CompanyTimeOffEmployeeTable`; `Company.TimeOff.HolidayPolicy`: `CompanyTimeOffHolidayPolicy`; `Company.TimeOff.PolicyDetail`: `CompanyTimeOffPolicyDetail`; `Company.TimeOff.SelectEmployees`: `CompanyTimeOffSelectEmployees`; `Company.TimeOff.SelectPolicyType`: `CompanyTimeOffSelectPolicyType`; `Company.TimeOff.TimeOffPolicies`: `CompanyTimeOffTimeOffPolicies`; `Company.TimeOff.TimeOffPolicyDetails`: `CompanyTimeOffTimeOffPolicyDetails`; `Company.TimeOff.TimeOffRequests`: `CompanyTimeOffTimeOffRequests`; `Contractor.Address`: `ContractorAddress`; `Contractor.ContractorList`: `ContractorContractorList`; `Contractor.NewHireReport`: `ContractorNewHireReport`; `Contractor.PaymentMethod`: `ContractorPaymentMethod`; `Contractor.Payments.CreatePayment`: `ContractorPaymentsCreatePayment`; `Contractor.Payments.PaymentHistory`: `ContractorPaymentsPaymentHistory`; `Contractor.Payments.PaymentsList`: `ContractorPaymentsPaymentsList`; `Contractor.Payments.PaymentStatement`: `ContractorPaymentsPaymentStatement`; `Contractor.Payments.PaymentSummary`: `ContractorPaymentsPaymentSummary`; `Contractor.Profile`: `ContractorProfile`; `Contractor.Submit`: `ContractorSubmit`; `Employee.BankAccount`: `EmployeeBankAccount`; `Employee.BankFormBody`: `EmployeeBankFormBody`; `Employee.Compensation`: `EmployeeCompensation`; `Employee.Dashboard`: `EmployeeDashboard`; `Employee.Deductions`: `EmployeeDeductions`; `Employee.DeductionsForm`: `EmployeeDeductionsForm`; `Employee.DocumentManager`: `EmployeeDocumentManager`; `Employee.DocumentSigner`: `EmployeeDocumentSigner`; `Employee.EmployeeDocuments`: `EmployeeEmployeeDocuments`; `Employee.EmployeeList`: `EmployeeEmployeeList`; `Employee.EmploymentEligibility`: `EmployeeEmploymentEligibility`; `Employee.FederalTaxes`: `EmployeeFederalTaxes`; `Employee.FederalTaxesView`: `EmployeeFederalTaxesView`; `Employee.HomeAddress`: `EmployeeHomeAddress`; `Employee.I9SignatureForm`: `EmployeeI9SignatureForm`; `Employee.Landing`: `EmployeeLanding`; `Employee.Management.Compensation`: `EmployeeManagementCompensation`; `Employee.Management.Deductions`: `EmployeeManagementDeductions`; `Employee.Management.Documents`: `EmployeeManagementDocuments`; `Employee.Management.FederalTaxes`: `EmployeeManagementFederalTaxes`; `Employee.Management.HomeAddress`: `EmployeeManagementHomeAddress`; `Employee.Management.PaymentMethod`: `EmployeeManagementPaymentMethod`; `Employee.Management.PaymentMethodBankForm`: `EmployeeManagementPaymentMethodBankForm`; `Employee.Management.PaymentMethodSplitForm`: `EmployeeManagementPaymentMethodSplitForm`; `Employee.Management.Paystubs`: `EmployeeManagementPaystubs`; `Employee.Management.Profile`: `EmployeeManagementProfile`; `Employee.Management.StateTaxes`: `EmployeeManagementStateTaxes`; `Employee.Management.WorkAddress`: `EmployeeManagementWorkAddress`; `Employee.ManagementEmployeeList`: `EmployeeManagementEmployeeList`; `Employee.OnboardingSummary`: `EmployeeOnboardingSummary`; `Employee.PaymentMethod`: `EmployeePaymentMethod`; `Employee.PaySchedules`: `EmployeePaySchedules`; `Employee.Profile`: `EmployeeProfile`; `Employee.SplitPaycheck`: `EmployeeSplitPaycheck`; `Employee.SplitPaymentsFormBody`: `EmployeeSplitPaymentsFormBody`; `Employee.StateTaxes`: `EmployeeStateTaxes`; `Employee.StateTaxesView`: `EmployeeStateTaxesView`; `Employee.Terminations.TerminateEmployee`: `EmployeeTerminationsTerminateEmployee`; `Employee.Terminations.TerminationFlow`: `EmployeeTerminationsTerminationFlow`; `Employee.Terminations.TerminationSummary`: `EmployeeTerminationsTerminationSummary`; `InformationRequests`: `InformationRequests`; `InformationRequests.InformationRequestForm`: `InformationRequestsInformationRequestForm`; `InformationRequests.InformationRequestList`: `InformationRequestsInformationRequestList`; `Payroll.Common`: `PayrollCommon`; `Payroll.ConfirmWireDetailsBanner`: `PayrollConfirmWireDetailsBanner`; `Payroll.ConfirmWireDetailsForm`: `PayrollConfirmWireDetailsForm`; `Payroll.Dismissal`: `PayrollDismissal`; `Payroll.EmployeeSelection`: `PayrollEmployeeSelection`; `Payroll.GrossUpModal`: `PayrollGrossUpModal`; `Payroll.OffCycle`: `PayrollOffCycle`; `Payroll.OffCycleCreation`: `PayrollOffCycleCreation`; `Payroll.OffCycleDeductionsSetting`: `PayrollOffCycleDeductionsSetting`; `Payroll.OffCyclePayPeriodDateForm`: `PayrollOffCyclePayPeriodDateForm`; `Payroll.OffCycleReasonSelection`: `PayrollOffCycleReasonSelection`; `Payroll.OffCycleTaxWithholding`: `PayrollOffCycleTaxWithholding`; `Payroll.PayrollBlocker`: `PayrollPayrollBlocker`; `Payroll.PayrollConfiguration`: `PayrollPayrollConfiguration`; `Payroll.PayrollEditEmployee`: `PayrollPayrollEditEmployee`; `Payroll.PayrollFlow`: `PayrollPayrollFlow`; `Payroll.PayrollHistory`: `PayrollPayrollHistory`; `Payroll.PayrollLanding`: `PayrollPayrollLanding`; `Payroll.PayrollList`: `PayrollPayrollList`; `Payroll.PayrollOverview`: `PayrollPayrollOverview`; `Payroll.PayrollReceipts`: `PayrollPayrollReceipts`; `Payroll.RecoveryCasesList`: `PayrollRecoveryCasesList`; `Payroll.RecoveryCasesResubmit`: `PayrollRecoveryCasesResubmit`; `Payroll.Transition`: `PayrollTransition`; `Payroll.TransitionCreation`: `PayrollTransitionCreation`; `Payroll.TransitionPayrollAlert`: `PayrollTransitionPayrollAlert`; `Payroll.WireInstructions`: `PayrollWireInstructions`; \}\>\>|Translation overrides keyed by language and i18next namespace. Strings supplied here replace the SDK defaults for the matching keys.|
|<a id="property-gustoproviderpropslng"></a> `lng?`|`string`|Active i18next language. Defaults to `'en'`.|
|<a id="property-gustoproviderpropsloadercomponent"></a> `LoaderComponent?`|(`__namedParameters`) => `Element`|Loading indicator rendered while SDK queries are pending. Overrides the SDK default spinner.|
|<a id="property-gustoproviderpropslocale"></a> `locale?`|`string`|BCP 47 locale used for number, date, and currency formatting throughout the SDK. Defaults to `'en-US'`.|
|<a id="property-gustoproviderpropsportalcontainer"></a> `portalContainer?`|`HTMLElement`|Element to use as the portal container for SDK popovers and dropdowns. Useful when rendering inside a modal or shadow root.|
|<a id="property-gustoproviderpropsqueryclient"></a> `queryClient?`|`QueryClient`|Optional TanStack Query `QueryClient`. When omitted, the SDK creates its own client configured for Gusto's API.|
|<a id="property-gustoproviderpropstheme"></a> `theme?`|`Partial`\<[`GustoSDKTheme`](#gustosdktheme)\>|Theme overrides applied to SDK components. See [GustoSDKTheme](#gustosdktheme).|

---

<a id="gustosdktheme"></a>

### GustoSDKTheme

Complete set of design tokens that control the SDK's visual theme. Pass a
`Partial<GustoSDKTheme>` to `ThemeProvider` to override specific tokens; any
token not supplied falls back to the SDK default.

#### Extends

- [`GustoSDKThemeColors`](#gustosdkthemecolors)

#### Properties

|Property|Type|Default value|Description|
|-|-|-|-|
|<a id="property-gustosdkthemebadgeradius"></a> `badgeRadius`|`string`|`undefined`|Border radius of badges.|
|<a id="property-gustosdkthemebannerradius"></a> `bannerRadius`|`string`|`undefined`|Border radius of banners.|
|<a id="property-gustosdkthemeboxradius"></a> `boxRadius`|`string`|`undefined`|Border radius of box/panel surfaces.|
|<a id="property-gustosdkthemebuttonradius"></a> `buttonRadius`|`string`|`undefined`|Border radius of buttons.|
|<a id="property-gustosdkthemecardradius"></a> `cardRadius`|`string`|`undefined`|Border radius of card surfaces.|
|<a id="property-gustosdkthemecolorbody"></a> `colorBody`|`string`|`undefined`|Background color of the main content area.|
|<a id="property-gustosdkthemecolorbodyaccent"></a> `colorBodyAccent`|`string`|`undefined`|Subtle accent background, used for hover states and alternating rows.|
|<a id="property-gustosdkthemecolorbodycontent"></a> `colorBodyContent`|`string`|`undefined`|Primary text color rendered on body backgrounds.|
|<a id="property-gustosdkthemecolorbodysubcontent"></a> `colorBodySubContent`|`string`|`undefined`|Secondary/muted text color for supporting copy and labels.|
|<a id="property-gustosdkthemecolorborderprimary"></a> `colorBorderPrimary`|`string`|`undefined`|Color of primary borders (inputs, cards, dividers).|
|<a id="property-gustosdkthemecolorbordersecondary"></a> `colorBorderSecondary`|`string`|`undefined`|Color of secondary/subtle borders.|
|<a id="property-gustosdkthemecolorbuttonicon"></a> `colorButtonIcon`|`string`|`undefined`|Color of icon-only buttons.|
|<a id="property-gustosdkthemecolorerror"></a> `colorError`|`string`|`undefined`|Background for error banners and inline validation states.|
|<a id="property-gustosdkthemecolorerroraccent"></a> `colorErrorAccent`|`string`|`undefined`|Border, icon accent, and field error indicator inside error surfaces.|
|<a id="property-gustosdkthemecolorerrorcontent"></a> `colorErrorContent`|`string`|`undefined`|Text color rendered on error surfaces.|
|<a id="property-gustosdkthemecolorinfo"></a> `colorInfo`|`string`|`undefined`|Background for informational banners and callouts.|
|<a id="property-gustosdkthemecolorinfoaccent"></a> `colorInfoAccent`|`string`|`undefined`|Border or icon accent inside informational surfaces.|
|<a id="property-gustosdkthemecolorinfocontent"></a> `colorInfoContent`|`string`|`undefined`|Text color rendered on informational surfaces.|
|<a id="property-gustosdkthemecolorprimary"></a> `colorPrimary`|`string`|`undefined`|Brand primary color, used for primary buttons and active states.|
|<a id="property-gustosdkthemecolorprimaryaccent"></a> `colorPrimaryAccent`|`string`|`undefined`|Hover/pressed tint for primary elements.|
|<a id="property-gustosdkthemecolorprimarycontent"></a> `colorPrimaryContent`|`string`|`undefined`|Text or icon color rendered on primary backgrounds.|
|<a id="property-gustosdkthemecolorsecondary"></a> `colorSecondary`|`string`|`undefined`|Brand secondary color, used for secondary buttons and surfaces.|
|<a id="property-gustosdkthemecolorsecondaryaccent"></a> `colorSecondaryAccent`|`string`|`undefined`|Hover/pressed tint for secondary elements.|
|<a id="property-gustosdkthemecolorsecondarycontent"></a> `colorSecondaryContent`|`string`|`undefined`|Text or icon color rendered on secondary backgrounds.|
|<a id="property-gustosdkthemecolorsuccess"></a> `colorSuccess`|`string`|`undefined`|Background for success banners and confirmation states.|
|<a id="property-gustosdkthemecolorsuccessaccent"></a> `colorSuccessAccent`|`string`|`undefined`|Border or icon accent inside success surfaces.|
|<a id="property-gustosdkthemecolorsuccesscontent"></a> `colorSuccessContent`|`string`|`undefined`|Text color rendered on success surfaces.|
|<a id="property-gustosdkthemecolorwarning"></a> `colorWarning`|`string`|`undefined`|Background for warning banners and callouts.|
|<a id="property-gustosdkthemecolorwarningaccent"></a> `colorWarningAccent`|`string`|`undefined`|Border or icon accent inside warning surfaces.|
|<a id="property-gustosdkthemecolorwarningcontent"></a> `colorWarningContent`|`string`|`undefined`|Text color rendered on warning surfaces.|
|<a id="property-gustosdkthemefocusringcolor"></a> `focusRingColor`|`string`|`colorPrimary`|Color of the keyboard focus ring.|
|<a id="property-gustosdkthemefocusringwidth"></a> `focusRingWidth`|`string`|`undefined`|Width of the keyboard focus ring.|
|<a id="property-gustosdkthemefontfamily"></a> `fontFamily`|`string`|`undefined`|Font family stack applied to all SDK text.|
|<a id="property-gustosdkthemefontlineheightextrasmall"></a> `fontLineHeightExtraSmall`|`string`|`undefined`|Line height for extra-small text.|
|<a id="property-gustosdkthemefontlineheightlarge"></a> `fontLineHeightLarge`|`string`|`undefined`|Line height for large text.|
|<a id="property-gustosdkthemefontlineheightregular"></a> `fontLineHeightRegular`|`string`|`undefined`|Line height for regular/body text.|
|<a id="property-gustosdkthemefontlineheightsmall"></a> `fontLineHeightSmall`|`string`|`undefined`|Line height for small text.|
|<a id="property-gustosdkthemefontsizeextrasmall"></a> `fontSizeExtraSmall`|`string`|`undefined`|Font size for extra-small text.|
|<a id="property-gustosdkthemefontsizeheading1"></a> `fontSizeHeading1`|`string`|`undefined`|Font size for H1 headings.|
|<a id="property-gustosdkthemefontsizeheading2"></a> `fontSizeHeading2`|`string`|`undefined`|Font size for H2 headings.|
|<a id="property-gustosdkthemefontsizeheading3"></a> `fontSizeHeading3`|`string`|`undefined`|Font size for H3 headings.|
|<a id="property-gustosdkthemefontsizeheading4"></a> `fontSizeHeading4`|`string`|`undefined`|Font size for H4 headings.|
|<a id="property-gustosdkthemefontsizeheading5"></a> `fontSizeHeading5`|`string`|`undefined`|Font size for H5 headings.|
|<a id="property-gustosdkthemefontsizeheading6"></a> `fontSizeHeading6`|`string`|`undefined`|Font size for H6 headings.|
|<a id="property-gustosdkthemefontsizelarge"></a> `fontSizeLarge`|`string`|`undefined`|Font size for large text.|
|<a id="property-gustosdkthemefontsizeregular"></a> `fontSizeRegular`|`string`|`undefined`|Font size for regular/body text.|
|<a id="property-gustosdkthemefontsizeroot"></a> `fontSizeRoot`|`string`|`undefined`|Root document font size as a numeric string (no `px` suffix). Used as the rem base.|
|<a id="property-gustosdkthemefontsizesmall"></a> `fontSizeSmall`|`string`|`undefined`|Font size for small text.|
|<a id="property-gustosdkthemefontweightbold"></a> `fontWeightBold`|`string`|`undefined`|Font weight for bold text.|
|<a id="property-gustosdkthemefontweightmedium"></a> `fontWeightMedium`|`string`|`undefined`|Font weight for medium-emphasis text.|
|<a id="property-gustosdkthemefontweightregular"></a> `fontWeightRegular`|`string`|`undefined`|Font weight for regular text.|
|<a id="property-gustosdkthemefontweightsemibold"></a> `fontWeightSemibold`|`string`|`undefined`|Font weight for semibold text.|
|<a id="property-gustosdkthemeinputadornmentcolor"></a> `inputAdornmentColor`|`string`|`colorBodySubContent`|Color of leading/trailing adornment icons in inputs.|
|<a id="property-gustosdkthemeinputbackgroundcolor"></a> `inputBackgroundColor`|`string`|`colorBody`|Background color of text inputs and selects.|
|<a id="property-gustosdkthemeinputbordercolor"></a> `inputBorderColor`|`string`|`undefined`|Border color of text inputs and selects.|
|<a id="property-gustosdkthemeinputborderwidth"></a> `inputBorderWidth`|`string`|`undefined`|Border width of text inputs and selects.|
|<a id="property-gustosdkthemeinputcontentcolor"></a> `inputContentColor`|`string`|`colorBodyContent`|Text color inside text inputs and selects.|
|<a id="property-gustosdkthemeinputdescriptioncolor"></a> `inputDescriptionColor`|`string`|`colorBodySubContent`|Color of form field description/hint text.|
|<a id="property-gustosdkthemeinputdisabledbackgroundcolor"></a> `inputDisabledBackgroundColor`|`string`|`colorBodyAccent`|Background color of disabled inputs.|
|<a id="property-gustosdkthemeinputerrorcolor"></a> `inputErrorColor`|`string`|`colorErrorAccent`|Color of inline field error messages.|
|<a id="property-gustosdkthemeinputlabelcolor"></a> `inputLabelColor`|`string`|`colorBodyContent`|Color of form field labels.|
|<a id="property-gustosdkthemeinputlabelfontsize"></a> `inputLabelFontSize`|`string`|`undefined`|Font size of form field labels.|
|<a id="property-gustosdkthemeinputlabelfontweight"></a> `inputLabelFontWeight`|`string`|`undefined`|Font weight of form field labels.|
|<a id="property-gustosdkthemeinputplaceholdercolor"></a> `inputPlaceholderColor`|`string`|`colorBodySubContent`|Placeholder text color inside inputs.|
|<a id="property-gustosdkthemeinputradius"></a> `inputRadius`|`string`|`undefined`|Border radius of text inputs and selects.|
|<a id="property-gustosdkthemeshadowresting"></a> `shadowResting`|`string`|`undefined`|Box shadow for resting/default elevation.|
|<a id="property-gustosdkthemeshadowtopmost"></a> `shadowTopmost`|`string`|`undefined`|Box shadow for elevated/topmost surfaces such as dropdowns and modals.|
|<a id="property-gustosdkthemetransitionduration"></a> `transitionDuration`|`string`|`undefined`|Duration of UI transitions, e.g. `"200ms"`.|

---

<a id="gustosdkthemecolors"></a>

### GustoSDKThemeColors

Color tokens that can be overridden to customize the SDK's visual theme.
Pass a `Partial<GustoSDKThemeColors>` when constructing a `Partial<GustoSDKTheme>`
to supply to `ThemeProvider`.

#### Extended by

- [`GustoSDKTheme`](#gustosdktheme)

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-gustosdkthemecolorscolorbody"></a> `colorBody`|`string`|Background color of the main content area.|
|<a id="property-gustosdkthemecolorscolorbodyaccent"></a> `colorBodyAccent`|`string`|Subtle accent background, used for hover states and alternating rows.|
|<a id="property-gustosdkthemecolorscolorbodycontent"></a> `colorBodyContent`|`string`|Primary text color rendered on body backgrounds.|
|<a id="property-gustosdkthemecolorscolorbodysubcontent"></a> `colorBodySubContent`|`string`|Secondary/muted text color for supporting copy and labels.|
|<a id="property-gustosdkthemecolorscolorborderprimary"></a> `colorBorderPrimary`|`string`|Color of primary borders (inputs, cards, dividers).|
|<a id="property-gustosdkthemecolorscolorbordersecondary"></a> `colorBorderSecondary`|`string`|Color of secondary/subtle borders.|
|<a id="property-gustosdkthemecolorscolorbuttonicon"></a> `colorButtonIcon`|`string`|Color of icon-only buttons.|
|<a id="property-gustosdkthemecolorscolorerror"></a> `colorError`|`string`|Background for error banners and inline validation states.|
|<a id="property-gustosdkthemecolorscolorerroraccent"></a> `colorErrorAccent`|`string`|Border, icon accent, and field error indicator inside error surfaces.|
|<a id="property-gustosdkthemecolorscolorerrorcontent"></a> `colorErrorContent`|`string`|Text color rendered on error surfaces.|
|<a id="property-gustosdkthemecolorscolorinfo"></a> `colorInfo`|`string`|Background for informational banners and callouts.|
|<a id="property-gustosdkthemecolorscolorinfoaccent"></a> `colorInfoAccent`|`string`|Border or icon accent inside informational surfaces.|
|<a id="property-gustosdkthemecolorscolorinfocontent"></a> `colorInfoContent`|`string`|Text color rendered on informational surfaces.|
|<a id="property-gustosdkthemecolorscolorprimary"></a> `colorPrimary`|`string`|Brand primary color, used for primary buttons and active states.|
|<a id="property-gustosdkthemecolorscolorprimaryaccent"></a> `colorPrimaryAccent`|`string`|Hover/pressed tint for primary elements.|
|<a id="property-gustosdkthemecolorscolorprimarycontent"></a> `colorPrimaryContent`|`string`|Text or icon color rendered on primary backgrounds.|
|<a id="property-gustosdkthemecolorscolorsecondary"></a> `colorSecondary`|`string`|Brand secondary color, used for secondary buttons and surfaces.|
|<a id="property-gustosdkthemecolorscolorsecondaryaccent"></a> `colorSecondaryAccent`|`string`|Hover/pressed tint for secondary elements.|
|<a id="property-gustosdkthemecolorscolorsecondarycontent"></a> `colorSecondaryContent`|`string`|Text or icon color rendered on secondary backgrounds.|
|<a id="property-gustosdkthemecolorscolorsuccess"></a> `colorSuccess`|`string`|Background for success banners and confirmation states.|
|<a id="property-gustosdkthemecolorscolorsuccessaccent"></a> `colorSuccessAccent`|`string`|Border or icon accent inside success surfaces.|
|<a id="property-gustosdkthemecolorscolorsuccesscontent"></a> `colorSuccessContent`|`string`|Text color rendered on success surfaces.|
|<a id="property-gustosdkthemecolorscolorwarning"></a> `colorWarning`|`string`|Background for warning banners and callouts.|
|<a id="property-gustosdkthemecolorscolorwarningaccent"></a> `colorWarningAccent`|`string`|Border or icon accent inside warning surfaces.|
|<a id="property-gustosdkthemecolorscolorwarningcontent"></a> `colorWarningContent`|`string`|Text color rendered on warning surfaces.|

---

<a id="headingprops"></a>

### HeadingProps

Props your `Heading` implementation must accept from the component adapter.
Renders an HTML heading (`<h1>`–`<h6>`) whose visual style level is controlled independently from its semantic level.

#### Extends

- `Pick`\<`HTMLAttributes`\<`HTMLHeadingElement`\>, `"className"` \| `"id"`\>

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-headingpropsas"></a> `as`|`"h1"` \| `"h2"` \| `"h3"` \| `"h4"` \| `"h5"` \| `"h6"`|The HTML heading element to render (h1-h6)|
|<a id="property-headingpropschildren"></a> `children?`|`ReactNode`|Content to be displayed inside the heading|
|<a id="property-headingpropsstyledas"></a> `styledAs?`|`"h1"` \| `"h2"` \| `"h3"` \| `"h4"` \| `"h5"` \| `"h6"`|Optional visual style to apply, independent of the semantic heading level|
|<a id="property-headingpropstextalign"></a> `textAlign?`|`"center"` \| `"start"` \| `"end"`|Text alignment within the heading|

---

<a id="hookerrorhandling"></a>

### HookErrorHandling

Error state and recovery actions returned by every hook in both loading and ready states.

#### Remarks

`errors` aggregates fetch and submit errors as normalized `SDKError` values.
Recovery is split by source: `retryQueries` refetches every failed
data-fetching query (dependent queries re-trigger automatically when their
dependencies resolve), and `clearSubmitError` clears the most recent
submission error. Inferring which action to offer from those two methods is
the supported way to discriminate fetch vs submit failures today.

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-hookerrorhandlingclearsubmiterror"></a> `clearSubmitError`|() => `void`|Clears the most recent submission error.|
|<a id="property-hookerrorhandlingerrors"></a> `errors`|[`SDKError`](#sdkerror)[]|Aggregated fetch and submit errors as normalized [SDKError](#sdkerror) values.|
|<a id="property-hookerrorhandlingretryqueries"></a> `retryQueries`|() => `void`|Refetches every failed data-fetching query; dependent queries re-trigger automatically when their dependencies resolve.|

---

<a id="hookforminternals"></a>

### HookFormInternals

Escape hatch exposing react-hook-form's `UseFormReturn` from a form hook.

#### Remarks

Available at `form.hookFormInternals` on every form hook for advanced cases
not covered by the built-in API — for example, watching a field for reactive
UI updates outside of the SDK fields, programmatically setting values, or
triggering validation on specific fields. The built-in `Fields`,
`actions.onSubmit`, and `form.getFormSubmissionValues` are sufficient for
most use cases.

#### Type Parameters

|Type Parameter|Default type|Description|
|-|-|-|
|`TFormData` _extends_ `FieldValues`|`FieldValues`|Shape of the form values managed by react-hook-form.|

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-hookforminternalsformmethods"></a> `formMethods`|`UseFormReturn`\<`TFormData`\>|The full react-hook-form return value; use for watching fields, setting values, or triggering validation.|

---

<a id="hookloadingresult"></a>

### HookLoadingResult

Discriminated union member returned by a hook while async data is being fetched.

#### Remarks

Only `isLoading` and `errorHandling` are available in this branch — query
errors surfaced before the hook can render its form are exposed via
`errorHandling.errors`. Once `isLoading` narrows to `false`, the hook's
ready-state shape (data, form, actions, status) becomes available.

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-hookloadingresulterrorhandling"></a> `errorHandling`|[`HookErrorHandling`](#hookerrorhandling)|Error state available before the form loads, e.g. for query errors surfaced during data fetching.|
|<a id="property-hookloadingresultisloading"></a> `isLoading`|`true`|Always `true` in this branch; narrows to `false` once the hook's ready-state shape is available.|

---

<a id="hooksubmitresult"></a>

### HookSubmitResult

Result returned by a form hook's `actions.onSubmit` after a successful submission.

#### Remarks

`mode` reflects which API path ran — `'create'` when no existing entity was
loaded, `'update'` when editing one. `data` is the saved entity returned by
the API. A failed validation or mutation returns `undefined` instead, so
always null-check before reading `result.data`.

#### Type Parameters

|Type Parameter|Description|
|-|-|
|`T`|Type of the saved entity returned by the underlying mutation.|

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-hooksubmitresultdata"></a> `data`|`T`|The saved entity returned by the API.|
|<a id="property-hooksubmitresultmode"></a> `mode`|`"create"` \| `"update"`|Whether the submission created a new entity or updated an existing one.|

---

<a id="loadingspinnerprops"></a>

### LoadingSpinnerProps

Props your `LoadingSpinner` implementation must accept from the component adapter.
Renders a spinner indicating that content is loading.

#### Extends

- `Pick`\<`HTMLAttributes`\<`HTMLDivElement`\>, `"className"` \| `"id"` \| `"aria-label"`\>

#### Properties

|Property|Type|Default value|Description|
|-|-|-|-|
|<a id="property-loadingspinnerpropsaria-label"></a> `aria-label?`|`string`|`undefined`|Defines a string value that labels the current element. **See** aria-labelledby.|
|<a id="property-loadingspinnerpropssize"></a> `size?`|`"sm"` \| `"lg"`|`'lg'`|Size of the spinner|
|<a id="property-loadingspinnerpropsstyle"></a> `style?`|`"inline"` \| `"block"`|`'block'`|Display style of the spinner|

---

<a id="menuitem"></a>

### MenuItem

Action entry your `Menu` implementation must accept for each entry in its `items` array
from the component adapter.

#### Extends

- `DataAttributes`

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-menuitemhref"></a> `href?`|`string`|Optional URL to navigate to when clicked|
|<a id="property-menuitemicon"></a> `icon?`|`ReactNode`|Optional icon to display before the label|
|<a id="property-menuitemisdisabled"></a> `isDisabled?`|`boolean`|Disables the menu item and prevents interaction|
|<a id="property-menuitemlabel"></a> `label`|`string`|Text label for the menu item|
|<a id="property-menuitemonclick"></a> `onClick`|() => `void`|Callback function when the menu item is clicked|

---

<a id="menuprops"></a>

### MenuProps

Props your `Menu` implementation must accept from the component adapter.
Renders a popover menu of actions anchored to a trigger element.

#### Extends

- `DataAttributes`

#### Properties

|Property|Type|Default value|Description|
|-|-|-|-|
|<a id="property-menupropsaria-label"></a> `aria-label`|`string`|`undefined`|Accessible label describing the menu's purpose|
|<a id="property-menupropsisopen"></a> `isOpen?`|`boolean`|`false`|Controls whether the menu is currently open|
|<a id="property-menupropsitems"></a> `items?`|[`MenuItem`](#menuitem)[]|`undefined`|Array of menu items to display|
|<a id="property-menupropsonclose"></a> `onClose?`|() => `void`|`undefined`|Callback when the menu is closed|
|<a id="property-menupropsplacement"></a> `placement?`|`"top"` \| `"top start"` \| `"top end"` \| `"bottom"` \| `"bottom start"` \| `"bottom end"` \| `"left"` \| `"right"`|`'bottom start'`|Controls the placement of the menu popover relative to the trigger|
|<a id="property-menupropsportalcontainer"></a> `portalContainer?`|`HTMLElement`|`undefined`|Element to use as the portal container for the menu popover. Overrides the default SDK root container from context.|
|<a id="property-menupropstriggerref"></a> `triggerRef?`|`RefObject`\<`Element` \| `null`\>|`undefined`|Reference to the element that triggers the menu|

---

<a id="modalprops"></a>

### ModalProps

Props your `Modal` implementation must accept from the component adapter.
Renders a modal overlay with body and footer content.

#### Properties

|Property|Type|Default value|Description|
|-|-|-|-|
|<a id="property-modalpropschildren"></a> `children?`|`ReactNode`|`undefined`|Main content to be rendered in the modal body|
|<a id="property-modalpropscontainerref"></a> `containerRef?`|`RefObject`\<`HTMLDivElement` \| `null`\>|`undefined`|Optional ref to the backdrop container|
|<a id="property-modalpropsfooter"></a> `footer?`|`ReactNode`|`undefined`|Footer content to be rendered at the bottom of the modal|
|<a id="property-modalpropsisopen"></a> `isOpen?`|`boolean`|`false`|Controls whether the modal is open or closed|
|<a id="property-modalpropsonclose"></a> `onClose?`|() => `void`|`undefined`|Callback function called when the modal should be closed|
|<a id="property-modalpropsshouldcloseonbackdropclick"></a> `shouldCloseOnBackdropClick?`|`boolean`|`false`|Whether clicking the backdrop should close the modal|

---

<a id="multiselectcomboboxoption"></a>

### MultiSelectComboBoxOption

Option entry for a `MultiSelectComboBox` dropdown list.

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-multiselectcomboboxoptionlabel"></a> `label`|`string`|Display text for the option|
|<a id="property-multiselectcomboboxoptionvalue"></a> `value`|`string`|Value of the option that will be passed to onChange|

---

<a id="multiselectcomboboxprops"></a>

### MultiSelectComboBoxProps

Props your `MultiSelectComboBox` implementation must accept from the component adapter.
Renders a form field wrapping a typeahead input for multi-option selection.

#### See

[ComboBoxProps](#comboboxprops)

#### Extends

- [`SharedFieldLayoutProps`](#sharedfieldlayoutprops).`Pick`\<`InputHTMLAttributes`\<`HTMLInputElement`\>, `"className"` \| `"id"` \| `"name"` \| `"placeholder"`\>

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-multiselectcomboboxpropsdescription"></a> `description?`|`ReactNode`|Optional description text for the field|
|<a id="property-multiselectcomboboxpropserrormessage"></a> `errorMessage?`|`string`|Error message to display when the field is invalid|
|<a id="property-multiselectcomboboxpropsinputref"></a> `inputRef?`|`Ref`\<`HTMLInputElement`\>|React ref for the combo box input element|
|<a id="property-multiselectcomboboxpropsisdisabled"></a> `isDisabled?`|`boolean`|Disables the combo box and prevents interaction|
|<a id="property-multiselectcomboboxpropsisinvalid"></a> `isInvalid?`|`boolean`|Indicates that the field has an error|
|<a id="property-multiselectcomboboxpropsisloading"></a> `isLoading?`|`boolean`|Shows a loading message in the description slot while options are being fetched|
|<a id="property-multiselectcomboboxpropsisrequired"></a> `isRequired?`|`boolean`|Indicates if the field is required|
|<a id="property-multiselectcomboboxpropslabel"></a> `label`|`string`|Label text for the combo box field|
|<a id="property-multiselectcomboboxpropsonblur"></a> `onBlur?`|() => `void`|Handler for blur events|
|<a id="property-multiselectcomboboxpropsonchange"></a> `onChange?`|(`values`) => `void`|Callback when the set of selected values changes|
|<a id="property-multiselectcomboboxpropsoptions"></a> `options`|[`MultiSelectComboBoxOption`](#multiselectcomboboxoption)[]|Array of options to display in the dropdown|
|<a id="property-multiselectcomboboxpropsshouldvisuallyhidelabel"></a> `shouldVisuallyHideLabel?`|`boolean`|Hides the label visually while keeping it accessible to screen readers|
|<a id="property-multiselectcomboboxpropsvalue"></a> `value?`|`string`[]|Currently selected values|

---

<a id="numberinputhookfieldprops"></a>

### NumberInputHookFieldProps

Props accepted by a number input field surfaced through a form hook.
Exposes numeric constraints (`min`, `max`), display `format`, `placeholder` text,
and `validationMessages` for custom error text alongside the shared base field
attributes (`label`, `description`).

#### Extends

- [`BaseFieldProps`](#basefieldprops)

#### Type Parameters

|Type Parameter|Default type|Description|
|-|-|-|
|`TErrorCode` _extends_ `string`|`never`|Validation error code keys mapped via `validationMessages`.|

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-numberinputhookfieldpropsdescription"></a> `description?`|`ReactNode`|Optional helper text rendered below the field.|
|<a id="property-numberinputhookfieldpropsfieldcomponent"></a> `FieldComponent?`|`ComponentType`\<[`NumberInputProps`](#numberinputprops)\>|Replaces the default number input UI component; must accept the same props as `NumberInputProps`.|
|<a id="property-numberinputhookfieldpropsformat"></a> `format?`|`"percent"` \| `"currency"` \| `"decimal"`|Display format for the number value (e.g. `'currency'`).|
|<a id="property-numberinputhookfieldpropsformhookresult"></a> `formHookResult?`|[`FormHookResult`](#formhookresult)|Form hook result to connect to; falls back to the nearest `SDKFormProvider` when omitted.|
|<a id="property-numberinputhookfieldpropslabel"></a> `label`|`string`|Visible label rendered above the field.|
|<a id="property-numberinputhookfieldpropsmax"></a> `max?`|`string` \| `number`|Maximum allowed numeric value.|
|<a id="property-numberinputhookfieldpropsmin"></a> `min?`|`string` \| `number`|Minimum allowed numeric value.|
|<a id="property-numberinputhookfieldpropsname"></a> `name`|`string`|The field name; must match the corresponding key in the form schema.|
|<a id="property-numberinputhookfieldpropsplaceholder"></a> `placeholder?`|`string`|Placeholder text displayed when the field has no value.|
|<a id="property-numberinputhookfieldpropsvalidationmessages"></a> `validationMessages?`|[`ValidationMessages`](#validationmessages)\<`TErrorCode`\>|Custom error text keyed by validation error code.|

---

<a id="numberinputprops"></a>

### NumberInputProps

Props your `NumberInput` implementation must accept from the component adapter.
Renders a form field wrapping a numeric `<input />` for currency, decimal, or percent values, with optional start/end adornments.

#### Extends

- [`SharedFieldLayoutProps`](#sharedfieldlayoutprops).`Pick`\<`InputHTMLAttributes`\<`HTMLInputElement`\>, `"min"` \| `"max"` \| `"name"` \| `"id"` \| `"placeholder"` \| `"className"`\>

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-numberinputpropsadornmentend"></a> `adornmentEnd?`|`ReactNode`|Element to display at the end of the input|
|<a id="property-numberinputpropsadornmentstart"></a> `adornmentStart?`|`ReactNode`|Element to display at the start of the input|
|<a id="property-numberinputpropsdescription"></a> `description?`|`ReactNode`|Optional description text for the field|
|<a id="property-numberinputpropserrormessage"></a> `errorMessage?`|`string`|Error message to display when the field is invalid|
|<a id="property-numberinputpropsformat"></a> `format?`|`"percent"` \| `"currency"` \| `"decimal"`|Format type for the number input|
|<a id="property-numberinputpropsinputref"></a> `inputRef?`|`Ref`\<`HTMLInputElement`\>|React ref for the number input element|
|<a id="property-numberinputpropsisdisabled"></a> `isDisabled?`|`boolean`|Disables the number input and prevents interaction|
|<a id="property-numberinputpropsisinvalid"></a> `isInvalid?`|`boolean`|Indicates that the field has an error|
|<a id="property-numberinputpropsisrequired"></a> `isRequired?`|`boolean`|Indicates if the field is required|
|<a id="property-numberinputpropslabel"></a> `label`|`ReactNode`|Label text for the field|
|<a id="property-numberinputpropsmaximumfractiondigits"></a> `maximumFractionDigits?`|`number`|Maximum number of decimal places to display|
|<a id="property-numberinputpropsminimumfractiondigits"></a> `minimumFractionDigits?`|`number`|Minimum number of decimal places to display|
|<a id="property-numberinputpropsonblur"></a> `onBlur?`|() => `void`|Handler for blur events|
|<a id="property-numberinputpropsonchange"></a> `onChange?`|(`value`) => `void`|Callback when number input value changes|
|<a id="property-numberinputpropsshouldvisuallyhidelabel"></a> `shouldVisuallyHideLabel?`|`boolean`|Hides the label visually while keeping it accessible to screen readers|
|<a id="property-numberinputpropsvalue"></a> `value?`|`number`|Current value of the number input|

---

<a id="observabilityerror"></a>

### ObservabilityError

An [SDKError](#sdkerror) enriched with component context for observability telemetry.

#### Remarks

Delivered to [ObservabilityHook.onError](#property-observabilityhookonerror). Extends [SDKError](#sdkerror) with
`timestamp`, `componentName`, and `componentStack` so error-tracking tools
(e.g. Sentry) can correlate and group errors. The base [SDKError](#sdkerror)
(without these fields) is the shape exposed through form hooks.

#### Extends

- [`SDKError`](#sdkerror)

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-observabilityerrorcategory"></a> `category`|[`SDKErrorCategory`](#sdkerrorcategory)|High-level error classification|
|<a id="property-observabilityerrorcomponentname"></a> `componentName?`|`string`|SDK component where the error occurred (e.g. "Employee.Profile")|
|<a id="property-observabilityerrorcomponentstack"></a> `componentStack?`|`string`|React component stack trace (present only for errors caught by ErrorBoundary)|
|<a id="property-observabilityerrorfielderrors"></a> `fieldErrors`|[`SDKFieldError`](#sdkfielderror)[]|Flattened field-level errors from API responses. Empty array for non-field errors.|
|<a id="property-observabilityerrorhttpstatus"></a> `httpStatus?`|`number`|HTTP status code (undefined for non-HTTP errors like network or validation)|
|<a id="property-observabilityerrormessage"></a> `message`|`string`|Human-readable error summary|
|<a id="property-observabilityerrorraw"></a> `raw?`|`unknown`|The original error object for advanced use cases. May be stripped by sanitization (controlled by `sanitization.includeRawError`).|
|<a id="property-observabilityerrortimestamp"></a> `timestamp`|`number`|When the error occurred (Unix timestamp in milliseconds)|

---

<a id="observabilityhook"></a>

### ObservabilityHook

Hooks for routing SDK errors and performance metrics into an external monitoring tool.

#### Remarks

Pass an instance to [GustoProvider](#gustoprovider) via `config.observability` to forward
errors to services like Sentry or Datadog and to capture performance metrics
for form submissions and component loading. Sanitization is applied before
the hooks are invoked; see [SanitizationConfig](#sanitizationconfig).

#### Example

```tsx
import * as Sentry from '@sentry/react'
import { GustoProvider, type ObservabilityHook } from '@gusto/embedded-react-sdk'

const observability: ObservabilityHook = {
  onError: error => {
    Sentry.captureException(error.raw ?? new Error(error.message), {
      level: error.category === 'validation_error' ? 'warning' : 'error',
      tags: {
        error_category: error.category,
        component: error.componentName ?? 'unknown',
        http_status: String(error.httpStatus ?? ''),
      },
    })
  },
  onMetric: metric => {
    console.log(`[Metric] ${metric.name}: ${metric.value}${metric.unit ?? ''}`)
  },
}

<GustoProvider config={{ baseUrl: '/api/', observability }}>
  <YourApp />
</GustoProvider>
```

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-observabilityhookonerror"></a> `onError?`|(`error`) => `void`|Called when an error is caught by error boundaries or form submission fails. Receives an `ObservabilityError` — an `SDKError` enriched with `componentName` and (for boundary errors) `componentStack`.|
|<a id="property-observabilityhookonmetric"></a> `onMetric?`|(`metric`) => `void`|Called to track performance metrics for component operations.|
|<a id="property-observabilityhooksanitization"></a> `sanitization?`|[`SanitizationConfig`](#sanitizationconfig)|Configuration for sanitizing data before sending to observability tools. Default: `{ enabled: true, includeRawError: false }`|

---

<a id="observabilitymetric"></a>

### ObservabilityMetric

A performance metric emitted by the SDK to [ObservabilityHook.onMetric](#property-observabilityhookonmetric).

#### Remarks

Built-in metric names include `sdk.form.submit_duration` (form submission time)
and `sdk.component.loading_duration` (time spent in loading/suspense state).
Tags may include `status` (`success` or `error`) and `component` when known.

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-observabilitymetricname"></a> `name`|`string`|Metric name (e.g., 'sdk.form.submit_duration', 'sdk.component.loading_duration')|
|<a id="property-observabilitymetrictags"></a> `tags?`|`Record`\<`string`, `string`\>|Tags for filtering/grouping|
|<a id="property-observabilitymetrictimestamp"></a> `timestamp`|`number`|When the metric was recorded (Unix timestamp in milliseconds)|
|<a id="property-observabilitymetricunit"></a> `unit?`|[`ObservabilityMetricUnit`](#observabilitymetricunit)|Metric unit|
|<a id="property-observabilitymetricvalue"></a> `value`|`number`|Metric value|

---

<a id="payrollloadingprops"></a>

### PayrollLoadingProps

Props your `PayrollLoading` implementation must accept from the component adapter.
Renders a loading state during payroll calculation.

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-payrollloadingpropsdescription"></a> `description?`|`ReactNode`|Optional supporting text displayed below the title.|
|<a id="property-payrollloadingpropstitle"></a> `title`|`ReactNode`|The heading text displayed above the loading animation.|

---

<a id="progressbarprops"></a>

### ProgressBarProps

Props your `ProgressBar` implementation must accept from the component adapter.
Renders a step-based progress indicator for multi-step flows.

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-progressbarpropsclassname"></a> `className?`|`string`|Additional CSS class name for the progress bar container|
|<a id="property-progressbarpropscta"></a> `cta?`|`ComponentType`\<\{ \}\> \| `null`|Component to render as the progress bar's CTA|
|<a id="property-progressbarpropscurrentstep"></a> `currentStep`|`number`|Current step in the progress sequence|
|<a id="property-progressbarpropslabel"></a> `label`|`string`|Accessible label describing the progress bar's purpose|
|<a id="property-progressbarpropstotalsteps"></a> `totalSteps`|`number`|Total number of steps in the progress sequence|

---

<a id="radiogrouphookfieldprops"></a>

### RadioGroupHookFieldProps

Props accepted by a radio group field surfaced through a form hook.
Exposes `getOptionLabel` to customize how option entries are rendered as labels,
and `validationMessages` for custom error text alongside the shared base field
attributes (`label`, `description`).

#### Extends

- [`BaseFieldProps`](#basefieldprops)

#### Type Parameters

|Type Parameter|Default type|Description|
|-|-|-|
|`TErrorCode` _extends_ `string`|`never`|Validation error code keys mapped via `validationMessages`.|
|`TEntry`|`unknown`|Shape of each option entry consumed by `getOptionLabel`.|

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-radiogrouphookfieldpropsdescription"></a> `description?`|`ReactNode`|Optional helper text rendered below the field.|
|<a id="property-radiogrouphookfieldpropsfieldcomponent"></a> `FieldComponent?`|`ComponentType`\<[`RadioGroupProps`](#radiogroupprops)\>|Replaces the default radio group UI component; must accept the same props as `RadioGroupProps`.|
|<a id="property-radiogrouphookfieldpropsformhookresult"></a> `formHookResult?`|[`FormHookResult`](#formhookresult)|Form hook result to connect to; falls back to the nearest `SDKFormProvider` when omitted.|
|<a id="property-radiogrouphookfieldpropsgetoptionlabel"></a> `getOptionLabel?`|(`entry`) => `string`|Maps a raw option entry to its display label; when omitted, options use the labels provided by the hook.|
|<a id="property-radiogrouphookfieldpropslabel"></a> `label`|`string`|Visible label rendered above the field.|
|<a id="property-radiogrouphookfieldpropsname"></a> `name`|`string`|The field name; must match the corresponding key in the form schema.|
|<a id="property-radiogrouphookfieldpropsvalidationmessages"></a> `validationMessages?`|[`ValidationMessages`](#validationmessages)\<`TErrorCode`\>|Custom error text keyed by validation error code.|

---

<a id="radiogroupoption"></a>

### RadioGroupOption

Option entry your `RadioGroup` implementation receives in the `options` array when rendering each radio button.

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-radiogroupoptiondescription"></a> `description?`|`ReactNode`|Optional description text for the radio option|
|<a id="property-radiogroupoptionisdisabled"></a> `isDisabled?`|`boolean`|Disables this specific radio option|
|<a id="property-radiogroupoptionlabel"></a> `label`|`ReactNode`|Label text or content for the radio option|
|<a id="property-radiogroupoptionvalue"></a> `value`|`string`|Value of the option that will be passed to onChange|

---

<a id="radiogroupprops"></a>

### RadioGroupProps

Props your `RadioGroup` implementation must accept from the component adapter.
Renders a form field wrapping multiple `<input type="radio" />` elements with a label, optional description, and error message.

#### Extends

- [`SharedFieldLayoutProps`](#sharedfieldlayoutprops).`Pick`\<`FieldsetHTMLAttributes`\<`HTMLFieldSetElement`\>, `"className"`\>

#### Properties

|Property|Type|Default value|Description|
|-|-|-|-|
|<a id="property-radiogrouppropsdefaultvalue"></a> `defaultValue?`|`string`|`undefined`|Initially selected value|
|<a id="property-radiogrouppropsdescription"></a> `description?`|`ReactNode`|`undefined`|Optional description text for the field|
|<a id="property-radiogrouppropserrormessage"></a> `errorMessage?`|`string`|`undefined`|Error message to display when the field is invalid|
|<a id="property-radiogrouppropsinputref"></a> `inputRef?`|`Ref`\<`HTMLInputElement`\>|`undefined`|React ref for the first radio input element|
|<a id="property-radiogrouppropsisdisabled"></a> `isDisabled?`|`boolean`|`false`|Disables all radio options in the group|
|<a id="property-radiogrouppropsisinvalid"></a> `isInvalid?`|`boolean`|`false`|Indicates that the field has an error|
|<a id="property-radiogrouppropsisrequired"></a> `isRequired?`|`boolean`|`undefined`|Indicates if the field is required|
|<a id="property-radiogrouppropslabel"></a> `label`|`ReactNode`|`undefined`|Label text for the field|
|<a id="property-radiogrouppropsonchange"></a> `onChange?`|(`value`) => `void`|`undefined`|Callback when selection changes|
|<a id="property-radiogrouppropsoptions"></a> `options`|[`RadioGroupOption`](#radiogroupoption)[]|`undefined`|Array of radio options to display|
|<a id="property-radiogrouppropsshouldvisuallyhidelabel"></a> `shouldVisuallyHideLabel?`|`boolean`|`undefined`|Hides the label visually while keeping it accessible to screen readers|
|<a id="property-radiogrouppropsvalue"></a> `value?`|`string` \| `null`|`undefined`|Currently selected value|

---

<a id="radioprops"></a>

### RadioProps

Props your `Radio` implementation must accept from the component adapter.
Renders a form field wrapping an `<input type="radio" />` with a label, optional description, and error message.

#### Extends

- [`SharedHorizontalFieldLayoutProps`](#sharedhorizontalfieldlayoutprops).`Pick`\<`InputHTMLAttributes`\<`HTMLInputElement`\>, `"name"` \| `"id"` \| `"className"` \| `"onBlur"`\>

#### Properties

|Property|Type|Default value|Description|
|-|-|-|-|
|<a id="property-radiopropsdescription"></a> `description?`|`ReactNode`|`undefined`|Optional description text for the field|
|<a id="property-radiopropserrormessage"></a> `errorMessage?`|`string`|`undefined`|Error message to display when the field is invalid|
|<a id="property-radiopropsinputref"></a> `inputRef?`|`Ref`\<`HTMLInputElement`\>|`undefined`|React ref for the radio input element|
|<a id="property-radiopropsisdisabled"></a> `isDisabled?`|`boolean`|`false`|Disables the radio button and prevents interaction|
|<a id="property-radiopropsisinvalid"></a> `isInvalid?`|`boolean`|`false`|Indicates that the field has an error|
|<a id="property-radiopropsisrequired"></a> `isRequired?`|`boolean`|`undefined`|Indicates if the field is required|
|<a id="property-radiopropslabel"></a> `label`|`ReactNode`|`undefined`|Label text for the field|
|<a id="property-radiopropsonchange"></a> `onChange?`|(`checked`) => `void`|`undefined`|Callback when radio button state changes|
|<a id="property-radiopropsshouldvisuallyhidelabel"></a> `shouldVisuallyHideLabel?`|`boolean`|`undefined`|Hides the label visually while keeping it accessible to screen readers|
|<a id="property-radiopropsvalue"></a> `value?`|`boolean`|`undefined`|Current checked state of the radio button|

---

<a id="sanitizationconfig"></a>

### SanitizationConfig

Configuration for sanitizing error and metric data before it reaches observability hooks.

#### Remarks

Sanitization runs by default to prevent PII leakage. When enabled, the SDK
pattern-redacts SSNs, emails, phone numbers, credit card numbers, and API
tokens from messages and tags, and removes values for fields with sensitive
names (`password`, `ssn`, `bankAccount`, etc.) from metadata. The `raw`
error object is excluded unless `includeRawError` is set to `true`.

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-sanitizationconfigadditionalsensitivefields"></a> `additionalSensitiveFields?`|`string`[]|Additional field names to treat as sensitive (case-insensitive)|
|<a id="property-sanitizationconfigcustomerrorsanitizer"></a> `customErrorSanitizer?`|(`error`) => [`ObservabilityError`](#observabilityerror)|Custom sanitization function for errors|
|<a id="property-sanitizationconfigcustommetricsanitizer"></a> `customMetricSanitizer?`|(`metric`) => [`ObservabilityMetric`](#observabilitymetric)|Custom sanitization function for metrics|
|<a id="property-sanitizationconfigenabled"></a> `enabled?`|`boolean`|Whether to sanitize error data. Default: true|
|<a id="property-sanitizationconfigincluderawerror"></a> `includeRawError?`|`boolean`|Whether to include the raw error object on SDKError. Default: false WARNING: Raw errors may contain sensitive data from form inputs or API responses|

---

<a id="sdkerror"></a>

### SDKError

Unified error shape returned by every form hook and error-handling surface.

#### Remarks

Every caught error — whether from the Gusto API, client-side Zod validation,
a network failure, or an unexpected runtime exception — is normalized into
this shape. The [SDKErrorCategory](#sdkerrorcategory) `category` field distinguishes
which source produced the error; `fieldErrors` is populated for structured
API responses (typically 422) and is an empty array otherwise.

Observability telemetry uses [ObservabilityError](#observabilityerror), which extends this
shape with component context.

#### Example

```tsx
import { useEmployeeForm } from '@gusto/embedded-react-sdk'

const { errorHandling } = useEmployeeForm({ employeeId })
const error = errorHandling.error

if (error) {
  console.log(error.category) // 'api_error'
  console.log(error.httpStatus) // 422
  console.log(error.fieldErrors) // [{ field: 'firstName', ... }]
}
```

#### Extended by

- [`ObservabilityError`](#observabilityerror)

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-sdkerrorcategory"></a> `category`|[`SDKErrorCategory`](#sdkerrorcategory)|High-level error classification|
|<a id="property-sdkerrorfielderrors"></a> `fieldErrors`|[`SDKFieldError`](#sdkfielderror)[]|Flattened field-level errors from API responses. Empty array for non-field errors.|
|<a id="property-sdkerrorhttpstatus"></a> `httpStatus?`|`number`|HTTP status code (undefined for non-HTTP errors like network or validation)|
|<a id="property-sdkerrormessage"></a> `message`|`string`|Human-readable error summary|
|<a id="property-sdkerrorraw"></a> `raw?`|`unknown`|The original error object for advanced use cases. May be stripped by sanitization (controlled by `sanitization.includeRawError`).|

---

<a id="sdkfielderror"></a>

### SDKFieldError

A flattened, field-level error extracted from an API response.

#### Remarks

For API errors with structured field errors (e.g. 422 responses), nested
`errors[]` structures are recursively flattened into one entry per leaf
field. The `field` property is the dot-separated camelCase path
(e.g. `"firstName"`, `"states.CA.filingStatus.value"`).

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-sdkfielderrorcategory"></a> `category`|`string`|API error category (e.g. "invalid_attribute_value", "invalid_operation", "payroll_blocker")|
|<a id="property-sdkfielderrorfield"></a> `field`|`string`|Dot-separated camelCase field path (e.g. "firstName", "states.CA.filingStatus.value")|
|<a id="property-sdkfielderrormessage"></a> `message`|`string`|Human-readable error message from the API|
|<a id="property-sdkfielderrormetadata"></a> `metadata?`|`Record`\<`string`, `unknown`\>|Additional metadata from the API (e.g. `{ key: "missing_bank_info" }` for payroll blockers)|

---

<a id="sdkhooks"></a>

### SDKHooks

Request interceptors for customizing HTTP requests and responses.

#### Remarks

Pass an instance of this interface to [GustoProvider](#gustoprovider) via `config.hooks` to
inspect or modify requests and responses across the four lifecycle stages.
Each entry is an array of objects implementing the corresponding hook type
from `@gusto/embedded-api-v-2025-11-15/hooks/types`.

|Stage|When it runs|
|-|-|
|`beforeCreateRequest`|Before the `Request` object is constructed (URL / method changes)|
|`beforeRequest`|After the `Request` is created but before it is sent (headers, auth tokens)|
|`afterSuccess`|After a successful response (2xx)|
|`afterError`|After an error response (4xx, 5xx) or network failure|

#### Example

```tsx
import { GustoProvider, type SDKHooks } from '@gusto/embedded-react-sdk'

const hooks: SDKHooks = {
  beforeRequest: [
    {
      beforeRequest: (context, request) => {
        request.headers.set('Authorization', `Bearer ${getToken()}`)
        return request
      },
    },
  ],
}

<GustoProvider config={{ baseUrl: '/api/', hooks }}>
  <YourApp />
</GustoProvider>
```

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-sdkhooksaftererror"></a> `afterError?`|`AfterErrorHook`[]|Hooks executed after error responses (4xx, 5xx) or network failures|
|<a id="property-sdkhooksaftersuccess"></a> `afterSuccess?`|`AfterSuccessHook`[]|Hooks executed after successful responses (2xx status codes)|
|<a id="property-sdkhooksbeforecreaterequest"></a> `beforeCreateRequest?`|`BeforeCreateRequestHook`[]|Hooks executed before creating a Request object|
|<a id="property-sdkhooksbeforerequest"></a> `beforeRequest?`|`BeforeRequestHook`[]|Hooks executed after Request creation but before sending|

---

<a id="selecthookfieldprops"></a>

### SelectHookFieldProps

Props accepted by a select field surfaced through a form hook.
Exposes `getOptionLabel` to customize how option entries are rendered as labels,
`placeholder` text, `portalContainer` for correct stacking inside modals,
and `validationMessages` for custom error text alongside the shared base field
attributes (`label`, `description`).

#### Extends

- [`BaseFieldProps`](#basefieldprops).`Pick`\<[`SelectProps`](#selectprops), `"portalContainer"`\>

#### Type Parameters

|Type Parameter|Default type|Description|
|-|-|-|
|`TErrorCode` _extends_ `string`|`never`|Validation error code keys mapped via `validationMessages`.|
|`TEntry`|`unknown`|Shape of each option entry consumed by `getOptionLabel`.|

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-selecthookfieldpropsdescription"></a> `description?`|`ReactNode`|Optional helper text rendered below the field.|
|<a id="property-selecthookfieldpropsfieldcomponent"></a> `FieldComponent?`|`ComponentType`\<[`SelectProps`](#selectprops)\>|Replaces the default select UI component; must accept the same props as `SelectProps`.|
|<a id="property-selecthookfieldpropsformhookresult"></a> `formHookResult?`|[`FormHookResult`](#formhookresult)|Form hook result to connect to; falls back to the nearest `SDKFormProvider` when omitted.|
|<a id="property-selecthookfieldpropsgetoptionlabel"></a> `getOptionLabel?`|(`entry`) => `string`|Maps a raw option entry to its display label; when omitted, options use the labels provided by the hook.|
|<a id="property-selecthookfieldpropslabel"></a> `label`|`string`|Visible label rendered above the field.|
|<a id="property-selecthookfieldpropsname"></a> `name`|`string`|The field name; must match the corresponding key in the form schema.|
|<a id="property-selecthookfieldpropsplaceholder"></a> `placeholder?`|`string`|Placeholder text displayed when no option is selected.|
|<a id="property-selecthookfieldpropsportalcontainer"></a> `portalContainer?`|`HTMLElement`|When used inside a modal, pass the modal backdrop ref's element so the listbox stacks correctly.|
|<a id="property-selecthookfieldpropsvalidationmessages"></a> `validationMessages?`|[`ValidationMessages`](#validationmessages)\<`TErrorCode`\>|Custom error text keyed by validation error code.|

---

<a id="selectoption"></a>

### SelectOption

Option entry your `Select` implementation receives in the `options` array when rendering each item in the dropdown.

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-selectoptionlabel"></a> `label`|`string`|Display text for the option|
|<a id="property-selectoptionvalue"></a> `value`|`string`|Value of the option that will be passed to onChange|

---

<a id="selectprops"></a>

### SelectProps

Props your `Select` implementation must accept from the component adapter.
Renders a form field wrapping a single-select dropdown with a label, description, and error message.

#### Extends

- [`SharedFieldLayoutProps`](#sharedfieldlayoutprops).`Pick`\<`SelectHTMLAttributes`\<`HTMLSelectElement`\>, `"id"` \| `"name"` \| `"className"`\>

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-selectpropsdescription"></a> `description?`|`ReactNode`|Optional description text for the field|
|<a id="property-selectpropserrormessage"></a> `errorMessage?`|`string`|Error message to display when the field is invalid|
|<a id="property-selectpropsinputref"></a> `inputRef?`|`Ref`\<`HTMLButtonElement`\>|React ref for the select button element|
|<a id="property-selectpropsisdisabled"></a> `isDisabled?`|`boolean`|Disables the select and prevents interaction|
|<a id="property-selectpropsisinvalid"></a> `isInvalid?`|`boolean`|Indicates that the field has an error|
|<a id="property-selectpropsisrequired"></a> `isRequired?`|`boolean`|Indicates if the field is required|
|<a id="property-selectpropslabel"></a> `label`|`string`|Label text for the select field|
|<a id="property-selectpropsonblur"></a> `onBlur?`|() => `void`|Handler for blur events|
|<a id="property-selectpropsonchange"></a> `onChange?`|(`value`) => `void`|Callback when selection changes|
|<a id="property-selectpropsoptions"></a> `options`|[`SelectOption`](#selectoption)[]|Array of options to display in the select dropdown|
|<a id="property-selectpropsplaceholder"></a> `placeholder?`|`string`|Placeholder text when no option is selected|
|<a id="property-selectpropsportalcontainer"></a> `portalContainer?`|`HTMLElement`|Element to use as the portal container|
|<a id="property-selectpropsshouldvisuallyhidelabel"></a> `shouldVisuallyHideLabel?`|`boolean`|Hides the label visually while keeping it accessible to screen readers|
|<a id="property-selectpropsvalue"></a> `value?`|`string` \| `null`|Currently selected value|

---

<a id="sharedfieldlayoutprops"></a>

### SharedFieldLayoutProps

Common layout props shared by form controls — label, description, error message, required state, and visual label hiding.

#### Remarks

Extended by the props interfaces of UI primitive components (such as `TextInputProps`, `SelectProps`, and `CheckboxGroupProps`)
so each control exposes a consistent surface for labeling, helper text, and validation messaging.

#### Extends

- `DataAttributes`

#### Extended by

- [`TextInputProps`](#textinputprops)
- [`SelectProps`](#selectprops)
- [`NumberInputProps`](#numberinputprops)
- [`DatePickerProps`](#datepickerprops)
- [`RadioGroupProps`](#radiogroupprops)
- [`CheckboxGroupProps`](#checkboxgroupprops)
- [`ComboBoxProps`](#comboboxprops)
- [`MultiSelectComboBoxProps`](#multiselectcomboboxprops)
- [`TextAreaProps`](#textareaprops)

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-sharedfieldlayoutpropsdescription"></a> `description?`|`ReactNode`|Optional description text for the field|
|<a id="property-sharedfieldlayoutpropserrormessage"></a> `errorMessage?`|`string`|Error message to display when the field is invalid|
|<a id="property-sharedfieldlayoutpropsisrequired"></a> `isRequired?`|`boolean`|Indicates if the field is required|
|<a id="property-sharedfieldlayoutpropslabel"></a> `label`|`ReactNode`|Label text for the field|
|<a id="property-sharedfieldlayoutpropsshouldvisuallyhidelabel"></a> `shouldVisuallyHideLabel?`|`boolean`|Hides the label visually while keeping it accessible to screen readers|

---

<a id="switchhookfieldprops"></a>

### SwitchHookFieldProps

Props accepted by a toggle switch field surfaced through a form hook.
Exposes `validationMessages` for custom error text alongside the shared base
field attributes (`label`, `description`).

#### Extends

- [`BaseFieldProps`](#basefieldprops)

#### Type Parameters

|Type Parameter|Default type|Description|
|-|-|-|
|`TErrorCode` _extends_ `string`|`never`|Validation error code keys mapped via `validationMessages`.|

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-switchhookfieldpropsdescription"></a> `description?`|`ReactNode`|Optional helper text rendered below the field.|
|<a id="property-switchhookfieldpropsfieldcomponent"></a> `FieldComponent?`|`ComponentType`\<[`SwitchProps`](#switchprops)\>|Replaces the default toggle switch UI component; must accept the same props as `SwitchProps`.|
|<a id="property-switchhookfieldpropsformhookresult"></a> `formHookResult?`|[`FormHookResult`](#formhookresult)|Form hook result to connect to; falls back to the nearest `SDKFormProvider` when omitted.|
|<a id="property-switchhookfieldpropslabel"></a> `label`|`string`|Visible label rendered above the field.|
|<a id="property-switchhookfieldpropsname"></a> `name`|`string`|The field name; must match the corresponding key in the form schema.|
|<a id="property-switchhookfieldpropsvalidationmessages"></a> `validationMessages?`|[`ValidationMessages`](#validationmessages)\<`TErrorCode`\>|Custom error text keyed by validation error code.|

---

<a id="switchprops"></a>

### SwitchProps

Props your `Switch` implementation must accept from the component adapter.
Renders a form field wrapping an `<input type="checkbox" />` styled as a boolean on/off toggle.

#### Extends

- [`SharedHorizontalFieldLayoutProps`](#sharedhorizontalfieldlayoutprops).`Pick`\<`InputHTMLAttributes`\<`HTMLInputElement`\>, `"name"` \| `"id"`\>.`Pick`\<`AriaAttributes`, `"aria-controls"`\>

#### Properties

|Property|Type|Default value|Description|
|-|-|-|-|
|<a id="property-switchpropsaria-controls"></a> `aria-controls?`|`string`|`undefined`|Identifies the element (or elements) whose contents or presence are controlled by the current element. **See** aria-owns.|
|<a id="property-switchpropsclassname"></a> `className?`|`string`|`undefined`|Additional CSS class name for the switch container|
|<a id="property-switchpropsdescription"></a> `description?`|`ReactNode`|`undefined`|Optional description text for the field|
|<a id="property-switchpropserrormessage"></a> `errorMessage?`|`string`|`undefined`|Error message to display when the field is invalid|
|<a id="property-switchpropsinputref"></a> `inputRef?`|`Ref`\<`HTMLInputElement`\>|`undefined`|React ref for the switch input element|
|<a id="property-switchpropsisdisabled"></a> `isDisabled?`|`boolean`|`false`|Disables the switch and prevents interaction|
|<a id="property-switchpropsisinvalid"></a> `isInvalid?`|`boolean`|`false`|Indicates that the field has an error|
|<a id="property-switchpropsisrequired"></a> `isRequired?`|`boolean`|`undefined`|Indicates if the field is required|
|<a id="property-switchpropslabel"></a> `label`|`string`|`undefined`|Label text for the switch|
|<a id="property-switchpropsonblur"></a> `onBlur?`|() => `void`|`undefined`|Handler for blur events|
|<a id="property-switchpropsonchange"></a> `onChange?`|(`checked`) => `void`|`undefined`|Callback when switch state changes|
|<a id="property-switchpropsshouldvisuallyhidelabel"></a> `shouldVisuallyHideLabel?`|`boolean`|`undefined`|Hides the label visually while keeping it accessible to screen readers|
|<a id="property-switchpropsvalue"></a> `value?`|`boolean`|`undefined`|Current checked state of the switch|

---

<a id="tabledata"></a>

### TableData

Shape of a single cell your `Table` implementation receives for headers, rows, and footers.

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-tabledatacontent"></a> `content`|`ReactNode`|Content to be displayed in the table cell|
|<a id="property-tabledatakey"></a> `key`|`string`|Unique identifier for the table cell|

---

<a id="tableprops"></a>

### TableProps

Props your `Table` implementation must accept from the component adapter.
Renders a table with column headers, body rows, an optional footer row, and an optional empty state.

#### Extends

- `Pick`\<`TableHTMLAttributes`\<`HTMLTableElement`\>, `"className"` \| `"aria-label"` \| `"id"` \| `"role"` \| `"aria-labelledby"` \| `"aria-describedby"`\>

#### Properties

|Property|Type|Default value|Description|
|-|-|-|-|
|<a id="property-tablepropsaria-describedby"></a> `aria-describedby?`|`string`|`undefined`|Identifies the element (or elements) that describes the object. **See** aria-labelledby|
|<a id="property-tablepropsaria-label"></a> `aria-label?`|`string`|`undefined`|Defines a string value that labels the current element. **See** aria-labelledby.|
|<a id="property-tablepropsaria-labelledby"></a> `aria-labelledby?`|`string`|`undefined`|Identifies the element (or elements) that labels the current element. **See** aria-describedby.|
|<a id="property-tablepropsemptystate"></a> `emptyState?`|`ReactNode`|`undefined`|Content to display when the table has no rows|
|<a id="property-tablepropsfooter"></a> `footer?`|[`TableData`](#tabledata)[]|`undefined`|Array of footer cells for the table|
|<a id="property-tablepropshascheckboxcolumn"></a> `hasCheckboxColumn?`|`boolean`|`false`|Whether the first column contains checkboxes (affects which column gets leading variant)|
|<a id="property-tablepropsheaders"></a> `headers`|[`TableData`](#tabledata)[]|`undefined`|Array of header cells for the table|
|<a id="property-tablepropsiswithinbox"></a> `isWithinBox?`|`boolean`|`false`|Removes borders and background for use inside a Box component|
|<a id="property-tablepropsrows"></a> `rows`|[`TableRow`](#tablerow)[]|`undefined`|Array of rows to be displayed in the table|

---

<a id="tablerow"></a>

### TableRow

Shape of a single row your `Table` implementation receives, containing an ordered list of cells.

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-tablerowdata"></a> `data`|[`TableData`](#tabledata)[]|Array of cells to be displayed in the row|
|<a id="property-tablerowkey"></a> `key`|`string`|Unique identifier for the table row|

---

<a id="tabsprops"></a>

### TabsProps

Props your `Tabs` implementation must accept from the component adapter.
Renders tabbed navigation with associated content panels.

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-tabspropsaria-label"></a> `aria-label?`|`string`|Accessible label for the tabs|
|<a id="property-tabspropsaria-labelledby"></a> `aria-labelledby?`|`string`|ID of element that labels the tabs|
|<a id="property-tabspropsclassname"></a> `className?`|`string`|Additional CSS class name|
|<a id="property-tabspropsonselectionchange"></a> `onSelectionChange`|(`id`) => `void`|Callback when tab selection changes|
|<a id="property-tabspropsselectedid"></a> `selectedId?`|`string`|Currently selected tab id|
|<a id="property-tabspropstabs"></a> `tabs`|`TabProps`[]|Array of tab configuration objects|

---

<a id="textareaprops"></a>

### TextAreaProps

Props your `TextArea` implementation must accept from the component adapter.
Renders a form field wrapping a `<textarea>` with a label, description, and error message.

#### Extends

- [`SharedFieldLayoutProps`](#sharedfieldlayoutprops).`Pick`\<`TextareaHTMLAttributes`\<`HTMLTextAreaElement`\>, `"name"` \| `"id"` \| `"placeholder"` \| `"className"` \| `"cols"`\>.`Pick`\<`TextareaHTMLAttributes`\<`HTMLTextAreaElement`\>, `"aria-describedby"`\>

#### Properties

|Property|Type|Default value|Description|
|-|-|-|-|
|<a id="property-textareapropsaria-describedby"></a> `aria-describedby?`|`string`|`undefined`|Identifies the element (or elements) that describes the object. **See** aria-labelledby|
|<a id="property-textareapropsdescription"></a> `description?`|`ReactNode`|`undefined`|Optional description text for the field|
|<a id="property-textareapropserrormessage"></a> `errorMessage?`|`string`|`undefined`|Error message to display when the field is invalid|
|<a id="property-textareapropsinputref"></a> `inputRef?`|`Ref`\<`HTMLTextAreaElement`\>|`undefined`|React ref for the textarea element|
|<a id="property-textareapropsisdisabled"></a> `isDisabled?`|`boolean`|`false`|Disables the textarea and prevents interaction|
|<a id="property-textareapropsisinvalid"></a> `isInvalid?`|`boolean`|`false`|Indicates that the field has an error|
|<a id="property-textareapropsisrequired"></a> `isRequired?`|`boolean`|`undefined`|Indicates if the field is required|
|<a id="property-textareapropslabel"></a> `label`|`ReactNode`|`undefined`|Label text for the field|
|<a id="property-textareapropsonblur"></a> `onBlur?`|() => `void`|`undefined`|Handler for blur events|
|<a id="property-textareapropsonchange"></a> `onChange?`|(`value`) => `void`|`undefined`|Callback when textarea value changes|
|<a id="property-textareapropsrows"></a> `rows?`|`number`|`4`|Number of visible text rows|
|<a id="property-textareapropsshouldvisuallyhidelabel"></a> `shouldVisuallyHideLabel?`|`boolean`|`undefined`|Hides the label visually while keeping it accessible to screen readers|
|<a id="property-textareapropsvalue"></a> `value?`|`string`|`undefined`|Current value of the textarea|

---

<a id="textinputhookfieldprops"></a>

### TextInputHookFieldProps

Props accepted by a text input field surfaced through a form hook.
Exposes a `transform` function for preprocessing raw input, `placeholder` text,
and `validationMessages` for custom error text alongside the shared base field
attributes (`label`, `description`).

#### Extends

- [`BaseFieldProps`](#basefieldprops)

#### Type Parameters

|Type Parameter|Default type|Description|
|-|-|-|
|`TErrorCode` _extends_ `string`|`never`|Required validation error code keys mapped via `validationMessages`.|
|`TOptionalErrorCode` _extends_ `string`|`never`|Optional validation error code keys mapped via `validationMessages`.|

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-textinputhookfieldpropsdescription"></a> `description?`|`ReactNode`|Optional helper text rendered below the field.|
|<a id="property-textinputhookfieldpropsfieldcomponent"></a> `FieldComponent?`|`ComponentType`\<[`TextInputProps`](#textinputprops)\>|Replaces the default text input UI component; must accept the same props as `TextInputProps`.|
|<a id="property-textinputhookfieldpropsformhookresult"></a> `formHookResult?`|[`FormHookResult`](#formhookresult)|Form hook result to connect to; falls back to the nearest `SDKFormProvider` when omitted.|
|<a id="property-textinputhookfieldpropslabel"></a> `label`|`string`|Visible label rendered above the field.|
|<a id="property-textinputhookfieldpropsname"></a> `name`|`string`|The field name; must match the corresponding key in the form schema.|
|<a id="property-textinputhookfieldpropsplaceholder"></a> `placeholder?`|`string`|Placeholder text displayed when the field has no value.|
|<a id="property-textinputhookfieldpropstransform"></a> `transform?`|(`value`) => `string`|Transforms the raw string value on every change before storing it; use for normalization such as trimming or changing case.|
|<a id="property-textinputhookfieldpropsvalidationmessages"></a> `validationMessages?`|[`ValidationMessages`](#validationmessages)\<`TErrorCode`, `TOptionalErrorCode`\>|Custom error text keyed by validation error code.|

---

<a id="textinputprops"></a>

### TextInputProps

Props your `TextInput` implementation must accept from the component adapter.
Renders a form field wrapping an `<input />` with a label, description, error message, and start/end adornment slots.

#### Extends

- [`SharedFieldLayoutProps`](#sharedfieldlayoutprops).`Pick`\<`InputHTMLAttributes`\<`HTMLInputElement`\>, `"name"` \| `"id"` \| `"placeholder"` \| `"className"` \| `"type"` \| `"min"` \| `"max"` \| `"maxLength"`\>.`Pick`\<`InputHTMLAttributes`\<`HTMLInputElement`\>, `"aria-describedby"` \| `"aria-labelledby"`\>

#### Properties

|Property|Type|Default value|Description|
|-|-|-|-|
|<a id="property-textinputpropsadornmentend"></a> `adornmentEnd?`|`ReactNode`|`undefined`|Element to display at the end of the input|
|<a id="property-textinputpropsadornmentstart"></a> `adornmentStart?`|`ReactNode`|`undefined`|Element to display at the start of the input|
|<a id="property-textinputpropsaria-describedby"></a> `aria-describedby?`|`string`|`undefined`|Identifies the element (or elements) that describes the object. **See** aria-labelledby|
|<a id="property-textinputpropsaria-labelledby"></a> `aria-labelledby?`|`string`|`undefined`|Identifies the element (or elements) that labels the current element. **See** aria-describedby.|
|<a id="property-textinputpropsdescription"></a> `description?`|`ReactNode`|`undefined`|Optional description text for the field|
|<a id="property-textinputpropserrormessage"></a> `errorMessage?`|`string`|`undefined`|Error message to display when the field is invalid|
|<a id="property-textinputpropsinputref"></a> `inputRef?`|`Ref`\<`HTMLInputElement`\>|`undefined`|React ref for the input element|
|<a id="property-textinputpropsisdisabled"></a> `isDisabled?`|`boolean`|`false`|Disables the input and prevents interaction|
|<a id="property-textinputpropsisinvalid"></a> `isInvalid?`|`boolean`|`false`|Indicates that the field has an error|
|<a id="property-textinputpropsisrequired"></a> `isRequired?`|`boolean`|`undefined`|Indicates if the field is required|
|<a id="property-textinputpropslabel"></a> `label`|`ReactNode`|`undefined`|Label text for the field|
|<a id="property-textinputpropsonblur"></a> `onBlur?`|() => `void`|`undefined`|Handler for blur events|
|<a id="property-textinputpropsonchange"></a> `onChange?`|(`value`) => `void`|`undefined`|Callback when input value changes|
|<a id="property-textinputpropsshouldvisuallyhidelabel"></a> `shouldVisuallyHideLabel?`|`boolean`|`undefined`|Hides the label visually while keeping it accessible to screen readers|
|<a id="property-textinputpropsvalue"></a> `value?`|`string`|`undefined`|Current value of the input|

---

<a id="textprops"></a>

### TextProps

Props your `Text` implementation must accept from the component adapter.
Renders body text as `<p>`, `<span>`, `<div>`, or `<pre>`, with size, weight, alignment, and variant options.

#### Extends

- `Pick`\<`HTMLAttributes`\<`HTMLParagraphElement`\>, `"className"` \| `"id"`\>

#### Properties

|Property|Type|Default value|Description|
|-|-|-|-|
|<a id="property-textpropsas"></a> `as?`|`"div"` \| `"span"` \| `"p"` \| `"pre"`|`'p'`|HTML element to render the text as|
|<a id="property-textpropschildren"></a> `children?`|`ReactNode`|`undefined`|Content to be displayed|
|<a id="property-textpropssize"></a> `size?`|`"xs"` \| `"sm"` \| `"md"` \| `"lg"`|`'md'`|Size variant of the text|
|<a id="property-textpropstextalign"></a> `textAlign?`|`"center"` \| `"start"` \| `"end"`|`undefined`|Text alignment within the container|
|<a id="property-textpropsvariant"></a> `variant?`|`"supporting"` \| `"leading"`|`undefined`|Visual style variant of the text|
|<a id="property-textpropsweight"></a> `weight?`|`"bold"` \| `"medium"` \| `"regular"` \| `"semibold"`|`undefined`|Font weight of the text|

## Type Aliases

<a id="buttoniconprops"></a>

### ButtonIconProps

> **ButtonIconProps** = [`ButtonProps`](#buttonprops) & `object`

Props your `ButtonIcon` implementation must accept from the component adapter.
Renders an icon-only `<button>`; requires `aria-label` since there is no visible text for assistive technologies.

#### Type Declaration

|Name|Type|Description|
|-|-|-|
|`aria-label`|`string`|Required aria-label for icon buttons to ensure accessibility|

---

<a id="calendarpreviewprops"></a>

### CalendarPreviewProps

> **CalendarPreviewProps** = `object`

Props your `CalendarPreview` implementation must accept from the component adapter.
Renders a read-only calendar display for visualizing a date range with optional highlighted dates.

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-calendarpreviewpropsdaterange"></a> `dateRange`|`object`|Date range to display in the calendar preview|
|`dateRange.end`|`Date`|End date of the range|
|`dateRange.label`|`string`|Label text for the date range|
|`dateRange.start`|`Date`|Start date of the range|
|<a id="property-calendarpreviewpropshighlightdates"></a> `highlightDates?`|`object`[]|Array of dates to highlight with custom colors and labels|

---

<a id="eventtype"></a>

### EventType

> **EventType** = _typeof_ [`componentEvents`](#componentevents)\[keyof _typeof_ [`componentEvents`](#componentevents)\]

Union of every event string value defined in [componentEvents](#componentevents).

#### Remarks

This is the type of the first argument passed to a component's `onEvent`
handler. Use it when typing your own handler so TypeScript can narrow against
the specific event keys you care about.

#### Example

```tsx
import { componentEvents, type EventType } from '@gusto/embedded-react-sdk'

const handleEvent = (type: EventType, data: unknown) => {
  if (type === componentEvents.EMPLOYEE_CREATED) {
    // ...
  }
}
```

---

<a id="fieldsmetadata"></a>

### FieldsMetadata

> **FieldsMetadata** = `object`

Map of form-field name to [FieldMetadata](#fieldmetadata) or [FieldMetadataWithOptions](#fieldmetadatawithoptions).

#### Index Signature

\[`key`: `string`\]: [`FieldMetadata`](#fieldmetadata) \| [`FieldMetadataWithOptions`](#fieldmetadatawithoptions)\<`unknown`\>

#### Remarks

Exposed on every form hook as `form.fieldsMetadata` so field components can look
up their own metadata by name.

---

<a id="formhookresult"></a>

### FormHookResult

> **FormHookResult** = `object`

Narrowed shape accepted by the `formHookResult` prop on hook field components.

#### Remarks

Derived from [BaseFormHookReady](#baseformhookready) so the prop stays in sync with what
form hooks return — passing the hook result directly (e.g.
`formHookResult={employeeDetails}`) is always type-safe. Use this prop when
fields from multiple hooks need to be interleaved freely instead of grouped
under an `SDKFormProvider`.

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-formhookresulterrorhandling"></a> `errorHandling`|`Pick`\<[`BaseFormHookReady`](#baseformhookready)\[`"errorHandling"`\], `"errors"`\>|The error handling surface; pass to [composeErrorHandler](#composeerrorhandler).|
|<a id="property-formhookresultform"></a> `form`|`Pick`\<[`BaseFormHookReady`](#baseformhookready)\[`"form"`\], `"fieldsMetadata"`\> & `object`|The form surface; provides field metadata and internal react-hook-form wiring.|

---

<a id="hookfieldprops"></a>

### HookFieldProps

> **HookFieldProps**\<`TProps`\> = `Omit`\<`TProps`, `"name"`\>

Strips `name` from a hook field's props type for domain-specific field components
that bind the form-field name internally.

#### Type Parameters

|Type Parameter|Description|
|-|-|
|`TProps` _extends_ `object`|Original hook field props type that includes a `name` property.|

---

<a id="linkprops"></a>

### LinkProps

> **LinkProps** = `Pick`\<`AnchorHTMLAttributes`\<`HTMLAnchorElement`\>, `"href"` \| `"target"` \| `"rel"` \| `"download"` \| `"className"` \| `"id"` \| `"onKeyDown"` \| `"onKeyUp"` \| `"aria-label"` \| `"aria-labelledby"` \| `"aria-describedby"` \| `"title"`\> & `object`

Props your `Link` implementation must accept from the component adapter.
Renders an HTML anchor (`<a>`) for inline navigation.

#### Type Declaration

|Name|Type|Description|
|-|-|-|
|`children?`|`ReactNode`|Content to be displayed inside the link|

---

<a id="mixederrorsource"></a>

### MixedErrorSource

> **MixedErrorSource** = `QueryWithRefetch` \| \{ `errorHandling`: [`HookErrorHandling`](#hookerrorhandling); \}

Accepted input shape for [composeErrorHandler](#composeerrorhandler): either a React Query result
(anything with `error` and `refetch`) or another SDK hook result that exposes
an `errorHandling` object.

---

<a id="observabilitymetricunit"></a>

### ObservabilityMetricUnit

> **ObservabilityMetricUnit** = `"ms"` \| `"count"` \| `"bytes"` \| `"percent"`

Unit of measure for an [ObservabilityMetric](#observabilitymetric).

---

<a id="orderedlistprops"></a>

### OrderedListProps

> **OrderedListProps** = `BaseListProps`

Props your `OrderedList` implementation must accept from the component adapter.
Renders an ordered (numbered) list of items.

---

<a id="paginationcontrolprops"></a>

### PaginationControlProps

> **PaginationControlProps** = `object`

Props your `PaginationControl` implementation must accept from the component adapter.
Renders pagination controls for navigating between pages of results.

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-paginationcontrolpropscurrentpage"></a> `currentPage`|`number`|The currently active page (1-based).|
|<a id="property-paginationcontrolpropshandlefirstpage"></a> `handleFirstPage`|() => `void`|Navigate to the first page.|
|<a id="property-paginationcontrolpropshandleitemsperpagechange"></a> `handleItemsPerPageChange`|(`n`) => `void`|Called when the user changes the number of items displayed per page.|
|<a id="property-paginationcontrolpropshandlelastpage"></a> `handleLastPage`|() => `void`|Navigate to the last page.|
|<a id="property-paginationcontrolpropshandlenextpage"></a> `handleNextPage`|() => `void`|Navigate to the next page.|
|<a id="property-paginationcontrolpropshandlepreviouspage"></a> `handlePreviousPage`|() => `void`|Navigate to the previous page.|
|<a id="property-paginationcontrolpropsisfetching"></a> `isFetching?`|`boolean`|Whether a page fetch is in progress.|
|<a id="property-paginationcontrolpropsitemsperpage"></a> `itemsPerPage?`|[`PaginationItemsPerPage`](#paginationitemsperpage)|Number of items shown per page.|
|<a id="property-paginationcontrolpropstotalcount"></a> `totalCount?`|`number`|Total number of items across all pages.|
|<a id="property-paginationcontrolpropstotalpages"></a> `totalPages`|`number`|Total number of pages.|

---

<a id="paginationitemsperpage"></a>

### PaginationItemsPerPage

> **PaginationItemsPerPage** = `5` \| `10` \| `25` \| `50`

---

<a id="sdkerrorcategory"></a>

### SDKErrorCategory

> **SDKErrorCategory** = _typeof_ `SDKErrorCategories`\[keyof _typeof_ `SDKErrorCategories`\]

High-level classification of where an [SDKError](#sdkerror) originated.

---

<a id="sharedhorizontalfieldlayoutprops"></a>

### SharedHorizontalFieldLayoutProps

> **SharedHorizontalFieldLayoutProps** = [`SharedFieldLayoutProps`](#sharedfieldlayoutprops)

Shared layout props consumed by horizontally-laid-out form controls — label, description, error message, required state, and visual label hiding.

#### Remarks

Extended by props interfaces for inline controls such as `CheckboxProps`, `RadioProps`, and `SwitchProps`.
Alias of [SharedFieldLayoutProps](#sharedfieldlayoutprops) — exposed as a distinct name to mirror the horizontal layout used by these controls.

---

<a id="submitstateforerrorhandling"></a>

### SubmitStateForErrorHandling

> **SubmitStateForErrorHandling** = `object`

Submit-side error state to merge into a composed [HookErrorHandling](#hookerrorhandling).

#### Remarks

Pass to [composeErrorHandler](#composeerrorhandler) when a screen has its own submit state outside of
any SDK form hook, so submit errors appear in the same error surface as query errors
and can be cleared together with `clearSubmitError`.

#### Properties

|Property|Type|Description|
|-|-|-|
|<a id="property-submitstateforerrorhandlingsetsubmiterror"></a> `setSubmitError`|(`error`) => `void`|Sets or clears the submit error.|
|<a id="property-submitstateforerrorhandlingsubmiterror"></a> `submitError`|[`SDKError`](#sdkerror) \| `null`|The current submit error, or `null` when cleared.|

---

<a id="unorderedlistprops"></a>

### UnorderedListProps

> **UnorderedListProps** = `BaseListProps`

Props your `UnorderedList` implementation must accept from the component adapter.
Renders an unordered (bulleted) list of items.

---

<a id="validationmessages"></a>

### ValidationMessages

> **ValidationMessages**\<`TErrorCode`, `TOptionalErrorCode`\> = `Record`\<`TErrorCode`, `string`\> & `Partial`\<`Record`\<`TOptionalErrorCode`, `string`\>\>

Maps every error code a schema field can produce to a display string.

#### Type Parameters

|Type Parameter|Default type|Description|
|-|-|-|
|`TErrorCode` _extends_ `string`|-|Error codes the field is guaranteed to produce.|
|`TOptionalErrorCode` _extends_ `string`|`never`|Error codes that only apply in some configurations.|

#### Remarks

Passed as the `validationMessages` prop on hook field components. The
required code set (`TErrorCode`) must be fully covered; codes in
`TOptionalErrorCode` may be omitted. When a message is missing, the field
falls back to displaying the raw error code.
