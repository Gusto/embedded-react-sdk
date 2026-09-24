import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
export type PayrollCreditBlockerUnblockOptionSubmitBankScreenshotMetadata = {
    /**
     * UUID of the information request
     */
    informationRequestUuid: string;
    /**
     * Last 4 digits of the bank account number for the bank screenshot RFI
     */
    bankAccountLastFourDigits?: string | null | undefined;
};
/**
 * Unblock option to resolve a credit blocker by submitting a bank screenshot
 */
export type PayrollCreditBlockerUnblockOptionSubmitBankScreenshot = {
    /**
     * The type of unblock option for the credit blocker
     */
    unblockType: "submit_bank_screenshot";
    /**
     * The payment check date associated with the unblock option
     */
    checkDate: string;
    metadata: PayrollCreditBlockerUnblockOptionSubmitBankScreenshotMetadata;
};
/** @internal */
export declare const PayrollCreditBlockerUnblockOptionSubmitBankScreenshotMetadata$inboundSchema: z.ZodType<PayrollCreditBlockerUnblockOptionSubmitBankScreenshotMetadata, z.ZodTypeDef, unknown>;
export declare function payrollCreditBlockerUnblockOptionSubmitBankScreenshotMetadataFromJSON(jsonString: string): SafeParseResult<PayrollCreditBlockerUnblockOptionSubmitBankScreenshotMetadata, SDKValidationError>;
/** @internal */
export declare const PayrollCreditBlockerUnblockOptionSubmitBankScreenshot$inboundSchema: z.ZodType<PayrollCreditBlockerUnblockOptionSubmitBankScreenshot, z.ZodTypeDef, unknown>;
export declare function payrollCreditBlockerUnblockOptionSubmitBankScreenshotFromJSON(jsonString: string): SafeParseResult<PayrollCreditBlockerUnblockOptionSubmitBankScreenshot, SDKValidationError>;
//# sourceMappingURL=payrollcreditblockerunblockoptionsubmitbankscreenshot.d.ts.map