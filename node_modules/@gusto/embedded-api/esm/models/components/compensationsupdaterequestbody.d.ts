import * as z from "zod/v3";
import { ClosedEnum } from "../../types/enums.js";
import { FlsaStatusType } from "./flsastatustype.js";
/**
 * The unit accompanying the compensation rate. If the employee is an owner, rate should be 'Paycheck'.
 */
export declare const CompensationsUpdateRequestBodyPaymentUnit: {
    readonly Hour: "Hour";
    readonly Week: "Week";
    readonly Month: "Month";
    readonly Year: "Year";
    readonly Paycheck: "Paycheck";
};
/**
 * The unit accompanying the compensation rate. If the employee is an owner, rate should be 'Paycheck'.
 */
export type CompensationsUpdateRequestBodyPaymentUnit = ClosedEnum<typeof CompensationsUpdateRequestBodyPaymentUnit>;
export type CompensationsUpdateRequestBodyMinimumWages = {
    /**
     * The UUID of the minimum wage.
     */
    uuid?: string | undefined;
};
/**
 * Request body for updating a compensation.
 */
export type CompensationsUpdateRequestBody = {
    /**
     * The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/idempotency) for information on how to use this field.
     */
    version: string;
    /**
     * The dollar amount paid per payment unit.
     */
    rate?: string | undefined;
    /**
     * The unit accompanying the compensation rate. If the employee is an owner, rate should be 'Paycheck'.
     */
    paymentUnit?: CompensationsUpdateRequestBodyPaymentUnit | undefined;
    /**
     * The FLSA status for this compensation. Salaried ('Exempt') employees are paid a fixed salary every pay period. Salaried with overtime ('Salaried Nonexempt') employees are paid a fixed salary every pay period, and receive overtime pay when applicable. Hourly ('Nonexempt') employees are paid for the hours they work, and receive overtime pay when applicable. Commissioned employees ('Commission Only Exempt') earn wages based only on commission. Commissioned with overtime ('Commission Only Nonexempt') earn wages based on commission, and receive overtime pay when applicable. Owners ('Owner') are employees that own at least twenty percent of the company.
     */
    flsaStatus?: FlsaStatusType | undefined;
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
    minimumWages?: Array<CompensationsUpdateRequestBodyMinimumWages> | undefined;
};
/** @internal */
export declare const CompensationsUpdateRequestBodyPaymentUnit$outboundSchema: z.ZodNativeEnum<typeof CompensationsUpdateRequestBodyPaymentUnit>;
/** @internal */
export type CompensationsUpdateRequestBodyMinimumWages$Outbound = {
    uuid?: string | undefined;
};
/** @internal */
export declare const CompensationsUpdateRequestBodyMinimumWages$outboundSchema: z.ZodType<CompensationsUpdateRequestBodyMinimumWages$Outbound, z.ZodTypeDef, CompensationsUpdateRequestBodyMinimumWages>;
export declare function compensationsUpdateRequestBodyMinimumWagesToJSON(compensationsUpdateRequestBodyMinimumWages: CompensationsUpdateRequestBodyMinimumWages): string;
/** @internal */
export type CompensationsUpdateRequestBody$Outbound = {
    version: string;
    rate?: string | undefined;
    payment_unit?: string | undefined;
    flsa_status?: string | undefined;
    effective_date?: string | undefined;
    title?: string | undefined;
    adjust_for_minimum_wage?: boolean | undefined;
    minimum_wages?: Array<CompensationsUpdateRequestBodyMinimumWages$Outbound> | undefined;
};
/** @internal */
export declare const CompensationsUpdateRequestBody$outboundSchema: z.ZodType<CompensationsUpdateRequestBody$Outbound, z.ZodTypeDef, CompensationsUpdateRequestBody>;
export declare function compensationsUpdateRequestBodyToJSON(compensationsUpdateRequestBody: CompensationsUpdateRequestBody): string;
//# sourceMappingURL=compensationsupdaterequestbody.d.ts.map