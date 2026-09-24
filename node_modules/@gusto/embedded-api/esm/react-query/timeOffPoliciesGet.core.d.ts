import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1TimeOffPoliciesTimeOffPolicyUuidHeaderXGustoAPIVersion, GetV1TimeOffPoliciesTimeOffPolicyUuidRequest, GetV1TimeOffPoliciesTimeOffPolicyUuidResponse } from "../models/operations/getv1timeoffpoliciestimeoffpolicyuuid.js";
export type TimeOffPoliciesGetQueryData = GetV1TimeOffPoliciesTimeOffPolicyUuidResponse;
export declare function prefetchTimeOffPoliciesGet(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1TimeOffPoliciesTimeOffPolicyUuidRequest, options?: RequestOptions): Promise<void>;
export declare function buildTimeOffPoliciesGetQuery(client$: GustoEmbeddedCore, request: GetV1TimeOffPoliciesTimeOffPolicyUuidRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<TimeOffPoliciesGetQueryData>;
};
export declare function queryKeyTimeOffPoliciesGet(timeOffPolicyUuid: string, parameters: {
    xGustoAPIVersion?: GetV1TimeOffPoliciesTimeOffPolicyUuidHeaderXGustoAPIVersion | undefined;
}): QueryKey;
//# sourceMappingURL=timeOffPoliciesGet.core.d.ts.map