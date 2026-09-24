import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
/**
 * Representation of a bank account item
 */
export type PaymentMethodBankAccount = {
    /**
     * The bank account ID
     */
    uuid: string;
    /**
     * The bank account name
     */
    name?: string | undefined;
    /**
     * Masked bank account number
     */
    hiddenAccountNumber?: string | undefined;
    /**
     * The order of priority for each payment split, with priority 1 being the first bank account paid. Priority must be unique and sequential.
     */
    priority?: number | undefined;
    /**
     * If `split_by` is 'Amount', this is in cents (e.g., 500 for $5.00) and exactly one account must have a `split_amount` of `null` to capture the remainder. If `split_by` is 'Percentage', this is the percentage value (e.g., 60 for 60%).
     */
    splitAmount?: number | null | undefined;
};
/** @internal */
export declare const PaymentMethodBankAccount$inboundSchema: z.ZodType<PaymentMethodBankAccount, z.ZodTypeDef, unknown>;
export declare function paymentMethodBankAccountFromJSON(jsonString: string): SafeParseResult<PaymentMethodBankAccount, SDKValidationError>;
//# sourceMappingURL=paymentmethodbankaccount.d.ts.map