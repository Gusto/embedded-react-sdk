import { InvalidateQueryFilters, QueryClient, UseQueryResult, UseSuspenseQueryResult } from "@tanstack/react-query";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { GetV1WebhooksHealthCheckHeaderXGustoAPIVersion, GetV1WebhooksHealthCheckRequest, GetV1WebhooksHealthCheckSecurity } from "../models/operations/getv1webhookshealthcheck.js";
import { QueryHookOptions, SuspenseQueryHookOptions, TupleToPrefixes } from "./_types.js";
import { buildWebhooksGetV1WebhooksHealthCheckQuery, prefetchWebhooksGetV1WebhooksHealthCheck, queryKeyWebhooksGetV1WebhooksHealthCheck, WebhooksGetV1WebhooksHealthCheckQueryData } from "./webhooksGetV1WebhooksHealthCheck.core.js";
export { buildWebhooksGetV1WebhooksHealthCheckQuery, prefetchWebhooksGetV1WebhooksHealthCheck, queryKeyWebhooksGetV1WebhooksHealthCheck, type WebhooksGetV1WebhooksHealthCheckQueryData, };
export type WebhooksGetV1WebhooksHealthCheckQueryError = GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Get the webhooks health status
 *
 * @remarks
 * Returns the health status (`healthy`, `unhealthy`, or `unknown`) of the webhooks system based on the last ten minutes of activity.
 *
 * 📘 System Access Authentication
 *
 * This endpoint uses the [Bearer Auth scheme with the system-level access token in the HTTP Authorization header](https://docs.gusto.com/embedded-payroll/docs/system-access)
 *
 * scope: `webhook_subscriptions:read`
 */
export declare function useWebhooksGetV1WebhooksHealthCheck(security: GetV1WebhooksHealthCheckSecurity, request: GetV1WebhooksHealthCheckRequest, options?: QueryHookOptions<WebhooksGetV1WebhooksHealthCheckQueryData, WebhooksGetV1WebhooksHealthCheckQueryError>): UseQueryResult<WebhooksGetV1WebhooksHealthCheckQueryData, WebhooksGetV1WebhooksHealthCheckQueryError>;
/**
 * Get the webhooks health status
 *
 * @remarks
 * Returns the health status (`healthy`, `unhealthy`, or `unknown`) of the webhooks system based on the last ten minutes of activity.
 *
 * 📘 System Access Authentication
 *
 * This endpoint uses the [Bearer Auth scheme with the system-level access token in the HTTP Authorization header](https://docs.gusto.com/embedded-payroll/docs/system-access)
 *
 * scope: `webhook_subscriptions:read`
 */
export declare function useWebhooksGetV1WebhooksHealthCheckSuspense(security: GetV1WebhooksHealthCheckSecurity, request: GetV1WebhooksHealthCheckRequest, options?: SuspenseQueryHookOptions<WebhooksGetV1WebhooksHealthCheckQueryData, WebhooksGetV1WebhooksHealthCheckQueryError>): UseSuspenseQueryResult<WebhooksGetV1WebhooksHealthCheckQueryData, WebhooksGetV1WebhooksHealthCheckQueryError>;
export declare function setWebhooksGetV1WebhooksHealthCheckData(client: QueryClient, queryKeyBase: [
    parameters: {
        xGustoAPIVersion?: GetV1WebhooksHealthCheckHeaderXGustoAPIVersion | undefined;
    }
], data: WebhooksGetV1WebhooksHealthCheckQueryData): WebhooksGetV1WebhooksHealthCheckQueryData | undefined;
export declare function invalidateWebhooksGetV1WebhooksHealthCheck(client: QueryClient, queryKeyBase: TupleToPrefixes<[
    parameters: {
        xGustoAPIVersion?: GetV1WebhooksHealthCheckHeaderXGustoAPIVersion | undefined;
    }
]>, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
export declare function invalidateAllWebhooksGetV1WebhooksHealthCheck(client: QueryClient, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
//# sourceMappingURL=webhooksGetV1WebhooksHealthCheck.d.ts.map