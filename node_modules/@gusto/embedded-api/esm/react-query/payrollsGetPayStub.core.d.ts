import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1PayrollsPayrollUuidEmployeesEmployeeUuidPayStubHeaderXGustoAPIVersion, GetV1PayrollsPayrollUuidEmployeesEmployeeUuidPayStubRequest, GetV1PayrollsPayrollUuidEmployeesEmployeeUuidPayStubResponse } from "../models/operations/getv1payrollspayrolluuidemployeesemployeeuuidpaystub.js";
export type PayrollsGetPayStubQueryData = GetV1PayrollsPayrollUuidEmployeesEmployeeUuidPayStubResponse;
export declare function prefetchPayrollsGetPayStub(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1PayrollsPayrollUuidEmployeesEmployeeUuidPayStubRequest, options?: RequestOptions): Promise<void>;
export declare function buildPayrollsGetPayStubQuery(client$: GustoEmbeddedCore, request: GetV1PayrollsPayrollUuidEmployeesEmployeeUuidPayStubRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<PayrollsGetPayStubQueryData>;
};
export declare function queryKeyPayrollsGetPayStub(payrollId: string, employeeId: string, parameters: {
    xGustoAPIVersion?: GetV1PayrollsPayrollUuidEmployeesEmployeeUuidPayStubHeaderXGustoAPIVersion | undefined;
}): QueryKey;
//# sourceMappingURL=payrollsGetPayStub.core.d.ts.map