import { InvalidateQueryFilters, QueryClient, UseQueryResult, UseSuspenseQueryResult } from "@tanstack/react-query";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { GetV1CompaniesCompanyIdContractorPaymentContractorPaymentHeaderXGustoAPIVersion, GetV1CompaniesCompanyIdContractorPaymentContractorPaymentRequest } from "../models/operations/getv1companiescompanyidcontractorpaymentcontractorpayment.js";
import { QueryHookOptions, SuspenseQueryHookOptions, TupleToPrefixes } from "./_types.js";
import { buildContractorPaymentsGetQuery, ContractorPaymentsGetQueryData, prefetchContractorPaymentsGet, queryKeyContractorPaymentsGet } from "./contractorPaymentsGet.core.js";
export { buildContractorPaymentsGetQuery, type ContractorPaymentsGetQueryData, prefetchContractorPaymentsGet, queryKeyContractorPaymentsGet, };
export type ContractorPaymentsGetQueryError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Get a single contractor payment
 *
 * @remarks
 * Returns a single contractor payment.
 *
 * scope: `payrolls:read`
 */
export declare function useContractorPaymentsGet(request: GetV1CompaniesCompanyIdContractorPaymentContractorPaymentRequest, options?: QueryHookOptions<ContractorPaymentsGetQueryData, ContractorPaymentsGetQueryError>): UseQueryResult<ContractorPaymentsGetQueryData, ContractorPaymentsGetQueryError>;
/**
 * Get a single contractor payment
 *
 * @remarks
 * Returns a single contractor payment.
 *
 * scope: `payrolls:read`
 */
export declare function useContractorPaymentsGetSuspense(request: GetV1CompaniesCompanyIdContractorPaymentContractorPaymentRequest, options?: SuspenseQueryHookOptions<ContractorPaymentsGetQueryData, ContractorPaymentsGetQueryError>): UseSuspenseQueryResult<ContractorPaymentsGetQueryData, ContractorPaymentsGetQueryError>;
export declare function setContractorPaymentsGetData(client: QueryClient, queryKeyBase: [
    companyId: string,
    contractorPaymentId: string,
    parameters: {
        xGustoAPIVersion?: GetV1CompaniesCompanyIdContractorPaymentContractorPaymentHeaderXGustoAPIVersion | undefined;
    }
], data: ContractorPaymentsGetQueryData): ContractorPaymentsGetQueryData | undefined;
export declare function invalidateContractorPaymentsGet(client: QueryClient, queryKeyBase: TupleToPrefixes<[
    companyId: string,
    contractorPaymentId: string,
    parameters: {
        xGustoAPIVersion?: GetV1CompaniesCompanyIdContractorPaymentContractorPaymentHeaderXGustoAPIVersion | undefined;
    }
]>, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
export declare function invalidateAllContractorPaymentsGet(client: QueryClient, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
//# sourceMappingURL=contractorPaymentsGet.d.ts.map