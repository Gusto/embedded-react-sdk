import { ClientSDK, RequestOptions } from "../lib/sdks.js";
import { GetV1CompanyIndustryRequest, GetV1CompanyIndustryResponse } from "../models/operations/getv1companyindustry.js";
import { PutV1CompanyIndustryRequest, PutV1CompanyIndustryResponse } from "../models/operations/putv1companyindustry.js";
export declare class IndustrySelection extends ClientSDK {
    /**
     * Get a company industry selection
     *
     * @remarks
     * Returns the industry classification for a company, including NAICS code, SIC codes, and industry title.
     *
     * scope: `companies:read`
     */
    get(request: GetV1CompanyIndustryRequest, options?: RequestOptions): Promise<GetV1CompanyIndustryResponse>;
    /**
     * Update a company industry selection
     *
     * @remarks
     * Update the industry classification for a company by passing in a [NAICS code](https://www.naics.com).
     *
     * Optionally provide an industry title and [SIC codes](https://siccode.com/). If you do not provide SIC codes,
     * we will use the NAICS code to perform an internal lookup.
     *
     * Our UI leverages [Middesk API](https://docs.middesk.com/reference/introduction) to determine industry
     * classification codes.
     *
     * scope: `companies:write`
     */
    update(request: PutV1CompanyIndustryRequest, options?: RequestOptions): Promise<PutV1CompanyIndustryResponse>;
}
//# sourceMappingURL=industryselection.d.ts.map