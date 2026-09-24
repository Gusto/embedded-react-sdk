import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1PeopleBatchesPeopleBatchUuidHeaderXGustoAPIVersion, GetV1PeopleBatchesPeopleBatchUuidRequest, GetV1PeopleBatchesPeopleBatchUuidResponse } from "../models/operations/getv1peoplebatchespeoplebatchuuid.js";
export type PeopleBatchesGetV1PeopleBatchesPeopleBatchUuidQueryData = GetV1PeopleBatchesPeopleBatchUuidResponse;
export declare function prefetchPeopleBatchesGetV1PeopleBatchesPeopleBatchUuid(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1PeopleBatchesPeopleBatchUuidRequest, options?: RequestOptions): Promise<void>;
export declare function buildPeopleBatchesGetV1PeopleBatchesPeopleBatchUuidQuery(client$: GustoEmbeddedCore, request: GetV1PeopleBatchesPeopleBatchUuidRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<PeopleBatchesGetV1PeopleBatchesPeopleBatchUuidQueryData>;
};
export declare function queryKeyPeopleBatchesGetV1PeopleBatchesPeopleBatchUuid(peopleBatchUuid: string, parameters: {
    xGustoAPIVersion?: GetV1PeopleBatchesPeopleBatchUuidHeaderXGustoAPIVersion | undefined;
}): QueryKey;
//# sourceMappingURL=peopleBatchesGetV1PeopleBatchesPeopleBatchUuid.core.d.ts.map