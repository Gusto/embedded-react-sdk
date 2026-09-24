import { ClientSDK, RequestOptions } from "../lib/sdks.js";
import { GetCompaniesCompanyUuidWireInRequestUuidRequest, GetCompaniesCompanyUuidWireInRequestUuidResponse } from "../models/operations/getcompaniescompanyuuidwireinrequestuuid.js";
import { GetWireInRequestsWireInRequestUuidRequest, GetWireInRequestsWireInRequestUuidResponse } from "../models/operations/getwireinrequestswireinrequestuuid.js";
import { PutWireInRequestsWireInRequestUuidRequest, PutWireInRequestsWireInRequestUuidResponse } from "../models/operations/putwireinrequestswireinrequestuuid.js";
export declare class WireInRequests extends ClientSDK {
    /**
     * Get a single Wire In Request
     *
     * @remarks
     * Fetch a Wire In Request.
     *
     * scope: `payrolls:read`
     */
    get(request: GetWireInRequestsWireInRequestUuidRequest, options?: RequestOptions): Promise<GetWireInRequestsWireInRequestUuidResponse>;
    /**
     * Submit a wire in request
     *
     * @remarks
     * Submit a wire in request for a payment
     *
     * scope: `payrolls:run`
     */
    submit(request: PutWireInRequestsWireInRequestUuidRequest, options?: RequestOptions): Promise<PutWireInRequestsWireInRequestUuidResponse>;
    /**
     * Get all Wire In Requests for a company
     *
     * @remarks
     * Fetches all Wire In Requests for a company.
     *
     * scope: `payrolls:read`
     */
    list(request: GetCompaniesCompanyUuidWireInRequestUuidRequest, options?: RequestOptions): Promise<GetCompaniesCompanyUuidWireInRequestUuidResponse>;
}
//# sourceMappingURL=wireinrequests.d.ts.map