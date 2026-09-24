import { InvalidateQueryFilters, QueryClient, UseQueryResult, UseSuspenseQueryResult } from "@tanstack/react-query";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { GetV1EmployeesEmployeeIdFederalTaxesHeaderXGustoAPIVersion, GetV1EmployeesEmployeeIdFederalTaxesRequest } from "../models/operations/getv1employeesemployeeidfederaltaxes.js";
import { QueryHookOptions, SuspenseQueryHookOptions, TupleToPrefixes } from "./_types.js";
import { buildEmployeeTaxSetupGetFederalTaxesQuery, EmployeeTaxSetupGetFederalTaxesQueryData, prefetchEmployeeTaxSetupGetFederalTaxes, queryKeyEmployeeTaxSetupGetFederalTaxes } from "./employeeTaxSetupGetFederalTaxes.core.js";
export { buildEmployeeTaxSetupGetFederalTaxesQuery, type EmployeeTaxSetupGetFederalTaxesQueryData, prefetchEmployeeTaxSetupGetFederalTaxes, queryKeyEmployeeTaxSetupGetFederalTaxes, };
export type EmployeeTaxSetupGetFederalTaxesQueryError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Get federal taxes for an employee
 *
 * @remarks
 * Returns federal tax information for an employee. The response structure varies based on the w4_data_type (pre_2020_w4 or rev_2020_w4).
 *
 * scope: `employee_federal_taxes:read`
 */
export declare function useEmployeeTaxSetupGetFederalTaxes(request: GetV1EmployeesEmployeeIdFederalTaxesRequest, options?: QueryHookOptions<EmployeeTaxSetupGetFederalTaxesQueryData, EmployeeTaxSetupGetFederalTaxesQueryError>): UseQueryResult<EmployeeTaxSetupGetFederalTaxesQueryData, EmployeeTaxSetupGetFederalTaxesQueryError>;
/**
 * Get federal taxes for an employee
 *
 * @remarks
 * Returns federal tax information for an employee. The response structure varies based on the w4_data_type (pre_2020_w4 or rev_2020_w4).
 *
 * scope: `employee_federal_taxes:read`
 */
export declare function useEmployeeTaxSetupGetFederalTaxesSuspense(request: GetV1EmployeesEmployeeIdFederalTaxesRequest, options?: SuspenseQueryHookOptions<EmployeeTaxSetupGetFederalTaxesQueryData, EmployeeTaxSetupGetFederalTaxesQueryError>): UseSuspenseQueryResult<EmployeeTaxSetupGetFederalTaxesQueryData, EmployeeTaxSetupGetFederalTaxesQueryError>;
export declare function setEmployeeTaxSetupGetFederalTaxesData(client: QueryClient, queryKeyBase: [
    employeeUuid: string,
    parameters: {
        xGustoAPIVersion?: GetV1EmployeesEmployeeIdFederalTaxesHeaderXGustoAPIVersion | undefined;
    }
], data: EmployeeTaxSetupGetFederalTaxesQueryData): EmployeeTaxSetupGetFederalTaxesQueryData | undefined;
export declare function invalidateEmployeeTaxSetupGetFederalTaxes(client: QueryClient, queryKeyBase: TupleToPrefixes<[
    employeeUuid: string,
    parameters: {
        xGustoAPIVersion?: GetV1EmployeesEmployeeIdFederalTaxesHeaderXGustoAPIVersion | undefined;
    }
]>, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
export declare function invalidateAllEmployeeTaxSetupGetFederalTaxes(client: QueryClient, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
//# sourceMappingURL=employeeTaxSetupGetFederalTaxes.d.ts.map