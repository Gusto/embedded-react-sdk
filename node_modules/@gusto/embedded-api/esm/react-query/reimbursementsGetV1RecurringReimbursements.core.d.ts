import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1RecurringReimbursementsHeaderXGustoAPIVersion, GetV1RecurringReimbursementsRequest, GetV1RecurringReimbursementsResponse } from "../models/operations/getv1recurringreimbursements.js";
export type ReimbursementsGetV1RecurringReimbursementsQueryData = GetV1RecurringReimbursementsResponse;
export declare function prefetchReimbursementsGetV1RecurringReimbursements(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1RecurringReimbursementsRequest, options?: RequestOptions): Promise<void>;
export declare function buildReimbursementsGetV1RecurringReimbursementsQuery(client$: GustoEmbeddedCore, request: GetV1RecurringReimbursementsRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<ReimbursementsGetV1RecurringReimbursementsQueryData>;
};
export declare function queryKeyReimbursementsGetV1RecurringReimbursements(id: string, parameters: {
    xGustoAPIVersion?: GetV1RecurringReimbursementsHeaderXGustoAPIVersion | undefined;
}): QueryKey;
//# sourceMappingURL=reimbursementsGetV1RecurringReimbursements.core.d.ts.map