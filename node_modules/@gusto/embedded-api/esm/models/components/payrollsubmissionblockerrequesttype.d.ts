import * as z from "zod/v3";
/**
 * Request object for resolving a submission blocker. Each submission_blocker should include a selected unblock option.
 */
export type PayrollSubmissionBlockerRequestType = {
    /**
     * The type of submission_blocker that is blocking the payment.
     */
    blockerType: string;
    /**
     * The selected option to unblock the payment's submission_blocker.
     */
    selectedOption: string;
};
/** @internal */
export type PayrollSubmissionBlockerRequestType$Outbound = {
    blocker_type: string;
    selected_option: string;
};
/** @internal */
export declare const PayrollSubmissionBlockerRequestType$outboundSchema: z.ZodType<PayrollSubmissionBlockerRequestType$Outbound, z.ZodTypeDef, PayrollSubmissionBlockerRequestType>;
export declare function payrollSubmissionBlockerRequestTypeToJSON(payrollSubmissionBlockerRequestType: PayrollSubmissionBlockerRequestType): string;
//# sourceMappingURL=payrollsubmissionblockerrequesttype.d.ts.map