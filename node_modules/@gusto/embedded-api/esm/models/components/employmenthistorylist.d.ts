import * as z from "zod/v3";
import { ClosedEnum } from "../../types/enums.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
/**
 * The employee's employment status. Supplying an invalid option will set the employment_status to *not_set*.
 */
export declare const EmploymentHistoryListEmploymentStatus: {
    readonly PartTime: "part_time";
    readonly FullTime: "full_time";
    readonly PartTimeEligible: "part_time_eligible";
    readonly Variable: "variable";
    readonly SeasonalNotSet: "seasonal - not_set";
};
/**
 * The employee's employment status. Supplying an invalid option will set the employment_status to *not_set*.
 */
export type EmploymentHistoryListEmploymentStatus = ClosedEnum<typeof EmploymentHistoryListEmploymentStatus>;
/**
 * The representation of an employee's individual employements.
 */
export type EmploymentHistoryList = {
    /**
     * The employee's start day of work for an employment.
     */
    hireDate?: string | undefined;
    /**
     * The employee's last day of work for an employment.
     */
    terminationDate?: string | null | undefined;
    /**
     * The boolean flag indicating whether Gusto will file a new hire report for the employee.
     */
    fileNewHireReport?: boolean | undefined;
    /**
     * Whether the employee is a two percent shareholder of the company. This field only applies to companies with an S-Corp entity type.
     */
    twoPercentShareholder?: boolean | undefined;
    /**
     * The employee's employment status. Supplying an invalid option will set the employment_status to *not_set*.
     */
    employmentStatus?: EmploymentHistoryListEmploymentStatus | undefined;
};
/** @internal */
export declare const EmploymentHistoryListEmploymentStatus$inboundSchema: z.ZodNativeEnum<typeof EmploymentHistoryListEmploymentStatus>;
/** @internal */
export declare const EmploymentHistoryList$inboundSchema: z.ZodType<EmploymentHistoryList, z.ZodTypeDef, unknown>;
export declare function employmentHistoryListFromJSON(jsonString: string): SafeParseResult<EmploymentHistoryList, SDKValidationError>;
//# sourceMappingURL=employmenthistorylist.d.ts.map