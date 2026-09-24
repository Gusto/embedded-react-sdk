import * as z from "zod/v3";
import { ClosedEnum } from "../../types/enums.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
import { GarnishmentChildSupport } from "./garnishmentchildsupport.js";
export declare const GarnishmentType: {
    readonly ChildSupport: "child_support";
    readonly FederalTaxLien: "federal_tax_lien";
    readonly StateTaxLien: "state_tax_lien";
    readonly StudentLoan: "student_loan";
    readonly CreditorGarnishment: "creditor_garnishment";
    readonly FederalLoan: "federal_loan";
    readonly OtherGarnishment: "other_garnishment";
};
export type GarnishmentType = ClosedEnum<typeof GarnishmentType>;
/**
 * Garnishments, or employee deductions, are fixed amounts or percentages deducted from an employee’s pay. They can be deducted a specific number of times or on a recurring basis. Garnishments can also have maximum deductions on a yearly or per-pay-period bases. Common uses for garnishments are court-ordered payments for child support or back taxes. Some companies provide loans to their employees that are repaid via garnishments.
 */
export type Garnishment = {
    /**
     * The UUID of the garnishment in Gusto.
     */
    uuid: string;
    /**
     * The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/idempotency) for information on how to use this field.
     */
    version?: string | undefined;
    /**
     * The UUID of the employee to which this garnishment belongs.
     */
    employeeUuid?: string | undefined;
    /**
     * Whether or not this garnishment is currently active.
     */
    active: boolean;
    /**
     * The amount of the garnishment. Either a percentage or a fixed dollar amount. Represented as a float, e.g. "8.00".
     */
    amount?: string | undefined;
    /**
     * The description of the garnishment.
     */
    description?: string | undefined;
    /**
     * Whether the garnishment is court ordered.
     */
    courtOrdered?: boolean | undefined;
    /**
     * The number of times to apply the garnishment. Ignored if recurring is true.
     */
    times: number | null;
    /**
     * Whether the garnishment should recur indefinitely.
     */
    recurring: boolean;
    /**
     * The maximum deduction per annum. A null value indicates no maximum. Represented as a float, e.g. "200.00".
     */
    annualMaximum: string | null;
    /**
     * A maximum total deduction for the lifetime of this garnishment. A null value indicates no maximum.
     */
    totalAmount: string | null;
    /**
     * The maximum deduction per pay period. A null value indicates no maximum. Represented as a float, e.g. "16.00".
     */
    payPeriodMaximum: string | null;
    /**
     * Whether the amount should be treated as a percentage to be deducted per pay period.
     */
    deductAsPercentage: boolean;
    /**
     * The specific type of garnishment for court ordered garnishments.
     */
    garnishmentType?: GarnishmentType | null | undefined;
    /**
     * Additional child support order details
     */
    childSupport?: GarnishmentChildSupport | null | undefined;
};
/** @internal */
export declare const GarnishmentType$inboundSchema: z.ZodNativeEnum<typeof GarnishmentType>;
/** @internal */
export declare const Garnishment$inboundSchema: z.ZodType<Garnishment, z.ZodTypeDef, unknown>;
export declare function garnishmentFromJSON(jsonString: string): SafeParseResult<Garnishment, SDKValidationError>;
//# sourceMappingURL=garnishment.d.ts.map