import * as z from "zod/v3";
import { ClosedEnum } from "../../types/enums.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
import { ContractorPaymentForGroup } from "./contractorpaymentforgroup.js";
import { PayrollCreditBlockerType } from "./payrollcreditblockertype.js";
import { PayrollSubmissionBlockerType } from "./payrollsubmissionblockertype.js";
/**
 * The status of the contractor payment group.  Will be `Funded` if all payments that should be funded (i.e. have `Direct Deposit` for payment method) are funded.  A group can have status `Funded` while having associated payments that have status `Unfunded`, i.e. payment with `Check` payment method.
 */
export declare const ContractorPaymentGroupStatus: {
    readonly Unfunded: "Unfunded";
    readonly Funded: "Funded";
};
/**
 * The status of the contractor payment group.  Will be `Funded` if all payments that should be funded (i.e. have `Direct Deposit` for payment method) are funded.  A group can have status `Funded` while having associated payments that have status `Unfunded`, i.e. payment with `Check` payment method.
 */
export type ContractorPaymentGroupStatus = ClosedEnum<typeof ContractorPaymentGroupStatus>;
export type ContractorPaymentGroupTotals = {
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
 * The full contractor payment group, including associated contractor payments.
 */
export type ContractorPaymentGroup = {
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
    status?: ContractorPaymentGroupStatus | undefined;
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
    totals?: ContractorPaymentGroupTotals | undefined;
    contractorPayments?: Array<ContractorPaymentForGroup> | undefined;
};
/** @internal */
export declare const ContractorPaymentGroupStatus$inboundSchema: z.ZodNativeEnum<typeof ContractorPaymentGroupStatus>;
/** @internal */
export declare const ContractorPaymentGroupTotals$inboundSchema: z.ZodType<ContractorPaymentGroupTotals, z.ZodTypeDef, unknown>;
export declare function contractorPaymentGroupTotalsFromJSON(jsonString: string): SafeParseResult<ContractorPaymentGroupTotals, SDKValidationError>;
/** @internal */
export declare const ContractorPaymentGroup$inboundSchema: z.ZodType<ContractorPaymentGroup, z.ZodTypeDef, unknown>;
export declare function contractorPaymentGroupFromJSON(jsonString: string): SafeParseResult<ContractorPaymentGroup, SDKValidationError>;
//# sourceMappingURL=contractorpaymentgroup.d.ts.map