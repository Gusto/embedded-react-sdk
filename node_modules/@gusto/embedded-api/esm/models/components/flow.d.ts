import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
/**
 * The representation of a flow in Gusto white-label UI.
 */
export type Flow = {
    url?: string | undefined;
};
/** @internal */
export declare const Flow$inboundSchema: z.ZodType<Flow, z.ZodTypeDef, unknown>;
export declare function flowFromJSON(jsonString: string): SafeParseResult<Flow, SDKValidationError>;
//# sourceMappingURL=flow.d.ts.map