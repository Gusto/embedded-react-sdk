import * as z from "zod/v3";
import { ClosedEnum } from "../../types/enums.js";
/**
 * Desired payment speed. 1-day is only applicable to partners that opt in.
 */
export declare const PaymentConfigsUpdateRequestPaymentSpeed: {
    readonly OneMinusDay: "1-day";
    readonly TwoMinusDay: "2-day";
    readonly FourMinusDay: "4-day";
};
/**
 * Desired payment speed. 1-day is only applicable to partners that opt in.
 */
export type PaymentConfigsUpdateRequestPaymentSpeed = ClosedEnum<typeof PaymentConfigsUpdateRequestPaymentSpeed>;
export type PaymentConfigsUpdateRequestPaymentConfigs = {
    /**
     * Desired payment speed. 1-day is only applicable to partners that opt in.
     */
    paymentSpeed?: PaymentConfigsUpdateRequestPaymentSpeed | undefined;
    /**
     * Payment limit for 1-day or 2-day payroll (in dollars).
     */
    fastPaymentLimit?: number | null | undefined;
    /**
     * Whether to use the partner-owned disbursement payment rail.
     */
    partnerOwnedDisbursement?: boolean | undefined;
};
/**
 * Request body for updating company payment configs. At least one of payment_speed, fast_payment_limit, or partner_owned_disbursement is required.
 */
export type PaymentConfigsUpdateRequest = {
    paymentConfigs?: PaymentConfigsUpdateRequestPaymentConfigs | undefined;
};
/** @internal */
export declare const PaymentConfigsUpdateRequestPaymentSpeed$outboundSchema: z.ZodNativeEnum<typeof PaymentConfigsUpdateRequestPaymentSpeed>;
/** @internal */
export type PaymentConfigsUpdateRequestPaymentConfigs$Outbound = {
    payment_speed?: string | undefined;
    fast_payment_limit?: number | null | undefined;
    partner_owned_disbursement?: boolean | undefined;
};
/** @internal */
export declare const PaymentConfigsUpdateRequestPaymentConfigs$outboundSchema: z.ZodType<PaymentConfigsUpdateRequestPaymentConfigs$Outbound, z.ZodTypeDef, PaymentConfigsUpdateRequestPaymentConfigs>;
export declare function paymentConfigsUpdateRequestPaymentConfigsToJSON(paymentConfigsUpdateRequestPaymentConfigs: PaymentConfigsUpdateRequestPaymentConfigs): string;
/** @internal */
export type PaymentConfigsUpdateRequest$Outbound = {
    payment_configs?: PaymentConfigsUpdateRequestPaymentConfigs$Outbound | undefined;
};
/** @internal */
export declare const PaymentConfigsUpdateRequest$outboundSchema: z.ZodType<PaymentConfigsUpdateRequest$Outbound, z.ZodTypeDef, PaymentConfigsUpdateRequest>;
export declare function paymentConfigsUpdateRequestToJSON(paymentConfigsUpdateRequest: PaymentConfigsUpdateRequest): string;
//# sourceMappingURL=paymentconfigsupdaterequest.d.ts.map