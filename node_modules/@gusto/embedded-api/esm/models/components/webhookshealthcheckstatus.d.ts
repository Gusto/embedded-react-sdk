import * as z from "zod/v3";
import { ClosedEnum } from "../../types/enums.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
/**
 * Latest health status of the webhooks system
 */
export declare const WebhooksHealthCheckStatusStatus: {
    readonly Healthy: "healthy";
    readonly Unhealthy: "unhealthy";
    readonly Unknown: "unknown";
};
/**
 * Latest health status of the webhooks system
 */
export type WebhooksHealthCheckStatusStatus = ClosedEnum<typeof WebhooksHealthCheckStatusStatus>;
/**
 * The representation of a webhooks health check response
 */
export type WebhooksHealthCheckStatus = {
    /**
     * Latest health status of the webhooks system
     */
    status?: WebhooksHealthCheckStatusStatus | undefined;
    /**
     * ISO8601 timestamp of the last successful health check with millisecond precision
     */
    lastCheckedAt?: Date | undefined;
};
/** @internal */
export declare const WebhooksHealthCheckStatusStatus$inboundSchema: z.ZodNativeEnum<typeof WebhooksHealthCheckStatusStatus>;
/** @internal */
export declare const WebhooksHealthCheckStatus$inboundSchema: z.ZodType<WebhooksHealthCheckStatus, z.ZodTypeDef, unknown>;
export declare function webhooksHealthCheckStatusFromJSON(jsonString: string): SafeParseResult<WebhooksHealthCheckStatus, SDKValidationError>;
//# sourceMappingURL=webhookshealthcheckstatus.d.ts.map