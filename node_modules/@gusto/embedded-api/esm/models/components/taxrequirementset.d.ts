import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
import { TaxRequirement } from "./taxrequirement.js";
export type TaxRequirementSet = {
    /**
     * One of the two-letter state abbreviations for the fifty United States and the District of Columbia (DC)
     */
    state?: string | undefined;
    /**
     * An identifier for a set of requirements. A list of requirement sets can contain multiple sets with the same `key` and different `effective_from` values.
     */
    key?: string | undefined;
    /**
     * Customer facing label for the requirement set, e.g. "Registrations"
     */
    label?: string | undefined;
    /**
     * An ISO 8601 formatted date representing the date values became effective. Some requirement sets are effective dated, while others are not. Multiple requirement sets for the same state/key can/will exist with unique effective dates. If a requirement set is has an `effective_from` value, all requirement sets with the same key will also have an `effective_from` value.
     */
    effectiveFrom?: string | null | undefined;
    requirements?: Array<TaxRequirement> | undefined;
};
/** @internal */
export declare const TaxRequirementSet$inboundSchema: z.ZodType<TaxRequirementSet, z.ZodTypeDef, unknown>;
export declare function taxRequirementSetFromJSON(jsonString: string): SafeParseResult<TaxRequirementSet, SDKValidationError>;
//# sourceMappingURL=taxrequirementset.d.ts.map