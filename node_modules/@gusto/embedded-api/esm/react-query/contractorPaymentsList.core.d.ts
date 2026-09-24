import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1CompaniesCompanyIdContractorPaymentsHeaderXGustoAPIVersion, GetV1CompaniesCompanyIdContractorPaymentsRequest, GetV1CompaniesCompanyIdContractorPaymentsResponse } from "../models/operations/getv1companiescompanyidcontractorpayments.js";
export type ContractorPaymentsListQueryData = GetV1CompaniesCompanyIdContractorPaymentsResponse;
export declare function prefetchContractorPaymentsList(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1CompaniesCompanyIdContractorPaymentsRequest, options?: RequestOptions): Promise<void>;
export declare function buildContractorPaymentsListQuery(client$: GustoEmbeddedCore, request: GetV1CompaniesCompanyIdContractorPaymentsRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<ContractorPaymentsListQueryData>;
};
export declare function queryKeyContractorPaymentsList(companyId: string, parameters: {
    xGustoAPIVersion?: GetV1CompaniesCompanyIdContractorPaymentsHeaderXGustoAPIVersion | undefined;
    startDate: string;
    endDate: string;
    contractorUuid?: string | undefined;
    groupByDate?: boolean | undefined;
    page?: number | undefined;
    per?: number | undefined;
}): QueryKey;
//# sourceMappingURL=contractorPaymentsList.core.d.ts.map