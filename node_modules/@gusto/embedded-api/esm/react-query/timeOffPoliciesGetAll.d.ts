import { InvalidateQueryFilters, QueryClient, UseQueryResult, UseSuspenseQueryResult } from "@tanstack/react-query";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { GetV1CompaniesCompanyUuidTimeOffPoliciesHeaderXGustoAPIVersion, GetV1CompaniesCompanyUuidTimeOffPoliciesRequest } from "../models/operations/getv1companiescompanyuuidtimeoffpolicies.js";
import { QueryHookOptions, SuspenseQueryHookOptions, TupleToPrefixes } from "./_types.js";
import { buildTimeOffPoliciesGetAllQuery, prefetchTimeOffPoliciesGetAll, queryKeyTimeOffPoliciesGetAll, TimeOffPoliciesGetAllQueryData } from "./timeOffPoliciesGetAll.core.js";
export { buildTimeOffPoliciesGetAllQuery, prefetchTimeOffPoliciesGetAll, queryKeyTimeOffPoliciesGetAll, type TimeOffPoliciesGetAllQueryData, };
export type TimeOffPoliciesGetAllQueryError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Get all time off policies for a company
 *
 * @remarks
 * Get all time off policies for a company
 *
 * scope: `time_off_policies:read`
 */
export declare function useTimeOffPoliciesGetAll(request: GetV1CompaniesCompanyUuidTimeOffPoliciesRequest, options?: QueryHookOptions<TimeOffPoliciesGetAllQueryData, TimeOffPoliciesGetAllQueryError>): UseQueryResult<TimeOffPoliciesGetAllQueryData, TimeOffPoliciesGetAllQueryError>;
/**
 * Get all time off policies for a company
 *
 * @remarks
 * Get all time off policies for a company
 *
 * scope: `time_off_policies:read`
 */
export declare function useTimeOffPoliciesGetAllSuspense(request: GetV1CompaniesCompanyUuidTimeOffPoliciesRequest, options?: SuspenseQueryHookOptions<TimeOffPoliciesGetAllQueryData, TimeOffPoliciesGetAllQueryError>): UseSuspenseQueryResult<TimeOffPoliciesGetAllQueryData, TimeOffPoliciesGetAllQueryError>;
export declare function setTimeOffPoliciesGetAllData(client: QueryClient, queryKeyBase: [
    companyUuid: string,
    parameters: {
        xGustoAPIVersion?: GetV1CompaniesCompanyUuidTimeOffPoliciesHeaderXGustoAPIVersion | undefined;
    }
], data: TimeOffPoliciesGetAllQueryData): TimeOffPoliciesGetAllQueryData | undefined;
export declare function invalidateTimeOffPoliciesGetAll(client: QueryClient, queryKeyBase: TupleToPrefixes<[
    companyUuid: string,
    parameters: {
        xGustoAPIVersion?: GetV1CompaniesCompanyUuidTimeOffPoliciesHeaderXGustoAPIVersion | undefined;
    }
]>, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
export declare function invalidateAllTimeOffPoliciesGetAll(client: QueryClient, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
//# sourceMappingURL=timeOffPoliciesGetAll.d.ts.map