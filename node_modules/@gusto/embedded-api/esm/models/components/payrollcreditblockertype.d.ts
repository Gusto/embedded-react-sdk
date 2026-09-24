import * as z from "zod/v3";
import { ClosedEnum } from "../../types/enums.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
import { PayrollCreditBlockerUnblockOptionRespondToHighRiskFraudRfi } from "./payrollcreditblockerunblockoptionrespondtohighriskfraudrfi.js";
import { PayrollCreditBlockerUnblockOptionSubmitBankScreenshot } from "./payrollcreditblockerunblockoptionsubmitbankscreenshot.js";
import { PayrollCreditBlockerUnblockOptionSubmitWire } from "./payrollcreditblockerunblockoptionsubmitwire.js";
import { PayrollCreditBlockerUnblockOptionWaitForReverseWire } from "./payrollcreditblockerunblockoptionwaitforreversewire.js";
export type PayrollCreditBlockerTypeUnblockOptions = PayrollCreditBlockerUnblockOptionSubmitWire | PayrollCreditBlockerUnblockOptionSubmitBankScreenshot | PayrollCreditBlockerUnblockOptionRespondToHighRiskFraudRfi | PayrollCreditBlockerUnblockOptionWaitForReverseWire;
/**
 * The status of the credit blocker
 */
export declare const PayrollCreditBlockerTypeStatus: {
    readonly Unresolved: "unresolved";
    readonly PendingReview: "pending_review";
    readonly Resolved: "resolved";
    readonly Failed: "failed";
};
/**
 * The status of the credit blocker
 */
export type PayrollCreditBlockerTypeStatus = ClosedEnum<typeof PayrollCreditBlockerTypeStatus>;
/**
 * A blocker that prevents payment crediting.
 */
export type PayrollCreditBlockerType = {
    /**
     * The type of blocker that's blocking the payment from being credited.
     */
    blockerType?: string | undefined;
    /**
     * The name of the credit blocker.
     */
    blockerName?: string | undefined;
    /**
     * The available options to unblock a credit blocker.
     */
    unblockOptions?: Array<PayrollCreditBlockerUnblockOptionSubmitWire | PayrollCreditBlockerUnblockOptionSubmitBankScreenshot | PayrollCreditBlockerUnblockOptionRespondToHighRiskFraudRfi | PayrollCreditBlockerUnblockOptionWaitForReverseWire> | undefined;
    /**
     * The unblock option that's been selected to resolve the credit blocker.
     */
    selectedOption?: string | null | undefined;
    /**
     * The status of the credit blocker
     */
    status?: PayrollCreditBlockerTypeStatus | undefined;
};
/** @internal */
export declare const PayrollCreditBlockerTypeUnblockOptions$inboundSchema: z.ZodType<PayrollCreditBlockerTypeUnblockOptions, z.ZodTypeDef, unknown>;
export declare function payrollCreditBlockerTypeUnblockOptionsFromJSON(jsonString: string): SafeParseResult<PayrollCreditBlockerTypeUnblockOptions, SDKValidationError>;
/** @internal */
export declare const PayrollCreditBlockerTypeStatus$inboundSchema: z.ZodNativeEnum<typeof PayrollCreditBlockerTypeStatus>;
/** @internal */
export declare const PayrollCreditBlockerType$inboundSchema: z.ZodType<PayrollCreditBlockerType, z.ZodTypeDef, unknown>;
export declare function payrollCreditBlockerTypeFromJSON(jsonString: string): SafeParseResult<PayrollCreditBlockerType, SDKValidationError>;
//# sourceMappingURL=payrollcreditblockertype.d.ts.map