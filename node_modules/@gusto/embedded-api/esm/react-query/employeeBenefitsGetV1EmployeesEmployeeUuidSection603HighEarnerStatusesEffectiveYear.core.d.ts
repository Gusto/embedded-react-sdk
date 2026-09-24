import { QueryClient, QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { GustoEmbeddedCore } from "../core.js";
import { RequestOptions } from "../lib/sdks.js";
import { GetV1EmployeesEmployeeUuidSection603HighEarnerStatusesEffectiveYearHeaderXGustoAPIVersion, GetV1EmployeesEmployeeUuidSection603HighEarnerStatusesEffectiveYearRequest, GetV1EmployeesEmployeeUuidSection603HighEarnerStatusesEffectiveYearResponse } from "../models/operations/getv1employeesemployeeuuidsection603highearnerstatuseseffectiveyear.js";
export type EmployeeBenefitsGetV1EmployeesEmployeeUuidSection603HighEarnerStatusesEffectiveYearQueryData = GetV1EmployeesEmployeeUuidSection603HighEarnerStatusesEffectiveYearResponse;
export declare function prefetchEmployeeBenefitsGetV1EmployeesEmployeeUuidSection603HighEarnerStatusesEffectiveYear(queryClient: QueryClient, client$: GustoEmbeddedCore, request: GetV1EmployeesEmployeeUuidSection603HighEarnerStatusesEffectiveYearRequest, options?: RequestOptions): Promise<void>;
export declare function buildEmployeeBenefitsGetV1EmployeesEmployeeUuidSection603HighEarnerStatusesEffectiveYearQuery(client$: GustoEmbeddedCore, request: GetV1EmployeesEmployeeUuidSection603HighEarnerStatusesEffectiveYearRequest, options?: RequestOptions): {
    queryKey: QueryKey;
    queryFn: (context: QueryFunctionContext) => Promise<EmployeeBenefitsGetV1EmployeesEmployeeUuidSection603HighEarnerStatusesEffectiveYearQueryData>;
};
export declare function queryKeyEmployeeBenefitsGetV1EmployeesEmployeeUuidSection603HighEarnerStatusesEffectiveYear(employeeUuid: string, effectiveYear: number, parameters: {
    xGustoAPIVersion?: GetV1EmployeesEmployeeUuidSection603HighEarnerStatusesEffectiveYearHeaderXGustoAPIVersion | undefined;
}): QueryKey;
//# sourceMappingURL=employeeBenefitsGetV1EmployeesEmployeeUuidSection603HighEarnerStatusesEffectiveYear.core.d.ts.map