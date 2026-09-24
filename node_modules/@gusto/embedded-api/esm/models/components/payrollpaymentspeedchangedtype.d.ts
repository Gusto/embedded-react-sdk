import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
/**
 * Only applicable when a payroll is moved to four day processing instead of fast ach.
 */
export type PayrollPaymentSpeedChangedType = {
    /**
     * Original check date when fast ach applies.
     */
    originalCheckDate?: string | undefined;
    /**
     * Current check date.
     */
    currentCheckDate?: string | undefined;
    /**
     * Original debit date when fast ach applies.
     */
    originalDebitDate?: string | undefined;
    /**
     * Current debit date.
     */
    currentDebitDate?: string | undefined;
    /**
     * The reason why the payroll is moved to four day.
     */
    reason?: string | undefined;
};
/** @internal */
export declare const PayrollPaymentSpeedChangedType$inboundSchema: z.ZodType<PayrollPaymentSpeedChangedType, z.ZodTypeDef, unknown>;
export declare function payrollPaymentSpeedChangedTypeFromJSON(jsonString: string): SafeParseResult<PayrollPaymentSpeedChangedType, SDKValidationError>;
//# sourceMappingURL=payrollpaymentspeedchangedtype.d.ts.map