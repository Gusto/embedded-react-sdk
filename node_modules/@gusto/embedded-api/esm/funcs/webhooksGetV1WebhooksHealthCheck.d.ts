import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { GetV1WebhooksHealthCheckRequest, GetV1WebhooksHealthCheckResponse, GetV1WebhooksHealthCheckSecurity } from "../models/operations/getv1webhookshealthcheck.js";
import { APIPromise } from "../types/async.js";
import { Result } from "../types/fp.js";
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
export declare function webhooksGetV1WebhooksHealthCheck(client: GustoEmbeddedCore, security: GetV1WebhooksHealthCheckSecurity, request: GetV1WebhooksHealthCheckRequest, options?: RequestOptions): APIPromise<Result<GetV1WebhooksHealthCheckResponse, GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError>>;
//# sourceMappingURL=webhooksGetV1WebhooksHealthCheck.d.ts.map