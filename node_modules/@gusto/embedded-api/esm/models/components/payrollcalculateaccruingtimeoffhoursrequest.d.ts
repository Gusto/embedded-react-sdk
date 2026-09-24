import * as z from "zod/v3";
/**
 * Request body for calculating accruing time off hours
 */
export type PayrollCalculateAccruingTimeOffHoursRequest = {
    /**
     * Regular hours worked in this pay period
     */
    regularHoursWorked?: string | null | undefined;
    /**
     * Overtime hours worked in this pay period
     */
    overtimeHoursWorked?: string | null | undefined;
    /**
     * Double overtime hours worked in this pay period
     */
    doubleOvertimeHoursWorked?: string | null | undefined;
    /**
     * Paid time off hours used in this pay period
     */
    ptoHoursUsed?: string | null | undefined;
    /**
     * Sick hours used in this pay period
     */
    sickHoursUsed?: string | null | undefined;
};
/** @internal */
export type PayrollCalculateAccruingTimeOffHoursRequest$Outbound = {
    regular_hours_worked?: string | null | undefined;
    overtime_hours_worked?: string | null | undefined;
    double_overtime_hours_worked?: string | null | undefined;
    pto_hours_used?: string | null | undefined;
    sick_hours_used?: string | null | undefined;
};
/** @internal */
export declare const PayrollCalculateAccruingTimeOffHoursRequest$outboundSchema: z.ZodType<PayrollCalculateAccruingTimeOffHoursRequest$Outbound, z.ZodTypeDef, PayrollCalculateAccruingTimeOffHoursRequest>;
export declare function payrollCalculateAccruingTimeOffHoursRequestToJSON(payrollCalculateAccruingTimeOffHoursRequest: PayrollCalculateAccruingTimeOffHoursRequest): string;
//# sourceMappingURL=payrollcalculateaccruingtimeoffhoursrequest.d.ts.map