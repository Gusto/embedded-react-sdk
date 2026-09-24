import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
export type PayrollTaxesType = {
    /**
     * The tax name
     */
    name?: string | undefined;
    /**
     * Whether this tax is an employer or employee tax
     */
    employer?: boolean | undefined;
    /**
     * The total tax for the payroll
     */
    amount?: number | undefined;
};
/** @internal */
export declare const PayrollTaxesType$inboundSchema: z.ZodType<PayrollTaxesType, z.ZodTypeDef, unknown>;
export declare function payrollTaxesTypeFromJSON(jsonString: string): SafeParseResult<PayrollTaxesType, SDKValidationError>;
//# sourceMappingURL=payrolltaxestype.d.ts.map