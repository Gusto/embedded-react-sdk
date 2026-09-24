import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1EmployeesEmployeeIdI9AuthorizationDocumentOptionsHeaderXGustoAPIVersion, GetV1EmployeesEmployeeIdI9AuthorizationDocumentOptionsRequest, GetV1EmployeesEmployeeIdI9AuthorizationDocumentOptionsResponse } from "../models/operations/getv1employeesemployeeidi9authorizationdocumentoptions.js";
export type I9VerificationGetDocumentOptionsQueryData = GetV1EmployeesEmployeeIdI9AuthorizationDocumentOptionsResponse;
export declare function prefetchI9VerificationGetDocumentOptions(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1EmployeesEmployeeIdI9AuthorizationDocumentOptionsRequest, options?: RequestOptions): Promise<void>;
export declare function buildI9VerificationGetDocumentOptionsQuery(client$: GustoEmbeddedCore, request: GetV1EmployeesEmployeeIdI9AuthorizationDocumentOptionsRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<I9VerificationGetDocumentOptionsQueryData>;
};
export declare function queryKeyI9VerificationGetDocumentOptions(employeeId: string, parameters: {
    xGustoAPIVersion?: GetV1EmployeesEmployeeIdI9AuthorizationDocumentOptionsHeaderXGustoAPIVersion | undefined;
}): QueryKey;
//# sourceMappingURL=i9VerificationGetDocumentOptions.core.d.ts.map