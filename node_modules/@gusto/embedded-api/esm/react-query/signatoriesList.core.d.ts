import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1CompaniesCompanyUuidSignatoriesHeaderXGustoAPIVersion, GetV1CompaniesCompanyUuidSignatoriesRequest, GetV1CompaniesCompanyUuidSignatoriesResponse } from "../models/operations/getv1companiescompanyuuidsignatories.js";
export type SignatoriesListQueryData = GetV1CompaniesCompanyUuidSignatoriesResponse;
export declare function prefetchSignatoriesList(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1CompaniesCompanyUuidSignatoriesRequest, options?: RequestOptions): Promise<void>;
export declare function buildSignatoriesListQuery(client$: GustoEmbeddedCore, request: GetV1CompaniesCompanyUuidSignatoriesRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<SignatoriesListQueryData>;
};
export declare function queryKeySignatoriesList(companyUuid: string, parameters: {
    xGustoAPIVersion?: GetV1CompaniesCompanyUuidSignatoriesHeaderXGustoAPIVersion | undefined;
}): QueryKey;
//# sourceMappingURL=signatoriesList.core.d.ts.map