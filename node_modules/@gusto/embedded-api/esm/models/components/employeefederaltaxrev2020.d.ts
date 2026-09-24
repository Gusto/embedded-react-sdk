import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
/**
 * Federal tax information for employees using the revised 2020 W4 form.
 */
export type EmployeeFederalTaxRev2020 = {
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
    w4DataType: "rev_2020_w4";
    /**
     * It determines which tax return form an individual will use and is an important factor in computing taxable income. One of:
     *
     * @remarks
     * - Single
     * - Married
     * - Head of Household
     * - Exempt from withholding
     */
    filingStatus: string | null;
    /**
     * An employee can request an additional amount to be withheld from each paycheck.
     */
    extraWithholding: string | null;
    /**
     * If there are only two jobs (i.e., you and your spouse each have a job, or you have two), you can set it to true.
     */
    twoJobs: boolean | null;
    /**
     * A dependent is a person other than the taxpayer or spouse who entitles the taxpayer to claim a dependency exemption.
     */
    dependentsAmount: string | null;
    /**
     * Other income amount.
     */
    otherIncome: string | null;
    /**
     * Deductions other than the standard deduction to reduce withholding.
     */
    deductions: string | null;
};
/** @internal */
export declare const EmployeeFederalTaxRev2020$inboundSchema: z.ZodType<EmployeeFederalTaxRev2020, z.ZodTypeDef, unknown>;
export declare function employeeFederalTaxRev2020FromJSON(jsonString: string): SafeParseResult<EmployeeFederalTaxRev2020, SDKValidationError>;
//# sourceMappingURL=employeefederaltaxrev2020.d.ts.map