import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1WorkAddressesWorkAddressUuidHeaderXGustoAPIVersion, GetV1WorkAddressesWorkAddressUuidRequest, GetV1WorkAddressesWorkAddressUuidResponse } from "../models/operations/getv1workaddressesworkaddressuuid.js";
export type EmployeeAddressesRetrieveWorkAddressQueryData = GetV1WorkAddressesWorkAddressUuidResponse;
export declare function prefetchEmployeeAddressesRetrieveWorkAddress(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1WorkAddressesWorkAddressUuidRequest, options?: RequestOptions): Promise<void>;
export declare function buildEmployeeAddressesRetrieveWorkAddressQuery(client$: GustoEmbeddedCore, request: GetV1WorkAddressesWorkAddressUuidRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<EmployeeAddressesRetrieveWorkAddressQueryData>;
};
export declare function queryKeyEmployeeAddressesRetrieveWorkAddress(workAddressUuid: string, parameters: {
    xGustoAPIVersion?: GetV1WorkAddressesWorkAddressUuidHeaderXGustoAPIVersion | undefined;
}): QueryKey;
//# sourceMappingURL=employeeAddressesRetrieveWorkAddress.core.d.ts.map