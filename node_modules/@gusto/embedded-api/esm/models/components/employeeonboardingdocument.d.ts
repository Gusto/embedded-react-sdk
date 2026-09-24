import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
/**
 * Configuration for which onboarding documents (e.g. Form I-9) are required for an employee during onboarding.
 */
export type EmployeeOnboardingDocument = {
    /**
     * The UUID of the onboarding documents config record. Null when no config has been saved yet.
     */
    uuid?: string | null | undefined;
    /**
     * Whether to include Form I-9 for this employee during onboarding.
     *
     * @remarks
     * When true, the employee will be prompted to complete Form I-9 as part of their onboarding.
     */
    i9Document?: boolean | undefined;
};
/** @internal */
export declare const EmployeeOnboardingDocument$inboundSchema: z.ZodType<EmployeeOnboardingDocument, z.ZodTypeDef, unknown>;
export declare function employeeOnboardingDocumentFromJSON(jsonString: string): SafeParseResult<EmployeeOnboardingDocument, SDKValidationError>;
//# sourceMappingURL=employeeonboardingdocument.d.ts.map