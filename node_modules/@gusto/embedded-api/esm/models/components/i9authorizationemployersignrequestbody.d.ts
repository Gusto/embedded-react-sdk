import * as z from "zod/v3";
/**
 * Request body for employer signing an employee's Form I-9.
 */
export type I9AuthorizationEmployerSignRequestBody = {
    /**
     * The signature
     */
    signatureText: string;
    /**
     * The signer's job title
     */
    signerTitle: string;
    /**
     * The IP address of the signatory who signed the form. Both IPv4 AND IPv6 are supported. You must provide the IP address with either this parameter OR you can leave out this parameter and set the IP address in the request header using the `x-gusto-client-ip` header instead.
     */
    signedByIpAddress?: string | undefined;
    /**
     * Whether you agree to sign electronically
     */
    agree: boolean;
    /**
     * Any additional notes
     */
    additionalInfo?: string | undefined;
    /**
     * Whether an alternative procedure authorized by DHS to examine documents was used
     */
    altProcedure?: boolean | undefined;
};
/** @internal */
export type I9AuthorizationEmployerSignRequestBody$Outbound = {
    signature_text: string;
    signer_title: string;
    signed_by_ip_address?: string | undefined;
    agree: boolean;
    additional_info?: string | undefined;
    alt_procedure?: boolean | undefined;
};
/** @internal */
export declare const I9AuthorizationEmployerSignRequestBody$outboundSchema: z.ZodType<I9AuthorizationEmployerSignRequestBody$Outbound, z.ZodTypeDef, I9AuthorizationEmployerSignRequestBody>;
export declare function i9AuthorizationEmployerSignRequestBodyToJSON(i9AuthorizationEmployerSignRequestBody: I9AuthorizationEmployerSignRequestBody): string;
//# sourceMappingURL=i9authorizationemployersignrequestbody.d.ts.map