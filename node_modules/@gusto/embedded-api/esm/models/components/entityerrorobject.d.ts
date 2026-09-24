import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
import { MetadataWithMultipleEntities } from "./metadatawithmultipleentities.js";
import { MetadataWithOneEntity } from "./metadatawithoneentity.js";
/**
 * Contains relevant data to identify the resource in question when applicable. For example, to identify an entity `entity_type` and `entity_uuid` will be provided.
 */
export type Metadata = MetadataWithMultipleEntities | MetadataWithOneEntity;
export type EntityErrorObject = {
    /**
     * Specifies where the error occurs. Typically this key identifies the attribute/parameter related to the error.
     */
    errorKey: string;
    /**
     * Specifies the type of error. The category provides error groupings and can be used to build custom error handling in your integration. If category is `nested_errors`, the object will contain a nested `errors` property with entity errors.
     */
    category: string;
    /**
     * Provides details about the error - generally this message can be surfaced to an end user.
     */
    message?: string | undefined;
    /**
     * Contains relevant data to identify the resource in question when applicable. For example, to identify an entity `entity_type` and `entity_uuid` will be provided.
     */
    metadata?: MetadataWithMultipleEntities | MetadataWithOneEntity | undefined;
    /**
     * Will only exist if category is `nested_errors`. It is possible to have multiple levels of nested errors.
     */
    errors?: Array<EntityErrorObject> | undefined;
};
/** @internal */
export declare const Metadata$inboundSchema: z.ZodType<Metadata, z.ZodTypeDef, unknown>;
export declare function metadataFromJSON(jsonString: string): SafeParseResult<Metadata, SDKValidationError>;
/** @internal */
export declare const EntityErrorObject$inboundSchema: z.ZodType<EntityErrorObject, z.ZodTypeDef, unknown>;
export declare function entityErrorObjectFromJSON(jsonString: string): SafeParseResult<EntityErrorObject, SDKValidationError>;
//# sourceMappingURL=entityerrorobject.d.ts.map