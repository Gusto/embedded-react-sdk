import { InvalidateQueryFilters, QueryClient, UseQueryResult, UseSuspenseQueryResult } from "@tanstack/react-query";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { GetV1CompaniesCompanyIdLocationsHeaderXGustoAPIVersion, GetV1CompaniesCompanyIdLocationsRequest } from "../models/operations/getv1companiescompanyidlocations.js";
import { QueryHookOptions, SuspenseQueryHookOptions, TupleToPrefixes } from "./_types.js";
import { buildLocationsGetQuery, LocationsGetQueryData, prefetchLocationsGet, queryKeyLocationsGet } from "./locationsGet.core.js";
export { buildLocationsGetQuery, type LocationsGetQueryData, prefetchLocationsGet, queryKeyLocationsGet, };
export type LocationsGetQueryError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Get all company locations
 *
 * @remarks
 * Retrieves all company locations (addresses) associated with a company: mailing addresses, filing
 * addresses, or work locations. A single address may serve multiple, or all, purposes.
 *
 * Since all company locations are subsets of locations, use the Locations endpoints to
 * [get](ref:get-v1-locations-location_id) or [update](ref:put-v1-locations-location_id) an individual record.
 *
 * scope: `companies:read`
 */
export declare function useLocationsGet(request: GetV1CompaniesCompanyIdLocationsRequest, options?: QueryHookOptions<LocationsGetQueryData, LocationsGetQueryError>): UseQueryResult<LocationsGetQueryData, LocationsGetQueryError>;
/**
 * Get all company locations
 *
 * @remarks
 * Retrieves all company locations (addresses) associated with a company: mailing addresses, filing
 * addresses, or work locations. A single address may serve multiple, or all, purposes.
 *
 * Since all company locations are subsets of locations, use the Locations endpoints to
 * [get](ref:get-v1-locations-location_id) or [update](ref:put-v1-locations-location_id) an individual record.
 *
 * scope: `companies:read`
 */
export declare function useLocationsGetSuspense(request: GetV1CompaniesCompanyIdLocationsRequest, options?: SuspenseQueryHookOptions<LocationsGetQueryData, LocationsGetQueryError>): UseSuspenseQueryResult<LocationsGetQueryData, LocationsGetQueryError>;
export declare function setLocationsGetData(client: QueryClient, queryKeyBase: [
    companyId: string,
    parameters: {
        xGustoAPIVersion?: GetV1CompaniesCompanyIdLocationsHeaderXGustoAPIVersion | undefined;
        page?: number | undefined;
        per?: number | undefined;
    }
], data: LocationsGetQueryData): LocationsGetQueryData | undefined;
export declare function invalidateLocationsGet(client: QueryClient, queryKeyBase: TupleToPrefixes<[
    companyId: string,
    parameters: {
        xGustoAPIVersion?: GetV1CompaniesCompanyIdLocationsHeaderXGustoAPIVersion | undefined;
        page?: number | undefined;
        per?: number | undefined;
    }
]>, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
export declare function invalidateAllLocationsGet(client: QueryClient, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
//# sourceMappingURL=locationsGet.d.ts.map