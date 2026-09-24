import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
/**
 * Federal tax information for employees using the pre-2020 W4 form.
 */
export type EmployeeFederalTaxPre2020 = {
    /**
     * The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/idempotency) for information on how to use this field.
     */
    version: string;
    /**
     * The UUID of the employee.
     */
    employeeUuid?: string | undefined;
    /**
     * The internal ID of the employee.
     */
    employeeId?: number | undefined;
    /**
     * The internal ID of the company.
     */
    companyId?: number | undefined;
    /**
     * The version of w4 form.
     */
    w4DataType: "pre_2020_w4";
    /**
     * It determines which tax return form an individual will use and is an important factor in computing taxable income. One of:
     *
     * @remarks
     * - Single
     * - Married
     * - Head of Household
     * - Exempt from withholding
     * - Married, but withhold as Single
     */
    filingStatus?: string | null | undefined;
    /**
     * An exemption from paying a certain amount of income tax. May be null when filing_status is "Exempt from withholding".
     */
    federalWithholdingAllowance?: number | null | undefined;
    /**
     * An additional withholding dollar amount.
     */
    additionalWithholding: string;
};
/** @internal */
export declare const EmployeeFederalTaxPre2020$inboundSchema: z.ZodType<EmployeeFederalTaxPre2020, z.ZodTypeDef, unknown>;
export declare function employeeFederalTaxPre2020FromJSON(jsonString: string): SafeParseResult<EmployeeFederalTaxPre2020, SDKValidationError>;
//# sourceMappingURL=employeefederaltaxpre2020.d.ts.map