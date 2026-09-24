import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1EmployeesEmployeeUuidPayStubsHeaderXGustoAPIVersion, GetV1EmployeesEmployeeUuidPayStubsRequest, GetV1EmployeesEmployeeUuidPayStubsResponse } from "../models/operations/getv1employeesemployeeuuidpaystubs.js";
export type PayrollsGetPayStubsQueryData = GetV1EmployeesEmployeeUuidPayStubsResponse;
export declare function prefetchPayrollsGetPayStubs(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1EmployeesEmployeeUuidPayStubsRequest, options?: RequestOptions): Promise<void>;
export declare function buildPayrollsGetPayStubsQuery(client$: GustoEmbeddedCore, request: GetV1EmployeesEmployeeUuidPayStubsRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<PayrollsGetPayStubsQueryData>;
};
export declare function queryKeyPayrollsGetPayStubs(employeeId: string, parameters: {
    xGustoAPIVersion?: GetV1EmployeesEmployeeUuidPayStubsHeaderXGustoAPIVersion | undefined;
    page?: number | undefined;
    per?: number | undefined;
}): QueryKey;
//# sourceMappingURL=payrollsGetPayStubs.core.d.ts.map