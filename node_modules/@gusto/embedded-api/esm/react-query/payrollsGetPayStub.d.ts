import { InvalidateQueryFilters, QueryClient, UseQueryResult, UseSuspenseQueryResult } from "@tanstack/react-query";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { GetV1PayrollsPayrollUuidEmployeesEmployeeUuidPayStubHeaderXGustoAPIVersion, GetV1PayrollsPayrollUuidEmployeesEmployeeUuidPayStubRequest } from "../models/operations/getv1payrollspayrolluuidemployeesemployeeuuidpaystub.js";
import { QueryHookOptions, SuspenseQueryHookOptions, TupleToPrefixes } from "./_types.js";
import { buildPayrollsGetPayStubQuery, PayrollsGetPayStubQueryData, prefetchPayrollsGetPayStub, queryKeyPayrollsGetPayStub } from "./payrollsGetPayStub.core.js";
export { buildPayrollsGetPayStubQuery, type PayrollsGetPayStubQueryData, prefetchPayrollsGetPayStub, queryKeyPayrollsGetPayStub, };
export type PayrollsGetPayStubQueryError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Get an employee pay stub (pdf)
 *
 * @remarks
 * Get an employee's pay stub for the specified payroll. By default, an application/pdf response will be returned. No other content types are currently supported, but may be supported in the future.
 *
 * scope: `pay_stubs:read`
 */
export declare function usePayrollsGetPayStub(request: GetV1PayrollsPayrollUuidEmployeesEmployeeUuidPayStubRequest, options?: QueryHookOptions<PayrollsGetPayStubQueryData, PayrollsGetPayStubQueryError>): UseQueryResult<PayrollsGetPayStubQueryData, PayrollsGetPayStubQueryError>;
/**
 * Get an employee pay stub (pdf)
 *
 * @remarks
 * Get an employee's pay stub for the specified payroll. By default, an application/pdf response will be returned. No other content types are currently supported, but may be supported in the future.
 *
 * scope: `pay_stubs:read`
 */
export declare function usePayrollsGetPayStubSuspense(request: GetV1PayrollsPayrollUuidEmployeesEmployeeUuidPayStubRequest, options?: SuspenseQueryHookOptions<PayrollsGetPayStubQueryData, PayrollsGetPayStubQueryError>): UseSuspenseQueryResult<PayrollsGetPayStubQueryData, PayrollsGetPayStubQueryError>;
export declare function setPayrollsGetPayStubData(client: QueryClient, queryKeyBase: [
    payrollId: string,
    employeeId: string,
    parameters: {
        xGustoAPIVersion?: GetV1PayrollsPayrollUuidEmployeesEmployeeUuidPayStubHeaderXGustoAPIVersion | undefined;
    }
], data: PayrollsGetPayStubQueryData): PayrollsGetPayStubQueryData | undefined;
export declare function invalidatePayrollsGetPayStub(client: QueryClient, queryKeyBase: TupleToPrefixes<[
    payrollId: string,
    employeeId: string,
    parameters: {
        xGustoAPIVersion?: GetV1PayrollsPayrollUuidEmployeesEmployeeUuidPayStubHeaderXGustoAPIVersion | undefined;
    }
]>, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
export declare function invalidateAllPayrollsGetPayStub(client: QueryClient, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
//# sourceMappingURL=payrollsGetPayStub.d.ts.map