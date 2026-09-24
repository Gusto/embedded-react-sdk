import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
export type PayrollCompanyTaxesType = {
    /**
     * The tax name
     */
    name?: string | undefined;
    /**
     * Whether this tax is an employer or employee tax
     */
    employer?: boolean | undefined;
    /**
     * The amount of this tax for the payroll
     */
    amount?: string | undefined;
};
/** @internal */
export declare const PayrollCompanyTaxesType$inboundSchema: z.ZodType<PayrollCompanyTaxesType, z.ZodTypeDef, unknown>;
export declare function payrollCompanyTaxesTypeFromJSON(jsonString: string): SafeParseResult<PayrollCompanyTaxesType, SDKValidationError>;
//# sourceMappingURL=payrollcompanytaxestype.d.ts.map