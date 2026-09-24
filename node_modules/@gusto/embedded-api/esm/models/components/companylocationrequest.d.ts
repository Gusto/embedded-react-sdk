import * as z from "zod/v3";
/**
 * Request body for creating a company location (company address).
 */
export type CompanyLocationRequest = {
    /**
     * Street address line 1.
     */
    street1: string;
    /**
     * Street address line 2.
     */
    street2?: string | null | undefined;
    /**
     * City.
     */
    city: string;
    /**
     * State code (e.g. CA). Must be a valid two-letter state code.
     */
    state: string;
    /**
     * ZIP code. Must be a valid US zip (e.g. 12345 or 12345-6789).
     */
    zip: string;
    /**
     * Country code. Defaults to USA.
     */
    country?: string | undefined;
    /**
     * Phone number. Must be 10 digits.
     */
    phoneNumber: string;
    /**
     * Specify if this location is the company's mailing address.
     */
    mailingAddress?: boolean | undefined;
    /**
     * Specify if this location is the company's filing address.
     */
    filingAddress?: boolean | undefined;
};
/** @internal */
export type CompanyLocationRequest$Outbound = {
    street_1: string;
    street_2?: string | null | undefined;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone_number: string;
    mailing_address?: boolean | undefined;
    filing_address?: boolean | undefined;
};
/** @internal */
export declare const CompanyLocationRequest$outboundSchema: z.ZodType<CompanyLocationRequest$Outbound, z.ZodTypeDef, CompanyLocationRequest>;
export declare function companyLocationRequestToJSON(companyLocationRequest: CompanyLocationRequest): string;
//# sourceMappingURL=companylocationrequest.d.ts.map