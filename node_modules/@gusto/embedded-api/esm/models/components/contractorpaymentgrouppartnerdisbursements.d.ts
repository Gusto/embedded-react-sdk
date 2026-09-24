import * as z from "zod/v3";
import { ClosedEnum } from "../../types/enums.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
/**
 * The payment method for the disbursement
 */
export declare const ContractorPaymentGroupPartnerDisbursementsPaymentMethod: {
    readonly DirectDeposit: "Direct Deposit";
    readonly Check: "Check";
};
/**
 * The payment method for the disbursement
 */
export type ContractorPaymentGroupPartnerDisbursementsPaymentMethod = ClosedEnum<typeof ContractorPaymentGroupPartnerDisbursementsPaymentMethod>;
/**
 * The status of the payment
 */
export declare const ContractorPaymentGroupPartnerDisbursementsPaymentStatus: {
    readonly Pending: "Pending";
    readonly Paid: "Paid";
    readonly NotPartnerManaged: "Not partner managed";
    readonly ConvertedToCheck: "Converted to check";
};
/**
 * The status of the payment
 */
export type ContractorPaymentGroupPartnerDisbursementsPaymentStatus = ClosedEnum<typeof ContractorPaymentGroupPartnerDisbursementsPaymentStatus>;
export type Disbursements = {
    /**
     * The UUID of the contractor payment
     */
    contractorPaymentUuid?: string | undefined;
    /**
     * The UUID of the contractor
     */
    contractorUuid?: string | undefined;
    /**
     * The payment method for the disbursement
     */
    paymentMethod?: ContractorPaymentGroupPartnerDisbursementsPaymentMethod | undefined;
    /**
     * The status of the payment
     */
    paymentStatus?: ContractorPaymentGroupPartnerDisbursementsPaymentStatus | undefined;
};
/**
 * Partner disbursements for a contractor payment group
 */
export type ContractorPaymentGroupPartnerDisbursements = {
    /**
     * The UUID of the contractor payment group
     */
    contractorPaymentGroupUuid?: string | undefined;
    /**
     * List of disbursements for the contractor payment group
     */
    disbursements?: Array<Disbursements> | undefined;
};
/** @internal */
export declare const ContractorPaymentGroupPartnerDisbursementsPaymentMethod$inboundSchema: z.ZodNativeEnum<typeof ContractorPaymentGroupPartnerDisbursementsPaymentMethod>;
/** @internal */
export declare const ContractorPaymentGroupPartnerDisbursementsPaymentStatus$inboundSchema: z.ZodNativeEnum<typeof ContractorPaymentGroupPartnerDisbursementsPaymentStatus>;
/** @internal */
export declare const Disbursements$inboundSchema: z.ZodType<Disbursements, z.ZodTypeDef, unknown>;
export declare function disbursementsFromJSON(jsonString: string): SafeParseResult<Disbursements, SDKValidationError>;
/** @internal */
export declare const ContractorPaymentGroupPartnerDisbursements$inboundSchema: z.ZodType<ContractorPaymentGroupPartnerDisbursements, z.ZodTypeDef, unknown>;
export declare function contractorPaymentGroupPartnerDisbursementsFromJSON(jsonString: string): SafeParseResult<ContractorPaymentGroupPartnerDisbursements, SDKValidationError>;
//# sourceMappingURL=contractorpaymentgrouppartnerdisbursements.d.ts.map