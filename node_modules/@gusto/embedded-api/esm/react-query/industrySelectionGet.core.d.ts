import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1CompanyIndustryHeaderXGustoAPIVersion, GetV1CompanyIndustryRequest, GetV1CompanyIndustryResponse } from "../models/operations/getv1companyindustry.js";
export type IndustrySelectionGetQueryData = GetV1CompanyIndustryResponse;
export declare function prefetchIndustrySelectionGet(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1CompanyIndustryRequest, options?: RequestOptions): Promise<void>;
export declare function buildIndustrySelectionGetQuery(client$: GustoEmbeddedCore, request: GetV1CompanyIndustryRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<IndustrySelectionGetQueryData>;
};
export declare function queryKeyIndustrySelectionGet(companyId: string, parameters: {
    xGustoAPIVersion?: GetV1CompanyIndustryHeaderXGustoAPIVersion | undefined;
}): QueryKey;
//# sourceMappingURL=industrySelectionGet.core.d.ts.map