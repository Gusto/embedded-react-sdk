import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1EmployeesEmployeeIdStateTaxesHeaderXGustoAPIVersion, GetV1EmployeesEmployeeIdStateTaxesRequest, GetV1EmployeesEmployeeIdStateTaxesResponse } from "../models/operations/getv1employeesemployeeidstatetaxes.js";
export type EmployeeTaxSetupGetStateTaxesQueryData = GetV1EmployeesEmployeeIdStateTaxesResponse;
export declare function prefetchEmployeeTaxSetupGetStateTaxes(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1EmployeesEmployeeIdStateTaxesRequest, options?: RequestOptions): Promise<void>;
export declare function buildEmployeeTaxSetupGetStateTaxesQuery(client$: GustoEmbeddedCore, request: GetV1EmployeesEmployeeIdStateTaxesRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<EmployeeTaxSetupGetStateTaxesQueryData>;
};
export declare function queryKeyEmployeeTaxSetupGetStateTaxes(employeeUuid: string, parameters: {
    xGustoAPIVersion?: GetV1EmployeesEmployeeIdStateTaxesHeaderXGustoAPIVersion | undefined;
}): QueryKey;
//# sourceMappingURL=employeeTaxSetupGetStateTaxes.core.d.ts.map