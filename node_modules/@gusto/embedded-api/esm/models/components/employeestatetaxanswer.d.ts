import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
/**
 * The answer to the corresponding question - this may be a string, number, boolean, or null.
 */
export type Value = string | number | boolean;
export type EmployeeStateTaxAnswer = {
    /**
     * The answer to the corresponding question - this may be a string, number, boolean, or null.
     */
    value?: string | number | boolean | null | undefined;
    /**
     * The effective date of the answer - currently always “2010-01-01”.
     */
    validFrom?: string | undefined;
    /**
     * The effective end date of the answer - currently always null.
     */
    validUpTo?: string | null | undefined;
};
/** @internal */
export declare const Value$inboundSchema: z.ZodType<Value, z.ZodTypeDef, unknown>;
export declare function valueFromJSON(jsonString: string): SafeParseResult<Value, SDKValidationError>;
/** @internal */
export declare const EmployeeStateTaxAnswer$inboundSchema: z.ZodType<EmployeeStateTaxAnswer, z.ZodTypeDef, unknown>;
export declare function employeeStateTaxAnswerFromJSON(jsonString: string): SafeParseResult<EmployeeStateTaxAnswer, SDKValidationError>;
//# sourceMappingURL=employeestatetaxanswer.d.ts.map