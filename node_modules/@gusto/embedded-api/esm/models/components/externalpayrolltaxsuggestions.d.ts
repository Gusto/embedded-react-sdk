import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
export type TaxSuggestions = {
    /**
     * The ID of the tax.
     */
    taxId?: number | undefined;
    /**
     * Calculated tax amount.
     */
    amount?: string | undefined;
};
/**
 * The representation of an external payroll with minimal information.
 */
export type ExternalPayrollTaxSuggestions = {
    /**
     * The UUID of the employee.
     */
    employeeUuid?: string | undefined;
    /**
     * Possible tax liabilities selections.
     */
    taxSuggestions?: Array<TaxSuggestions> | undefined;
};
/** @internal */
export declare const TaxSuggestions$inboundSchema: z.ZodType<TaxSuggestions, z.ZodTypeDef, unknown>;
export declare function taxSuggestionsFromJSON(jsonString: string): SafeParseResult<TaxSuggestions, SDKValidationError>;
/** @internal */
export declare const ExternalPayrollTaxSuggestions$inboundSchema: z.ZodType<ExternalPayrollTaxSuggestions, z.ZodTypeDef, unknown>;
export declare function externalPayrollTaxSuggestionsFromJSON(jsonString: string): SafeParseResult<ExternalPayrollTaxSuggestions, SDKValidationError>;
//# sourceMappingURL=externalpayrolltaxsuggestions.d.ts.map