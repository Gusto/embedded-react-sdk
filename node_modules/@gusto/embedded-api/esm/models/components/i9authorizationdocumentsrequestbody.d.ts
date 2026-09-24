import * as z from "zod/v3";
export type Documents = {
    /**
     * The document type. Use the document options endpoint to get the possible values.
     */
    documentType: string;
    /**
     * The document title associated with the document type
     */
    documentTitle: string;
    /**
     * The document's document number
     */
    documentNumber?: string | undefined;
    /**
     * The document's expiration date
     */
    expirationDate?: string | undefined;
    /**
     * The document's issuing authority
     */
    issuingAuthority: string;
};
/**
 * Request body for creating an employee's I-9 authorization verification documents.
 */
export type I9AuthorizationDocumentsRequestBody = {
    /**
     * An array of I-9 verification documents. Every request must contain the complete list of documents for the employee, as previous records are replaced.
     */
    documents: Array<Documents>;
};
/** @internal */
export type Documents$Outbound = {
    document_type: string;
    document_title: string;
    document_number?: string | undefined;
    expiration_date?: string | undefined;
    issuing_authority: string;
};
/** @internal */
export declare const Documents$outboundSchema: z.ZodType<Documents$Outbound, z.ZodTypeDef, Documents>;
export declare function documentsToJSON(documents: Documents): string;
/** @internal */
export type I9AuthorizationDocumentsRequestBody$Outbound = {
    documents: Array<Documents$Outbound>;
};
/** @internal */
export declare const I9AuthorizationDocumentsRequestBody$outboundSchema: z.ZodType<I9AuthorizationDocumentsRequestBody$Outbound, z.ZodTypeDef, I9AuthorizationDocumentsRequestBody>;
export declare function i9AuthorizationDocumentsRequestBodyToJSON(i9AuthorizationDocumentsRequestBody: I9AuthorizationDocumentsRequestBody): string;
//# sourceMappingURL=i9authorizationdocumentsrequestbody.d.ts.map