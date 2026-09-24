import { InvalidateQueryFilters, QueryClient, UseQueryResult, UseSuspenseQueryResult } from "@tanstack/react-query";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { GetV1HomeAddressesHomeAddressUuidHeaderXGustoAPIVersion, GetV1HomeAddressesHomeAddressUuidRequest } from "../models/operations/getv1homeaddresseshomeaddressuuid.js";
import { QueryHookOptions, SuspenseQueryHookOptions, TupleToPrefixes } from "./_types.js";
import { buildEmployeeAddressesRetrieveHomeAddressQuery, EmployeeAddressesRetrieveHomeAddressQueryData, prefetchEmployeeAddressesRetrieveHomeAddress, queryKeyEmployeeAddressesRetrieveHomeAddress } from "./employeeAddressesRetrieveHomeAddress.core.js";
export { buildEmployeeAddressesRetrieveHomeAddressQuery, type EmployeeAddressesRetrieveHomeAddressQueryData, prefetchEmployeeAddressesRetrieveHomeAddress, queryKeyEmployeeAddressesRetrieveHomeAddress, };
export type EmployeeAddressesRetrieveHomeAddressQueryError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Get an employee's home address
 *
 * @remarks
 * The home address of an employee is used to determine certain tax information about them. Addresses are geocoded on create and update to ensure validity.
 *
 * Supports home address effective dating and courtesy withholding.
 *
 * scope: `employees:read`
 */
export declare function useEmployeeAddressesRetrieveHomeAddress(request: GetV1HomeAddressesHomeAddressUuidRequest, options?: QueryHookOptions<EmployeeAddressesRetrieveHomeAddressQueryData, EmployeeAddressesRetrieveHomeAddressQueryError>): UseQueryResult<EmployeeAddressesRetrieveHomeAddressQueryData, EmployeeAddressesRetrieveHomeAddressQueryError>;
/**
 * Get an employee's home address
 *
 * @remarks
 * The home address of an employee is used to determine certain tax information about them. Addresses are geocoded on create and update to ensure validity.
 *
 * Supports home address effective dating and courtesy withholding.
 *
 * scope: `employees:read`
 */
export declare function useEmployeeAddressesRetrieveHomeAddressSuspense(request: GetV1HomeAddressesHomeAddressUuidRequest, options?: SuspenseQueryHookOptions<EmployeeAddressesRetrieveHomeAddressQueryData, EmployeeAddressesRetrieveHomeAddressQueryError>): UseSuspenseQueryResult<EmployeeAddressesRetrieveHomeAddressQueryData, EmployeeAddressesRetrieveHomeAddressQueryError>;
export declare function setEmployeeAddressesRetrieveHomeAddressData(client: QueryClient, queryKeyBase: [
    homeAddressUuid: string,
    parameters: {
        xGustoAPIVersion?: GetV1HomeAddressesHomeAddressUuidHeaderXGustoAPIVersion | undefined;
    }
], data: EmployeeAddressesRetrieveHomeAddressQueryData): EmployeeAddressesRetrieveHomeAddressQueryData | undefined;
export declare function invalidateEmployeeAddressesRetrieveHomeAddress(client: QueryClient, queryKeyBase: TupleToPrefixes<[
    homeAddressUuid: string,
    parameters: {
        xGustoAPIVersion?: GetV1HomeAddressesHomeAddressUuidHeaderXGustoAPIVersion | undefined;
    }
]>, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
export declare function invalidateAllEmployeeAddressesRetrieveHomeAddress(client: QueryClient, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
//# sourceMappingURL=employeeAddressesRetrieveHomeAddress.d.ts.map