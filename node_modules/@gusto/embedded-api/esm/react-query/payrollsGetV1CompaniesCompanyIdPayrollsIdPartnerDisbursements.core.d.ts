import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1CompaniesCompanyIdPayrollsIdPartnerDisbursementsHeaderXGustoAPIVersion, GetV1CompaniesCompanyIdPayrollsIdPartnerDisbursementsRequest, GetV1CompaniesCompanyIdPayrollsIdPartnerDisbursementsResponse } from "../models/operations/getv1companiescompanyidpayrollsidpartnerdisbursements.js";
export type PayrollsGetV1CompaniesCompanyIdPayrollsIdPartnerDisbursementsQueryData = GetV1CompaniesCompanyIdPayrollsIdPartnerDisbursementsResponse;
export declare function prefetchPayrollsGetV1CompaniesCompanyIdPayrollsIdPartnerDisbursements(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1CompaniesCompanyIdPayrollsIdPartnerDisbursementsRequest, options?: RequestOptions): Promise<void>;
export declare function buildPayrollsGetV1CompaniesCompanyIdPayrollsIdPartnerDisbursementsQuery(client$: GustoEmbeddedCore, request: GetV1CompaniesCompanyIdPayrollsIdPartnerDisbursementsRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<PayrollsGetV1CompaniesCompanyIdPayrollsIdPartnerDisbursementsQueryData>;
};
export declare function queryKeyPayrollsGetV1CompaniesCompanyIdPayrollsIdPartnerDisbursements(companyId: string, id: string, parameters: {
    xGustoAPIVersion?: GetV1CompaniesCompanyIdPayrollsIdPartnerDisbursementsHeaderXGustoAPIVersion | undefined;
}): QueryKey;
//# sourceMappingURL=payrollsGetV1CompaniesCompanyIdPayrollsIdPartnerDisbursements.core.d.ts.map