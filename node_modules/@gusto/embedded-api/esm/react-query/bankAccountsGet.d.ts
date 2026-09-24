import { InvalidateQueryFilters, QueryClient, UseQueryResult, UseSuspenseQueryResult } from "@tanstack/react-query";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { GetV1CompaniesCompanyIdBankAccountsHeaderXGustoAPIVersion, GetV1CompaniesCompanyIdBankAccountsRequest } from "../models/operations/getv1companiescompanyidbankaccounts.js";
import { QueryHookOptions, SuspenseQueryHookOptions, TupleToPrefixes } from "./_types.js";
import { BankAccountsGetQueryData, buildBankAccountsGetQuery, prefetchBankAccountsGet, queryKeyBankAccountsGet } from "./bankAccountsGet.core.js";
export { type BankAccountsGetQueryData, buildBankAccountsGetQuery, prefetchBankAccountsGet, queryKeyBankAccountsGet, };
export type BankAccountsGetQueryError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Get all company bank accounts
 *
 * @remarks
 * Returns company bank accounts. Currently, we only support a single default bank account per company.
 *
 * scope: `company_bank_accounts:read`
 */
export declare function useBankAccountsGet(request: GetV1CompaniesCompanyIdBankAccountsRequest, options?: QueryHookOptions<BankAccountsGetQueryData, BankAccountsGetQueryError>): UseQueryResult<BankAccountsGetQueryData, BankAccountsGetQueryError>;
/**
 * Get all company bank accounts
 *
 * @remarks
 * Returns company bank accounts. Currently, we only support a single default bank account per company.
 *
 * scope: `company_bank_accounts:read`
 */
export declare function useBankAccountsGetSuspense(request: GetV1CompaniesCompanyIdBankAccountsRequest, options?: SuspenseQueryHookOptions<BankAccountsGetQueryData, BankAccountsGetQueryError>): UseSuspenseQueryResult<BankAccountsGetQueryData, BankAccountsGetQueryError>;
export declare function setBankAccountsGetData(client: QueryClient, queryKeyBase: [
    companyId: string,
    parameters: {
        xGustoAPIVersion?: GetV1CompaniesCompanyIdBankAccountsHeaderXGustoAPIVersion | undefined;
    }
], data: BankAccountsGetQueryData): BankAccountsGetQueryData | undefined;
export declare function invalidateBankAccountsGet(client: QueryClient, queryKeyBase: TupleToPrefixes<[
    companyId: string,
    parameters: {
        xGustoAPIVersion?: GetV1CompaniesCompanyIdBankAccountsHeaderXGustoAPIVersion | undefined;
    }
]>, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
export declare function invalidateAllBankAccountsGet(client: QueryClient, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
//# sourceMappingURL=bankAccountsGet.d.ts.map