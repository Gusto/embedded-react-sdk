import * as z from "zod/v3";
import { ClosedEnum } from "../../types/enums.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
import { PayrollCreditBlockerType } from "./payrollcreditblockertype.js";
import { PayrollSubmissionBlockerType } from "./payrollsubmissionblockertype.js";
/**
 * The status of the contractor payment group.  Will be `Funded` if all payments that should be funded (i.e. have `Direct Deposit` for payment method) are funded.  A group can have status `Funded` while having associated payments that have status `Unfunded`, i.e. payment with `Check` payment method.
 */
export declare const ContractorPaymentGroupWithBlockersStatus: {
    readonly Unfunded: "Unfunded";
    readonly Funded: "Funded";
};
/**
 * The status of the contractor payment group.  Will be `Funded` if all payments that should be funded (i.e. have `Direct Deposit` for payment method) are funded.  A group can have status `Funded` while having associated payments that have status `Unfunded`, i.e. payment with `Check` payment method.
 */
export type ContractorPaymentGroupWithBlockersStatus = ClosedEnum<typeof ContractorPaymentGroupWithBlockersStatus>;
export type ContractorPaymentGroupWithBlockersTotals = {
    /**
     * The total amount for the group of contractor payments.
     */
    amount?: string | undefined;
    /**
     * The total debit amount for the group of contractor payments. Sum of wage & reimbursement amount.
     */
    debitAmount?: string | undefined;
    /**
     * The total wage amount for the group of contractor payments.
     */
    wageAmount?: string | undefined;
    /**
     * The total reimbursement amount for the group of contractor payments.
     */
    reimbursementAmount?: string | undefined;
    /**
     * The total check amount for the group of contractor payments.
     */
    checkAmount?: string | undefined;
};
/**
 * Contractor payment group with submission and credit blockers, but without individual contractor payments.
 */
export type ContractorPaymentGroupWithBlockers = {
    /**
     * The unique identifier of the contractor payment group.
     */
    uuid?: string | undefined;
    /**
     * The UUID of the company.
     */
    companyUuid?: string | undefined;
    /**
     * The check date of the contractor payment group.
     */
    checkDate?: string | undefined;
    /**
     * The debit date of the contractor payment group.
     */
    debitDate?: string | undefined;
    /**
     * The status of the contractor payment group.  Will be `Funded` if all payments that should be funded (i.e. have `Direct Deposit` for payment method) are funded.  A group can have status `Funded` while having associated payments that have status `Unfunded`, i.e. payment with `Check` payment method.
     */
    status?: ContractorPaymentGroupWithBlockersStatus | undefined;
    /**
     * Token used to make contractor payment group creation idempotent.  Will error if attempting to create a group with a duplicate token.
     */
    creationToken?: string | null | undefined;
    /**
     * Whether the disbursement is partner owned.
     */
    partnerOwnedDisbursement?: boolean | null | undefined;
    /**
     * List of submission blockers for the contractor payment group.
     */
    submissionBlockers?: Array<PayrollSubmissionBlockerType> | undefined;
    /**
     * List of credit blockers for the contractor payment group.
     */
    creditBlockers?: Array<PayrollCreditBlockerType> | undefined;
    totals?: ContractorPaymentGroupWithBlockersTotals | undefined;
};
/** @internal */
export declare const ContractorPaymentGroupWithBlockersStatus$inboundSchema: z.ZodNativeEnum<typeof ContractorPaymentGroupWithBlockersStatus>;
/** @internal */
export declare const ContractorPaymentGroupWithBlockersTotals$inboundSchema: z.ZodType<ContractorPaymentGroupWithBlockersTotals, z.ZodTypeDef, unknown>;
export declare function contractorPaymentGroupWithBlockersTotalsFromJSON(jsonString: string): SafeParseResult<ContractorPaymentGroupWithBlockersTotals, SDKValidationError>;
/** @internal */
export declare const ContractorPaymentGroupWithBlockers$inboundSchema: z.ZodType<ContractorPaymentGroupWithBlockers, z.ZodTypeDef, unknown>;
export declare function contractorPaymentGroupWithBlockersFromJSON(jsonString: string): SafeParseResult<ContractorPaymentGroupWithBlockers, SDKValidationError>;
//# sourceMappingURL=contractorpaymentgroupwithblockers.d.ts.map