import { InvalidateQueryFilters, QueryClient, UseQueryResult, UseSuspenseQueryResult } from "@tanstack/react-query";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { GetV1EmployeesEmployeeIdHomeAddressesHeaderXGustoAPIVersion, GetV1EmployeesEmployeeIdHomeAddressesRequest } from "../models/operations/getv1employeesemployeeidhomeaddresses.js";
import { QueryHookOptions, SuspenseQueryHookOptions, TupleToPrefixes } from "./_types.js";
import { buildEmployeeAddressesGetQuery, EmployeeAddressesGetQueryData, prefetchEmployeeAddressesGet, queryKeyEmployeeAddressesGet } from "./employeeAddressesGet.core.js";
export { buildEmployeeAddressesGetQuery, type EmployeeAddressesGetQueryData, prefetchEmployeeAddressesGet, queryKeyEmployeeAddressesGet, };
export type EmployeeAddressesGetQueryError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Get an employee's home addresses
 *
 * @remarks
 * The home address of an employee is used to determine certain tax information about them. Addresses are geocoded on create and update to ensure validity.
 *
 * Supports home address effective dating and courtesy withholding.
 *
 * scope: `employees:read`
 */
export declare function useEmployeeAddressesGet(request: GetV1EmployeesEmployeeIdHomeAddressesRequest, options?: QueryHookOptions<EmployeeAddressesGetQueryData, EmployeeAddressesGetQueryError>): UseQueryResult<EmployeeAddressesGetQueryData, EmployeeAddressesGetQueryError>;
/**
 * Get an employee's home addresses
 *
 * @remarks
 * The home address of an employee is used to determine certain tax information about them. Addresses are geocoded on create and update to ensure validity.
 *
 * Supports home address effective dating and courtesy withholding.
 *
 * scope: `employees:read`
 */
export declare function useEmployeeAddressesGetSuspense(request: GetV1EmployeesEmployeeIdHomeAddressesRequest, options?: SuspenseQueryHookOptions<EmployeeAddressesGetQueryData, EmployeeAddressesGetQueryError>): UseSuspenseQueryResult<EmployeeAddressesGetQueryData, EmployeeAddressesGetQueryError>;
export declare function setEmployeeAddressesGetData(client: QueryClient, queryKeyBase: [
    employeeId: string,
    parameters: {
        xGustoAPIVersion?: GetV1EmployeesEmployeeIdHomeAddressesHeaderXGustoAPIVersion | undefined;
    }
], data: EmployeeAddressesGetQueryData): EmployeeAddressesGetQueryData | undefined;
export declare function invalidateEmployeeAddressesGet(client: QueryClient, queryKeyBase: TupleToPrefixes<[
    employeeId: string,
    parameters: {
        xGustoAPIVersion?: GetV1EmployeesEmployeeIdHomeAddressesHeaderXGustoAPIVersion | undefined;
    }
]>, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
export declare function invalidateAllEmployeeAddressesGet(client: QueryClient, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
//# sourceMappingURL=employeeAddressesGet.d.ts.map