import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1CompaniesCompanyIdPayPeriodsHeaderXGustoAPIVersion, GetV1CompaniesCompanyIdPayPeriodsRequest, GetV1CompaniesCompanyIdPayPeriodsResponse, PayrollTypes } from "../models/operations/getv1companiescompanyidpayperiods.js";
import { RFCDate } from "../types/rfcdate.js";
export type PaySchedulesGetPayPeriodsQueryData = GetV1CompaniesCompanyIdPayPeriodsResponse;
export declare function prefetchPaySchedulesGetPayPeriods(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1CompaniesCompanyIdPayPeriodsRequest, options?: RequestOptions): Promise<void>;
export declare function buildPaySchedulesGetPayPeriodsQuery(client$: GustoEmbeddedCore, request: GetV1CompaniesCompanyIdPayPeriodsRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<PaySchedulesGetPayPeriodsQueryData>;
};
export declare function queryKeyPaySchedulesGetPayPeriods(companyId: string, parameters: {
    xGustoAPIVersion?: GetV1CompaniesCompanyIdPayPeriodsHeaderXGustoAPIVersion | undefined;
    startDate?: RFCDate | undefined;
    endDate?: RFCDate | undefined;
    payrollTypes?: PayrollTypes | undefined;
}): QueryKey;
//# sourceMappingURL=paySchedulesGetPayPeriods.core.d.ts.map