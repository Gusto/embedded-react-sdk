import { InvalidateQueryFilters, QueryClient, UseQueryResult, UseSuspenseQueryResult } from "@tanstack/react-query";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { GetV1CompaniesHeaderXGustoAPIVersion, GetV1CompaniesRequest } from "../models/operations/getv1companies.js";
import { QueryHookOptions, SuspenseQueryHookOptions, TupleToPrefixes } from "./_types.js";
import { buildCompaniesGetQuery, CompaniesGetQueryData, prefetchCompaniesGet, queryKeyCompaniesGet } from "./companiesGet.core.js";
export { buildCompaniesGetQuery, type CompaniesGetQueryData, prefetchCompaniesGet, queryKeyCompaniesGet, };
export type CompaniesGetQueryError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Get a company
 *
 * @remarks
 * Get a company.
 *
 * The employees:read scope is required to return home_address and non-work locations.
 * The company_admin:read scope is required to return primary_payroll_admin.
 * The signatories:read scope is required to return primary_signatory.
 *
 * scope: `companies:read`
 */
export declare function useCompaniesGet(request: GetV1CompaniesRequest, options?: QueryHookOptions<CompaniesGetQueryData, CompaniesGetQueryError>): UseQueryResult<CompaniesGetQueryData, CompaniesGetQueryError>;
/**
 * Get a company
 *
 * @remarks
 * Get a company.
 *
 * The employees:read scope is required to return home_address and non-work locations.
 * The company_admin:read scope is required to return primary_payroll_admin.
 * The signatories:read scope is required to return primary_signatory.
 *
 * scope: `companies:read`
 */
export declare function useCompaniesGetSuspense(request: GetV1CompaniesRequest, options?: SuspenseQueryHookOptions<CompaniesGetQueryData, CompaniesGetQueryError>): UseSuspenseQueryResult<CompaniesGetQueryData, CompaniesGetQueryError>;
export declare function setCompaniesGetData(client: QueryClient, queryKeyBase: [
    companyId: string,
    parameters: {
        xGustoAPIVersion?: GetV1CompaniesHeaderXGustoAPIVersion | undefined;
    }
], data: CompaniesGetQueryData): CompaniesGetQueryData | undefined;
export declare function invalidateCompaniesGet(client: QueryClient, queryKeyBase: TupleToPrefixes<[
    companyId: string,
    parameters: {
        xGustoAPIVersion?: GetV1CompaniesHeaderXGustoAPIVersion | undefined;
    }
]>, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
export declare function invalidateAllCompaniesGet(client: QueryClient, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
//# sourceMappingURL=companiesGet.d.ts.map