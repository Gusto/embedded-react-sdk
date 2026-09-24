import { InvalidateQueryFilters, QueryClient, UseQueryResult, UseSuspenseQueryResult } from "@tanstack/react-query";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { GetV1ContractorPaymentGroupsContractorPaymentGroupIdHeaderXGustoAPIVersion, GetV1ContractorPaymentGroupsContractorPaymentGroupIdRequest } from "../models/operations/getv1contractorpaymentgroupscontractorpaymentgroupid.js";
import { QueryHookOptions, SuspenseQueryHookOptions, TupleToPrefixes } from "./_types.js";
import { buildContractorPaymentGroupsGetQuery, ContractorPaymentGroupsGetQueryData, prefetchContractorPaymentGroupsGet, queryKeyContractorPaymentGroupsGet } from "./contractorPaymentGroupsGet.core.js";
export { buildContractorPaymentGroupsGetQuery, type ContractorPaymentGroupsGetQueryData, prefetchContractorPaymentGroupsGet, queryKeyContractorPaymentGroupsGet, };
export type ContractorPaymentGroupsGetQueryError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Get a contractor payment group
 *
 * @remarks
 * Returns a contractor payment group with all associated contractor payments.
 *
 * scope: `payrolls:read`
 */
export declare function useContractorPaymentGroupsGet(request: GetV1ContractorPaymentGroupsContractorPaymentGroupIdRequest, options?: QueryHookOptions<ContractorPaymentGroupsGetQueryData, ContractorPaymentGroupsGetQueryError>): UseQueryResult<ContractorPaymentGroupsGetQueryData, ContractorPaymentGroupsGetQueryError>;
/**
 * Get a contractor payment group
 *
 * @remarks
 * Returns a contractor payment group with all associated contractor payments.
 *
 * scope: `payrolls:read`
 */
export declare function useContractorPaymentGroupsGetSuspense(request: GetV1ContractorPaymentGroupsContractorPaymentGroupIdRequest, options?: SuspenseQueryHookOptions<ContractorPaymentGroupsGetQueryData, ContractorPaymentGroupsGetQueryError>): UseSuspenseQueryResult<ContractorPaymentGroupsGetQueryData, ContractorPaymentGroupsGetQueryError>;
export declare function setContractorPaymentGroupsGetData(client: QueryClient, queryKeyBase: [
    contractorPaymentGroupUuid: string,
    parameters: {
        xGustoAPIVersion?: GetV1ContractorPaymentGroupsContractorPaymentGroupIdHeaderXGustoAPIVersion | undefined;
    }
], data: ContractorPaymentGroupsGetQueryData): ContractorPaymentGroupsGetQueryData | undefined;
export declare function invalidateContractorPaymentGroupsGet(client: QueryClient, queryKeyBase: TupleToPrefixes<[
    contractorPaymentGroupUuid: string,
    parameters: {
        xGustoAPIVersion?: GetV1ContractorPaymentGroupsContractorPaymentGroupIdHeaderXGustoAPIVersion | undefined;
    }
]>, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
export declare function invalidateAllContractorPaymentGroupsGet(client: QueryClient, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
//# sourceMappingURL=contractorPaymentGroupsGet.d.ts.map