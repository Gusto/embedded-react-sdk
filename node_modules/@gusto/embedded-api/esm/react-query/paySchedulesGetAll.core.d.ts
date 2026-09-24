import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1CompaniesCompanyIdPaySchedulesHeaderXGustoAPIVersion, GetV1CompaniesCompanyIdPaySchedulesRequest, GetV1CompaniesCompanyIdPaySchedulesResponse } from "../models/operations/getv1companiescompanyidpayschedules.js";
export type PaySchedulesGetAllQueryData = GetV1CompaniesCompanyIdPaySchedulesResponse;
export declare function prefetchPaySchedulesGetAll(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1CompaniesCompanyIdPaySchedulesRequest, options?: RequestOptions): Promise<void>;
export declare function buildPaySchedulesGetAllQuery(client$: GustoEmbeddedCore, request: GetV1CompaniesCompanyIdPaySchedulesRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<PaySchedulesGetAllQueryData>;
};
export declare function queryKeyPaySchedulesGetAll(companyId: string, parameters: {
    xGustoAPIVersion?: GetV1CompaniesCompanyIdPaySchedulesHeaderXGustoAPIVersion | undefined;
    page?: number | undefined;
    per?: number | undefined;
}): QueryKey;
//# sourceMappingURL=paySchedulesGetAll.core.d.ts.map