import { InvalidateQueryFilters, QueryClient, UseQueryResult, UseSuspenseQueryResult } from "@tanstack/react-query";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { GetV1ContractorPaymentGroupsIdPartnerDisbursementsHeaderXGustoAPIVersion, GetV1ContractorPaymentGroupsIdPartnerDisbursementsRequest } from "../models/operations/getv1contractorpaymentgroupsidpartnerdisbursements.js";
import { QueryHookOptions, SuspenseQueryHookOptions, TupleToPrefixes } from "./_types.js";
import { buildContractorPaymentGroupsGetV1ContractorPaymentGroupsIdPartnerDisbursementsQuery, ContractorPaymentGroupsGetV1ContractorPaymentGroupsIdPartnerDisbursementsQueryData, prefetchContractorPaymentGroupsGetV1ContractorPaymentGroupsIdPartnerDisbursements, queryKeyContractorPaymentGroupsGetV1ContractorPaymentGroupsIdPartnerDisbursements } from "./contractorPaymentGroupsGetV1ContractorPaymentGroupsIdPartnerDisbursements.core.js";
export { buildContractorPaymentGroupsGetV1ContractorPaymentGroupsIdPartnerDisbursementsQuery, type ContractorPaymentGroupsGetV1ContractorPaymentGroupsIdPartnerDisbursementsQueryData, prefetchContractorPaymentGroupsGetV1ContractorPaymentGroupsIdPartnerDisbursements, queryKeyContractorPaymentGroupsGetV1ContractorPaymentGroupsIdPartnerDisbursements, };
export type ContractorPaymentGroupsGetV1ContractorPaymentGroupsIdPartnerDisbursementsQueryError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Get partner disbursements for a contractor payment group
 *
 * @remarks
 * Get partner disbursements for a specific contractor payment group.
 *
 * scope: `partner_disbursements:read`
 */
export declare function useContractorPaymentGroupsGetV1ContractorPaymentGroupsIdPartnerDisbursements(request: GetV1ContractorPaymentGroupsIdPartnerDisbursementsRequest, options?: QueryHookOptions<ContractorPaymentGroupsGetV1ContractorPaymentGroupsIdPartnerDisbursementsQueryData, ContractorPaymentGroupsGetV1ContractorPaymentGroupsIdPartnerDisbursementsQueryError>): UseQueryResult<ContractorPaymentGroupsGetV1ContractorPaymentGroupsIdPartnerDisbursementsQueryData, ContractorPaymentGroupsGetV1ContractorPaymentGroupsIdPartnerDisbursementsQueryError>;
/**
 * Get partner disbursements for a contractor payment group
 *
 * @remarks
 * Get partner disbursements for a specific contractor payment group.
 *
 * scope: `partner_disbursements:read`
 */
export declare function useContractorPaymentGroupsGetV1ContractorPaymentGroupsIdPartnerDisbursementsSuspense(request: GetV1ContractorPaymentGroupsIdPartnerDisbursementsRequest, options?: SuspenseQueryHookOptions<ContractorPaymentGroupsGetV1ContractorPaymentGroupsIdPartnerDisbursementsQueryData, ContractorPaymentGroupsGetV1ContractorPaymentGroupsIdPartnerDisbursementsQueryError>): UseSuspenseQueryResult<ContractorPaymentGroupsGetV1ContractorPaymentGroupsIdPartnerDisbursementsQueryData, ContractorPaymentGroupsGetV1ContractorPaymentGroupsIdPartnerDisbursementsQueryError>;
export declare function setContractorPaymentGroupsGetV1ContractorPaymentGroupsIdPartnerDisbursementsData(client: QueryClient, queryKeyBase: [
    id: string,
    parameters: {
        xGustoAPIVersion?: GetV1ContractorPaymentGroupsIdPartnerDisbursementsHeaderXGustoAPIVersion | undefined;
    }
], data: ContractorPaymentGroupsGetV1ContractorPaymentGroupsIdPartnerDisbursementsQueryData): ContractorPaymentGroupsGetV1ContractorPaymentGroupsIdPartnerDisbursementsQueryData | undefined;
export declare function invalidateContractorPaymentGroupsGetV1ContractorPaymentGroupsIdPartnerDisbursements(client: QueryClient, queryKeyBase: TupleToPrefixes<[
    id: string,
    parameters: {
        xGustoAPIVersion?: GetV1ContractorPaymentGroupsIdPartnerDisbursementsHeaderXGustoAPIVersion | undefined;
    }
]>, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
export declare function invalidateAllContractorPaymentGroupsGetV1ContractorPaymentGroupsIdPartnerDisbursements(client: QueryClient, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
//# sourceMappingURL=contractorPaymentGroupsGetV1ContractorPaymentGroupsIdPartnerDisbursements.d.ts.map