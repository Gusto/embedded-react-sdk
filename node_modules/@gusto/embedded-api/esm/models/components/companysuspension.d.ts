import * as z from "zod/v3";
import { ClosedEnum } from "../../types/enums.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
/**
 * How Gusto will handle taxes already collected.
 */
export declare const ReconcileTaxMethod: {
    readonly PayTaxes: "pay_taxes";
    readonly RefundTaxes: "refund_taxes";
};
/**
 * How Gusto will handle taxes already collected.
 */
export type ReconcileTaxMethod = ClosedEnum<typeof ReconcileTaxMethod>;
export type TaxRefunds = {
    /**
     * Dollar amount.
     */
    amount?: string | undefined;
    /**
     * What kind of tax this is.
     */
    description?: string | undefined;
};
/**
 * Record representing the suspension of a company's Gusto account.
 */
export type CompanySuspension = {
    /**
     * Unique identifier for this suspension.
     */
    uuid?: string | undefined;
    /**
     * Unique identifier for the company which is suspended.
     */
    companyUuid?: string | undefined;
    /**
     * Date that the suspension took effect.
     */
    effectiveDate?: string | undefined;
    /**
     * Which competitor the company is joining instead. Only required if `reason` is `'switching_provider'`.
     */
    leavingFor?: string | null | undefined;
    /**
     * Explanation for why the company's account was suspended.
     */
    reason?: string | undefined;
    /**
     * How Gusto will handle taxes already collected.
     */
    reconcileTaxMethod?: ReconcileTaxMethod | undefined;
    /**
     * Should Gusto file quarterly tax forms on behalf of the company? The correct answer can depend on why the company is suspending their account, and how taxes are being reconciled.
     *
     * @remarks
     */
    fileQuarterlyForms?: boolean | undefined;
    /**
     * Should Gusto file yearly tax forms on behalf of the company? The correct answer can depend on why the company is suspending their account, and how taxes are being reconciled.
     *
     * @remarks
     */
    fileYearlyForms?: boolean | undefined;
    /**
     * User-supplied comments describing why they are suspending their account.
     */
    comments?: string | null | undefined;
    /**
     * Describes the taxes which are refundable to the company for this suspension. These may be refunded or paid by Gusto depending on the value in `reconcile_tax_method`.
     *
     * @remarks
     */
    taxRefunds?: Array<TaxRefunds> | undefined;
};
/** @internal */
export declare const ReconcileTaxMethod$inboundSchema: z.ZodNativeEnum<typeof ReconcileTaxMethod>;
/** @internal */
export declare const TaxRefunds$inboundSchema: z.ZodType<TaxRefunds, z.ZodTypeDef, unknown>;
export declare function taxRefundsFromJSON(jsonString: string): SafeParseResult<TaxRefunds, SDKValidationError>;
/** @internal */
export declare const CompanySuspension$inboundSchema: z.ZodType<CompanySuspension, z.ZodTypeDef, unknown>;
export declare function companySuspensionFromJSON(jsonString: string): SafeParseResult<CompanySuspension, SDKValidationError>;
//# sourceMappingURL=companysuspension.d.ts.map