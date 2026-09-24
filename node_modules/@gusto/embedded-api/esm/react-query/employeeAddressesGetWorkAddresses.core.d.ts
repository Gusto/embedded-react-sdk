import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1EmployeesEmployeeIdWorkAddressesHeaderXGustoAPIVersion, GetV1EmployeesEmployeeIdWorkAddressesRequest, GetV1EmployeesEmployeeIdWorkAddressesResponse } from "../models/operations/getv1employeesemployeeidworkaddresses.js";
export type EmployeeAddressesGetWorkAddressesQueryData = GetV1EmployeesEmployeeIdWorkAddressesResponse;
export declare function prefetchEmployeeAddressesGetWorkAddresses(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1EmployeesEmployeeIdWorkAddressesRequest, options?: RequestOptions): Promise<void>;
export declare function buildEmployeeAddressesGetWorkAddressesQuery(client$: GustoEmbeddedCore, request: GetV1EmployeesEmployeeIdWorkAddressesRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<EmployeeAddressesGetWorkAddressesQueryData>;
};
export declare function queryKeyEmployeeAddressesGetWorkAddresses(employeeId: string, parameters: {
    xGustoAPIVersion?: GetV1EmployeesEmployeeIdWorkAddressesHeaderXGustoAPIVersion | undefined;
}): QueryKey;
//# sourceMappingURL=employeeAddressesGetWorkAddresses.core.d.ts.map