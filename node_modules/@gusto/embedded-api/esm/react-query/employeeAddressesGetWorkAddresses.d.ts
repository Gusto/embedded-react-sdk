import { InvalidateQueryFilters, QueryClient, UseQueryResult, UseSuspenseQueryResult } from "@tanstack/react-query";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { GetV1EmployeesEmployeeIdWorkAddressesHeaderXGustoAPIVersion, GetV1EmployeesEmployeeIdWorkAddressesRequest } from "../models/operations/getv1employeesemployeeidworkaddresses.js";
import { QueryHookOptions, SuspenseQueryHookOptions, TupleToPrefixes } from "./_types.js";
import { buildEmployeeAddressesGetWorkAddressesQuery, EmployeeAddressesGetWorkAddressesQueryData, prefetchEmployeeAddressesGetWorkAddresses, queryKeyEmployeeAddressesGetWorkAddresses } from "./employeeAddressesGetWorkAddresses.core.js";
export { buildEmployeeAddressesGetWorkAddressesQuery, type EmployeeAddressesGetWorkAddressesQueryData, prefetchEmployeeAddressesGetWorkAddresses, queryKeyEmployeeAddressesGetWorkAddresses, };
export type EmployeeAddressesGetWorkAddressesQueryError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Get an employee's work addresses
 *
 * @remarks
 * Returns a list of an employee's work addresses. Each address includes its effective
 * date and a boolean signifying if it is the currently active work address.
 *
 * scope: `employees:read`
 */
export declare function useEmployeeAddressesGetWorkAddresses(request: GetV1EmployeesEmployeeIdWorkAddressesRequest, options?: QueryHookOptions<EmployeeAddressesGetWorkAddressesQueryData, EmployeeAddressesGetWorkAddressesQueryError>): UseQueryResult<EmployeeAddressesGetWorkAddressesQueryData, EmployeeAddressesGetWorkAddressesQueryError>;
/**
 * Get an employee's work addresses
 *
 * @remarks
 * Returns a list of an employee's work addresses. Each address includes its effective
 * date and a boolean signifying if it is the currently active work address.
 *
 * scope: `employees:read`
 */
export declare function useEmployeeAddressesGetWorkAddressesSuspense(request: GetV1EmployeesEmployeeIdWorkAddressesRequest, options?: SuspenseQueryHookOptions<EmployeeAddressesGetWorkAddressesQueryData, EmployeeAddressesGetWorkAddressesQueryError>): UseSuspenseQueryResult<EmployeeAddressesGetWorkAddressesQueryData, EmployeeAddressesGetWorkAddressesQueryError>;
export declare function setEmployeeAddressesGetWorkAddressesData(client: QueryClient, queryKeyBase: [
    employeeId: string,
    parameters: {
        xGustoAPIVersion?: GetV1EmployeesEmployeeIdWorkAddressesHeaderXGustoAPIVersion | undefined;
    }
], data: EmployeeAddressesGetWorkAddressesQueryData): EmployeeAddressesGetWorkAddressesQueryData | undefined;
export declare function invalidateEmployeeAddressesGetWorkAddresses(client: QueryClient, queryKeyBase: TupleToPrefixes<[
    employeeId: string,
    parameters: {
        xGustoAPIVersion?: GetV1EmployeesEmployeeIdWorkAddressesHeaderXGustoAPIVersion | undefined;
    }
]>, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
export declare function invalidateAllEmployeeAddressesGetWorkAddresses(client: QueryClient, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
//# sourceMappingURL=employeeAddressesGetWorkAddresses.d.ts.map