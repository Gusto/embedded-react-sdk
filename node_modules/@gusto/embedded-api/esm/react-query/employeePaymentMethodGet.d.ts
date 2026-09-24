import { InvalidateQueryFilters, QueryClient, UseQueryResult, UseSuspenseQueryResult } from "@tanstack/react-query";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { GetV1EmployeesEmployeeIdPaymentMethodHeaderXGustoAPIVersion, GetV1EmployeesEmployeeIdPaymentMethodRequest } from "../models/operations/getv1employeesemployeeidpaymentmethod.js";
import { QueryHookOptions, SuspenseQueryHookOptions, TupleToPrefixes } from "./_types.js";
import { buildEmployeePaymentMethodGetQuery, EmployeePaymentMethodGetQueryData, prefetchEmployeePaymentMethodGet, queryKeyEmployeePaymentMethodGet } from "./employeePaymentMethodGet.core.js";
export { buildEmployeePaymentMethodGetQuery, type EmployeePaymentMethodGetQueryData, prefetchEmployeePaymentMethodGet, queryKeyEmployeePaymentMethodGet, };
export type EmployeePaymentMethodGetQueryError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Get payment method for an employee
 *
 * @remarks
 * Returns the payment method for an employee (e.g. Check or Direct Deposit with split configuration).
 *
 * scope: `employee_payment_methods:read`
 */
export declare function useEmployeePaymentMethodGet(request: GetV1EmployeesEmployeeIdPaymentMethodRequest, options?: QueryHookOptions<EmployeePaymentMethodGetQueryData, EmployeePaymentMethodGetQueryError>): UseQueryResult<EmployeePaymentMethodGetQueryData, EmployeePaymentMethodGetQueryError>;
/**
 * Get payment method for an employee
 *
 * @remarks
 * Returns the payment method for an employee (e.g. Check or Direct Deposit with split configuration).
 *
 * scope: `employee_payment_methods:read`
 */
export declare function useEmployeePaymentMethodGetSuspense(request: GetV1EmployeesEmployeeIdPaymentMethodRequest, options?: SuspenseQueryHookOptions<EmployeePaymentMethodGetQueryData, EmployeePaymentMethodGetQueryError>): UseSuspenseQueryResult<EmployeePaymentMethodGetQueryData, EmployeePaymentMethodGetQueryError>;
export declare function setEmployeePaymentMethodGetData(client: QueryClient, queryKeyBase: [
    employeeId: string,
    parameters: {
        xGustoAPIVersion?: GetV1EmployeesEmployeeIdPaymentMethodHeaderXGustoAPIVersion | undefined;
    }
], data: EmployeePaymentMethodGetQueryData): EmployeePaymentMethodGetQueryData | undefined;
export declare function invalidateEmployeePaymentMethodGet(client: QueryClient, queryKeyBase: TupleToPrefixes<[
    employeeId: string,
    parameters: {
        xGustoAPIVersion?: GetV1EmployeesEmployeeIdPaymentMethodHeaderXGustoAPIVersion | undefined;
    }
]>, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
export declare function invalidateAllEmployeePaymentMethodGet(client: QueryClient, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
//# sourceMappingURL=employeePaymentMethodGet.d.ts.map