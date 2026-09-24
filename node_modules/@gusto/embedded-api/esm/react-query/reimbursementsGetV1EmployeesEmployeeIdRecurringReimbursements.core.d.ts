import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1EmployeesEmployeeIdRecurringReimbursementsHeaderXGustoAPIVersion, GetV1EmployeesEmployeeIdRecurringReimbursementsRequest, GetV1EmployeesEmployeeIdRecurringReimbursementsResponse } from "../models/operations/getv1employeesemployeeidrecurringreimbursements.js";
export type ReimbursementsGetV1EmployeesEmployeeIdRecurringReimbursementsQueryData = GetV1EmployeesEmployeeIdRecurringReimbursementsResponse;
export declare function prefetchReimbursementsGetV1EmployeesEmployeeIdRecurringReimbursements(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1EmployeesEmployeeIdRecurringReimbursementsRequest, options?: RequestOptions): Promise<void>;
export declare function buildReimbursementsGetV1EmployeesEmployeeIdRecurringReimbursementsQuery(client$: GustoEmbeddedCore, request: GetV1EmployeesEmployeeIdRecurringReimbursementsRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<ReimbursementsGetV1EmployeesEmployeeIdRecurringReimbursementsQueryData>;
};
export declare function queryKeyReimbursementsGetV1EmployeesEmployeeIdRecurringReimbursements(employeeId: string, parameters: {
    xGustoAPIVersion?: GetV1EmployeesEmployeeIdRecurringReimbursementsHeaderXGustoAPIVersion | undefined;
    page?: number | undefined;
    per?: number | undefined;
}): QueryKey;
//# sourceMappingURL=reimbursementsGetV1EmployeesEmployeeIdRecurringReimbursements.core.d.ts.map