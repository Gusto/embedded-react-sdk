import { ClientSDK, RequestOptions } from "../lib/sdks.js";
import { GetV1ContractorDocumentRequest, GetV1ContractorDocumentResponse } from "../models/operations/getv1contractordocument.js";
import { GetV1ContractorDocumentPdfRequest, GetV1ContractorDocumentPdfResponse } from "../models/operations/getv1contractordocumentpdf.js";
import { GetV1ContractorDocumentsRequest, GetV1ContractorDocumentsResponse } from "../models/operations/getv1contractordocuments.js";
import { PutV1ContractorDocumentSignRequest, PutV1ContractorDocumentSignResponse } from "../models/operations/putv1contractordocumentsign.js";
export declare class ContractorDocuments extends ClientSDK {
    /**
     * Get all contractor documents
     *
     * @remarks
     * Get a list of all contractor's documents
     *
     * scope: `contractor_documents:read`
     */
    getAll(request: GetV1ContractorDocumentsRequest, options?: RequestOptions): Promise<GetV1ContractorDocumentsResponse>;
    /**
     * Get a contractor document
     *
     * @remarks
     * Get a contractor document.
     *
     * scope: `contractor_documents:read`
     */
    get(request: GetV1ContractorDocumentRequest, options?: RequestOptions): Promise<GetV1ContractorDocumentResponse>;
    /**
     * Get the contractor document pdf
     *
     * @remarks
     * Get the contractor document pdf.
     *
     * scope: `contractor_documents:read`
     */
    getPdf(request: GetV1ContractorDocumentPdfRequest, options?: RequestOptions): Promise<GetV1ContractorDocumentPdfResponse>;
    /**
     * Sign a contractor document
     *
     * @remarks
     * Sign a contractor document.
     *
     * scope: `contractor_documents:write`
     */
    sign(request: PutV1ContractorDocumentSignRequest, options?: RequestOptions): Promise<PutV1ContractorDocumentSignResponse>;
}
//# sourceMappingURL=contractordocuments.d.ts.map