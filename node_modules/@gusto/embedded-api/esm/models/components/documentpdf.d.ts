import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
export type DocumentPdf = {
    /**
     * the UUID of the document
     */
    uuid?: string | undefined;
    /**
     * the URL of the document
     */
    documentUrl?: string | undefined;
};
/** @internal */
export declare const DocumentPdf$inboundSchema: z.ZodType<DocumentPdf, z.ZodTypeDef, unknown>;
export declare function documentPdfFromJSON(jsonString: string): SafeParseResult<DocumentPdf, SDKValidationError>;
//# sourceMappingURL=documentpdf.d.ts.map