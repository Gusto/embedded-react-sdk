import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1EmployeesEmployeeIdFederalTaxesHeaderXGustoAPIVersion, GetV1EmployeesEmployeeIdFederalTaxesRequest, GetV1EmployeesEmployeeIdFederalTaxesResponse } from "../models/operations/getv1employeesemployeeidfederaltaxes.js";
export type EmployeeTaxSetupGetFederalTaxesQueryData = GetV1EmployeesEmployeeIdFederalTaxesResponse;
export declare function prefetchEmployeeTaxSetupGetFederalTaxes(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1EmployeesEmployeeIdFederalTaxesRequest, options?: RequestOptions): Promise<void>;
export declare function buildEmployeeTaxSetupGetFederalTaxesQuery(client$: GustoEmbeddedCore, request: GetV1EmployeesEmployeeIdFederalTaxesRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<EmployeeTaxSetupGetFederalTaxesQueryData>;
};
export declare function queryKeyEmployeeTaxSetupGetFederalTaxes(employeeUuid: string, parameters: {
    xGustoAPIVersion?: GetV1EmployeesEmployeeIdFederalTaxesHeaderXGustoAPIVersion | undefined;
}): QueryKey;
//# sourceMappingURL=employeeTaxSetupGetFederalTaxes.core.d.ts.map