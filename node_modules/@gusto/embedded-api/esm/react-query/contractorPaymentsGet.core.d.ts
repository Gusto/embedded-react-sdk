import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1CompaniesCompanyIdContractorPaymentContractorPaymentHeaderXGustoAPIVersion, GetV1CompaniesCompanyIdContractorPaymentContractorPaymentRequest, GetV1CompaniesCompanyIdContractorPaymentContractorPaymentResponse } from "../models/operations/getv1companiescompanyidcontractorpaymentcontractorpayment.js";
export type ContractorPaymentsGetQueryData = GetV1CompaniesCompanyIdContractorPaymentContractorPaymentResponse;
export declare function prefetchContractorPaymentsGet(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1CompaniesCompanyIdContractorPaymentContractorPaymentRequest, options?: RequestOptions): Promise<void>;
export declare function buildContractorPaymentsGetQuery(client$: GustoEmbeddedCore, request: GetV1CompaniesCompanyIdContractorPaymentContractorPaymentRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<ContractorPaymentsGetQueryData>;
};
export declare function queryKeyContractorPaymentsGet(companyId: string, contractorPaymentId: string, parameters: {
    xGustoAPIVersion?: GetV1CompaniesCompanyIdContractorPaymentContractorPaymentHeaderXGustoAPIVersion | undefined;
}): QueryKey;
//# sourceMappingURL=contractorPaymentsGet.core.d.ts.map