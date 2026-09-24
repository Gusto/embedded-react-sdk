import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { RFCDate } from "../../types/rfcdate.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
/**
 * Representation of a Minimum Wage
 */
export type MinimumWage = {
    /**
     * unique identifier of a minimum wage
     */
    uuid: string;
    /**
     * The wage rate for a minimum wage record. Represented as a float, e.g. "15.0".
     */
    wage: string;
    /**
     * The type of wage the minimum wage applies to, e.g. "Regular", "Regular-Industry-Specific".
     */
    wageType: string;
    /**
     * The date the minimum wage rule is effective on.
     */
    effectiveDate: RFCDate;
    /**
     * The governing authority that created the minimum wage, e.g. "City", "State", or "Federal".
     */
    authority: string;
    /**
     * Description of parties the minimum wage applies to.
     */
    notes?: string | undefined;
};
/** @internal */
export declare const MinimumWage$inboundSchema: z.ZodType<MinimumWage, z.ZodTypeDef, unknown>;
export declare function minimumWageFromJSON(jsonString: string): SafeParseResult<MinimumWage, SDKValidationError>;
//# sourceMappingURL=minimumwage.d.ts.map