import { InvalidateQueryFilters, QueryClient, UseQueryResult, UseSuspenseQueryResult } from "@tanstack/react-query";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { GetV1CompaniesCompanyUuidSignatoriesHeaderXGustoAPIVersion, GetV1CompaniesCompanyUuidSignatoriesRequest } from "../models/operations/getv1companiescompanyuuidsignatories.js";
import { QueryHookOptions, SuspenseQueryHookOptions, TupleToPrefixes } from "./_types.js";
import { buildSignatoriesListQuery, prefetchSignatoriesList, queryKeySignatoriesList, SignatoriesListQueryData } from "./signatoriesList.core.js";
export { buildSignatoriesListQuery, prefetchSignatoriesList, queryKeySignatoriesList, type SignatoriesListQueryData, };
export type SignatoriesListQueryError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Get the signatories for a company
 *
 * @remarks
 * Returns the signatories for a company. A company has at most one signatory.
 *
 * ## Related guides
 * - [Signatory Events](doc:signatory-events)
 *
 * scope: `signatories:read`
 */
export declare function useSignatoriesList(request: GetV1CompaniesCompanyUuidSignatoriesRequest, options?: QueryHookOptions<SignatoriesListQueryData, SignatoriesListQueryError>): UseQueryResult<SignatoriesListQueryData, SignatoriesListQueryError>;
/**
 * Get the signatories for a company
 *
 * @remarks
 * Returns the signatories for a company. A company has at most one signatory.
 *
 * ## Related guides
 * - [Signatory Events](doc:signatory-events)
 *
 * scope: `signatories:read`
 */
export declare function useSignatoriesListSuspense(request: GetV1CompaniesCompanyUuidSignatoriesRequest, options?: SuspenseQueryHookOptions<SignatoriesListQueryData, SignatoriesListQueryError>): UseSuspenseQueryResult<SignatoriesListQueryData, SignatoriesListQueryError>;
export declare function setSignatoriesListData(client: QueryClient, queryKeyBase: [
    companyUuid: string,
    parameters: {
        xGustoAPIVersion?: GetV1CompaniesCompanyUuidSignatoriesHeaderXGustoAPIVersion | undefined;
    }
], data: SignatoriesListQueryData): SignatoriesListQueryData | undefined;
export declare function invalidateSignatoriesList(client: QueryClient, queryKeyBase: TupleToPrefixes<[
    companyUuid: string,
    parameters: {
        xGustoAPIVersion?: GetV1CompaniesCompanyUuidSignatoriesHeaderXGustoAPIVersion | undefined;
    }
]>, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
export declare function invalidateAllSignatoriesList(client: QueryClient, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
//# sourceMappingURL=signatoriesList.d.ts.map