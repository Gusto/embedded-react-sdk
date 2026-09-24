import * as z from "zod/v3";
import { ClosedEnum } from "../../types/enums.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
/**
 * Payment speed. READ-ONLY.
 *
 * @remarks
 * - `1-day`: Next-day ACH (only for partners that opt in).
 * - `2-day`: Two-day ACH.
 * - `4-day`: Standard ACH.
 */
export declare const PaymentSpeed: {
    readonly OneMinusDay: "1-day";
    readonly TwoMinusDay: "2-day";
    readonly FourMinusDay: "4-day";
};
/**
 * Payment speed. READ-ONLY.
 *
 * @remarks
 * - `1-day`: Next-day ACH (only for partners that opt in).
 * - `2-day`: Two-day ACH.
 * - `4-day`: Standard ACH.
 */
export type PaymentSpeed = ClosedEnum<typeof PaymentSpeed>;
/**
 * The type of blocker
 */
export declare const BlockerType: {
    readonly MinimumDays: "minimum_days";
    readonly MinimumFundedPayments: "minimum_funded_payments";
};
/**
 * The type of blocker
 */
export type BlockerType = ClosedEnum<typeof BlockerType>;
export type EarnedFastAchBlockers = {
    /**
     * The type of blocker
     */
    blockerType?: BlockerType | undefined;
    /**
     * The threshold needed to unblock
     */
    threshold?: number | undefined;
};
export type PaymentConfigs = {
    /**
     * Company uuid
     */
    companyUuid?: string | undefined;
    /**
     * Partner uuid
     */
    partnerUuid?: string | undefined;
    /**
     * Payment limit for 1-day or 2-day payroll (string representation of decimal).
     */
    fastPaymentLimit?: string | null | undefined;
    /**
     * Payment speed. READ-ONLY.
     *
     * @remarks
     * - `1-day`: Next-day ACH (only for partners that opt in).
     * - `2-day`: Two-day ACH.
     * - `4-day`: Standard ACH.
     */
    paymentSpeed?: PaymentSpeed | undefined;
    /**
     * Whether the company is configured to use the partner-owned disbursement payment rail
     */
    partnerOwnedDisbursement?: boolean | undefined;
    /**
     * Blockers preventing the company from earning fast ACH payments
     */
    earnedFastAchBlockers?: Array<EarnedFastAchBlockers> | undefined;
};
/** @internal */
export declare const PaymentSpeed$inboundSchema: z.ZodNativeEnum<typeof PaymentSpeed>;
/** @internal */
export declare const BlockerType$inboundSchema: z.ZodNativeEnum<typeof BlockerType>;
/** @internal */
export declare const EarnedFastAchBlockers$inboundSchema: z.ZodType<EarnedFastAchBlockers, z.ZodTypeDef, unknown>;
export declare function earnedFastAchBlockersFromJSON(jsonString: string): SafeParseResult<EarnedFastAchBlockers, SDKValidationError>;
/** @internal */
export declare const PaymentConfigs$inboundSchema: z.ZodType<PaymentConfigs, z.ZodTypeDef, unknown>;
export declare function paymentConfigsFromJSON(jsonString: string): SafeParseResult<PaymentConfigs, SDKValidationError>;
//# sourceMappingURL=paymentconfigs.d.ts.map