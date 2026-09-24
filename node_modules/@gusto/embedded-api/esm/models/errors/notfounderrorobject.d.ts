import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { GustoEmbeddedError } from "./gustoembeddederror.js";
import { SDKValidationError } from "./sdkvalidationerror.js";
export type Errors = {
    /**
     * Specifies where the error occurs. Typically this key identifies the attribute/parameter related to the error.
     */
    errorKey: string;
    /**
     * Specifies the type of error. The category provides error groupings and can be used to build custom error handling in your integration.
     */
    category: string;
    /**
     * Provides details about the error - generally this message can be surfaced to an end user.
     */
    message?: string | undefined;
};
/**
 * Not Found
 *
 * @remarks
 *
 * The requested resource does not exist. Make sure the provided ID/UUID is valid.
 */
export type NotFoundErrorObjectData = {
    errors: Array<Errors>;
};
/**
 * Not Found
 *
 * @remarks
 *
 * The requested resource does not exist. Make sure the provided ID/UUID is valid.
 */
export declare class NotFoundErrorObject extends GustoEmbeddedError {
    errors: Array<Errors>;
    /** The original data that was passed to this error instance. */
    data$: NotFoundErrorObjectData;
    constructor(err: NotFoundErrorObjectData, httpMeta: {
        response: Response;
        request: Request;
        body: string;
    });
}
/** @internal */
export declare const Errors$inboundSchema: z.ZodType<Errors, z.ZodTypeDef, unknown>;
export declare function errorsFromJSON(jsonString: string): SafeParseResult<Errors, SDKValidationError>;
/** @internal */
export declare const NotFoundErrorObject$inboundSchema: z.ZodType<NotFoundErrorObject, z.ZodTypeDef, unknown>;
//# sourceMappingURL=notfounderrorobject.d.ts.map