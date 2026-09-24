import * as z from "zod/v3";
import { ClosedEnum } from "../../types/enums.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
export type UnblockOptions = {
    /**
     * The type of unblock option for the submission blocker.
     */
    unblockType?: string | undefined;
    /**
     * The payment check date associated with the unblock option.
     */
    checkDate?: string | undefined;
    /**
     * Additional data associated with the unblock option.
     */
    metadata?: {
        [k: string]: any;
    } | undefined;
};
/**
 * The status of the submission blocker.
 */
export declare const PayrollSubmissionBlockerTypeStatus: {
    readonly Unresolved: "unresolved";
    readonly Resolved: "resolved";
};
/**
 * The status of the submission blocker.
 */
export type PayrollSubmissionBlockerTypeStatus = ClosedEnum<typeof PayrollSubmissionBlockerTypeStatus>;
/**
 * A blocker that prevents payment submission.
 */
export type PayrollSubmissionBlockerType = {
    /**
     * The type of blocker that's blocking the payment submission.
     */
    blockerType?: string | undefined;
    /**
     * The name of the submission blocker.
     */
    blockerName?: string | undefined;
    /**
     * The available options to unblock a submission blocker.
     */
    unblockOptions?: Array<UnblockOptions> | undefined;
    /**
     * The unblock option that's been selected to resolve the submission blocker.
     */
    selectedOption?: string | null | undefined;
    /**
     * The status of the submission blocker.
     */
    status?: PayrollSubmissionBlockerTypeStatus | undefined;
};
/** @internal */
export declare const UnblockOptions$inboundSchema: z.ZodType<UnblockOptions, z.ZodTypeDef, unknown>;
export declare function unblockOptionsFromJSON(jsonString: string): SafeParseResult<UnblockOptions, SDKValidationError>;
/** @internal */
export declare const PayrollSubmissionBlockerTypeStatus$inboundSchema: z.ZodNativeEnum<typeof PayrollSubmissionBlockerTypeStatus>;
/** @internal */
export declare const PayrollSubmissionBlockerType$inboundSchema: z.ZodType<PayrollSubmissionBlockerType, z.ZodTypeDef, unknown>;
export declare function payrollSubmissionBlockerTypeFromJSON(jsonString: string): SafeParseResult<PayrollSubmissionBlockerType, SDKValidationError>;
//# sourceMappingURL=payrollsubmissionblockertype.d.ts.map