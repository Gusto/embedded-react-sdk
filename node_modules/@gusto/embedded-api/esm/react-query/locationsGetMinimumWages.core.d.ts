import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1LocationsLocationUuidMinimumWagesHeaderXGustoAPIVersion, GetV1LocationsLocationUuidMinimumWagesRequest, GetV1LocationsLocationUuidMinimumWagesResponse } from "../models/operations/getv1locationslocationuuidminimumwages.js";
export type LocationsGetMinimumWagesQueryData = GetV1LocationsLocationUuidMinimumWagesResponse;
export declare function prefetchLocationsGetMinimumWages(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1LocationsLocationUuidMinimumWagesRequest, options?: RequestOptions): Promise<void>;
export declare function buildLocationsGetMinimumWagesQuery(client$: GustoEmbeddedCore, request: GetV1LocationsLocationUuidMinimumWagesRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<LocationsGetMinimumWagesQueryData>;
};
export declare function queryKeyLocationsGetMinimumWages(locationUuid: string, parameters: {
    xGustoAPIVersion?: GetV1LocationsLocationUuidMinimumWagesHeaderXGustoAPIVersion | undefined;
    effectiveDate?: string | undefined;
}): QueryKey;
//# sourceMappingURL=locationsGetMinimumWages.core.d.ts.map