import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1EmployeesEmployeeIdI9AuthorizationHeaderXGustoAPIVersion, GetV1EmployeesEmployeeIdI9AuthorizationRequest, GetV1EmployeesEmployeeIdI9AuthorizationResponse } from "../models/operations/getv1employeesemployeeidi9authorization.js";
export type I9VerificationGetAuthorizationQueryData = GetV1EmployeesEmployeeIdI9AuthorizationResponse;
export declare function prefetchI9VerificationGetAuthorization(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1EmployeesEmployeeIdI9AuthorizationRequest, options?: RequestOptions): Promise<void>;
export declare function buildI9VerificationGetAuthorizationQuery(client$: GustoEmbeddedCore, request: GetV1EmployeesEmployeeIdI9AuthorizationRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<I9VerificationGetAuthorizationQueryData>;
};
export declare function queryKeyI9VerificationGetAuthorization(employeeId: string, parameters: {
    xGustoAPIVersion?: GetV1EmployeesEmployeeIdI9AuthorizationHeaderXGustoAPIVersion | undefined;
}): QueryKey;
//# sourceMappingURL=i9VerificationGetAuthorization.core.d.ts.map