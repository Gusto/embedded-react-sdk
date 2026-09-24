import * as z from "zod/v3";
import { ClosedEnum } from "../../types/enums.js";
import { FlsaStatusType } from "./flsastatustype.js";
/**
 * The unit accompanying the compensation rate. If the employee is an owner, rate should be 'Paycheck'.
 */
export declare const CompensationsRequestBodyPaymentUnit: {
    readonly Hour: "Hour";
    readonly Week: "Week";
    readonly Month: "Month";
    readonly Year: "Year";
    readonly Paycheck: "Paycheck";
};
/**
 * The unit accompanying the compensation rate. If the employee is an owner, rate should be 'Paycheck'.
 */
export type CompensationsRequestBodyPaymentUnit = ClosedEnum<typeof CompensationsRequestBodyPaymentUnit>;
export type CompensationsRequestBodyMinimumWages = {
    /**
     * The UUID of the minimum wage.
     */
    uuid?: string | undefined;
};
/**
 * Request body for creating a compensation.
 */
export type CompensationsRequestBody = {
    /**
     * The dollar amount paid per payment unit.
     */
    rate: string;
    /**
     * The unit accompanying the compensation rate. If the employee is an owner, rate should be 'Paycheck'.
     */
    paymentUnit: CompensationsRequestBodyPaymentUnit;
    /**
     * The FLSA status for this compensation. Salaried ('Exempt') employees are paid a fixed salary every pay period. Salaried with overtime ('Salaried Nonexempt') employees are paid a fixed salary every pay period, and receive overtime pay when applicable. Hourly ('Nonexempt') employees are paid for the hours they work, and receive overtime pay when applicable. Commissioned employees ('Commission Only Exempt') earn wages based only on commission. Commissioned with overtime ('Commission Only Nonexempt') earn wages based on commission, and receive overtime pay when applicable. Owners ('Owner') are employees that own at least twenty percent of the company.
     */
    flsaStatus: FlsaStatusType;
    /**
     * The effective date for this compensation.
     */
    effectiveDate?: string | undefined;
    /**
     * The job title for this compensation.
     */
    title?: string | undefined;
    /**
     * Whether the compensation should be adjusted to minimum wage during payroll calculation.
     */
    adjustForMinimumWage?: boolean | undefined;
    minimumWages?: Array<CompensationsRequestBodyMinimumWages> | undefined;
};
/** @internal */
export declare const CompensationsRequestBodyPaymentUnit$outboundSchema: z.ZodNativeEnum<typeof CompensationsRequestBodyPaymentUnit>;
/** @internal */
export type CompensationsRequestBodyMinimumWages$Outbound = {
    uuid?: string | undefined;
};
/** @internal */
export declare const CompensationsRequestBodyMinimumWages$outboundSchema: z.ZodType<CompensationsRequestBodyMinimumWages$Outbound, z.ZodTypeDef, CompensationsRequestBodyMinimumWages>;
export declare function compensationsRequestBodyMinimumWagesToJSON(compensationsRequestBodyMinimumWages: CompensationsRequestBodyMinimumWages): string;
/** @internal */
export type CompensationsRequestBody$Outbound = {
    rate: string;
    payment_unit: string;
    flsa_status: string;
    effective_date?: string | undefined;
    title?: string | undefined;
    adjust_for_minimum_wage?: boolean | undefined;
    minimum_wages?: Array<CompensationsRequestBodyMinimumWages$Outbound> | undefined;
};
/** @internal */
export declare const CompensationsRequestBody$outboundSchema: z.ZodType<CompensationsRequestBody$Outbound, z.ZodTypeDef, CompensationsRequestBody>;
export declare function compensationsRequestBodyToJSON(compensationsRequestBody: CompensationsRequestBody): string;
//# sourceMappingURL=compensationsrequestbody.d.ts.map