import * as z from "zod/v3";
import { ClosedEnum } from "../../types/enums.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
/**
 * The payment method for the disbursement
 */
export declare const PayrollPartnerDisbursementsPaymentMethod: {
    readonly DirectDeposit: "Direct Deposit";
    readonly Check: "Check";
};
/**
 * The payment method for the disbursement
 */
export type PayrollPartnerDisbursementsPaymentMethod = ClosedEnum<typeof PayrollPartnerDisbursementsPaymentMethod>;
/**
 * The status of the payment
 */
export declare const PayrollPartnerDisbursementsPaymentStatus: {
    readonly Pending: "Pending";
    readonly Paid: "Paid";
    readonly NotPartnerManaged: "Not partner managed";
    readonly ConvertedToCheck: "Converted to check";
};
/**
 * The status of the payment
 */
export type PayrollPartnerDisbursementsPaymentStatus = ClosedEnum<typeof PayrollPartnerDisbursementsPaymentStatus>;
export type PayrollPartnerDisbursementsDisbursements = {
    /**
     * The UUID of the employee
     */
    employeeUuid?: string | undefined;
    /**
     * The payment method for the disbursement
     */
    paymentMethod?: PayrollPartnerDisbursementsPaymentMethod | undefined;
    /**
     * The status of the payment
     */
    paymentStatus?: PayrollPartnerDisbursementsPaymentStatus | undefined;
};
/**
 * Partner disbursements for a payroll
 */
export type PayrollPartnerDisbursements = {
    /**
     * The UUID of the payroll
     */
    payrollUuid?: string | undefined;
    /**
     * List of disbursements for the payroll
     */
    disbursements?: Array<PayrollPartnerDisbursementsDisbursements> | undefined;
};
/** @internal */
export declare const PayrollPartnerDisbursementsPaymentMethod$inboundSchema: z.ZodNativeEnum<typeof PayrollPartnerDisbursementsPaymentMethod>;
/** @internal */
export declare const PayrollPartnerDisbursementsPaymentStatus$inboundSchema: z.ZodNativeEnum<typeof PayrollPartnerDisbursementsPaymentStatus>;
/** @internal */
export declare const PayrollPartnerDisbursementsDisbursements$inboundSchema: z.ZodType<PayrollPartnerDisbursementsDisbursements, z.ZodTypeDef, unknown>;
export declare function payrollPartnerDisbursementsDisbursementsFromJSON(jsonString: string): SafeParseResult<PayrollPartnerDisbursementsDisbursements, SDKValidationError>;
/** @internal */
export declare const PayrollPartnerDisbursements$inboundSchema: z.ZodType<PayrollPartnerDisbursements, z.ZodTypeDef, unknown>;
export declare function payrollPartnerDisbursementsFromJSON(jsonString: string): SafeParseResult<PayrollPartnerDisbursements, SDKValidationError>;
//# sourceMappingURL=payrollpartnerdisbursements.d.ts.map