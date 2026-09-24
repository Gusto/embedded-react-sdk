import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1LocationsLocationIdHeaderXGustoAPIVersion, GetV1LocationsLocationIdRequest, GetV1LocationsLocationIdResponse } from "../models/operations/getv1locationslocationid.js";
export type LocationsRetrieveQueryData = GetV1LocationsLocationIdResponse;
export declare function prefetchLocationsRetrieve(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1LocationsLocationIdRequest, options?: RequestOptions): Promise<void>;
export declare function buildLocationsRetrieveQuery(client$: GustoEmbeddedCore, request: GetV1LocationsLocationIdRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<LocationsRetrieveQueryData>;
};
export declare function queryKeyLocationsRetrieve(locationId: string, parameters: {
    xGustoAPIVersion?: GetV1LocationsLocationIdHeaderXGustoAPIVersion | undefined;
}): QueryKey;
//# sourceMappingURL=locationsRetrieve.core.d.ts.map