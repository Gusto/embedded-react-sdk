import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1CompaniesCompanyUuidHolidayPayPolicyHeaderXGustoAPIVersion, GetV1CompaniesCompanyUuidHolidayPayPolicyRequest, GetV1CompaniesCompanyUuidHolidayPayPolicyResponse } from "../models/operations/getv1companiescompanyuuidholidaypaypolicy.js";
export type HolidayPayPoliciesGetQueryData = GetV1CompaniesCompanyUuidHolidayPayPolicyResponse;
export declare function prefetchHolidayPayPoliciesGet(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1CompaniesCompanyUuidHolidayPayPolicyRequest, options?: RequestOptions): Promise<void>;
export declare function buildHolidayPayPoliciesGetQuery(client$: GustoEmbeddedCore, request: GetV1CompaniesCompanyUuidHolidayPayPolicyRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<HolidayPayPoliciesGetQueryData>;
};
export declare function queryKeyHolidayPayPoliciesGet(companyUuid: string, parameters: {
    xGustoAPIVersion?: GetV1CompaniesCompanyUuidHolidayPayPolicyHeaderXGustoAPIVersion | undefined;
}): QueryKey;
//# sourceMappingURL=holidayPayPoliciesGet.core.d.ts.map