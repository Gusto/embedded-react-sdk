import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
import { MetadataWithOneEntity } from "./metadatawithoneentity.js";
/**
 * multiple entities
 */
export type MetadataWithMultipleEntities = {
    entities: Array<MetadataWithOneEntity>;
};
/** @internal */
export declare const MetadataWithMultipleEntities$inboundSchema: z.ZodType<MetadataWithMultipleEntities, z.ZodTypeDef, unknown>;
export declare function metadataWithMultipleEntitiesFromJSON(jsonString: string): SafeParseResult<MetadataWithMultipleEntities, SDKValidationError>;
//# sourceMappingURL=metadatawithmultipleentities.d.ts.map