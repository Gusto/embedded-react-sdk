import { InvalidateQueryFilters, QueryClient, UseQueryResult, UseSuspenseQueryResult } from "@tanstack/react-query";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { GetV1WorkAddressesWorkAddressUuidHeaderXGustoAPIVersion, GetV1WorkAddressesWorkAddressUuidRequest } from "../models/operations/getv1workaddressesworkaddressuuid.js";
import { QueryHookOptions, SuspenseQueryHookOptions, TupleToPrefixes } from "./_types.js";
import { buildEmployeeAddressesRetrieveWorkAddressQuery, EmployeeAddressesRetrieveWorkAddressQueryData, prefetchEmployeeAddressesRetrieveWorkAddress, queryKeyEmployeeAddressesRetrieveWorkAddress } from "./employeeAddressesRetrieveWorkAddress.core.js";
export { buildEmployeeAddressesRetrieveWorkAddressQuery, type EmployeeAddressesRetrieveWorkAddressQueryData, prefetchEmployeeAddressesRetrieveWorkAddress, queryKeyEmployeeAddressesRetrieveWorkAddress, };
export type EmployeeAddressesRetrieveWorkAddressQueryError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Get an employee work address
 *
 * @remarks
 * The work address of an employee is used for payroll tax purposes.
 *
 * scope: `employees:read`
 */
export declare function useEmployeeAddressesRetrieveWorkAddress(request: GetV1WorkAddressesWorkAddressUuidRequest, options?: QueryHookOptions<EmployeeAddressesRetrieveWorkAddressQueryData, EmployeeAddressesRetrieveWorkAddressQueryError>): UseQueryResult<EmployeeAddressesRetrieveWorkAddressQueryData, EmployeeAddressesRetrieveWorkAddressQueryError>;
/**
 * Get an employee work address
 *
 * @remarks
 * The work address of an employee is used for payroll tax purposes.
 *
 * scope: `employees:read`
 */
export declare function useEmployeeAddressesRetrieveWorkAddressSuspense(request: GetV1WorkAddressesWorkAddressUuidRequest, options?: SuspenseQueryHookOptions<EmployeeAddressesRetrieveWorkAddressQueryData, EmployeeAddressesRetrieveWorkAddressQueryError>): UseSuspenseQueryResult<EmployeeAddressesRetrieveWorkAddressQueryData, EmployeeAddressesRetrieveWorkAddressQueryError>;
export declare function setEmployeeAddressesRetrieveWorkAddressData(client: QueryClient, queryKeyBase: [
    workAddressUuid: string,
    parameters: {
        xGustoAPIVersion?: GetV1WorkAddressesWorkAddressUuidHeaderXGustoAPIVersion | undefined;
    }
], data: EmployeeAddressesRetrieveWorkAddressQueryData): EmployeeAddressesRetrieveWorkAddressQueryData | undefined;
export declare function invalidateEmployeeAddressesRetrieveWorkAddress(client: QueryClient, queryKeyBase: TupleToPrefixes<[
    workAddressUuid: string,
    parameters: {
        xGustoAPIVersion?: GetV1WorkAddressesWorkAddressUuidHeaderXGustoAPIVersion | undefined;
    }
]>, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
export declare function invalidateAllEmployeeAddressesRetrieveWorkAddress(client: QueryClient, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
//# sourceMappingURL=employeeAddressesRetrieveWorkAddress.d.ts.map