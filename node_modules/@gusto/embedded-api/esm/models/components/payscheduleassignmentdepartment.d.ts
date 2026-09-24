import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
export type PayScheduleAssignmentDepartment = {
    /**
     * The UUID of the department.
     */
    departmentUuid?: string | undefined;
    /**
     * The department's pay schedule UUID.
     */
    payScheduleUuid?: string | undefined;
};
/** @internal */
export declare const PayScheduleAssignmentDepartment$inboundSchema: z.ZodType<PayScheduleAssignmentDepartment, z.ZodTypeDef, unknown>;
export declare function payScheduleAssignmentDepartmentFromJSON(jsonString: string): SafeParseResult<PayScheduleAssignmentDepartment, SDKValidationError>;
//# sourceMappingURL=payscheduleassignmentdepartment.d.ts.map