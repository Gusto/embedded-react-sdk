import { InvalidateQueryFilters, QueryClient, UseQueryResult, UseSuspenseQueryResult } from "@tanstack/react-query";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { GetV1CompanyIndustryHeaderXGustoAPIVersion, GetV1CompanyIndustryRequest } from "../models/operations/getv1companyindustry.js";
import { QueryHookOptions, SuspenseQueryHookOptions, TupleToPrefixes } from "./_types.js";
import { buildIndustrySelectionGetQuery, IndustrySelectionGetQueryData, prefetchIndustrySelectionGet, queryKeyIndustrySelectionGet } from "./industrySelectionGet.core.js";
export { buildIndustrySelectionGetQuery, type IndustrySelectionGetQueryData, prefetchIndustrySelectionGet, queryKeyIndustrySelectionGet, };
export type IndustrySelectionGetQueryError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Get a company industry selection
 *
 * @remarks
 * Returns the industry classification for a company, including NAICS code, SIC codes, and industry title.
 *
 * scope: `companies:read`
 */
export declare function useIndustrySelectionGet(request: GetV1CompanyIndustryRequest, options?: QueryHookOptions<IndustrySelectionGetQueryData, IndustrySelectionGetQueryError>): UseQueryResult<IndustrySelectionGetQueryData, IndustrySelectionGetQueryError>;
/**
 * Get a company industry selection
 *
 * @remarks
 * Returns the industry classification for a company, including NAICS code, SIC codes, and industry title.
 *
 * scope: `companies:read`
 */
export declare function useIndustrySelectionGetSuspense(request: GetV1CompanyIndustryRequest, options?: SuspenseQueryHookOptions<IndustrySelectionGetQueryData, IndustrySelectionGetQueryError>): UseSuspenseQueryResult<IndustrySelectionGetQueryData, IndustrySelectionGetQueryError>;
export declare function setIndustrySelectionGetData(client: QueryClient, queryKeyBase: [
    companyId: string,
    parameters: {
        xGustoAPIVersion?: GetV1CompanyIndustryHeaderXGustoAPIVersion | undefined;
    }
], data: IndustrySelectionGetQueryData): IndustrySelectionGetQueryData | undefined;
export declare function invalidateIndustrySelectionGet(client: QueryClient, queryKeyBase: TupleToPrefixes<[
    companyId: string,
    parameters: {
        xGustoAPIVersion?: GetV1CompanyIndustryHeaderXGustoAPIVersion | undefined;
    }
]>, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
export declare function invalidateAllIndustrySelectionGet(client: QueryClient, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
//# sourceMappingURL=industrySelectionGet.d.ts.map