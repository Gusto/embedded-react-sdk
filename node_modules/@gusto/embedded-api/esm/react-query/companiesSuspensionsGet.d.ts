import { InvalidateQueryFilters, QueryClient, UseQueryResult, UseSuspenseQueryResult } from "@tanstack/react-query";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { GetCompaniesCompanyUuidSuspensionsHeaderXGustoAPIVersion, GetCompaniesCompanyUuidSuspensionsRequest } from "../models/operations/getcompaniescompanyuuidsuspensions.js";
import { QueryHookOptions, SuspenseQueryHookOptions, TupleToPrefixes } from "./_types.js";
import { buildCompaniesSuspensionsGetQuery, CompaniesSuspensionsGetQueryData, prefetchCompaniesSuspensionsGet, queryKeyCompaniesSuspensionsGet } from "./companiesSuspensionsGet.core.js";
export { buildCompaniesSuspensionsGetQuery, type CompaniesSuspensionsGetQueryData, prefetchCompaniesSuspensionsGet, queryKeyCompaniesSuspensionsGet, };
export type CompaniesSuspensionsGetQueryError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Get suspensions for this company
 *
 * @remarks
 * Get existing suspension records for this company. A company may have multiple suspension records if they have suspended their Gusto account more than once.
 *
 * >📘 To check if company is already suspended
 * >
 * > To determine if a company is _currently_ suspended, use the `is_suspended` and `company_status` fields in the [Get a company](https://docs.gusto.com/embedded-payroll/reference/get-v1-companies) endpoint.
 *
 * scope: `company_suspensions:read`
 */
export declare function useCompaniesSuspensionsGet(request: GetCompaniesCompanyUuidSuspensionsRequest, options?: QueryHookOptions<CompaniesSuspensionsGetQueryData, CompaniesSuspensionsGetQueryError>): UseQueryResult<CompaniesSuspensionsGetQueryData, CompaniesSuspensionsGetQueryError>;
/**
 * Get suspensions for this company
 *
 * @remarks
 * Get existing suspension records for this company. A company may have multiple suspension records if they have suspended their Gusto account more than once.
 *
 * >📘 To check if company is already suspended
 * >
 * > To determine if a company is _currently_ suspended, use the `is_suspended` and `company_status` fields in the [Get a company](https://docs.gusto.com/embedded-payroll/reference/get-v1-companies) endpoint.
 *
 * scope: `company_suspensions:read`
 */
export declare function useCompaniesSuspensionsGetSuspense(request: GetCompaniesCompanyUuidSuspensionsRequest, options?: SuspenseQueryHookOptions<CompaniesSuspensionsGetQueryData, CompaniesSuspensionsGetQueryError>): UseSuspenseQueryResult<CompaniesSuspensionsGetQueryData, CompaniesSuspensionsGetQueryError>;
export declare function setCompaniesSuspensionsGetData(client: QueryClient, queryKeyBase: [
    companyUuid: string,
    parameters: {
        xGustoAPIVersion?: GetCompaniesCompanyUuidSuspensionsHeaderXGustoAPIVersion | undefined;
    }
], data: CompaniesSuspensionsGetQueryData): CompaniesSuspensionsGetQueryData | undefined;
export declare function invalidateCompaniesSuspensionsGet(client: QueryClient, queryKeyBase: TupleToPrefixes<[
    companyUuid: string,
    parameters: {
        xGustoAPIVersion?: GetCompaniesCompanyUuidSuspensionsHeaderXGustoAPIVersion | undefined;
    }
]>, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
export declare function invalidateAllCompaniesSuspensionsGet(client: QueryClient, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
//# sourceMappingURL=companiesSuspensionsGet.d.ts.map