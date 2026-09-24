import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1EmployeesEmployeeUuidSection603HighEarnerStatusesHeaderXGustoAPIVersion, GetV1EmployeesEmployeeUuidSection603HighEarnerStatusesRequest, GetV1EmployeesEmployeeUuidSection603HighEarnerStatusesResponse } from "../models/operations/getv1employeesemployeeuuidsection603highearnerstatuses.js";
export type EmployeeBenefitsGetV1EmployeesEmployeeUuidSection603HighEarnerStatusesQueryData = GetV1EmployeesEmployeeUuidSection603HighEarnerStatusesResponse;
export declare function prefetchEmployeeBenefitsGetV1EmployeesEmployeeUuidSection603HighEarnerStatuses(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1EmployeesEmployeeUuidSection603HighEarnerStatusesRequest, options?: RequestOptions): Promise<void>;
export declare function buildEmployeeBenefitsGetV1EmployeesEmployeeUuidSection603HighEarnerStatusesQuery(client$: GustoEmbeddedCore, request: GetV1EmployeesEmployeeUuidSection603HighEarnerStatusesRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<EmployeeBenefitsGetV1EmployeesEmployeeUuidSection603HighEarnerStatusesQueryData>;
};
export declare function queryKeyEmployeeBenefitsGetV1EmployeesEmployeeUuidSection603HighEarnerStatuses(employeeUuid: string, parameters: {
    xGustoAPIVersion?: GetV1EmployeesEmployeeUuidSection603HighEarnerStatusesHeaderXGustoAPIVersion | undefined;
}): QueryKey;
//# sourceMappingURL=employeeBenefitsGetV1EmployeesEmployeeUuidSection603HighEarnerStatuses.core.d.ts.map