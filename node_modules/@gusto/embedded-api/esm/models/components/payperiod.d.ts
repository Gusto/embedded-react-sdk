import * as z from "zod/v3";
import { ClosedEnum } from "../../types/enums.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
/**
 * Whether it is regular pay period or transition pay period.
 */
export declare const PayrollType: {
    readonly Regular: "regular";
    readonly Transition: "transition";
};
/**
 * Whether it is regular pay period or transition pay period.
 */
export type PayrollType = ClosedEnum<typeof PayrollType>;
/**
 * Information about the payroll for the pay period.
 */
export type PayPeriodPayroll = {
    /**
     * The UUID of the payroll for this pay period.
     */
    payrollUuid?: string | undefined;
    /**
     * The date on which employees will be paid for the payroll if the payroll is submitted on time.
     */
    checkDate?: string | undefined;
    /**
     * Whether or not the payroll has been successfully processed. Note that processed payrolls cannot be updated. Additionally, a payroll is not guaranteed to be processed just because the payroll deadline has passed. Late payrolls are not uncommon. Conversely, users may choose to run payroll before the payroll deadline.
     */
    processed?: boolean | undefined;
    /**
     * The date by which payroll should be run for employees to be paid on time. Payroll data, such as time and attendance data, should be submitted on or before this date.
     */
    payrollDeadline?: Date | undefined;
    /**
     * Whether it is regular pay period or transition pay period.
     */
    payrollType?: PayrollType | undefined;
};
/**
 * The representation of a pay period.
 */
export type PayPeriod = {
    /**
     * The start date, inclusive, of the pay period.
     */
    startDate?: string | undefined;
    /**
     * The end date, inclusive, of the pay period.
     */
    endDate?: string | undefined;
    /**
     * A unique identifier of the pay schedule to which the pay period belongs.
     */
    payScheduleUuid?: string | undefined;
    /**
     * Information about the payroll for the pay period.
     */
    payroll?: PayPeriodPayroll | undefined;
};
/** @internal */
export declare const PayrollType$inboundSchema: z.ZodNativeEnum<typeof PayrollType>;
/** @internal */
export declare const PayPeriodPayroll$inboundSchema: z.ZodType<PayPeriodPayroll, z.ZodTypeDef, unknown>;
export declare function payPeriodPayrollFromJSON(jsonString: string): SafeParseResult<PayPeriodPayroll, SDKValidationError>;
/** @internal */
export declare const PayPeriod$inboundSchema: z.ZodType<PayPeriod, z.ZodTypeDef, unknown>;
export declare function payPeriodFromJSON(jsonString: string): SafeParseResult<PayPeriod, SDKValidationError>;
//# sourceMappingURL=payperiod.d.ts.map