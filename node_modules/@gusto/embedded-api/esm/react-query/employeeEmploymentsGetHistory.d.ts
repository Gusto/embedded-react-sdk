import { InvalidateQueryFilters, QueryClient, UseQueryResult, UseSuspenseQueryResult } from "@tanstack/react-query";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { GetV1EmployeesEmployeeIdEmploymentHistoryHeaderXGustoAPIVersion, GetV1EmployeesEmployeeIdEmploymentHistoryRequest } from "../models/operations/getv1employeesemployeeidemploymenthistory.js";
import { QueryHookOptions, SuspenseQueryHookOptions, TupleToPrefixes } from "./_types.js";
import { buildEmployeeEmploymentsGetHistoryQuery, EmployeeEmploymentsGetHistoryQueryData, prefetchEmployeeEmploymentsGetHistory, queryKeyEmployeeEmploymentsGetHistory } from "./employeeEmploymentsGetHistory.core.js";
export { buildEmployeeEmploymentsGetHistoryQuery, type EmployeeEmploymentsGetHistoryQueryData, prefetchEmployeeEmploymentsGetHistory, queryKeyEmployeeEmploymentsGetHistory, };
export type EmployeeEmploymentsGetHistoryQueryError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Get employment history for an employee
 *
 * @remarks
 * Retrieve the employment history for a given employee, which includes termination and rehire.
 *
 * scope: `employments:read`
 */
export declare function useEmployeeEmploymentsGetHistory(request: GetV1EmployeesEmployeeIdEmploymentHistoryRequest, options?: QueryHookOptions<EmployeeEmploymentsGetHistoryQueryData, EmployeeEmploymentsGetHistoryQueryError>): UseQueryResult<EmployeeEmploymentsGetHistoryQueryData, EmployeeEmploymentsGetHistoryQueryError>;
/**
 * Get employment history for an employee
 *
 * @remarks
 * Retrieve the employment history for a given employee, which includes termination and rehire.
 *
 * scope: `employments:read`
 */
export declare function useEmployeeEmploymentsGetHistorySuspense(request: GetV1EmployeesEmployeeIdEmploymentHistoryRequest, options?: SuspenseQueryHookOptions<EmployeeEmploymentsGetHistoryQueryData, EmployeeEmploymentsGetHistoryQueryError>): UseSuspenseQueryResult<EmployeeEmploymentsGetHistoryQueryData, EmployeeEmploymentsGetHistoryQueryError>;
export declare function setEmployeeEmploymentsGetHistoryData(client: QueryClient, queryKeyBase: [
    employeeId: string,
    parameters: {
        xGustoAPIVersion?: GetV1EmployeesEmployeeIdEmploymentHistoryHeaderXGustoAPIVersion | undefined;
    }
], data: EmployeeEmploymentsGetHistoryQueryData): EmployeeEmploymentsGetHistoryQueryData | undefined;
export declare function invalidateEmployeeEmploymentsGetHistory(client: QueryClient, queryKeyBase: TupleToPrefixes<[
    employeeId: string,
    parameters: {
        xGustoAPIVersion?: GetV1EmployeesEmployeeIdEmploymentHistoryHeaderXGustoAPIVersion | undefined;
    }
]>, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
export declare function invalidateAllEmployeeEmploymentsGetHistory(client: QueryClient, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
//# sourceMappingURL=employeeEmploymentsGetHistory.d.ts.map