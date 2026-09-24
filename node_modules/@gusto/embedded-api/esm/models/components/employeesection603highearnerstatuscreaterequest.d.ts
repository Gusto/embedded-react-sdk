import * as z from "zod/v3";
/**
 * Request body for creating an employee's Section 603 high earner status
 */
export type EmployeeSection603HighEarnerStatusCreateRequest = {
    /**
     * The year for which this high earner status applies
     */
    effectiveYear: number;
    /**
     * Whether the employee is classified as a high earner for Section 603 purposes
     */
    isHighEarner: boolean;
};
/** @internal */
export type EmployeeSection603HighEarnerStatusCreateRequest$Outbound = {
    effective_year: number;
    is_high_earner: boolean;
};
/** @internal */
export declare const EmployeeSection603HighEarnerStatusCreateRequest$outboundSchema: z.ZodType<EmployeeSection603HighEarnerStatusCreateRequest$Outbound, z.ZodTypeDef, EmployeeSection603HighEarnerStatusCreateRequest>;
export declare function employeeSection603HighEarnerStatusCreateRequestToJSON(employeeSection603HighEarnerStatusCreateRequest: EmployeeSection603HighEarnerStatusCreateRequest): string;
//# sourceMappingURL=employeesection603highearnerstatuscreaterequest.d.ts.map