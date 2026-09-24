import * as z from "zod/v3";
export type HolidayPayPolicyRequestNewYearsDay = {
    selected?: boolean | undefined;
};
export type HolidayPayPolicyRequestMlkDay = {
    selected?: boolean | undefined;
};
export type HolidayPayPolicyRequestPresidentsDay = {
    selected?: boolean | undefined;
};
export type HolidayPayPolicyRequestMemorialDay = {
    selected?: boolean | undefined;
};
export type HolidayPayPolicyRequestJuneteenth = {
    selected?: boolean | undefined;
};
export type HolidayPayPolicyRequestIndependenceDay = {
    selected?: boolean | undefined;
};
export type HolidayPayPolicyRequestLaborDay = {
    selected?: boolean | undefined;
};
export type HolidayPayPolicyRequestColumbusDay = {
    selected?: boolean | undefined;
};
export type HolidayPayPolicyRequestVeteransDay = {
    selected?: boolean | undefined;
};
export type HolidayPayPolicyRequestThanksgiving = {
    selected?: boolean | undefined;
};
export type HolidayPayPolicyRequestChristmasDay = {
    selected?: boolean | undefined;
};
/**
 * An object containing federal holiday objects, each containing a boolean selected property.
 */
export type HolidayPayPolicyRequestFederalHolidays = {
    newYearsDay?: HolidayPayPolicyRequestNewYearsDay | undefined;
    mlkDay?: HolidayPayPolicyRequestMlkDay | undefined;
    presidentsDay?: HolidayPayPolicyRequestPresidentsDay | undefined;
    memorialDay?: HolidayPayPolicyRequestMemorialDay | undefined;
    juneteenth?: HolidayPayPolicyRequestJuneteenth | undefined;
    independenceDay?: HolidayPayPolicyRequestIndependenceDay | undefined;
    laborDay?: HolidayPayPolicyRequestLaborDay | undefined;
    columbusDay?: HolidayPayPolicyRequestColumbusDay | undefined;
    veteransDay?: HolidayPayPolicyRequestVeteransDay | undefined;
    thanksgiving?: HolidayPayPolicyRequestThanksgiving | undefined;
    christmasDay?: HolidayPayPolicyRequestChristmasDay | undefined;
};
/**
 * Request body for creating or updating a holiday pay policy
 */
export type HolidayPayPolicyRequest = {
    /**
     * An object containing federal holiday objects, each containing a boolean selected property.
     */
    federalHolidays?: HolidayPayPolicyRequestFederalHolidays | undefined;
};
/** @internal */
export type HolidayPayPolicyRequestNewYearsDay$Outbound = {
    selected?: boolean | undefined;
};
/** @internal */
export declare const HolidayPayPolicyRequestNewYearsDay$outboundSchema: z.ZodType<HolidayPayPolicyRequestNewYearsDay$Outbound, z.ZodTypeDef, HolidayPayPolicyRequestNewYearsDay>;
export declare function holidayPayPolicyRequestNewYearsDayToJSON(holidayPayPolicyRequestNewYearsDay: HolidayPayPolicyRequestNewYearsDay): string;
/** @internal */
export type HolidayPayPolicyRequestMlkDay$Outbound = {
    selected?: boolean | undefined;
};
/** @internal */
export declare const HolidayPayPolicyRequestMlkDay$outboundSchema: z.ZodType<HolidayPayPolicyRequestMlkDay$Outbound, z.ZodTypeDef, HolidayPayPolicyRequestMlkDay>;
export declare function holidayPayPolicyRequestMlkDayToJSON(holidayPayPolicyRequestMlkDay: HolidayPayPolicyRequestMlkDay): string;
/** @internal */
export type HolidayPayPolicyRequestPresidentsDay$Outbound = {
    selected?: boolean | undefined;
};
/** @internal */
export declare const HolidayPayPolicyRequestPresidentsDay$outboundSchema: z.ZodType<HolidayPayPolicyRequestPresidentsDay$Outbound, z.ZodTypeDef, HolidayPayPolicyRequestPresidentsDay>;
export declare function holidayPayPolicyRequestPresidentsDayToJSON(holidayPayPolicyRequestPresidentsDay: HolidayPayPolicyRequestPresidentsDay): string;
/** @internal */
export type HolidayPayPolicyRequestMemorialDay$Outbound = {
    selected?: boolean | undefined;
};
/** @internal */
export declare const HolidayPayPolicyRequestMemorialDay$outboundSchema: z.ZodType<HolidayPayPolicyRequestMemorialDay$Outbound, z.ZodTypeDef, HolidayPayPolicyRequestMemorialDay>;
export declare function holidayPayPolicyRequestMemorialDayToJSON(holidayPayPolicyRequestMemorialDay: HolidayPayPolicyRequestMemorialDay): string;
/** @internal */
export type HolidayPayPolicyRequestJuneteenth$Outbound = {
    selected?: boolean | undefined;
};
/** @internal */
export declare const HolidayPayPolicyRequestJuneteenth$outboundSchema: z.ZodType<HolidayPayPolicyRequestJuneteenth$Outbound, z.ZodTypeDef, HolidayPayPolicyRequestJuneteenth>;
export declare function holidayPayPolicyRequestJuneteenthToJSON(holidayPayPolicyRequestJuneteenth: HolidayPayPolicyRequestJuneteenth): string;
/** @internal */
export type HolidayPayPolicyRequestIndependenceDay$Outbound = {
    selected?: boolean | undefined;
};
/** @internal */
export declare const HolidayPayPolicyRequestIndependenceDay$outboundSchema: z.ZodType<HolidayPayPolicyRequestIndependenceDay$Outbound, z.ZodTypeDef, HolidayPayPolicyRequestIndependenceDay>;
export declare function holidayPayPolicyRequestIndependenceDayToJSON(holidayPayPolicyRequestIndependenceDay: HolidayPayPolicyRequestIndependenceDay): string;
/** @internal */
export type HolidayPayPolicyRequestLaborDay$Outbound = {
    selected?: boolean | undefined;
};
/** @internal */
export declare const HolidayPayPolicyRequestLaborDay$outboundSchema: z.ZodType<HolidayPayPolicyRequestLaborDay$Outbound, z.ZodTypeDef, HolidayPayPolicyRequestLaborDay>;
export declare function holidayPayPolicyRequestLaborDayToJSON(holidayPayPolicyRequestLaborDay: HolidayPayPolicyRequestLaborDay): string;
/** @internal */
export type HolidayPayPolicyRequestColumbusDay$Outbound = {
    selected?: boolean | undefined;
};
/** @internal */
export declare const HolidayPayPolicyRequestColumbusDay$outboundSchema: z.ZodType<HolidayPayPolicyRequestColumbusDay$Outbound, z.ZodTypeDef, HolidayPayPolicyRequestColumbusDay>;
export declare function holidayPayPolicyRequestColumbusDayToJSON(holidayPayPolicyRequestColumbusDay: HolidayPayPolicyRequestColumbusDay): string;
/** @internal */
export type HolidayPayPolicyRequestVeteransDay$Outbound = {
    selected?: boolean | undefined;
};
/** @internal */
export declare const HolidayPayPolicyRequestVeteransDay$outboundSchema: z.ZodType<HolidayPayPolicyRequestVeteransDay$Outbound, z.ZodTypeDef, HolidayPayPolicyRequestVeteransDay>;
export declare function holidayPayPolicyRequestVeteransDayToJSON(holidayPayPolicyRequestVeteransDay: HolidayPayPolicyRequestVeteransDay): string;
/** @internal */
export type HolidayPayPolicyRequestThanksgiving$Outbound = {
    selected?: boolean | undefined;
};
/** @internal */
export declare const HolidayPayPolicyRequestThanksgiving$outboundSchema: z.ZodType<HolidayPayPolicyRequestThanksgiving$Outbound, z.ZodTypeDef, HolidayPayPolicyRequestThanksgiving>;
export declare function holidayPayPolicyRequestThanksgivingToJSON(holidayPayPolicyRequestThanksgiving: HolidayPayPolicyRequestThanksgiving): string;
/** @internal */
export type HolidayPayPolicyRequestChristmasDay$Outbound = {
    selected?: boolean | undefined;
};
/** @internal */
export declare const HolidayPayPolicyRequestChristmasDay$outboundSchema: z.ZodType<HolidayPayPolicyRequestChristmasDay$Outbound, z.ZodTypeDef, HolidayPayPolicyRequestChristmasDay>;
export declare function holidayPayPolicyRequestChristmasDayToJSON(holidayPayPolicyRequestChristmasDay: HolidayPayPolicyRequestChristmasDay): string;
/** @internal */
export type HolidayPayPolicyRequestFederalHolidays$Outbound = {
    new_years_day?: HolidayPayPolicyRequestNewYearsDay$Outbound | undefined;
    mlk_day?: HolidayPayPolicyRequestMlkDay$Outbound | undefined;
    presidents_day?: HolidayPayPolicyRequestPresidentsDay$Outbound | undefined;
    memorial_day?: HolidayPayPolicyRequestMemorialDay$Outbound | undefined;
    juneteenth?: HolidayPayPolicyRequestJuneteenth$Outbound | undefined;
    independence_day?: HolidayPayPolicyRequestIndependenceDay$Outbound | undefined;
    labor_day?: HolidayPayPolicyRequestLaborDay$Outbound | undefined;
    columbus_day?: HolidayPayPolicyRequestColumbusDay$Outbound | undefined;
    veterans_day?: HolidayPayPolicyRequestVeteransDay$Outbound | undefined;
    thanksgiving?: HolidayPayPolicyRequestThanksgiving$Outbound | undefined;
    christmas_day?: HolidayPayPolicyRequestChristmasDay$Outbound | undefined;
};
/** @internal */
export declare const HolidayPayPolicyRequestFederalHolidays$outboundSchema: z.ZodType<HolidayPayPolicyRequestFederalHolidays$Outbound, z.ZodTypeDef, HolidayPayPolicyRequestFederalHolidays>;
export declare function holidayPayPolicyRequestFederalHolidaysToJSON(holidayPayPolicyRequestFederalHolidays: HolidayPayPolicyRequestFederalHolidays): string;
/** @internal */
export type HolidayPayPolicyRequest$Outbound = {
    federal_holidays?: HolidayPayPolicyRequestFederalHolidays$Outbound | undefined;
};
/** @internal */
export declare const HolidayPayPolicyRequest$outboundSchema: z.ZodType<HolidayPayPolicyRequest$Outbound, z.ZodTypeDef, HolidayPayPolicyRequest>;
export declare function holidayPayPolicyRequestToJSON(holidayPayPolicyRequest: HolidayPayPolicyRequest): string;
//# sourceMappingURL=holidaypaypolicyrequest.d.ts.map