import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
export type PayScheduleAssignmentEmployee = {
    /**
     * The UUID of the employee.
     */
    employeeUuid?: string | undefined;
    /**
     * The employee's pay schedule UUID.
     */
    payScheduleUuid?: string | null | undefined;
};
/** @internal */
export declare const PayScheduleAssignmentEmployee$inboundSchema: z.ZodType<PayScheduleAssignmentEmployee, z.ZodTypeDef, unknown>;
export declare function payScheduleAssignmentEmployeeFromJSON(jsonString: string): SafeParseResult<PayScheduleAssignmentEmployee, SDKValidationError>;
//# sourceMappingURL=payscheduleassignmentemployee.d.ts.map