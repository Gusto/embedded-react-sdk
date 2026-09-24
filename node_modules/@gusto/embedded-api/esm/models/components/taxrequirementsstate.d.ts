import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
import { TaxRequirementSet } from "./taxrequirementset.js";
export type TaxRequirementsState = {
    companyUuid?: string | undefined;
    /**
     * One of the two-letter state abbreviations for the fifty United States and the District of Columbia (DC)
     */
    state?: string | undefined;
    requirementSets?: Array<TaxRequirementSet> | undefined;
};
/** @internal */
export declare const TaxRequirementsState$inboundSchema: z.ZodType<TaxRequirementsState, z.ZodTypeDef, unknown>;
export declare function taxRequirementsStateFromJSON(jsonString: string): SafeParseResult<TaxRequirementsState, SDKValidationError>;
//# sourceMappingURL=taxrequirementsstate.d.ts.map