import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1CompaniesCompanyUuidTimeOffPoliciesHeaderXGustoAPIVersion, GetV1CompaniesCompanyUuidTimeOffPoliciesRequest, GetV1CompaniesCompanyUuidTimeOffPoliciesResponse } from "../models/operations/getv1companiescompanyuuidtimeoffpolicies.js";
export type TimeOffPoliciesGetAllQueryData = GetV1CompaniesCompanyUuidTimeOffPoliciesResponse;
export declare function prefetchTimeOffPoliciesGetAll(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1CompaniesCompanyUuidTimeOffPoliciesRequest, options?: RequestOptions): Promise<void>;
export declare function buildTimeOffPoliciesGetAllQuery(client$: GustoEmbeddedCore, request: GetV1CompaniesCompanyUuidTimeOffPoliciesRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<TimeOffPoliciesGetAllQueryData>;
};
export declare function queryKeyTimeOffPoliciesGetAll(companyUuid: string, parameters: {
    xGustoAPIVersion?: GetV1CompaniesCompanyUuidTimeOffPoliciesHeaderXGustoAPIVersion | undefined;
}): QueryKey;
//# sourceMappingURL=timeOffPoliciesGetAll.core.d.ts.map