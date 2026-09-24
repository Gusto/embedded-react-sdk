import { InvalidateQueryFilters, QueryClient, UseQueryResult, UseSuspenseQueryResult } from "@tanstack/react-query";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { GetV1LocationsLocationUuidMinimumWagesHeaderXGustoAPIVersion, GetV1LocationsLocationUuidMinimumWagesRequest } from "../models/operations/getv1locationslocationuuidminimumwages.js";
import { QueryHookOptions, SuspenseQueryHookOptions, TupleToPrefixes } from "./_types.js";
import { buildLocationsGetMinimumWagesQuery, LocationsGetMinimumWagesQueryData, prefetchLocationsGetMinimumWages, queryKeyLocationsGetMinimumWages } from "./locationsGetMinimumWages.core.js";
export { buildLocationsGetMinimumWagesQuery, type LocationsGetMinimumWagesQueryData, prefetchLocationsGetMinimumWages, queryKeyLocationsGetMinimumWages, };
export type LocationsGetMinimumWagesQueryError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Get minimum wages for a location
 *
 * @remarks
 * Get minimum wages for a location
 *
 * scope: `companies:read`
 */
export declare function useLocationsGetMinimumWages(request: GetV1LocationsLocationUuidMinimumWagesRequest, options?: QueryHookOptions<LocationsGetMinimumWagesQueryData, LocationsGetMinimumWagesQueryError>): UseQueryResult<LocationsGetMinimumWagesQueryData, LocationsGetMinimumWagesQueryError>;
/**
 * Get minimum wages for a location
 *
 * @remarks
 * Get minimum wages for a location
 *
 * scope: `companies:read`
 */
export declare function useLocationsGetMinimumWagesSuspense(request: GetV1LocationsLocationUuidMinimumWagesRequest, options?: SuspenseQueryHookOptions<LocationsGetMinimumWagesQueryData, LocationsGetMinimumWagesQueryError>): UseSuspenseQueryResult<LocationsGetMinimumWagesQueryData, LocationsGetMinimumWagesQueryError>;
export declare function setLocationsGetMinimumWagesData(client: QueryClient, queryKeyBase: [
    locationUuid: string,
    parameters: {
        xGustoAPIVersion?: GetV1LocationsLocationUuidMinimumWagesHeaderXGustoAPIVersion | undefined;
        effectiveDate?: string | undefined;
    }
], data: LocationsGetMinimumWagesQueryData): LocationsGetMinimumWagesQueryData | undefined;
export declare function invalidateLocationsGetMinimumWages(client: QueryClient, queryKeyBase: TupleToPrefixes<[
    locationUuid: string,
    parameters: {
        xGustoAPIVersion?: GetV1LocationsLocationUuidMinimumWagesHeaderXGustoAPIVersion | undefined;
        effectiveDate?: string | undefined;
    }
]>, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
export declare function invalidateAllLocationsGetMinimumWages(client: QueryClient, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
//# sourceMappingURL=locationsGetMinimumWages.d.ts.map