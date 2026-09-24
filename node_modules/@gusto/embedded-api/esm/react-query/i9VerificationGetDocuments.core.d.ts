import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1EmployeesEmployeeIdI9AuthorizationDocumentsHeaderXGustoAPIVersion, GetV1EmployeesEmployeeIdI9AuthorizationDocumentsRequest, GetV1EmployeesEmployeeIdI9AuthorizationDocumentsResponse } from "../models/operations/getv1employeesemployeeidi9authorizationdocuments.js";
export type I9VerificationGetDocumentsQueryData = GetV1EmployeesEmployeeIdI9AuthorizationDocumentsResponse;
export declare function prefetchI9VerificationGetDocuments(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1EmployeesEmployeeIdI9AuthorizationDocumentsRequest, options?: RequestOptions): Promise<void>;
export declare function buildI9VerificationGetDocumentsQuery(client$: GustoEmbeddedCore, request: GetV1EmployeesEmployeeIdI9AuthorizationDocumentsRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<I9VerificationGetDocumentsQueryData>;
};
export declare function queryKeyI9VerificationGetDocuments(employeeId: string, parameters: {
    xGustoAPIVersion?: GetV1EmployeesEmployeeIdI9AuthorizationDocumentsHeaderXGustoAPIVersion | undefined;
}): QueryKey;
//# sourceMappingURL=i9VerificationGetDocuments.core.d.ts.map