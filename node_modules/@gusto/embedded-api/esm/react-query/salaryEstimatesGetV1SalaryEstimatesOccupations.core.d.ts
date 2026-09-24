import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1SalaryEstimatesOccupationsHeaderXGustoAPIVersion, GetV1SalaryEstimatesOccupationsRequest, GetV1SalaryEstimatesOccupationsResponse, GetV1SalaryEstimatesOccupationsSecurity } from "../models/operations/getv1salaryestimatesoccupations.js";
export type SalaryEstimatesGetV1SalaryEstimatesOccupationsQueryData = GetV1SalaryEstimatesOccupationsResponse;
export declare function prefetchSalaryEstimatesGetV1SalaryEstimatesOccupations(queryClient: QueryClient, client$: GustoEmbeddedCore, security: GetV1SalaryEstimatesOccupationsSecurity, request: GetV1SalaryEstimatesOccupationsRequest, options?: RequestOptions): Promise<void>;
export declare function buildSalaryEstimatesGetV1SalaryEstimatesOccupationsQuery(client$: GustoEmbeddedCore, security: GetV1SalaryEstimatesOccupationsSecurity, request: GetV1SalaryEstimatesOccupationsRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<SalaryEstimatesGetV1SalaryEstimatesOccupationsQueryData>;
};
export declare function queryKeySalaryEstimatesGetV1SalaryEstimatesOccupations(parameters: {
    xGustoAPIVersion?: GetV1SalaryEstimatesOccupationsHeaderXGustoAPIVersion | undefined;
    search: string;
}): QueryKey;
//# sourceMappingURL=salaryEstimatesGetV1SalaryEstimatesOccupations.core.d.ts.map