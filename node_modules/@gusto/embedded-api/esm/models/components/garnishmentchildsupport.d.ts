import * as z from "zod/v3";
import { ClosedEnum } from "../../types/enums.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
/**
 * How often the agency collects the withholding amount. e.g. $500 monthly -> `Monthly`.
 */
export declare const PaymentPeriod: {
    readonly EveryWeek: "Every week";
    readonly EveryOtherWeek: "Every other week";
    readonly TwicePerMonth: "Twice per month";
    readonly Monthly: "Monthly";
};
/**
 * How often the agency collects the withholding amount. e.g. $500 monthly -> `Monthly`.
 */
export type PaymentPeriod = ClosedEnum<typeof PaymentPeriod>;
/**
 * Additional child support order details
 */
export type GarnishmentChildSupport = {
    /**
     * The two letter state abbreviation for the state issuing the child support order. Agency data is available in the `GET /v1/garnishments/child_support` API.
     */
    state?: string | undefined;
    /**
     * How often the agency collects the withholding amount. e.g. $500 monthly -> `Monthly`.
     */
    paymentPeriod?: PaymentPeriod | undefined;
    /**
     * The FIPS code associated with the state or county agency issuing the child support order. Agency data is available in the `GET /v1/garnishments/child_support` API.
     */
    fipsCode?: string | undefined;
    /**
     * Child Support Enforcement Case Number associated with this child support obligation - required for most states. Agency specific requirements are available in the `GET /v1/garnishments/child_support` API.
     */
    caseNumber?: string | null | undefined;
    /**
     * Order Identifier or Order ID associated with this child support obligation - required for some states. Agency specific requirements are available in the `GET /v1/garnishments/child_support` API.
     */
    orderNumber?: string | null | undefined;
    /**
     * Child Support Enforcement Remittance ID associated with this child support obligation - required for some states. Agency specific requirements are available in the `GET /v1/garnishments/child_support` API.
     */
    remittanceNumber?: string | null | undefined;
};
/** @internal */
export declare const PaymentPeriod$inboundSchema: z.ZodNativeEnum<typeof PaymentPeriod>;
/** @internal */
export declare const PaymentPeriod$outboundSchema: z.ZodNativeEnum<typeof PaymentPeriod>;
/** @internal */
export declare const GarnishmentChildSupport$inboundSchema: z.ZodType<GarnishmentChildSupport, z.ZodTypeDef, unknown>;
/** @internal */
export type GarnishmentChildSupport$Outbound = {
    state?: string | undefined;
    payment_period?: string | undefined;
    fips_code?: string | undefined;
    case_number?: string | null | undefined;
    order_number?: string | null | undefined;
    remittance_number?: string | null | undefined;
};
/** @internal */
export declare const GarnishmentChildSupport$outboundSchema: z.ZodType<GarnishmentChildSupport$Outbound, z.ZodTypeDef, GarnishmentChildSupport>;
export declare function garnishmentChildSupportToJSON(garnishmentChildSupport: GarnishmentChildSupport): string;
export declare function garnishmentChildSupportFromJSON(jsonString: string): SafeParseResult<GarnishmentChildSupport, SDKValidationError>;
//# sourceMappingURL=garnishmentchildsupport.d.ts.map