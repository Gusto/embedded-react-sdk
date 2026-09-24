import { InvalidateQueryFilters, QueryClient, UseQueryResult, UseSuspenseQueryResult } from "@tanstack/react-query";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { GetV1PeopleBatchesPeopleBatchUuidHeaderXGustoAPIVersion, GetV1PeopleBatchesPeopleBatchUuidRequest } from "../models/operations/getv1peoplebatchespeoplebatchuuid.js";
import { QueryHookOptions, SuspenseQueryHookOptions, TupleToPrefixes } from "./_types.js";
import { buildPeopleBatchesGetV1PeopleBatchesPeopleBatchUuidQuery, PeopleBatchesGetV1PeopleBatchesPeopleBatchUuidQueryData, prefetchPeopleBatchesGetV1PeopleBatchesPeopleBatchUuid, queryKeyPeopleBatchesGetV1PeopleBatchesPeopleBatchUuid } from "./peopleBatchesGetV1PeopleBatchesPeopleBatchUuid.core.js";
export { buildPeopleBatchesGetV1PeopleBatchesPeopleBatchUuidQuery, type PeopleBatchesGetV1PeopleBatchesPeopleBatchUuidQueryData, prefetchPeopleBatchesGetV1PeopleBatchesPeopleBatchUuid, queryKeyPeopleBatchesGetV1PeopleBatchesPeopleBatchUuid, };
export type PeopleBatchesGetV1PeopleBatchesPeopleBatchUuidQueryError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Get a people batch
 *
 * @remarks
 * Returns the status and results of a people batch.
 *
 * Poll this endpoint to check the batch processing status and retrieve results.
 *
 * scope: `people_batches:read`
 */
export declare function usePeopleBatchesGetV1PeopleBatchesPeopleBatchUuid(request: GetV1PeopleBatchesPeopleBatchUuidRequest, options?: QueryHookOptions<PeopleBatchesGetV1PeopleBatchesPeopleBatchUuidQueryData, PeopleBatchesGetV1PeopleBatchesPeopleBatchUuidQueryError>): UseQueryResult<PeopleBatchesGetV1PeopleBatchesPeopleBatchUuidQueryData, PeopleBatchesGetV1PeopleBatchesPeopleBatchUuidQueryError>;
/**
 * Get a people batch
 *
 * @remarks
 * Returns the status and results of a people batch.
 *
 * Poll this endpoint to check the batch processing status and retrieve results.
 *
 * scope: `people_batches:read`
 */
export declare function usePeopleBatchesGetV1PeopleBatchesPeopleBatchUuidSuspense(request: GetV1PeopleBatchesPeopleBatchUuidRequest, options?: SuspenseQueryHookOptions<PeopleBatchesGetV1PeopleBatchesPeopleBatchUuidQueryData, PeopleBatchesGetV1PeopleBatchesPeopleBatchUuidQueryError>): UseSuspenseQueryResult<PeopleBatchesGetV1PeopleBatchesPeopleBatchUuidQueryData, PeopleBatchesGetV1PeopleBatchesPeopleBatchUuidQueryError>;
export declare function setPeopleBatchesGetV1PeopleBatchesPeopleBatchUuidData(client: QueryClient, queryKeyBase: [
    peopleBatchUuid: string,
    parameters: {
        xGustoAPIVersion?: GetV1PeopleBatchesPeopleBatchUuidHeaderXGustoAPIVersion | undefined;
    }
], data: PeopleBatchesGetV1PeopleBatchesPeopleBatchUuidQueryData): PeopleBatchesGetV1PeopleBatchesPeopleBatchUuidQueryData | undefined;
export declare function invalidatePeopleBatchesGetV1PeopleBatchesPeopleBatchUuid(client: QueryClient, queryKeyBase: TupleToPrefixes<[
    peopleBatchUuid: string,
    parameters: {
        xGustoAPIVersion?: GetV1PeopleBatchesPeopleBatchUuidHeaderXGustoAPIVersion | undefined;
    }
]>, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
export declare function invalidateAllPeopleBatchesGetV1PeopleBatchesPeopleBatchUuid(client: QueryClient, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
//# sourceMappingURL=peopleBatchesGetV1PeopleBatchesPeopleBatchUuid.d.ts.map