import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1CompensationsCompensationIdHeaderXGustoAPIVersion, GetV1CompensationsCompensationIdRequest, GetV1CompensationsCompensationIdResponse } from "../models/operations/getv1compensationscompensationid.js";
export type JobsAndCompensationsGetCompensationQueryData = GetV1CompensationsCompensationIdResponse;
export declare function prefetchJobsAndCompensationsGetCompensation(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1CompensationsCompensationIdRequest, options?: RequestOptions): Promise<void>;
export declare function buildJobsAndCompensationsGetCompensationQuery(client$: GustoEmbeddedCore, request: GetV1CompensationsCompensationIdRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<JobsAndCompensationsGetCompensationQueryData>;
};
export declare function queryKeyJobsAndCompensationsGetCompensation(compensationId: string, parameters: {
    xGustoAPIVersion?: GetV1CompensationsCompensationIdHeaderXGustoAPIVersion | undefined;
}): QueryKey;
//# sourceMappingURL=jobsAndCompensationsGetCompensation.core.d.ts.map