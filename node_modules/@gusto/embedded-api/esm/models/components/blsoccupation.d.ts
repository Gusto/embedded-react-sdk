import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
/**
 * A Bureau of Labor Statistics occupation code with its title and description, used for salary estimate calculations.
 */
export type BLSOccupation = {
    /**
     * Bureau of Labor Statistics (BLS) occupation code.
     */
    code: string;
    /**
     * Occupation title.
     */
    title: string;
    /**
     * Occupation description.
     */
    description?: string | undefined;
};
/** @internal */
export declare const BLSOccupation$inboundSchema: z.ZodType<BLSOccupation, z.ZodTypeDef, unknown>;
export declare function blsOccupationFromJSON(jsonString: string): SafeParseResult<BLSOccupation, SDKValidationError>;
//# sourceMappingURL=blsoccupation.d.ts.map