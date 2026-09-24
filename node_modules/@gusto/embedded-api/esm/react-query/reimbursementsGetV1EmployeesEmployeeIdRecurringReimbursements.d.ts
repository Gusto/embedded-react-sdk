import { InvalidateQueryFilters, QueryClient, UseQueryResult, UseSuspenseQueryResult } from "@tanstack/react-query";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { GetV1EmployeesEmployeeIdRecurringReimbursementsHeaderXGustoAPIVersion, GetV1EmployeesEmployeeIdRecurringReimbursementsRequest } from "../models/operations/getv1employeesemployeeidrecurringreimbursements.js";
import { QueryHookOptions, SuspenseQueryHookOptions, TupleToPrefixes } from "./_types.js";
import { buildReimbursementsGetV1EmployeesEmployeeIdRecurringReimbursementsQuery, prefetchReimbursementsGetV1EmployeesEmployeeIdRecurringReimbursements, queryKeyReimbursementsGetV1EmployeesEmployeeIdRecurringReimbursements, ReimbursementsGetV1EmployeesEmployeeIdRecurringReimbursementsQueryData } from "./reimbursementsGetV1EmployeesEmployeeIdRecurringReimbursements.core.js";
export { buildReimbursementsGetV1EmployeesEmployeeIdRecurringReimbursementsQuery, prefetchReimbursementsGetV1EmployeesEmployeeIdRecurringReimbursements, queryKeyReimbursementsGetV1EmployeesEmployeeIdRecurringReimbursements, type ReimbursementsGetV1EmployeesEmployeeIdRecurringReimbursementsQueryData, };
export type ReimbursementsGetV1EmployeesEmployeeIdRecurringReimbursementsQueryError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Get recurring reimbursements for an employee
 *
 * @remarks
 * Get all active recurring reimbursements for an employee.
 *
 * scope: `reimbursements:read`
 */
export declare function useReimbursementsGetV1EmployeesEmployeeIdRecurringReimbursements(request: GetV1EmployeesEmployeeIdRecurringReimbursementsRequest, options?: QueryHookOptions<ReimbursementsGetV1EmployeesEmployeeIdRecurringReimbursementsQueryData, ReimbursementsGetV1EmployeesEmployeeIdRecurringReimbursementsQueryError>): UseQueryResult<ReimbursementsGetV1EmployeesEmployeeIdRecurringReimbursementsQueryData, ReimbursementsGetV1EmployeesEmployeeIdRecurringReimbursementsQueryError>;
/**
 * Get recurring reimbursements for an employee
 *
 * @remarks
 * Get all active recurring reimbursements for an employee.
 *
 * scope: `reimbursements:read`
 */
export declare function useReimbursementsGetV1EmployeesEmployeeIdRecurringReimbursementsSuspense(request: GetV1EmployeesEmployeeIdRecurringReimbursementsRequest, options?: SuspenseQueryHookOptions<ReimbursementsGetV1EmployeesEmployeeIdRecurringReimbursementsQueryData, ReimbursementsGetV1EmployeesEmployeeIdRecurringReimbursementsQueryError>): UseSuspenseQueryResult<ReimbursementsGetV1EmployeesEmployeeIdRecurringReimbursementsQueryData, ReimbursementsGetV1EmployeesEmployeeIdRecurringReimbursementsQueryError>;
export declare function setReimbursementsGetV1EmployeesEmployeeIdRecurringReimbursementsData(client: QueryClient, queryKeyBase: [
    employeeId: string,
    parameters: {
        xGustoAPIVersion?: GetV1EmployeesEmployeeIdRecurringReimbursementsHeaderXGustoAPIVersion | undefined;
        page?: number | undefined;
        per?: number | undefined;
    }
], data: ReimbursementsGetV1EmployeesEmployeeIdRecurringReimbursementsQueryData): ReimbursementsGetV1EmployeesEmployeeIdRecurringReimbursementsQueryData | undefined;
export declare function invalidateReimbursementsGetV1EmployeesEmployeeIdRecurringReimbursements(client: QueryClient, queryKeyBase: TupleToPrefixes<[
    employeeId: string,
    parameters: {
        xGustoAPIVersion?: GetV1EmployeesEmployeeIdRecurringReimbursementsHeaderXGustoAPIVersion | undefined;
        page?: number | undefined;
        per?: number | undefined;
    }
]>, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
export declare function invalidateAllReimbursementsGetV1EmployeesEmployeeIdRecurringReimbursements(client: QueryClient, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
//# sourceMappingURL=reimbursementsGetV1EmployeesEmployeeIdRecurringReimbursements.d.ts.map