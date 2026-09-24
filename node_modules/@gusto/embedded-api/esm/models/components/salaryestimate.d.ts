import * as z from "zod/v3";
import { ClosedEnum } from "../../types/enums.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
/**
 * Experience level for this occupation.
 */
export declare const ExperienceLevel: {
    readonly Novice: "novice";
    readonly Intermediate: "intermediate";
    readonly Average: "average";
    readonly Skilled: "skilled";
    readonly Expert: "expert";
};
/**
 * Experience level for this occupation.
 */
export type ExperienceLevel = ClosedEnum<typeof ExperienceLevel>;
export type Occupations = {
    /**
     * Bureau of Labor Statistics (BLS) occupation code.
     */
    code: string;
    /**
     * Occupation name.
     */
    name?: string | undefined;
    /**
     * Occupation description.
     */
    description?: string | undefined;
    /**
     * Experience level for this occupation.
     */
    experienceLevel: ExperienceLevel;
    /**
     * Percentage of time spent in this occupation (as decimal string, 0-1).
     */
    timePercentage: string;
    /**
     * Whether this is the primary occupation.
     */
    primary?: boolean | undefined;
};
/**
 * A salary estimate calculation for an S-Corp owner based on occupation, experience level, location, and business revenue.
 */
export type SalaryEstimate = {
    /**
     * The UUID of the salary estimate.
     */
    uuid: string;
    /**
     * The UUID of the employee this salary estimate is for.
     */
    employeeUuid: string | null;
    /**
     * The UUID of the employee job this salary estimate is associated with (once accepted).
     */
    employeeJobUuid?: string | null | undefined;
    /**
     * The annual net revenue of the business used for salary calculations.
     */
    annualNetRevenue: string | null;
    /**
     * The ZIP code used for location-based salary calculations.
     */
    zipCode: string | null;
    /**
     * The calculated reasonable salary estimate in cents. Null if not yet calculated.
     */
    result?: number | null | undefined;
    /**
     * The timestamp when this salary estimate was accepted and finalized.
     */
    acceptedAt?: Date | null | undefined;
    /**
     * The timestamp when this salary estimate was created.
     */
    createdAt: Date;
    /**
     * The timestamp when this salary estimate was last updated.
     */
    updatedAt: Date;
    /**
     * Array of occupations with their experience levels and time allocations.
     */
    occupations: Array<Occupations>;
};
/** @internal */
export declare const ExperienceLevel$inboundSchema: z.ZodNativeEnum<typeof ExperienceLevel>;
/** @internal */
export declare const Occupations$inboundSchema: z.ZodType<Occupations, z.ZodTypeDef, unknown>;
export declare function occupationsFromJSON(jsonString: string): SafeParseResult<Occupations, SDKValidationError>;
/** @internal */
export declare const SalaryEstimate$inboundSchema: z.ZodType<SalaryEstimate, z.ZodTypeDef, unknown>;
export declare function salaryEstimateFromJSON(jsonString: string): SafeParseResult<SalaryEstimate, SDKValidationError>;
//# sourceMappingURL=salaryestimate.d.ts.map