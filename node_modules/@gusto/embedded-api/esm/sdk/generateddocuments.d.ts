import { ClientSDK, RequestOptions } from "../lib/sdks.js";
import { GetV1GeneratedDocumentsDocumentTypeRequestUuidRequest, GetV1GeneratedDocumentsDocumentTypeRequestUuidResponse } from "../models/operations/getv1generateddocumentsdocumenttyperequestuuid.js";
export declare class GeneratedDocuments extends ClientSDK {
    /**
     * Get a generated document
     *
     * @remarks
     * Get a document given the request_uuid. The response will include the generation request's status and urls to the document. A list of urls is returned as certain document types require several urls.
     *
     * scope: `generated_documents:read`
     */
    get(request: GetV1GeneratedDocumentsDocumentTypeRequestUuidRequest, options?: RequestOptions): Promise<GetV1GeneratedDocumentsDocumentTypeRequestUuidResponse>;
}
//# sourceMappingURL=generateddocuments.d.ts.map