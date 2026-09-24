import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
export type NewYearsDay = {
    selected?: boolean | undefined;
    name?: string | undefined;
    date?: string | undefined;
};
export type MlkDay = {
    selected?: boolean | undefined;
    name?: string | undefined;
    date?: string | undefined;
};
export type PresidentsDay = {
    selected?: boolean | undefined;
    name?: string | undefined;
    date?: string | undefined;
};
export type MemorialDay = {
    selected?: boolean | undefined;
    name?: string | undefined;
    date?: string | undefined;
};
export type Juneteenth = {
    selected?: boolean | undefined;
    name?: string | undefined;
    date?: string | undefined;
};
export type IndependenceDay = {
    selected?: boolean | undefined;
    name?: string | undefined;
    date?: string | undefined;
};
export type LaborDay = {
    selected?: boolean | undefined;
    name?: string | undefined;
    date?: string | undefined;
};
export type ColumbusDay = {
    selected?: boolean | undefined;
    name?: string | undefined;
    date?: string | undefined;
};
export type VeteransDay = {
    selected?: boolean | undefined;
    name?: string | undefined;
    date?: string | undefined;
};
export type Thanksgiving = {
    selected?: boolean | undefined;
    name?: string | undefined;
    date?: string | undefined;
};
export type ChristmasDay = {
    selected?: boolean | undefined;
    name?: string | undefined;
    date?: string | undefined;
};
/**
 * List of the eleven supported federal holidays and their details
 */
export type FederalHolidays = {
    newYearsDay?: NewYearsDay | undefined;
    mlkDay?: MlkDay | undefined;
    presidentsDay?: PresidentsDay | undefined;
    memorialDay?: MemorialDay | undefined;
    juneteenth?: Juneteenth | undefined;
    independenceDay?: IndependenceDay | undefined;
    laborDay?: LaborDay | undefined;
    columbusDay?: ColumbusDay | undefined;
    veteransDay?: VeteransDay | undefined;
    thanksgiving?: Thanksgiving | undefined;
    christmasDay?: ChristmasDay | undefined;
};
export type HolidayPayPolicyEmployees = {
    uuid?: string | undefined;
};
/**
 * Representation of a Holiday Pay Policy
 */
export type HolidayPayPolicy = {
    /**
     * The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/versioning#object-layer) for information on how to use this field.
     */
    version: string;
    /**
     * A unique identifier for the company owning the holiday pay policy
     */
    companyUuid: string;
    /**
     * List of the eleven supported federal holidays and their details
     */
    federalHolidays: FederalHolidays;
    /**
     * List of employee uuids under a holiday pay policy
     */
    employees: Array<HolidayPayPolicyEmployees>;
};
/** @internal */
export declare const NewYearsDay$inboundSchema: z.ZodType<NewYearsDay, z.ZodTypeDef, unknown>;
export declare function newYearsDayFromJSON(jsonString: string): SafeParseResult<NewYearsDay, SDKValidationError>;
/** @internal */
export declare const MlkDay$inboundSchema: z.ZodType<MlkDay, z.ZodTypeDef, unknown>;
export declare function mlkDayFromJSON(jsonString: string): SafeParseResult<MlkDay, SDKValidationError>;
/** @internal */
export declare const PresidentsDay$inboundSchema: z.ZodType<PresidentsDay, z.ZodTypeDef, unknown>;
export declare function presidentsDayFromJSON(jsonString: string): SafeParseResult<PresidentsDay, SDKValidationError>;
/** @internal */
export declare const MemorialDay$inboundSchema: z.ZodType<MemorialDay, z.ZodTypeDef, unknown>;
export declare function memorialDayFromJSON(jsonString: string): SafeParseResult<MemorialDay, SDKValidationError>;
/** @internal */
export declare const Juneteenth$inboundSchema: z.ZodType<Juneteenth, z.ZodTypeDef, unknown>;
export declare function juneteenthFromJSON(jsonString: string): SafeParseResult<Juneteenth, SDKValidationError>;
/** @internal */
export declare const IndependenceDay$inboundSchema: z.ZodType<IndependenceDay, z.ZodTypeDef, unknown>;
export declare function independenceDayFromJSON(jsonString: string): SafeParseResult<IndependenceDay, SDKValidationError>;
/** @internal */
export declare const LaborDay$inboundSchema: z.ZodType<LaborDay, z.ZodTypeDef, unknown>;
export declare function laborDayFromJSON(jsonString: string): SafeParseResult<LaborDay, SDKValidationError>;
/** @internal */
export declare const ColumbusDay$inboundSchema: z.ZodType<ColumbusDay, z.ZodTypeDef, unknown>;
export declare function columbusDayFromJSON(jsonString: string): SafeParseResult<ColumbusDay, SDKValidationError>;
/** @internal */
export declare const VeteransDay$inboundSchema: z.ZodType<VeteransDay, z.ZodTypeDef, unknown>;
export declare function veteransDayFromJSON(jsonString: string): SafeParseResult<VeteransDay, SDKValidationError>;
/** @internal */
export declare const Thanksgiving$inboundSchema: z.ZodType<Thanksgiving, z.ZodTypeDef, unknown>;
export declare function thanksgivingFromJSON(jsonString: string): SafeParseResult<Thanksgiving, SDKValidationError>;
/** @internal */
export declare const ChristmasDay$inboundSchema: z.ZodType<ChristmasDay, z.ZodTypeDef, unknown>;
export declare function christmasDayFromJSON(jsonString: string): SafeParseResult<ChristmasDay, SDKValidationError>;
/** @internal */
export declare const FederalHolidays$inboundSchema: z.ZodType<FederalHolidays, z.ZodTypeDef, unknown>;
export declare function federalHolidaysFromJSON(jsonString: string): SafeParseResult<FederalHolidays, SDKValidationError>;
/** @internal */
export declare const HolidayPayPolicyEmployees$inboundSchema: z.ZodType<HolidayPayPolicyEmployees, z.ZodTypeDef, unknown>;
export declare function holidayPayPolicyEmployeesFromJSON(jsonString: string): SafeParseResult<HolidayPayPolicyEmployees, SDKValidationError>;
/** @internal */
export declare const HolidayPayPolicy$inboundSchema: z.ZodType<HolidayPayPolicy, z.ZodTypeDef, unknown>;
export declare function holidayPayPolicyFromJSON(jsonString: string): SafeParseResult<HolidayPayPolicy, SDKValidationError>;
//# sourceMappingURL=holidaypaypolicy.d.ts.map