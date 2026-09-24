import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
export type PayrollCreditBlockerUnblockOptionSubmitWireMetadata = {
    /**
     * The amount to be wired in (decimal string)
     */
    wireInAmount: string;
    /**
     * Deadline for the wire transfer to be received
     */
    wireInDeadline: Date;
    /**
     * UUID of the wire in request
     */
    wireInRequestUuid: string;
};
/**
 * Unblock option to resolve a credit blocker by submitting a wire transfer
 */
export type PayrollCreditBlockerUnblockOptionSubmitWire = {
    /**
     * The type of unblock option for the credit blocker
     */
    unblockType: "submit_wire";
    /**
     * The payment check date associated with the unblock option
     */
    checkDate: string;
    metadata: PayrollCreditBlockerUnblockOptionSubmitWireMetadata;
};
/** @internal */
export declare const PayrollCreditBlockerUnblockOptionSubmitWireMetadata$inboundSchema: z.ZodType<PayrollCreditBlockerUnblockOptionSubmitWireMetadata, z.ZodTypeDef, unknown>;
export declare function payrollCreditBlockerUnblockOptionSubmitWireMetadataFromJSON(jsonString: string): SafeParseResult<PayrollCreditBlockerUnblockOptionSubmitWireMetadata, SDKValidationError>;
/** @internal */
export declare const PayrollCreditBlockerUnblockOptionSubmitWire$inboundSchema: z.ZodType<PayrollCreditBlockerUnblockOptionSubmitWire, z.ZodTypeDef, unknown>;
export declare function payrollCreditBlockerUnblockOptionSubmitWireFromJSON(jsonString: string): SafeParseResult<PayrollCreditBlockerUnblockOptionSubmitWire, SDKValidationError>;
//# sourceMappingURL=payrollcreditblockerunblockoptionsubmitwire.d.ts.map