import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
export type PayrollPayPeriodType = {
    /**
     * The start date, inclusive, of the pay period.
     */
    startDate?: string | undefined;
    /**
     * The start date, inclusive, of the pay period.
     */
    endDate?: string | undefined;
    /**
     * The UUID of the pay schedule for the payroll.
     */
    payScheduleUuid?: string | null | undefined;
};
/** @internal */
export declare const PayrollPayPeriodType$inboundSchema: z.ZodType<PayrollPayPeriodType, z.ZodTypeDef, unknown>;
export declare function payrollPayPeriodTypeFromJSON(jsonString: string): SafeParseResult<PayrollPayPeriodType, SDKValidationError>;
//# sourceMappingURL=payrollpayperiodtype.d.ts.map