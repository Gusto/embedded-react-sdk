import { InvalidateQueryFilters, QueryClient, UseQueryResult, UseSuspenseQueryResult } from "@tanstack/react-query";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { GetV1EmployeesEmployeeIdOnboardingStatusHeaderXGustoAPIVersion, GetV1EmployeesEmployeeIdOnboardingStatusRequest } from "../models/operations/getv1employeesemployeeidonboardingstatus.js";
import { QueryHookOptions, SuspenseQueryHookOptions, TupleToPrefixes } from "./_types.js";
import { buildEmployeesGetOnboardingStatusQuery, EmployeesGetOnboardingStatusQueryData, prefetchEmployeesGetOnboardingStatus, queryKeyEmployeesGetOnboardingStatus } from "./employeesGetOnboardingStatus.core.js";
export { buildEmployeesGetOnboardingStatusQuery, type EmployeesGetOnboardingStatusQueryData, prefetchEmployeesGetOnboardingStatus, queryKeyEmployeesGetOnboardingStatus, };
export type EmployeesGetOnboardingStatusQueryError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Get the employee's onboarding status
 *
 * @remarks
 * # Description
 * Retrieves an employee's onboarding status. The data returned helps inform the required onboarding steps and respective completion status.
 *
 * ## onboarding_status
 *
 * ### Admin-facilitated onboarding
 * | onboarding_status | Description |
 * |:------------------|------------:|
 * | `admin_onboarding_incomplete` | Admin needs to complete the full employee-onboarding. |
 * | `onboarding_completed` | Employee has been fully onboarded and verified. |
 *
 * ### Employee self-onboarding
 * | onboarding_status | Description |
 * |:------------------|------------:|
 * | `admin_onboarding_incomplete` | Admin needs to enter basic information about the employee. |
 * | `self_onboarding_pending_invite` | Admin has the intention to invite the employee to self-onboard (e.g., marking a checkbox), but the system has not yet sent the invitation. |
 * | `self_onboarding_invited` | Employee has been sent an invitation to self-onboard. |
 * | `self_onboarding_invited_started` | Employee has started the self-onboarding process. |
 * | `self_onboarding_invited_overdue` | Employee's start date has passed, and employee has still not completed self-onboarding. |
 * | `self_onboarding_completed_by_employee` | Employee has completed entering in their information. The status should be updated via API to "self_onboarding_awaiting_admin_review" from here, once the Admin has started reviewing. |
 * | `self_onboarding_awaiting_admin_review` | Admin has started to verify the employee's information. |
 * | `onboarding_completed` | Employee has been fully onboarded and verified. |
 *
 * ## onboarding_steps
 *
 * | onboarding_steps | Requirement(s) to be completed |
 * |:-----------------|-------------------------------:|
 * | `personal_details` | Add employee's first name, last name, email, date of birth, social security number |
 * | `compensation_details` | Associate employee to a job & compensation. |
 * | `add_work_address` | Add employee work address. |
 * | `add_home_address` | Add employee home address. |
 * | `federal_tax_setup` | Set up federal tax withholdings. |
 * | `state_tax_setup` | Set up state tax withholdings. |
 * | `direct_deposit_setup` | (optional) Set up employee's direct deposit. |
 * | `employee_form_signing` | Employee forms (e.g., W4, direct deposit authorization) are generated & signed. |
 * | `file_new_hire_report` | File a new hire report for this employee. |
 * | `admin_review` | Admin reviews & confirms employee details (only required for Employee self-onboarding) |
 *
 * scope: `employees:read`
 */
export declare function useEmployeesGetOnboardingStatus(request: GetV1EmployeesEmployeeIdOnboardingStatusRequest, options?: QueryHookOptions<EmployeesGetOnboardingStatusQueryData, EmployeesGetOnboardingStatusQueryError>): UseQueryResult<EmployeesGetOnboardingStatusQueryData, EmployeesGetOnboardingStatusQueryError>;
/**
 * Get the employee's onboarding status
 *
 * @remarks
 * # Description
 * Retrieves an employee's onboarding status. The data returned helps inform the required onboarding steps and respective completion status.
 *
 * ## onboarding_status
 *
 * ### Admin-facilitated onboarding
 * | onboarding_status | Description |
 * |:------------------|------------:|
 * | `admin_onboarding_incomplete` | Admin needs to complete the full employee-onboarding. |
 * | `onboarding_completed` | Employee has been fully onboarded and verified. |
 *
 * ### Employee self-onboarding
 * | onboarding_status | Description |
 * |:------------------|------------:|
 * | `admin_onboarding_incomplete` | Admin needs to enter basic information about the employee. |
 * | `self_onboarding_pending_invite` | Admin has the intention to invite the employee to self-onboard (e.g., marking a checkbox), but the system has not yet sent the invitation. |
 * | `self_onboarding_invited` | Employee has been sent an invitation to self-onboard. |
 * | `self_onboarding_invited_started` | Employee has started the self-onboarding process. |
 * | `self_onboarding_invited_overdue` | Employee's start date has passed, and employee has still not completed self-onboarding. |
 * | `self_onboarding_completed_by_employee` | Employee has completed entering in their information. The status should be updated via API to "self_onboarding_awaiting_admin_review" from here, once the Admin has started reviewing. |
 * | `self_onboarding_awaiting_admin_review` | Admin has started to verify the employee's information. |
 * | `onboarding_completed` | Employee has been fully onboarded and verified. |
 *
 * ## onboarding_steps
 *
 * | onboarding_steps | Requirement(s) to be completed |
 * |:-----------------|-------------------------------:|
 * | `personal_details` | Add employee's first name, last name, email, date of birth, social security number |
 * | `compensation_details` | Associate employee to a job & compensation. |
 * | `add_work_address` | Add employee work address. |
 * | `add_home_address` | Add employee home address. |
 * | `federal_tax_setup` | Set up federal tax withholdings. |
 * | `state_tax_setup` | Set up state tax withholdings. |
 * | `direct_deposit_setup` | (optional) Set up employee's direct deposit. |
 * | `employee_form_signing` | Employee forms (e.g., W4, direct deposit authorization) are generated & signed. |
 * | `file_new_hire_report` | File a new hire report for this employee. |
 * | `admin_review` | Admin reviews & confirms employee details (only required for Employee self-onboarding) |
 *
 * scope: `employees:read`
 */
export declare function useEmployeesGetOnboardingStatusSuspense(request: GetV1EmployeesEmployeeIdOnboardingStatusRequest, options?: SuspenseQueryHookOptions<EmployeesGetOnboardingStatusQueryData, EmployeesGetOnboardingStatusQueryError>): UseSuspenseQueryResult<EmployeesGetOnboardingStatusQueryData, EmployeesGetOnboardingStatusQueryError>;
export declare function setEmployeesGetOnboardingStatusData(client: QueryClient, queryKeyBase: [
    employeeId: string,
    parameters: {
        xGustoAPIVersion?: GetV1EmployeesEmployeeIdOnboardingStatusHeaderXGustoAPIVersion | undefined;
    }
], data: EmployeesGetOnboardingStatusQueryData): EmployeesGetOnboardingStatusQueryData | undefined;
export declare function invalidateEmployeesGetOnboardingStatus(client: QueryClient, queryKeyBase: TupleToPrefixes<[
    employeeId: string,
    parameters: {
        xGustoAPIVersion?: GetV1EmployeesEmployeeIdOnboardingStatusHeaderXGustoAPIVersion | undefined;
    }
]>, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
export declare function invalidateAllEmployeesGetOnboardingStatus(client: QueryClient, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
//# sourceMappingURL=employeesGetOnboardingStatus.d.ts.map