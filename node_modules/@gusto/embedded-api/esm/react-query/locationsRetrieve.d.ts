import { InvalidateQueryFilters, QueryClient, UseQueryResult, UseSuspenseQueryResult } from "@tanstack/react-query";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { GetV1LocationsLocationIdHeaderXGustoAPIVersion, GetV1LocationsLocationIdRequest } from "../models/operations/getv1locationslocationid.js";
import { QueryHookOptions, SuspenseQueryHookOptions, TupleToPrefixes } from "./_types.js";
import { buildLocationsRetrieveQuery, LocationsRetrieveQueryData, prefetchLocationsRetrieve, queryKeyLocationsRetrieve } from "./locationsRetrieve.core.js";
export { buildLocationsRetrieveQuery, type LocationsRetrieveQueryData, prefetchLocationsRetrieve, queryKeyLocationsRetrieve, };
export type LocationsRetrieveQueryError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Get a location
 *
 * @remarks
 * Get a location.
 *
 * scope: `companies:read`
 */
export declare function useLocationsRetrieve(request: GetV1LocationsLocationIdRequest, options?: QueryHookOptions<LocationsRetrieveQueryData, LocationsRetrieveQueryError>): UseQueryResult<LocationsRetrieveQueryData, LocationsRetrieveQueryError>;
/**
 * Get a location
 *
 * @remarks
 * Get a location.
 *
 * scope: `companies:read`
 */
export declare function useLocationsRetrieveSuspense(request: GetV1LocationsLocationIdRequest, options?: SuspenseQueryHookOptions<LocationsRetrieveQueryData, LocationsRetrieveQueryError>): UseSuspenseQueryResult<LocationsRetrieveQueryData, LocationsRetrieveQueryError>;
export declare function setLocationsRetrieveData(client: QueryClient, queryKeyBase: [
    locationId: string,
    parameters: {
        xGustoAPIVersion?: GetV1LocationsLocationIdHeaderXGustoAPIVersion | undefined;
    }
], data: LocationsRetrieveQueryData): LocationsRetrieveQueryData | undefined;
export declare function invalidateLocationsRetrieve(client: QueryClient, queryKeyBase: TupleToPrefixes<[
    locationId: string,
    parameters: {
        xGustoAPIVersion?: GetV1LocationsLocationIdHeaderXGustoAPIVersion | undefined;
    }
]>, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
export declare function invalidateAllLocationsRetrieve(client: QueryClient, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
//# sourceMappingURL=locationsRetrieve.d.ts.map