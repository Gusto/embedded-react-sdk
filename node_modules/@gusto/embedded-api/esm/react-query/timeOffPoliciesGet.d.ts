import { InvalidateQueryFilters, QueryClient, UseQueryResult, UseSuspenseQueryResult } from "@tanstack/react-query";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { GetV1TimeOffPoliciesTimeOffPolicyUuidHeaderXGustoAPIVersion, GetV1TimeOffPoliciesTimeOffPolicyUuidRequest } from "../models/operations/getv1timeoffpoliciestimeoffpolicyuuid.js";
import { QueryHookOptions, SuspenseQueryHookOptions, TupleToPrefixes } from "./_types.js";
import { buildTimeOffPoliciesGetQuery, prefetchTimeOffPoliciesGet, queryKeyTimeOffPoliciesGet, TimeOffPoliciesGetQueryData } from "./timeOffPoliciesGet.core.js";
export { buildTimeOffPoliciesGetQuery, prefetchTimeOffPoliciesGet, queryKeyTimeOffPoliciesGet, type TimeOffPoliciesGetQueryData, };
export type TimeOffPoliciesGetQueryError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Get a time off policy
 *
 * @remarks
 * Get a time off policy
 *
 * scope: `time_off_policies:read`
 */
export declare function useTimeOffPoliciesGet(request: GetV1TimeOffPoliciesTimeOffPolicyUuidRequest, options?: QueryHookOptions<TimeOffPoliciesGetQueryData, TimeOffPoliciesGetQueryError>): UseQueryResult<TimeOffPoliciesGetQueryData, TimeOffPoliciesGetQueryError>;
/**
 * Get a time off policy
 *
 * @remarks
 * Get a time off policy
 *
 * scope: `time_off_policies:read`
 */
export declare function useTimeOffPoliciesGetSuspense(request: GetV1TimeOffPoliciesTimeOffPolicyUuidRequest, options?: SuspenseQueryHookOptions<TimeOffPoliciesGetQueryData, TimeOffPoliciesGetQueryError>): UseSuspenseQueryResult<TimeOffPoliciesGetQueryData, TimeOffPoliciesGetQueryError>;
export declare function setTimeOffPoliciesGetData(client: QueryClient, queryKeyBase: [
    timeOffPolicyUuid: string,
    parameters: {
        xGustoAPIVersion?: GetV1TimeOffPoliciesTimeOffPolicyUuidHeaderXGustoAPIVersion | undefined;
    }
], data: TimeOffPoliciesGetQueryData): TimeOffPoliciesGetQueryData | undefined;
export declare function invalidateTimeOffPoliciesGet(client: QueryClient, queryKeyBase: TupleToPrefixes<[
    timeOffPolicyUuid: string,
    parameters: {
        xGustoAPIVersion?: GetV1TimeOffPoliciesTimeOffPolicyUuidHeaderXGustoAPIVersion | undefined;
    }
]>, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
export declare function invalidateAllTimeOffPoliciesGet(client: QueryClient, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
//# sourceMappingURL=timeOffPoliciesGet.d.ts.map