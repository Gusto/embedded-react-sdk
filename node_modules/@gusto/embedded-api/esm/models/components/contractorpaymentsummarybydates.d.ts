import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
import { ContractorPayment } from "./contractorpayment.js";
/**
 * The wage and reimbursement totals for all contractor payments within a given time period.
 */
export type ContractorPaymentSummaryByDatesTotal = {
    /**
     * The total reimbursements for contractor payments within a given time period.
     */
    reimbursements?: string | undefined;
    /**
     * The total wages for contractor payments within a given time period.
     */
    wages?: string | undefined;
};
export type ContractorPaymentSummaryByDatesContractorPayments = {
    /**
     * The UUID of the contractor.
     */
    contractorUuid?: string | undefined;
    /**
     * The payment check date.
     */
    checkDate?: string | undefined;
    /**
     * The total reimbursements for the contractor within a given time period.
     */
    reimbursementTotal?: string | undefined;
    /**
     * The total wages for the contractor within a given time period.
     */
    wageTotal?: string | undefined;
    /**
     * The contractor's payments within a given time period.
     */
    payments?: Array<ContractorPayment> | undefined;
};
/**
 * The representation of the summary of contractor payments for a given company in a given time period.
 */
export type ContractorPaymentSummaryByDates = {
    /**
     * The wage and reimbursement totals for all contractor payments within a given time period.
     */
    total?: ContractorPaymentSummaryByDatesTotal | undefined;
    /**
     * The individual contractor payments, within a given time period, grouped by check date.
     */
    contractorPayments?: Array<ContractorPaymentSummaryByDatesContractorPayments> | undefined;
};
/** @internal */
export declare const ContractorPaymentSummaryByDatesTotal$inboundSchema: z.ZodType<ContractorPaymentSummaryByDatesTotal, z.ZodTypeDef, unknown>;
export declare function contractorPaymentSummaryByDatesTotalFromJSON(jsonString: string): SafeParseResult<ContractorPaymentSummaryByDatesTotal, SDKValidationError>;
/** @internal */
export declare const ContractorPaymentSummaryByDatesContractorPayments$inboundSchema: z.ZodType<ContractorPaymentSummaryByDatesContractorPayments, z.ZodTypeDef, unknown>;
export declare function contractorPaymentSummaryByDatesContractorPaymentsFromJSON(jsonString: string): SafeParseResult<ContractorPaymentSummaryByDatesContractorPayments, SDKValidationError>;
/** @internal */
export declare const ContractorPaymentSummaryByDates$inboundSchema: z.ZodType<ContractorPaymentSummaryByDates, z.ZodTypeDef, unknown>;
export declare function contractorPaymentSummaryByDatesFromJSON(jsonString: string): SafeParseResult<ContractorPaymentSummaryByDates, SDKValidationError>;
//# sourceMappingURL=contractorpaymentsummarybydates.d.ts.map