import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetCompaniesCompanyUuidSuspensionsHeaderXGustoAPIVersion, GetCompaniesCompanyUuidSuspensionsRequest, GetCompaniesCompanyUuidSuspensionsResponse } from "../models/operations/getcompaniescompanyuuidsuspensions.js";
export type CompaniesSuspensionsGetQueryData = GetCompaniesCompanyUuidSuspensionsResponse;
export declare function prefetchCompaniesSuspensionsGet(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetCompaniesCompanyUuidSuspensionsRequest, options?: RequestOptions): Promise<void>;
export declare function buildCompaniesSuspensionsGetQuery(client$: GustoEmbeddedCore, request: GetCompaniesCompanyUuidSuspensionsRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<CompaniesSuspensionsGetQueryData>;
};
export declare function queryKeyCompaniesSuspensionsGet(companyUuid: string, parameters: {
    xGustoAPIVersion?: GetCompaniesCompanyUuidSuspensionsHeaderXGustoAPIVersion | undefined;
}): QueryKey;
//# sourceMappingURL=companiesSuspensionsGet.core.d.ts.map