import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
import { EmployeeFederalTaxPre2020 } from "./employeefederaltaxpre2020.js";
import { EmployeeFederalTaxRev2020 } from "./employeefederaltaxrev2020.js";
/**
 * Federal tax information for an employee. The response structure varies based on the w4_data_type field.
 */
export type EmployeeFederalTax = EmployeeFederalTaxPre2020 | EmployeeFederalTaxRev2020;
/** @internal */
export declare const EmployeeFederalTax$inboundSchema: z.ZodType<EmployeeFederalTax, z.ZodTypeDef, unknown>;
export declare function employeeFederalTaxFromJSON(jsonString: string): SafeParseResult<EmployeeFederalTax, SDKValidationError>;
//# sourceMappingURL=employeefederaltax.d.ts.map