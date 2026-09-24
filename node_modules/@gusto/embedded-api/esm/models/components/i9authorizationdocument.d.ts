import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
/**
 * An employee's I-9 verification document
 */
export type I9AuthorizationDocument = {
    /**
     * The UUID of the I-9 verification document
     */
    uuid: string;
    /**
     * The document's document type
     */
    documentType: string;
    /**
     * The document's document title
     */
    documentTitle: string;
    /**
     * The document's expiration date
     */
    expirationDate?: string | null | undefined;
    /**
     * The document's issuing authority
     */
    issuingAuthority: string;
};
/** @internal */
export declare const I9AuthorizationDocument$inboundSchema: z.ZodType<I9AuthorizationDocument, z.ZodTypeDef, unknown>;
export declare function i9AuthorizationDocumentFromJSON(jsonString: string): SafeParseResult<I9AuthorizationDocument, SDKValidationError>;
//# sourceMappingURL=i9authorizationdocument.d.ts.map