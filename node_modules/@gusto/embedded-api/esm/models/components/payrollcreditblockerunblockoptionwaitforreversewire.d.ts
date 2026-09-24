import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
export type PayrollCreditBlockerUnblockOptionWaitForReverseWireMetadata = {};
/**
 * Unblock option to resolve a credit blocker by waiting for reverse wire
 */
export type PayrollCreditBlockerUnblockOptionWaitForReverseWire = {
    /**
     * The type of unblock option for the credit blocker
     */
    unblockType: "wait_for_reverse_wire";
    /**
     * The payment check date associated with the unblock option
     */
    checkDate: string;
    metadata: PayrollCreditBlockerUnblockOptionWaitForReverseWireMetadata;
};
/** @internal */
export declare const PayrollCreditBlockerUnblockOptionWaitForReverseWireMetadata$inboundSchema: z.ZodType<PayrollCreditBlockerUnblockOptionWaitForReverseWireMetadata, z.ZodTypeDef, unknown>;
export declare function payrollCreditBlockerUnblockOptionWaitForReverseWireMetadataFromJSON(jsonString: string): SafeParseResult<PayrollCreditBlockerUnblockOptionWaitForReverseWireMetadata, SDKValidationError>;
/** @internal */
export declare const PayrollCreditBlockerUnblockOptionWaitForReverseWire$inboundSchema: z.ZodType<PayrollCreditBlockerUnblockOptionWaitForReverseWire, z.ZodTypeDef, unknown>;
export declare function payrollCreditBlockerUnblockOptionWaitForReverseWireFromJSON(jsonString: string): SafeParseResult<PayrollCreditBlockerUnblockOptionWaitForReverseWire, SDKValidationError>;
//# sourceMappingURL=payrollcreditblockerunblockoptionwaitforreversewire.d.ts.map