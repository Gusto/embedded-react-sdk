import { InvalidateQueryFilters, QueryClient, UseQueryResult, UseSuspenseQueryResult } from "@tanstack/react-query";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { GetV1EmployeesEmployeeUuidSection603HighEarnerStatusesHeaderXGustoAPIVersion, GetV1EmployeesEmployeeUuidSection603HighEarnerStatusesRequest } from "../models/operations/getv1employeesemployeeuuidsection603highearnerstatuses.js";
import { QueryHookOptions, SuspenseQueryHookOptions, TupleToPrefixes } from "./_types.js";
import { buildEmployeeBenefitsGetV1EmployeesEmployeeUuidSection603HighEarnerStatusesQuery, EmployeeBenefitsGetV1EmployeesEmployeeUuidSection603HighEarnerStatusesQueryData, prefetchEmployeeBenefitsGetV1EmployeesEmployeeUuidSection603HighEarnerStatuses, queryKeyEmployeeBenefitsGetV1EmployeesEmployeeUuidSection603HighEarnerStatuses } from "./employeeBenefitsGetV1EmployeesEmployeeUuidSection603HighEarnerStatuses.core.js";
export { buildEmployeeBenefitsGetV1EmployeesEmployeeUuidSection603HighEarnerStatusesQuery, type EmployeeBenefitsGetV1EmployeesEmployeeUuidSection603HighEarnerStatusesQueryData, prefetchEmployeeBenefitsGetV1EmployeesEmployeeUuidSection603HighEarnerStatuses, queryKeyEmployeeBenefitsGetV1EmployeesEmployeeUuidSection603HighEarnerStatuses, };
export type EmployeeBenefitsGetV1EmployeesEmployeeUuidSection603HighEarnerStatusesQueryError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Get all Section 603 high earner statuses for an employee
 *
 * @remarks
 * Get all Section 603 high earner statuses for an employee across all years.
 *
 * Section 603 of the SECURE 2.0 Act applies to employees aged 50 or older whose prior-year FICA wages exceed the IRS threshold.
 * These employees are classified as high earners, and their catch-up contributions to pre-tax retirement benefits must be designated as post-tax contributions.
 *
 * scope: `employee_benefits:read`
 */
export declare function useEmployeeBenefitsGetV1EmployeesEmployeeUuidSection603HighEarnerStatuses(request: GetV1EmployeesEmployeeUuidSection603HighEarnerStatusesRequest, options?: QueryHookOptions<EmployeeBenefitsGetV1EmployeesEmployeeUuidSection603HighEarnerStatusesQueryData, EmployeeBenefitsGetV1EmployeesEmployeeUuidSection603HighEarnerStatusesQueryError>): UseQueryResult<EmployeeBenefitsGetV1EmployeesEmployeeUuidSection603HighEarnerStatusesQueryData, EmployeeBenefitsGetV1EmployeesEmployeeUuidSection603HighEarnerStatusesQueryError>;
/**
 * Get all Section 603 high earner statuses for an employee
 *
 * @remarks
 * Get all Section 603 high earner statuses for an employee across all years.
 *
 * Section 603 of the SECURE 2.0 Act applies to employees aged 50 or older whose prior-year FICA wages exceed the IRS threshold.
 * These employees are classified as high earners, and their catch-up contributions to pre-tax retirement benefits must be designated as post-tax contributions.
 *
 * scope: `employee_benefits:read`
 */
export declare function useEmployeeBenefitsGetV1EmployeesEmployeeUuidSection603HighEarnerStatusesSuspense(request: GetV1EmployeesEmployeeUuidSection603HighEarnerStatusesRequest, options?: SuspenseQueryHookOptions<EmployeeBenefitsGetV1EmployeesEmployeeUuidSection603HighEarnerStatusesQueryData, EmployeeBenefitsGetV1EmployeesEmployeeUuidSection603HighEarnerStatusesQueryError>): UseSuspenseQueryResult<EmployeeBenefitsGetV1EmployeesEmployeeUuidSection603HighEarnerStatusesQueryData, EmployeeBenefitsGetV1EmployeesEmployeeUuidSection603HighEarnerStatusesQueryError>;
export declare function setEmployeeBenefitsGetV1EmployeesEmployeeUuidSection603HighEarnerStatusesData(client: QueryClient, queryKeyBase: [
    employeeUuid: string,
    parameters: {
        xGustoAPIVersion?: GetV1EmployeesEmployeeUuidSection603HighEarnerStatusesHeaderXGustoAPIVersion | undefined;
    }
], data: EmployeeBenefitsGetV1EmployeesEmployeeUuidSection603HighEarnerStatusesQueryData): EmployeeBenefitsGetV1EmployeesEmployeeUuidSection603HighEarnerStatusesQueryData | undefined;
export declare function invalidateEmployeeBenefitsGetV1EmployeesEmployeeUuidSection603HighEarnerStatuses(client: QueryClient, queryKeyBase: TupleToPrefixes<[
    employeeUuid: string,
    parameters: {
        xGustoAPIVersion?: GetV1EmployeesEmployeeUuidSection603HighEarnerStatusesHeaderXGustoAPIVersion | undefined;
    }
]>, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
export declare function invalidateAllEmployeeBenefitsGetV1EmployeesEmployeeUuidSection603HighEarnerStatuses(client: QueryClient, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
//# sourceMappingURL=employeeBenefitsGetV1EmployeesEmployeeUuidSection603HighEarnerStatuses.d.ts.map