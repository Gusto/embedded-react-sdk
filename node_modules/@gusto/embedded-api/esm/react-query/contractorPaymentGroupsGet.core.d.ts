import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1ContractorPaymentGroupsContractorPaymentGroupIdHeaderXGustoAPIVersion, GetV1ContractorPaymentGroupsContractorPaymentGroupIdRequest, GetV1ContractorPaymentGroupsContractorPaymentGroupIdResponse } from "../models/operations/getv1contractorpaymentgroupscontractorpaymentgroupid.js";
export type ContractorPaymentGroupsGetQueryData = GetV1ContractorPaymentGroupsContractorPaymentGroupIdResponse;
export declare function prefetchContractorPaymentGroupsGet(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1ContractorPaymentGroupsContractorPaymentGroupIdRequest, options?: RequestOptions): Promise<void>;
export declare function buildContractorPaymentGroupsGetQuery(client$: GustoEmbeddedCore, request: GetV1ContractorPaymentGroupsContractorPaymentGroupIdRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<ContractorPaymentGroupsGetQueryData>;
};
export declare function queryKeyContractorPaymentGroupsGet(contractorPaymentGroupUuid: string, parameters: {
    xGustoAPIVersion?: GetV1ContractorPaymentGroupsContractorPaymentGroupIdHeaderXGustoAPIVersion | undefined;
}): QueryKey;
//# sourceMappingURL=contractorPaymentGroupsGet.core.d.ts.map