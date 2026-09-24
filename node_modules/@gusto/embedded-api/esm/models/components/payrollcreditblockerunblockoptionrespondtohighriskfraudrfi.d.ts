import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
export type PayrollCreditBlockerUnblockOptionRespondToHighRiskFraudRfiMetadata = {
    /**
     * UUID of the information request
     */
    informationRequestUuid: string;
};
/**
 * Unblock option to resolve a credit blocker by responding to high risk fraud RFI
 */
export type PayrollCreditBlockerUnblockOptionRespondToHighRiskFraudRfi = {
    /**
     * The type of unblock option for the credit blocker
     */
    unblockType: "respond_to_high_risk_fraud_rfi";
    /**
     * The payment check date associated with the unblock option
     */
    checkDate: string;
    metadata: PayrollCreditBlockerUnblockOptionRespondToHighRiskFraudRfiMetadata;
};
/** @internal */
export declare const PayrollCreditBlockerUnblockOptionRespondToHighRiskFraudRfiMetadata$inboundSchema: z.ZodType<PayrollCreditBlockerUnblockOptionRespondToHighRiskFraudRfiMetadata, z.ZodTypeDef, unknown>;
export declare function payrollCreditBlockerUnblockOptionRespondToHighRiskFraudRfiMetadataFromJSON(jsonString: string): SafeParseResult<PayrollCreditBlockerUnblockOptionRespondToHighRiskFraudRfiMetadata, SDKValidationError>;
/** @internal */
export declare const PayrollCreditBlockerUnblockOptionRespondToHighRiskFraudRfi$inboundSchema: z.ZodType<PayrollCreditBlockerUnblockOptionRespondToHighRiskFraudRfi, z.ZodTypeDef, unknown>;
export declare function payrollCreditBlockerUnblockOptionRespondToHighRiskFraudRfiFromJSON(jsonString: string): SafeParseResult<PayrollCreditBlockerUnblockOptionRespondToHighRiskFraudRfi, SDKValidationError>;
//# sourceMappingURL=payrollcreditblockerunblockoptionrespondtohighriskfraudrfi.d.ts.map