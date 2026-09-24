import { ClientSDK, RequestOptions } from "../lib/sdks.js";
import { GetV1PeopleBatchesPeopleBatchUuidRequest, GetV1PeopleBatchesPeopleBatchUuidResponse } from "../models/operations/getv1peoplebatchespeoplebatchuuid.js";
import { PostV1CompaniesCompanyIdPeopleBatchesRequest, PostV1CompaniesCompanyIdPeopleBatchesResponse } from "../models/operations/postv1companiescompanyidpeoplebatches.js";
export declare class PeopleBatches extends ClientSDK {
    /**
     * Create a people batch
     *
     * @remarks
     * Creates a batch for bulk employee creation.
     *
     * The batch is processed asynchronously. Use the returned batch UUID to poll for status and results.
     *
     * scope: `people_batches:write`
     */
    postV1CompaniesCompanyIdPeopleBatches(request: PostV1CompaniesCompanyIdPeopleBatchesRequest, options?: RequestOptions): Promise<PostV1CompaniesCompanyIdPeopleBatchesResponse>;
    /**
     * Get a people batch
     *
     * @remarks
     * Returns the status and results of a people batch.
     *
     * Poll this endpoint to check the batch processing status and retrieve results.
     *
     * scope: `people_batches:read`
     */
    getV1PeopleBatchesPeopleBatchUuid(request: GetV1PeopleBatchesPeopleBatchUuidRequest, options?: RequestOptions): Promise<GetV1PeopleBatchesPeopleBatchUuidResponse>;
}
//# sourceMappingURL=peoplebatches.d.ts.map