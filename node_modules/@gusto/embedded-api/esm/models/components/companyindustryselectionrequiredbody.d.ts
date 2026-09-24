import * as z from "zod/v3";
export type CompanyIndustrySelectionRequiredBody = {
    /**
     * Industry title
     */
    title?: string | null | undefined;
    /**
     * North American Industry Classification System (NAICS) is used to classify businesses with a six digit number based on the primary type of work the business performs.
     */
    naicsCode: string;
    /**
     * A list of Standard Industrial Classification (SIC) codes, which are four digit numbers that categorize the industries that companies belong to based on their business activities. If sic_codes is not passed in, we will perform an internal lookup with `naics_code`.
     */
    sicCodes?: Array<string> | undefined;
};
/** @internal */
export type CompanyIndustrySelectionRequiredBody$Outbound = {
    title?: string | null | undefined;
    naics_code: string;
    sic_codes?: Array<string> | undefined;
};
/** @internal */
export declare const CompanyIndustrySelectionRequiredBody$outboundSchema: z.ZodType<CompanyIndustrySelectionRequiredBody$Outbound, z.ZodTypeDef, CompanyIndustrySelectionRequiredBody>;
export declare function companyIndustrySelectionRequiredBodyToJSON(companyIndustrySelectionRequiredBody: CompanyIndustrySelectionRequiredBody): string;
//# sourceMappingURL=companyindustryselectionrequiredbody.d.ts.map