import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1ContractorPaymentGroupsIdPartnerDisbursementsHeaderXGustoAPIVersion, GetV1ContractorPaymentGroupsIdPartnerDisbursementsRequest, GetV1ContractorPaymentGroupsIdPartnerDisbursementsResponse } from "../models/operations/getv1contractorpaymentgroupsidpartnerdisbursements.js";
export type ContractorPaymentGroupsGetV1ContractorPaymentGroupsIdPartnerDisbursementsQueryData = GetV1ContractorPaymentGroupsIdPartnerDisbursementsResponse;
export declare function prefetchContractorPaymentGroupsGetV1ContractorPaymentGroupsIdPartnerDisbursements(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1ContractorPaymentGroupsIdPartnerDisbursementsRequest, options?: RequestOptions): Promise<void>;
export declare function buildContractorPaymentGroupsGetV1ContractorPaymentGroupsIdPartnerDisbursementsQuery(client$: GustoEmbeddedCore, request: GetV1ContractorPaymentGroupsIdPartnerDisbursementsRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<ContractorPaymentGroupsGetV1ContractorPaymentGroupsIdPartnerDisbursementsQueryData>;
};
export declare function queryKeyContractorPaymentGroupsGetV1ContractorPaymentGroupsIdPartnerDisbursements(id: string, parameters: {
    xGustoAPIVersion?: GetV1ContractorPaymentGroupsIdPartnerDisbursementsHeaderXGustoAPIVersion | undefined;
}): QueryKey;
//# sourceMappingURL=contractorPaymentGroupsGetV1ContractorPaymentGroupsIdPartnerDisbursements.core.d.ts.map