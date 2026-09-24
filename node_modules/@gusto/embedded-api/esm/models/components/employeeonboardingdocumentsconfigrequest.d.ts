import * as z from "zod/v3";
/**
 * Request body for updating an employee's onboarding documents configuration.
 */
export type EmployeeOnboardingDocumentsConfigRequest = {
    /**
     * Whether to include Form I-9 for this employee during onboarding.
     *
     * @remarks
     * When true, the employee will be prompted to complete Form I-9 as part of their onboarding.
     */
    i9Document?: boolean | undefined;
};
/** @internal */
export type EmployeeOnboardingDocumentsConfigRequest$Outbound = {
    i9_document: boolean;
};
/** @internal */
export declare const EmployeeOnboardingDocumentsConfigRequest$outboundSchema: z.ZodType<EmployeeOnboardingDocumentsConfigRequest$Outbound, z.ZodTypeDef, EmployeeOnboardingDocumentsConfigRequest>;
export declare function employeeOnboardingDocumentsConfigRequestToJSON(employeeOnboardingDocumentsConfigRequest: EmployeeOnboardingDocumentsConfigRequest): string;
//# sourceMappingURL=employeeonboardingdocumentsconfigrequest.d.ts.map