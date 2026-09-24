import { ClientSDK, RequestOptions } from "../lib/sdks.js";
import { GetInformationRequestsRequest, GetInformationRequestsResponse } from "../models/operations/getinformationrequests.js";
import { SubmitInformationRequestRequest, SubmitInformationRequestResponse } from "../models/operations/submitinformationrequest.js";
export declare class InformationRequests extends ClientSDK {
    /**
     * Get all information requests for a company
     *
     * @remarks
     * Fetch all information requests for a company.
     *
     * scope: `information_requests:read`
     */
    getInformationRequests(request: GetInformationRequestsRequest, options?: RequestOptions): Promise<GetInformationRequestsResponse>;
    /**
     * Submit information request responses
     *
     * @remarks
     * Submit responses to an information request.
     * Supports both text responses and file uploads (multipart/form-data).
     * Maximum file size: 120MB.
     *
     * scope: `information_requests:write`
     */
    submit(request: SubmitInformationRequestRequest, options?: RequestOptions): Promise<SubmitInformationRequestResponse>;
}
//# sourceMappingURL=informationrequests.d.ts.map