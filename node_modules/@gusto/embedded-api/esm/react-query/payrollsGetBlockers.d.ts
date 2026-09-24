import { InvalidateQueryFilters, QueryClient, UseQueryResult, UseSuspenseQueryResult } from "@tanstack/react-query";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { GetV1CompaniesPayrollBlockersCompanyUuidHeaderXGustoAPIVersion, GetV1CompaniesPayrollBlockersCompanyUuidRequest } from "../models/operations/getv1companiespayrollblockerscompanyuuid.js";
import { QueryHookOptions, SuspenseQueryHookOptions, TupleToPrefixes } from "./_types.js";
import { buildPayrollsGetBlockersQuery, PayrollsGetBlockersQueryData, prefetchPayrollsGetBlockers, queryKeyPayrollsGetBlockers } from "./payrollsGetBlockers.core.js";
export { buildPayrollsGetBlockersQuery, type PayrollsGetBlockersQueryData, prefetchPayrollsGetBlockers, queryKeyPayrollsGetBlockers, };
export type PayrollsGetBlockersQueryError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Get all payroll blockers for a company
 *
 * @remarks
 * Returns a list of reasons that prevent the company from running payrolls. See the [Payroll Blockers guide](doc:payroll-blockers) for a complete list of reasons. The list is empty if there are no payroll blockers.
 *
 * scope: `payrolls:run`
 */
export declare function usePayrollsGetBlockers(request: GetV1CompaniesPayrollBlockersCompanyUuidRequest, options?: QueryHookOptions<PayrollsGetBlockersQueryData, PayrollsGetBlockersQueryError>): UseQueryResult<PayrollsGetBlockersQueryData, PayrollsGetBlockersQueryError>;
/**
 * Get all payroll blockers for a company
 *
 * @remarks
 * Returns a list of reasons that prevent the company from running payrolls. See the [Payroll Blockers guide](doc:payroll-blockers) for a complete list of reasons. The list is empty if there are no payroll blockers.
 *
 * scope: `payrolls:run`
 */
export declare function usePayrollsGetBlockersSuspense(request: GetV1CompaniesPayrollBlockersCompanyUuidRequest, options?: SuspenseQueryHookOptions<PayrollsGetBlockersQueryData, PayrollsGetBlockersQueryError>): UseSuspenseQueryResult<PayrollsGetBlockersQueryData, PayrollsGetBlockersQueryError>;
export declare function setPayrollsGetBlockersData(client: QueryClient, queryKeyBase: [
    companyUuid: string,
    parameters: {
        xGustoAPIVersion?: GetV1CompaniesPayrollBlockersCompanyUuidHeaderXGustoAPIVersion | undefined;
    }
], data: PayrollsGetBlockersQueryData): PayrollsGetBlockersQueryData | undefined;
export declare function invalidatePayrollsGetBlockers(client: QueryClient, queryKeyBase: TupleToPrefixes<[
    companyUuid: string,
    parameters: {
        xGustoAPIVersion?: GetV1CompaniesPayrollBlockersCompanyUuidHeaderXGustoAPIVersion | undefined;
    }
]>, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
export declare function invalidateAllPayrollsGetBlockers(client: QueryClient, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
//# sourceMappingURL=payrollsGetBlockers.d.ts.map