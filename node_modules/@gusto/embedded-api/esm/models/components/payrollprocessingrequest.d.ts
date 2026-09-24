import * as z from "zod/v3";
import { ClosedEnum } from "../../types/enums.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
import { EntityErrorObject } from "./entityerrorobject.js";
/**
 * The status of the payroll processing request
 */
export declare const PayrollProcessingRequestStatus: {
    readonly Calculating: "calculating";
    readonly CalculateSuccess: "calculate_success";
    readonly Submitting: "submitting";
    readonly SubmitSuccess: "submit_success";
    readonly ProcessingFailed: "processing_failed";
};
/**
 * The status of the payroll processing request
 */
export type PayrollProcessingRequestStatus = ClosedEnum<typeof PayrollProcessingRequestStatus>;
export type PayrollProcessingRequest = {
    /**
     * The status of the payroll processing request
     */
    status?: PayrollProcessingRequestStatus | undefined;
    /**
     * Errors that occurred during async payroll processing
     */
    errors?: Array<EntityErrorObject> | undefined;
};
/** @internal */
export declare const PayrollProcessingRequestStatus$inboundSchema: z.ZodNativeEnum<typeof PayrollProcessingRequestStatus>;
/** @internal */
export declare const PayrollProcessingRequest$inboundSchema: z.ZodType<PayrollProcessingRequest, z.ZodTypeDef, unknown>;
export declare function payrollProcessingRequestFromJSON(jsonString: string): SafeParseResult<PayrollProcessingRequest, SDKValidationError>;
//# sourceMappingURL=payrollprocessingrequest.d.ts.map