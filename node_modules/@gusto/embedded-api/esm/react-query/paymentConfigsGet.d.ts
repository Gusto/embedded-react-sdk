import { InvalidateQueryFilters, QueryClient, UseQueryResult, UseSuspenseQueryResult } from "@tanstack/react-query";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { GetV1CompanyPaymentConfigsHeaderXGustoAPIVersion, GetV1CompanyPaymentConfigsRequest } from "../models/operations/getv1companypaymentconfigs.js";
import { QueryHookOptions, SuspenseQueryHookOptions, TupleToPrefixes } from "./_types.js";
import { buildPaymentConfigsGetQuery, PaymentConfigsGetQueryData, prefetchPaymentConfigsGet, queryKeyPaymentConfigsGet } from "./paymentConfigsGet.core.js";
export { buildPaymentConfigsGetQuery, type PaymentConfigsGetQueryData, prefetchPaymentConfigsGet, queryKeyPaymentConfigsGet, };
export type PaymentConfigsGetQueryError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Get a company's payment configs
 *
 * @remarks
 * Get payment speed configurations for the company: payment speed (1-day, 2-day, or 4-day ACH), fast payment limit, partner-owned disbursement setting, and earned fast ACH blockers when applicable. 1-day is only available to partners that opt in.
 *
 * ### Related guides
 * - [Payroll Processing Speeds](doc:2-day-vs-4-day)
 *
 * scope: `company_payment_configs:read`
 */
export declare function usePaymentConfigsGet(request: GetV1CompanyPaymentConfigsRequest, options?: QueryHookOptions<PaymentConfigsGetQueryData, PaymentConfigsGetQueryError>): UseQueryResult<PaymentConfigsGetQueryData, PaymentConfigsGetQueryError>;
/**
 * Get a company's payment configs
 *
 * @remarks
 * Get payment speed configurations for the company: payment speed (1-day, 2-day, or 4-day ACH), fast payment limit, partner-owned disbursement setting, and earned fast ACH blockers when applicable. 1-day is only available to partners that opt in.
 *
 * ### Related guides
 * - [Payroll Processing Speeds](doc:2-day-vs-4-day)
 *
 * scope: `company_payment_configs:read`
 */
export declare function usePaymentConfigsGetSuspense(request: GetV1CompanyPaymentConfigsRequest, options?: SuspenseQueryHookOptions<PaymentConfigsGetQueryData, PaymentConfigsGetQueryError>): UseSuspenseQueryResult<PaymentConfigsGetQueryData, PaymentConfigsGetQueryError>;
export declare function setPaymentConfigsGetData(client: QueryClient, queryKeyBase: [
    companyUuid: string,
    parameters: {
        xGustoAPIVersion?: GetV1CompanyPaymentConfigsHeaderXGustoAPIVersion | undefined;
    }
], data: PaymentConfigsGetQueryData): PaymentConfigsGetQueryData | undefined;
export declare function invalidatePaymentConfigsGet(client: QueryClient, queryKeyBase: TupleToPrefixes<[
    companyUuid: string,
    parameters: {
        xGustoAPIVersion?: GetV1CompanyPaymentConfigsHeaderXGustoAPIVersion | undefined;
    }
]>, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
export declare function invalidateAllPaymentConfigsGet(client: QueryClient, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
//# sourceMappingURL=paymentConfigsGet.d.ts.map