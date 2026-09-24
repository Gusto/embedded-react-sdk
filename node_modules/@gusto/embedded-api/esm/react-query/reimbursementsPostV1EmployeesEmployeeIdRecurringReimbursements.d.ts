import { MutationKey, UseMutationResult } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { PostV1EmployeesEmployeeIdRecurringReimbursementsRequest, PostV1EmployeesEmployeeIdRecurringReimbursementsResponse } from "../models/operations/postv1employeesemployeeidrecurringreimbursements.js";
import { MutationHookOptions } from "./_types.js";
export type ReimbursementsPostV1EmployeesEmployeeIdRecurringReimbursementsMutationVariables = {
    request: PostV1EmployeesEmployeeIdRecurringReimbursementsRequest;
    options?: RequestOptions;
};
export type ReimbursementsPostV1EmployeesEmployeeIdRecurringReimbursementsMutationData = PostV1EmployeesEmployeeIdRecurringReimbursementsResponse;
export type ReimbursementsPostV1EmployeesEmployeeIdRecurringReimbursementsMutationError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Create a recurring reimbursement
 *
 * @remarks
 * Create a recurring reimbursement for an employee.
 *
 * scope: `reimbursements:write`
 */
export declare function useReimbursementsPostV1EmployeesEmployeeIdRecurringReimbursementsMutation(options?: MutationHookOptions<ReimbursementsPostV1EmployeesEmployeeIdRecurringReimbursementsMutationData, ReimbursementsPostV1EmployeesEmployeeIdRecurringReimbursementsMutationError, ReimbursementsPostV1EmployeesEmployeeIdRecurringReimbursementsMutationVariables>): UseMutationResult<ReimbursementsPostV1EmployeesEmployeeIdRecurringReimbursementsMutationData, ReimbursementsPostV1EmployeesEmployeeIdRecurringReimbursementsMutationError, ReimbursementsPostV1EmployeesEmployeeIdRecurringReimbursementsMutationVariables>;
export declare function mutationKeyReimbursementsPostV1EmployeesEmployeeIdRecurringReimbursements(): MutationKey;
export declare function buildReimbursementsPostV1EmployeesEmployeeIdRecurringReimbursementsMutation(client$: GustoEmbeddedCore, hookOptions?: RequestOptions): {
    mutationKey: MutationKey;
    mutationFn: (variables: ReimbursementsPostV1EmployeesEmployeeIdRecurringReimbursementsMutationVariables) => Promise<ReimbursementsPostV1EmployeesEmployeeIdRecurringReimbursementsMutationData>;
};
//# sourceMappingURL=reimbursementsPostV1EmployeesEmployeeIdRecurringReimbursements.d.ts.map