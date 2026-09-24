import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
/**
 * single entity
 */
export type MetadataWithOneEntity = {
    /**
     * Name of the entity that the error corresponds to.
     */
    entityType?: string | undefined;
    /**
     * Unique identifier for the entity.
     */
    entityUuid?: string | undefined;
    validFrom?: string | null | undefined;
    validUpTo?: string | null | undefined;
    key?: string | null | undefined;
    state?: string | null | undefined;
    additionalProperties?: {
        [k: string]: any;
    } | undefined;
};
/** @internal */
export declare const MetadataWithOneEntity$inboundSchema: z.ZodType<MetadataWithOneEntity, z.ZodTypeDef, unknown>;
export declare function metadataWithOneEntityFromJSON(jsonString: string): SafeParseResult<MetadataWithOneEntity, SDKValidationError>;
//# sourceMappingURL=metadatawithoneentity.d.ts.map