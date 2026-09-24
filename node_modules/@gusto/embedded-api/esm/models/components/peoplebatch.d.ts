import * as z from "zod/v3";
import { ClosedEnum } from "../../types/enums.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
/**
 * The current status of the batch processing.
 */
export declare const PeopleBatchStatus: {
    readonly Pending: "pending";
    readonly Processing: "processing";
    readonly Completed: "completed";
    readonly Failed: "failed";
    readonly PartialSuccess: "partial_success";
};
/**
 * The current status of the batch processing.
 */
export type PeopleBatchStatus = ClosedEnum<typeof PeopleBatchStatus>;
/**
 * A batch for bulk people creation.
 */
export type PeopleBatch = {
    /**
     * The unique identifier of the people batch.
     */
    uuid: string;
    /**
     * The idempotency key provided when creating the batch.
     */
    idempotencyKey: string;
    /**
     * The current status of the batch processing.
     */
    status: PeopleBatchStatus;
    /**
     * The action being performed on the batch.
     */
    batchAction: string;
};
/** @internal */
export declare const PeopleBatchStatus$inboundSchema: z.ZodNativeEnum<typeof PeopleBatchStatus>;
/** @internal */
export declare const PeopleBatch$inboundSchema: z.ZodType<PeopleBatch, z.ZodTypeDef, unknown>;
export declare function peopleBatchFromJSON(jsonString: string): SafeParseResult<PeopleBatch, SDKValidationError>;
//# sourceMappingURL=peoplebatch.d.ts.map