import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1CompanyPaymentConfigsHeaderXGustoAPIVersion, GetV1CompanyPaymentConfigsRequest, GetV1CompanyPaymentConfigsResponse } from "../models/operations/getv1companypaymentconfigs.js";
export type PaymentConfigsGetQueryData = GetV1CompanyPaymentConfigsResponse;
export declare function prefetchPaymentConfigsGet(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1CompanyPaymentConfigsRequest, options?: RequestOptions): Promise<void>;
export declare function buildPaymentConfigsGetQuery(client$: GustoEmbeddedCore, request: GetV1CompanyPaymentConfigsRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<PaymentConfigsGetQueryData>;
};
export declare function queryKeyPaymentConfigsGet(companyUuid: string, parameters: {
    xGustoAPIVersion?: GetV1CompanyPaymentConfigsHeaderXGustoAPIVersion | undefined;
}): QueryKey;
//# sourceMappingURL=paymentConfigsGet.core.d.ts.map