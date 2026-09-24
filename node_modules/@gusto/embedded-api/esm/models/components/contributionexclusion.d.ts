import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
/**
 * The representation of a contribution exclusion for a company benefit.
 */
export type ContributionExclusion = {
    /**
     * The UUID of the contribution type.
     */
    contributionUuid: string;
    /**
     * The name of the contribution type.
     */
    contributionType: string;
    /**
     * Whether this contribution type is excluded from the benefit.
     */
    excluded: boolean;
};
/** @internal */
export declare const ContributionExclusion$inboundSchema: z.ZodType<ContributionExclusion, z.ZodTypeDef, unknown>;
/** @internal */
export type ContributionExclusion$Outbound = {
    contribution_uuid: string;
    contribution_type: string;
    excluded: boolean;
};
/** @internal */
export declare const ContributionExclusion$outboundSchema: z.ZodType<ContributionExclusion$Outbound, z.ZodTypeDef, ContributionExclusion>;
export declare function contributionExclusionToJSON(contributionExclusion: ContributionExclusion): string;
export declare function contributionExclusionFromJSON(jsonString: string): SafeParseResult<ContributionExclusion, SDKValidationError>;
//# sourceMappingURL=contributionexclusion.d.ts.map