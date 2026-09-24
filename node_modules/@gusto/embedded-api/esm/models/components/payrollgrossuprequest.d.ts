import * as z from "zod/v3";
/**
 * Request body for calculating gross up amount
 */
export type PayrollGrossUpRequest = {
    /**
     * The UUID of the employee
     */
    employeeUuid: string;
    /**
     * Employee net earnings
     */
    netPay: string;
};
/** @internal */
export type PayrollGrossUpRequest$Outbound = {
    employee_uuid: string;
    net_pay: string;
};
/** @internal */
export declare const PayrollGrossUpRequest$outboundSchema: z.ZodType<PayrollGrossUpRequest$Outbound, z.ZodTypeDef, PayrollGrossUpRequest>;
export declare function payrollGrossUpRequestToJSON(payrollGrossUpRequest: PayrollGrossUpRequest): string;
//# sourceMappingURL=payrollgrossuprequest.d.ts.map