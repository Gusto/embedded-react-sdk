import { InvalidateQueryFilters, QueryClient, UseQueryResult, UseSuspenseQueryResult } from "@tanstack/react-query";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { GetV1CompensationsCompensationIdHeaderXGustoAPIVersion, GetV1CompensationsCompensationIdRequest } from "../models/operations/getv1compensationscompensationid.js";
import { QueryHookOptions, SuspenseQueryHookOptions, TupleToPrefixes } from "./_types.js";
import { buildJobsAndCompensationsGetCompensationQuery, JobsAndCompensationsGetCompensationQueryData, prefetchJobsAndCompensationsGetCompensation, queryKeyJobsAndCompensationsGetCompensation } from "./jobsAndCompensationsGetCompensation.core.js";
export { buildJobsAndCompensationsGetCompensationQuery, type JobsAndCompensationsGetCompensationQueryData, prefetchJobsAndCompensationsGetCompensation, queryKeyJobsAndCompensationsGetCompensation, };
export type JobsAndCompensationsGetCompensationQueryError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Get a compensation
 *
 * @remarks
 * Compensations contain information on how much is paid out for a job. Jobs may have many compensations, but only one that is active. The current compensation is the one with the most recent `effective_date`.
 *
 * scope: `compensations:read`
 */
export declare function useJobsAndCompensationsGetCompensation(request: GetV1CompensationsCompensationIdRequest, options?: QueryHookOptions<JobsAndCompensationsGetCompensationQueryData, JobsAndCompensationsGetCompensationQueryError>): UseQueryResult<JobsAndCompensationsGetCompensationQueryData, JobsAndCompensationsGetCompensationQueryError>;
/**
 * Get a compensation
 *
 * @remarks
 * Compensations contain information on how much is paid out for a job. Jobs may have many compensations, but only one that is active. The current compensation is the one with the most recent `effective_date`.
 *
 * scope: `compensations:read`
 */
export declare function useJobsAndCompensationsGetCompensationSuspense(request: GetV1CompensationsCompensationIdRequest, options?: SuspenseQueryHookOptions<JobsAndCompensationsGetCompensationQueryData, JobsAndCompensationsGetCompensationQueryError>): UseSuspenseQueryResult<JobsAndCompensationsGetCompensationQueryData, JobsAndCompensationsGetCompensationQueryError>;
export declare function setJobsAndCompensationsGetCompensationData(client: QueryClient, queryKeyBase: [
    compensationId: string,
    parameters: {
        xGustoAPIVersion?: GetV1CompensationsCompensationIdHeaderXGustoAPIVersion | undefined;
    }
], data: JobsAndCompensationsGetCompensationQueryData): JobsAndCompensationsGetCompensationQueryData | undefined;
export declare function invalidateJobsAndCompensationsGetCompensation(client: QueryClient, queryKeyBase: TupleToPrefixes<[
    compensationId: string,
    parameters: {
        xGustoAPIVersion?: GetV1CompensationsCompensationIdHeaderXGustoAPIVersion | undefined;
    }
]>, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
export declare function invalidateAllJobsAndCompensationsGetCompensation(client: QueryClient, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
//# sourceMappingURL=jobsAndCompensationsGetCompensation.d.ts.map