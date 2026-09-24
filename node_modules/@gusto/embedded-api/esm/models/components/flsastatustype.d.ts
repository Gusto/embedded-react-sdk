import * as z from "zod/v3";
import { ClosedEnum } from "../../types/enums.js";
/**
 * The FLSA status for this compensation. Salaried ('Exempt') employees are paid a fixed salary every pay period. Salaried with overtime ('Salaried Nonexempt') employees are paid a fixed salary every pay period, and receive overtime pay when applicable. Hourly ('Nonexempt') employees are paid for the hours they work, and receive overtime pay when applicable. Commissioned employees ('Commission Only Exempt') earn wages based only on commission. Commissioned with overtime ('Commission Only Nonexempt') earn wages based on commission, and receive overtime pay when applicable. Owners ('Owner') are employees that own at least twenty percent of the company.
 */
export declare const FlsaStatusType: {
    readonly Exempt: "Exempt";
    readonly SalariedNonexempt: "Salaried Nonexempt";
    readonly Nonexempt: "Nonexempt";
    readonly Owner: "Owner";
    readonly CommissionOnlyExempt: "Commission Only Exempt";
    readonly CommissionOnlyNonexempt: "Commission Only Nonexempt";
};
/**
 * The FLSA status for this compensation. Salaried ('Exempt') employees are paid a fixed salary every pay period. Salaried with overtime ('Salaried Nonexempt') employees are paid a fixed salary every pay period, and receive overtime pay when applicable. Hourly ('Nonexempt') employees are paid for the hours they work, and receive overtime pay when applicable. Commissioned employees ('Commission Only Exempt') earn wages based only on commission. Commissioned with overtime ('Commission Only Nonexempt') earn wages based on commission, and receive overtime pay when applicable. Owners ('Owner') are employees that own at least twenty percent of the company.
 */
export type FlsaStatusType = ClosedEnum<typeof FlsaStatusType>;
/** @internal */
export declare const FlsaStatusType$inboundSchema: z.ZodNativeEnum<typeof FlsaStatusType>;
/** @internal */
export declare const FlsaStatusType$outboundSchema: z.ZodNativeEnum<typeof FlsaStatusType>;
//# sourceMappingURL=flsastatustype.d.ts.map