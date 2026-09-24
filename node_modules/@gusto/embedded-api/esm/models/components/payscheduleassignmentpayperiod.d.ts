import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
/**
 * Pay schedule assignment first pay period information.
 */
export type PayScheduleAssignmentPayPeriod = {
    /**
     * The pay schedule UUID.
     */
    payScheduleUuid?: string | undefined;
    /**
     * Pay period start date.
     */
    startDate?: string | undefined;
    /**
     * Pay period end date.
     */
    endDate?: string | undefined;
    /**
     * Pay period check date.
     */
    checkDate?: string | undefined;
};
/** @internal */
export declare const PayScheduleAssignmentPayPeriod$inboundSchema: z.ZodType<PayScheduleAssignmentPayPeriod, z.ZodTypeDef, unknown>;
export declare function payScheduleAssignmentPayPeriodFromJSON(jsonString: string): SafeParseResult<PayScheduleAssignmentPayPeriod, SDKValidationError>;
//# sourceMappingURL=payscheduleassignmentpayperiod.d.ts.map