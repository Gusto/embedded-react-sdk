import { ClientSDK, RequestOptions } from "../lib/sdks.js";
import { GetEventsRequest, GetEventsResponse, GetEventsSecurity } from "../models/operations/getevents.js";
export declare class Events extends ClientSDK {
    /**
     * Get all events
     *
     * @remarks
     * Fetch all events, going back up to 30 days, that your partner application has the required scopes for. Note that a partner does NOT have to have verified webhook subscriptions in order to utilize this endpoint.
     *
     * 📘 System Access Authentication
     *
     * This endpoint uses the [Bearer Auth scheme with the system-level access token in the HTTP Authorization header](https://docs.gusto.com/embedded-payroll/docs/system-access)
     *
     * scope: `events:read`
     */
    get(security: GetEventsSecurity, request: GetEventsRequest, options?: RequestOptions): Promise<GetEventsResponse>;
}
//# sourceMappingURL=events.d.ts.map