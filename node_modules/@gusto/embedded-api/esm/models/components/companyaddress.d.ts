import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
/**
 * The representation of a company's address in Gusto.
 */
export type CompanyAddress = {
    street1?: string | undefined;
    street2?: string | null | undefined;
    city?: string | undefined;
    state?: string | undefined;
    zip?: string | undefined;
    country: string;
    /**
     * The status of the location. Inactive locations have been deleted, but may still have historical data associated with them.
     */
    inactive?: boolean | undefined;
    /**
     * The status of the location. Inactive locations have been deleted, but may still have historical data associated with them.
     */
    active?: boolean | undefined;
};
/** @internal */
export declare const CompanyAddress$inboundSchema: z.ZodType<CompanyAddress, z.ZodTypeDef, unknown>;
export declare function companyAddressFromJSON(jsonString: string): SafeParseResult<CompanyAddress, SDKValidationError>;
//# sourceMappingURL=companyaddress.d.ts.map