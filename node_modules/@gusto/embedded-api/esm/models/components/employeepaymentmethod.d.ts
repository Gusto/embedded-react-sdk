import * as z from "zod/v3";
import { ClosedEnum } from "../../types/enums.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
import { PaymentMethodBankAccount } from "./paymentmethodbankaccount.js";
/**
 * The payment method type. If type is Check, then `split_by` and `splits` do not need to be populated. If type is Direct Deposit, `split_by` and `splits` are required.
 */
export declare const EmployeePaymentMethodType: {
    readonly DirectDeposit: "Direct Deposit";
    readonly Check: "Check";
};
/**
 * The payment method type. If type is Check, then `split_by` and `splits` do not need to be populated. If type is Direct Deposit, `split_by` and `splits` are required.
 */
export type EmployeePaymentMethodType = ClosedEnum<typeof EmployeePaymentMethodType>;
export declare const EmployeePaymentMethodSplitBy: {
    readonly Amount: "Amount";
    readonly Percentage: "Percentage";
};
export type EmployeePaymentMethodSplitBy = ClosedEnum<typeof EmployeePaymentMethodSplitBy>;
export type EmployeePaymentMethod = {
    /**
     * The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/idempotency) for information on how to use this field.
     */
    version?: string | undefined;
    /**
     * The payment method type. If type is Check, then `split_by` and `splits` do not need to be populated. If type is Direct Deposit, `split_by` and `splits` are required.
     */
    type?: EmployeePaymentMethodType | undefined;
    /**
     * Describes how the payment will be split. If `split_by` is Percentage, then the split amounts must add up to exactly 100. If `split_by` is Amount, then the last split `amount` must be `null` to capture the remainder.
     */
    splitBy?: EmployeePaymentMethodSplitBy | null | undefined;
    splits?: Array<PaymentMethodBankAccount> | null | undefined;
};
/** @internal */
export declare const EmployeePaymentMethodType$inboundSchema: z.ZodNativeEnum<typeof EmployeePaymentMethodType>;
/** @internal */
export declare const EmployeePaymentMethodSplitBy$inboundSchema: z.ZodNativeEnum<typeof EmployeePaymentMethodSplitBy>;
/** @internal */
export declare const EmployeePaymentMethod$inboundSchema: z.ZodType<EmployeePaymentMethod, z.ZodTypeDef, unknown>;
export declare function employeePaymentMethodFromJSON(jsonString: string): SafeParseResult<EmployeePaymentMethod, SDKValidationError>;
//# sourceMappingURL=employeepaymentmethod.d.ts.map