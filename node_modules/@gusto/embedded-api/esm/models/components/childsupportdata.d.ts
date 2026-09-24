import * as z from "zod/v3";
import { ClosedEnum } from "../../types/enums.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
export type FipsCodes = {
    /**
     * FIPS code for state or county
     */
    code?: string | undefined;
    /**
     * Name of county in the state for the corresponding FIPS code. When `null` the FIPS code applies state wide.
     */
    county?: string | null | undefined;
};
/**
 * A required attribute when creating a garnishment for this state agency. The current values are listed as an enum; though unlikely, values could be added if state agency requirements change in the future.
 */
export declare const ChildSupportDataKey: {
    readonly CaseNumber: "case_number";
    readonly OrderNumber: "order_number";
    readonly RemittanceNumber: "remittance_number";
};
/**
 * A required attribute when creating a garnishment for this state agency. The current values are listed as an enum; though unlikely, values could be added if state agency requirements change in the future.
 */
export type ChildSupportDataKey = ClosedEnum<typeof ChildSupportDataKey>;
export type RequiredAttributes = {
    /**
     * A required attribute when creating a garnishment for this state agency. The current values are listed as an enum; though unlikely, values could be added if state agency requirements change in the future.
     */
    key?: ChildSupportDataKey | undefined;
    /**
     * A human readable name of the attribute, e.g. CSE Case Number
     */
    label?: string | undefined;
};
export type Agencies = {
    /**
     * Two letter state abbreviation
     */
    state?: string | undefined;
    /**
     * Name of state child support agency
     */
    name?: string | undefined;
    /**
     * Specifies if remitting payment to the agency is required outside of Gusto. If true, Gusto includes garnishment amounts for this agency in payroll calculation, but does not debit for or remit payment to the agency automatically. As of September 2024, only garnishments for South Carolina Integrated Child Support Services require manual payment.
     */
    manualPaymentRequired?: boolean | undefined;
    /**
     * FIPS codes for state or county child support orders
     */
    fipsCodes?: Array<FipsCodes> | undefined;
    /**
     * Describes which child support case identifying attributes are required for this agency. While most agencies only require a single identifier, some (e.g. OH) require multiple identifiers.
     */
    requiredAttributes?: Array<RequiredAttributes> | undefined;
};
/**
 * Child Support agency data
 */
export type ChildSupportData = {
    /**
     * State child support agencies
     */
    agencies?: Array<Agencies> | undefined;
};
/** @internal */
export declare const FipsCodes$inboundSchema: z.ZodType<FipsCodes, z.ZodTypeDef, unknown>;
export declare function fipsCodesFromJSON(jsonString: string): SafeParseResult<FipsCodes, SDKValidationError>;
/** @internal */
export declare const ChildSupportDataKey$inboundSchema: z.ZodNativeEnum<typeof ChildSupportDataKey>;
/** @internal */
export declare const RequiredAttributes$inboundSchema: z.ZodType<RequiredAttributes, z.ZodTypeDef, unknown>;
export declare function requiredAttributesFromJSON(jsonString: string): SafeParseResult<RequiredAttributes, SDKValidationError>;
/** @internal */
export declare const Agencies$inboundSchema: z.ZodType<Agencies, z.ZodTypeDef, unknown>;
export declare function agenciesFromJSON(jsonString: string): SafeParseResult<Agencies, SDKValidationError>;
/** @internal */
export declare const ChildSupportData$inboundSchema: z.ZodType<ChildSupportData, z.ZodTypeDef, unknown>;
export declare function childSupportDataFromJSON(jsonString: string): SafeParseResult<ChildSupportData, SDKValidationError>;
//# sourceMappingURL=childsupportdata.d.ts.map