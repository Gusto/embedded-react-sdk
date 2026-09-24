import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
import { PayScheduleAssignmentPayPeriod } from "./payscheduleassignmentpayperiod.js";
import { PayScheduleAssignmentTransitionPayPeriod } from "./payscheduleassignmenttransitionpayperiod.js";
export type PayScheduleAssignmentEmployeeChange = {
    /**
     * The UUID of the employee.
     */
    employeeUuid?: string | undefined;
    /**
     * The employee's first name.
     */
    firstName?: string | undefined;
    /**
     * The employee's last name.
     */
    lastName?: string | undefined;
    /**
     * New pay schedule frequency and name.
     */
    payFrequency?: string | undefined;
    /**
     * Pay schedule assignment first pay period information.
     */
    firstPayPeriod?: PayScheduleAssignmentPayPeriod | undefined;
    /**
     * Pay schedule assignment transition pay period information.
     */
    transitionPayPeriod?: PayScheduleAssignmentTransitionPayPeriod | undefined;
};
/** @internal */
export declare const PayScheduleAssignmentEmployeeChange$inboundSchema: z.ZodType<PayScheduleAssignmentEmployeeChange, z.ZodTypeDef, unknown>;
export declare function payScheduleAssignmentEmployeeChangeFromJSON(jsonString: string): SafeParseResult<PayScheduleAssignmentEmployeeChange, SDKValidationError>;
//# sourceMappingURL=payscheduleassignmentemployeechange.d.ts.map