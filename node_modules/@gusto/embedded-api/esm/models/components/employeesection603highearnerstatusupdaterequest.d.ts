import * as z from "zod/v3";
/**
 * Request body for updating an employee's Section 603 high earner status
 */
export type EmployeeSection603HighEarnerStatusUpdateRequest = {
    /**
     * Whether the employee is classified as a high earner for Section 603 purposes
     */
    isHighEarner: boolean;
};
/** @internal */
export type EmployeeSection603HighEarnerStatusUpdateRequest$Outbound = {
    is_high_earner: boolean;
};
/** @internal */
export declare const EmployeeSection603HighEarnerStatusUpdateRequest$outboundSchema: z.ZodType<EmployeeSection603HighEarnerStatusUpdateRequest$Outbound, z.ZodTypeDef, EmployeeSection603HighEarnerStatusUpdateRequest>;
export declare function employeeSection603HighEarnerStatusUpdateRequestToJSON(employeeSection603HighEarnerStatusUpdateRequest: EmployeeSection603HighEarnerStatusUpdateRequest): string;
//# sourceMappingURL=employeesection603highearnerstatusupdaterequest.d.ts.map