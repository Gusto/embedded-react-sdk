import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1CompaniesPayrollBlockersCompanyUuidHeaderXGustoAPIVersion, GetV1CompaniesPayrollBlockersCompanyUuidRequest, GetV1CompaniesPayrollBlockersCompanyUuidResponse } from "../models/operations/getv1companiespayrollblockerscompanyuuid.js";
export type PayrollsGetBlockersQueryData = GetV1CompaniesPayrollBlockersCompanyUuidResponse;
export declare function prefetchPayrollsGetBlockers(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1CompaniesPayrollBlockersCompanyUuidRequest, options?: RequestOptions): Promise<void>;
export declare function buildPayrollsGetBlockersQuery(client$: GustoEmbeddedCore, request: GetV1CompaniesPayrollBlockersCompanyUuidRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<PayrollsGetBlockersQueryData>;
};
export declare function queryKeyPayrollsGetBlockers(companyUuid: string, parameters: {
    xGustoAPIVersion?: GetV1CompaniesPayrollBlockersCompanyUuidHeaderXGustoAPIVersion | undefined;
}): QueryKey;
//# sourceMappingURL=payrollsGetBlockers.core.d.ts.map