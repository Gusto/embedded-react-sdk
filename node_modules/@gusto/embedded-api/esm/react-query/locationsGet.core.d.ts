import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1CompaniesCompanyIdLocationsHeaderXGustoAPIVersion, GetV1CompaniesCompanyIdLocationsRequest, GetV1CompaniesCompanyIdLocationsResponse } from "../models/operations/getv1companiescompanyidlocations.js";
export type LocationsGetQueryData = GetV1CompaniesCompanyIdLocationsResponse;
export declare function prefetchLocationsGet(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1CompaniesCompanyIdLocationsRequest, options?: RequestOptions): Promise<void>;
export declare function buildLocationsGetQuery(client$: GustoEmbeddedCore, request: GetV1CompaniesCompanyIdLocationsRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<LocationsGetQueryData>;
};
export declare function queryKeyLocationsGet(companyId: string, parameters: {
    xGustoAPIVersion?: GetV1CompaniesCompanyIdLocationsHeaderXGustoAPIVersion | undefined;
    page?: number | undefined;
    per?: number | undefined;
}): QueryKey;
//# sourceMappingURL=locationsGet.core.d.ts.map