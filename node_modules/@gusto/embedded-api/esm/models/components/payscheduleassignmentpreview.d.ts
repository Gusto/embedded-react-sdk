import * as z from "zod/v3";
import { ClosedEnum } from "../../types/enums.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
import { PayScheduleAssignmentEmployeeChange } from "./payscheduleassignmentemployeechange.js";
export declare const PayScheduleAssignmentPreviewType: {
    readonly Single: "single";
    readonly HourlySalaried: "hourly_salaried";
    readonly ByEmployee: "by_employee";
    readonly ByDepartment: "by_department";
};
export type PayScheduleAssignmentPreviewType = ClosedEnum<typeof PayScheduleAssignmentPreviewType>;
/**
 * The representation of a pay schedule assignment preview.
 */
export type PayScheduleAssignmentPreview = {
    /**
     * The pay schedule assignment type.
     */
    type?: PayScheduleAssignmentPreviewType | null | undefined;
    /**
     * A list of pay schedule changes including pay period and transition pay period.
     */
    employeeChanges?: Array<PayScheduleAssignmentEmployeeChange> | undefined;
};
/** @internal */
export declare const PayScheduleAssignmentPreviewType$inboundSchema: z.ZodNativeEnum<typeof PayScheduleAssignmentPreviewType>;
/** @internal */
export declare const PayScheduleAssignmentPreview$inboundSchema: z.ZodType<PayScheduleAssignmentPreview, z.ZodTypeDef, unknown>;
export declare function payScheduleAssignmentPreviewFromJSON(jsonString: string): SafeParseResult<PayScheduleAssignmentPreview, SDKValidationError>;
//# sourceMappingURL=payscheduleassignmentpreview.d.ts.map