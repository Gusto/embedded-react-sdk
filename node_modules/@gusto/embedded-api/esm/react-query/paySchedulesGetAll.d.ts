import { InvalidateQueryFilters, QueryClient, UseQueryResult, UseSuspenseQueryResult } from "@tanstack/react-query";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { GetV1CompaniesCompanyIdPaySchedulesHeaderXGustoAPIVersion, GetV1CompaniesCompanyIdPaySchedulesRequest } from "../models/operations/getv1companiescompanyidpayschedules.js";
import { QueryHookOptions, SuspenseQueryHookOptions, TupleToPrefixes } from "./_types.js";
import { buildPaySchedulesGetAllQuery, PaySchedulesGetAllQueryData, prefetchPaySchedulesGetAll, queryKeyPaySchedulesGetAll } from "./paySchedulesGetAll.core.js";
export { buildPaySchedulesGetAllQuery, type PaySchedulesGetAllQueryData, prefetchPaySchedulesGetAll, queryKeyPaySchedulesGetAll, };
export type PaySchedulesGetAllQueryError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Get the pay schedules for a company
 *
 * @remarks
 * Returns all pay schedules for a company. The pay schedule object captures the details of when employees work and when they should be paid. A company can have multiple pay schedules.
 *
 * scope: `pay_schedules:read`
 */
export declare function usePaySchedulesGetAll(request: GetV1CompaniesCompanyIdPaySchedulesRequest, options?: QueryHookOptions<PaySchedulesGetAllQueryData, PaySchedulesGetAllQueryError>): UseQueryResult<PaySchedulesGetAllQueryData, PaySchedulesGetAllQueryError>;
/**
 * Get the pay schedules for a company
 *
 * @remarks
 * Returns all pay schedules for a company. The pay schedule object captures the details of when employees work and when they should be paid. A company can have multiple pay schedules.
 *
 * scope: `pay_schedules:read`
 */
export declare function usePaySchedulesGetAllSuspense(request: GetV1CompaniesCompanyIdPaySchedulesRequest, options?: SuspenseQueryHookOptions<PaySchedulesGetAllQueryData, PaySchedulesGetAllQueryError>): UseSuspenseQueryResult<PaySchedulesGetAllQueryData, PaySchedulesGetAllQueryError>;
export declare function setPaySchedulesGetAllData(client: QueryClient, queryKeyBase: [
    companyId: string,
    parameters: {
        xGustoAPIVersion?: GetV1CompaniesCompanyIdPaySchedulesHeaderXGustoAPIVersion | undefined;
        page?: number | undefined;
        per?: number | undefined;
    }
], data: PaySchedulesGetAllQueryData): PaySchedulesGetAllQueryData | undefined;
export declare function invalidatePaySchedulesGetAll(client: QueryClient, queryKeyBase: TupleToPrefixes<[
    companyId: string,
    parameters: {
        xGustoAPIVersion?: GetV1CompaniesCompanyIdPaySchedulesHeaderXGustoAPIVersion | undefined;
        page?: number | undefined;
        per?: number | undefined;
    }
]>, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
export declare function invalidateAllPaySchedulesGetAll(client: QueryClient, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
//# sourceMappingURL=paySchedulesGetAll.d.ts.map