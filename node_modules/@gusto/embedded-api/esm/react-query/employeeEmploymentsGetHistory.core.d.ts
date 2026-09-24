import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1EmployeesEmployeeIdEmploymentHistoryHeaderXGustoAPIVersion, GetV1EmployeesEmployeeIdEmploymentHistoryRequest, GetV1EmployeesEmployeeIdEmploymentHistoryResponse } from "../models/operations/getv1employeesemployeeidemploymenthistory.js";
export type EmployeeEmploymentsGetHistoryQueryData = GetV1EmployeesEmployeeIdEmploymentHistoryResponse;
export declare function prefetchEmployeeEmploymentsGetHistory(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1EmployeesEmployeeIdEmploymentHistoryRequest, options?: RequestOptions): Promise<void>;
export declare function buildEmployeeEmploymentsGetHistoryQuery(client$: GustoEmbeddedCore, request: GetV1EmployeesEmployeeIdEmploymentHistoryRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<EmployeeEmploymentsGetHistoryQueryData>;
};
export declare function queryKeyEmployeeEmploymentsGetHistory(employeeId: string, parameters: {
    xGustoAPIVersion?: GetV1EmployeesEmployeeIdEmploymentHistoryHeaderXGustoAPIVersion | undefined;
}): QueryKey;
//# sourceMappingURL=employeeEmploymentsGetHistory.core.d.ts.map