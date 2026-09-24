import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
/**
 * Ytd Benefit Amounts From Different Company
 */
export type YtdBenefitAmountsFromDifferentCompany = {
    /**
     * The unique identifier for this benefit amount record.
     */
    uuid: string;
    /**
     * The benefit type supported by Gusto. See [Benefit Types](https://docs.gusto.com/embedded-payroll/reference/get-v1-benefits) for more information.
     */
    benefitType: number;
    /**
     * The year-to-date employee deduction made outside the current company.
     */
    ytdEmployeeDeductionAmount: string;
    /**
     * The year-to-date company contribution made outside the current company.
     */
    ytdCompanyContributionAmount: string;
};
/** @internal */
export declare const YtdBenefitAmountsFromDifferentCompany$inboundSchema: z.ZodType<YtdBenefitAmountsFromDifferentCompany, z.ZodTypeDef, unknown>;
export declare function ytdBenefitAmountsFromDifferentCompanyFromJSON(jsonString: string): SafeParseResult<YtdBenefitAmountsFromDifferentCompany, SDKValidationError>;
//# sourceMappingURL=ytdbenefitamountsfromdifferentcompany.d.ts.map