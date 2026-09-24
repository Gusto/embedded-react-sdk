import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1SalaryEstimatesIdHeaderXGustoAPIVersion, GetV1SalaryEstimatesIdRequest, GetV1SalaryEstimatesIdResponse } from "../models/operations/getv1salaryestimatesid.js";
export type SalaryEstimatesGetV1SalaryEstimatesIdQueryData = GetV1SalaryEstimatesIdResponse;
export declare function prefetchSalaryEstimatesGetV1SalaryEstimatesId(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1SalaryEstimatesIdRequest, options?: RequestOptions): Promise<void>;
export declare function buildSalaryEstimatesGetV1SalaryEstimatesIdQuery(client$: GustoEmbeddedCore, request: GetV1SalaryEstimatesIdRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<SalaryEstimatesGetV1SalaryEstimatesIdQueryData>;
};
export declare function queryKeySalaryEstimatesGetV1SalaryEstimatesId(uuid: string, parameters: {
    xGustoAPIVersion?: GetV1SalaryEstimatesIdHeaderXGustoAPIVersion | undefined;
}): QueryKey;
//# sourceMappingURL=salaryEstimatesGetV1SalaryEstimatesId.core.d.ts.map