import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1CompaniesHeaderXGustoAPIVersion, GetV1CompaniesRequest, GetV1CompaniesResponse } from "../models/operations/getv1companies.js";
export type CompaniesGetQueryData = GetV1CompaniesResponse;
export declare function prefetchCompaniesGet(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1CompaniesRequest, options?: RequestOptions): Promise<void>;
export declare function buildCompaniesGetQuery(client$: GustoEmbeddedCore, request: GetV1CompaniesRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<CompaniesGetQueryData>;
};
export declare function queryKeyCompaniesGet(companyId: string, parameters: {
    xGustoAPIVersion?: GetV1CompaniesHeaderXGustoAPIVersion | undefined;
}): QueryKey;
//# sourceMappingURL=companiesGet.core.d.ts.map