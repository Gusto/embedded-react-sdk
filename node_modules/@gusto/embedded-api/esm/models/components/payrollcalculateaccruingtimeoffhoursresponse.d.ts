import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
export type HoursEarned = {
    /**
     * The UUID of the time off policy
     */
    timeOffPolicyUuid?: string | undefined;
    /**
     * Hours accrued during this pay period.
     */
    hours?: string | undefined;
};
/**
 * Response containing the calculated accruing time off hours
 */
export type PayrollCalculateAccruingTimeOffHoursResponse = {
    /**
     * Accruing time off hours earned for each time off policy
     */
    hoursEarned: Array<HoursEarned>;
};
/** @internal */
export declare const HoursEarned$inboundSchema: z.ZodType<HoursEarned, z.ZodTypeDef, unknown>;
export declare function hoursEarnedFromJSON(jsonString: string): SafeParseResult<HoursEarned, SDKValidationError>;
/** @internal */
export declare const PayrollCalculateAccruingTimeOffHoursResponse$inboundSchema: z.ZodType<PayrollCalculateAccruingTimeOffHoursResponse, z.ZodTypeDef, unknown>;
export declare function payrollCalculateAccruingTimeOffHoursResponseFromJSON(jsonString: string): SafeParseResult<PayrollCalculateAccruingTimeOffHoursResponse, SDKValidationError>;
//# sourceMappingURL=payrollcalculateaccruingtimeoffhoursresponse.d.ts.map