import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
/**
 * Pay schedule assignment transition pay period information.
 */
export type PayScheduleAssignmentTransitionPayPeriod = {
    /**
     * Pay period start date.
     */
    startDate?: string | undefined;
    /**
     * Pay period end date.
     */
    endDate?: string | undefined;
};
/** @internal */
export declare const PayScheduleAssignmentTransitionPayPeriod$inboundSchema: z.ZodType<PayScheduleAssignmentTransitionPayPeriod, z.ZodTypeDef, unknown>;
export declare function payScheduleAssignmentTransitionPayPeriodFromJSON(jsonString: string): SafeParseResult<PayScheduleAssignmentTransitionPayPeriod, SDKValidationError>;
//# sourceMappingURL=payscheduleassignmenttransitionpayperiod.d.ts.map