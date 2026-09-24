import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1EmployeesEmployeeIdOnboardingStatusHeaderXGustoAPIVersion, GetV1EmployeesEmployeeIdOnboardingStatusRequest, GetV1EmployeesEmployeeIdOnboardingStatusResponse } from "../models/operations/getv1employeesemployeeidonboardingstatus.js";
export type EmployeesGetOnboardingStatusQueryData = GetV1EmployeesEmployeeIdOnboardingStatusResponse;
export declare function prefetchEmployeesGetOnboardingStatus(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1EmployeesEmployeeIdOnboardingStatusRequest, options?: RequestOptions): Promise<void>;
export declare function buildEmployeesGetOnboardingStatusQuery(client$: GustoEmbeddedCore, request: GetV1EmployeesEmployeeIdOnboardingStatusRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<EmployeesGetOnboardingStatusQueryData>;
};
export declare function queryKeyEmployeesGetOnboardingStatus(employeeId: string, parameters: {
    xGustoAPIVersion?: GetV1EmployeesEmployeeIdOnboardingStatusHeaderXGustoAPIVersion | undefined;
}): QueryKey;
//# sourceMappingURL=employeesGetOnboardingStatus.core.d.ts.map