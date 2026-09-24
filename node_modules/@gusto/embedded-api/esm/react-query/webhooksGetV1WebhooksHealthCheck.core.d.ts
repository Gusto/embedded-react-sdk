import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1WebhooksHealthCheckHeaderXGustoAPIVersion, GetV1WebhooksHealthCheckRequest, GetV1WebhooksHealthCheckResponse, GetV1WebhooksHealthCheckSecurity } from "../models/operations/getv1webhookshealthcheck.js";
export type WebhooksGetV1WebhooksHealthCheckQueryData = GetV1WebhooksHealthCheckResponse;
export declare function prefetchWebhooksGetV1WebhooksHealthCheck(queryClient: QueryClient, client$: GustoEmbeddedCore, security: GetV1WebhooksHealthCheckSecurity, request: GetV1WebhooksHealthCheckRequest, options?: RequestOptions): Promise<void>;
export declare function buildWebhooksGetV1WebhooksHealthCheckQuery(client$: GustoEmbeddedCore, security: GetV1WebhooksHealthCheckSecurity, request: GetV1WebhooksHealthCheckRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<WebhooksGetV1WebhooksHealthCheckQueryData>;
};
export declare function queryKeyWebhooksGetV1WebhooksHealthCheck(parameters: {
    xGustoAPIVersion?: GetV1WebhooksHealthCheckHeaderXGustoAPIVersion | undefined;
}): QueryKey;
//# sourceMappingURL=webhooksGetV1WebhooksHealthCheck.core.d.ts.map