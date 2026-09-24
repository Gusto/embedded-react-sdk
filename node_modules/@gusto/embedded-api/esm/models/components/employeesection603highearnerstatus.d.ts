import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
/**
 * The representation of an employee's Section 603 high earner status for a specific year. Section 603 of the SECURE 2.0 Act requires employees aged 50 or older whose prior-year FICA wages exceed the IRS threshold to have their catch-up contributions to pre-tax retirement benefits designated as post-tax contributions.
 */
export type EmployeeSection603HighEarnerStatus = {
    /**
     * The unique identifier of the Section 603 high earner status record
     */
    id: string;
    /**
     * The year for which this high earner status applies
     */
    effectiveYear: number;
    /**
     * Whether the employee is classified as a high earner for Section 603 purposes. Can be null if the status has not yet been determined.
     */
    isHighEarner: boolean | null;
};
/** @internal */
export declare const EmployeeSection603HighEarnerStatus$inboundSchema: z.ZodType<EmployeeSection603HighEarnerStatus, z.ZodTypeDef, unknown>;
export declare function employeeSection603HighEarnerStatusFromJSON(jsonString: string): SafeParseResult<EmployeeSection603HighEarnerStatus, SDKValidationError>;
//# sourceMappingURL=employeesection603highearnerstatus.d.ts.map