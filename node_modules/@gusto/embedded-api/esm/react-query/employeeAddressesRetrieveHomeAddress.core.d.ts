import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1HomeAddressesHomeAddressUuidHeaderXGustoAPIVersion, GetV1HomeAddressesHomeAddressUuidRequest, GetV1HomeAddressesHomeAddressUuidResponse } from "../models/operations/getv1homeaddresseshomeaddressuuid.js";
export type EmployeeAddressesRetrieveHomeAddressQueryData = GetV1HomeAddressesHomeAddressUuidResponse;
export declare function prefetchEmployeeAddressesRetrieveHomeAddress(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1HomeAddressesHomeAddressUuidRequest, options?: RequestOptions): Promise<void>;
export declare function buildEmployeeAddressesRetrieveHomeAddressQuery(client$: GustoEmbeddedCore, request: GetV1HomeAddressesHomeAddressUuidRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<EmployeeAddressesRetrieveHomeAddressQueryData>;
};
export declare function queryKeyEmployeeAddressesRetrieveHomeAddress(homeAddressUuid: string, parameters: {
    xGustoAPIVersion?: GetV1HomeAddressesHomeAddressUuidHeaderXGustoAPIVersion | undefined;
}): QueryKey;
//# sourceMappingURL=employeeAddressesRetrieveHomeAddress.core.d.ts.map