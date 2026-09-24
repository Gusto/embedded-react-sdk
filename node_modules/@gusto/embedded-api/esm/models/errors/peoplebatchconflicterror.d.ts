import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { GustoEmbeddedError } from "./gustoembeddederror.js";
import { SDKValidationError } from "./sdkvalidationerror.js";
export type PeopleBatchConflictErrorMetadata = {
    /**
     * The UUID of the existing entity.
     */
    entityUuid?: string | undefined;
    /**
     * The type of the existing entity.
     */
    entityType?: string | undefined;
};
export type PeopleBatchConflictErrorErrors = {
    /**
     * The key identifying the error source.
     */
    errorKey?: string | undefined;
    /**
     * The error category.
     */
    category?: string | undefined;
    /**
     * Human-readable error message.
     */
    message?: string | undefined;
    metadata?: PeopleBatchConflictErrorMetadata | undefined;
};
/**
 * Error response when a people batch idempotency key conflict occurs.
 */
export type PeopleBatchConflictErrorData = {
    errors?: Array<PeopleBatchConflictErrorErrors> | undefined;
};
/**
 * Error response when a people batch idempotency key conflict occurs.
 */
export declare class PeopleBatchConflictError extends GustoEmbeddedError {
    errors?: Array<PeopleBatchConflictErrorErrors> | undefined;
    /** The original data that was passed to this error instance. */
    data$: PeopleBatchConflictErrorData;
    constructor(err: PeopleBatchConflictErrorData, httpMeta: {
        response: Response;
        request: Request;
        body: string;
    });
}
/** @internal */
export declare const PeopleBatchConflictErrorMetadata$inboundSchema: z.ZodType<PeopleBatchConflictErrorMetadata, z.ZodTypeDef, unknown>;
export declare function peopleBatchConflictErrorMetadataFromJSON(jsonString: string): SafeParseResult<PeopleBatchConflictErrorMetadata, SDKValidationError>;
/** @internal */
export declare const PeopleBatchConflictErrorErrors$inboundSchema: z.ZodType<PeopleBatchConflictErrorErrors, z.ZodTypeDef, unknown>;
export declare function peopleBatchConflictErrorErrorsFromJSON(jsonString: string): SafeParseResult<PeopleBatchConflictErrorErrors, SDKValidationError>;
/** @internal */
export declare const PeopleBatchConflictError$inboundSchema: z.ZodType<PeopleBatchConflictError, z.ZodTypeDef, unknown>;
//# sourceMappingURL=peoplebatchconflicterror.d.ts.map