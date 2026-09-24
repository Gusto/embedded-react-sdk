import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1EmployeesEmployeeIdPaymentMethodHeaderXGustoAPIVersion, GetV1EmployeesEmployeeIdPaymentMethodRequest, GetV1EmployeesEmployeeIdPaymentMethodResponse } from "../models/operations/getv1employeesemployeeidpaymentmethod.js";
export type EmployeePaymentMethodGetQueryData = GetV1EmployeesEmployeeIdPaymentMethodResponse;
export declare function prefetchEmployeePaymentMethodGet(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1EmployeesEmployeeIdPaymentMethodRequest, options?: RequestOptions): Promise<void>;
export declare function buildEmployeePaymentMethodGetQuery(client$: GustoEmbeddedCore, request: GetV1EmployeesEmployeeIdPaymentMethodRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<EmployeePaymentMethodGetQueryData>;
};
export declare function queryKeyEmployeePaymentMethodGet(employeeId: string, parameters: {
    xGustoAPIVersion?: GetV1EmployeesEmployeeIdPaymentMethodHeaderXGustoAPIVersion | undefined;
}): QueryKey;
//# sourceMappingURL=employeePaymentMethodGet.core.d.ts.map