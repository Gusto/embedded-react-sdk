import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1CompaniesCompanyIdPaySchedulesPayScheduleIdHeaderXGustoAPIVersion, GetV1CompaniesCompanyIdPaySchedulesPayScheduleIdRequest, GetV1CompaniesCompanyIdPaySchedulesPayScheduleIdResponse } from "../models/operations/getv1companiescompanyidpayschedulespayscheduleid.js";
export type PaySchedulesGetQueryData = GetV1CompaniesCompanyIdPaySchedulesPayScheduleIdResponse;
export declare function prefetchPaySchedulesGet(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1CompaniesCompanyIdPaySchedulesPayScheduleIdRequest, options?: RequestOptions): Promise<void>;
export declare function buildPaySchedulesGetQuery(client$: GustoEmbeddedCore, request: GetV1CompaniesCompanyIdPaySchedulesPayScheduleIdRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<PaySchedulesGetQueryData>;
};
export declare function queryKeyPaySchedulesGet(companyId: string, payScheduleId: string, parameters: {
    xGustoAPIVersion?: GetV1CompaniesCompanyIdPaySchedulesPayScheduleIdHeaderXGustoAPIVersion | undefined;
}): QueryKey;
//# sourceMappingURL=paySchedulesGet.core.d.ts.map