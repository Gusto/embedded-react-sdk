import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1EmployeesEmployeeIdHomeAddressesHeaderXGustoAPIVersion, GetV1EmployeesEmployeeIdHomeAddressesRequest, GetV1EmployeesEmployeeIdHomeAddressesResponse } from "../models/operations/getv1employeesemployeeidhomeaddresses.js";
export type EmployeeAddressesGetQueryData = GetV1EmployeesEmployeeIdHomeAddressesResponse;
export declare function prefetchEmployeeAddressesGet(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1EmployeesEmployeeIdHomeAddressesRequest, options?: RequestOptions): Promise<void>;
export declare function buildEmployeeAddressesGetQuery(client$: GustoEmbeddedCore, request: GetV1EmployeesEmployeeIdHomeAddressesRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<EmployeeAddressesGetQueryData>;
};
export declare function queryKeyEmployeeAddressesGet(employeeId: string, parameters: {
    xGustoAPIVersion?: GetV1EmployeesEmployeeIdHomeAddressesHeaderXGustoAPIVersion | undefined;
}): QueryKey;
//# sourceMappingURL=employeeAddressesGet.core.d.ts.map