import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1JobsJobIdCompensationsHeaderXGustoAPIVersion, GetV1JobsJobIdCompensationsQueryParamInclude, GetV1JobsJobIdCompensationsRequest, GetV1JobsJobIdCompensationsResponse } from "../models/operations/getv1jobsjobidcompensations.js";
export type JobsAndCompensationsGetCompensationsQueryData = GetV1JobsJobIdCompensationsResponse;
export declare function prefetchJobsAndCompensationsGetCompensations(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1JobsJobIdCompensationsRequest, options?: RequestOptions): Promise<void>;
export declare function buildJobsAndCompensationsGetCompensationsQuery(client$: GustoEmbeddedCore, request: GetV1JobsJobIdCompensationsRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<JobsAndCompensationsGetCompensationsQueryData>;
};
export declare function queryKeyJobsAndCompensationsGetCompensations(jobId: string, parameters: {
    xGustoAPIVersion?: GetV1JobsJobIdCompensationsHeaderXGustoAPIVersion | undefined;
    page?: number | undefined;
    per?: number | undefined;
    include?: GetV1JobsJobIdCompensationsQueryParamInclude | undefined;
}): QueryKey;
//# sourceMappingURL=jobsAndCompensationsGetCompensations.core.d.ts.map