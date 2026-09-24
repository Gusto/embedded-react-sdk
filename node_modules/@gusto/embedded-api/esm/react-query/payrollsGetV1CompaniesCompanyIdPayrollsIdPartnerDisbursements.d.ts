import { InvalidateQueryFilters, QueryClient, UseQueryResult, UseSuspenseQueryResult } from "@tanstack/react-query";
import { GustoEmbeddedError } from "../models/errors/gustoembeddederror.js";
import { ConnectionError, InvalidRequestError, RequestAbortedError, RequestTimeoutError, UnexpectedClientError } from "../models/errors/httpclienterrors.js";
import { NotFoundErrorObject } from "../models/errors/notfounderrorobject.js";
import { ResponseValidationError } from "../models/errors/responsevalidationerror.js";
import { SDKValidationError } from "../models/errors/sdkvalidationerror.js";
import { GetV1CompaniesCompanyIdPayrollsIdPartnerDisbursementsHeaderXGustoAPIVersion, GetV1CompaniesCompanyIdPayrollsIdPartnerDisbursementsRequest } from "../models/operations/getv1companiescompanyidpayrollsidpartnerdisbursements.js";
import { QueryHookOptions, SuspenseQueryHookOptions, TupleToPrefixes } from "./_types.js";
import { buildPayrollsGetV1CompaniesCompanyIdPayrollsIdPartnerDisbursementsQuery, PayrollsGetV1CompaniesCompanyIdPayrollsIdPartnerDisbursementsQueryData, prefetchPayrollsGetV1CompaniesCompanyIdPayrollsIdPartnerDisbursements, queryKeyPayrollsGetV1CompaniesCompanyIdPayrollsIdPartnerDisbursements } from "./payrollsGetV1CompaniesCompanyIdPayrollsIdPartnerDisbursements.core.js";
export { buildPayrollsGetV1CompaniesCompanyIdPayrollsIdPartnerDisbursementsQuery, type PayrollsGetV1CompaniesCompanyIdPayrollsIdPartnerDisbursementsQueryData, prefetchPayrollsGetV1CompaniesCompanyIdPayrollsIdPartnerDisbursements, queryKeyPayrollsGetV1CompaniesCompanyIdPayrollsIdPartnerDisbursements, };
export type PayrollsGetV1CompaniesCompanyIdPayrollsIdPartnerDisbursementsQueryError = NotFoundErrorObject | GustoEmbeddedError | ResponseValidationError | ConnectionError | RequestAbortedError | RequestTimeoutError | InvalidRequestError | UnexpectedClientError | SDKValidationError;
/**
 * Get partner disbursements for a payroll
 *
 * @remarks
 * Get partner disbursements for a specific payroll.
 *
 * scope: `partner_disbursements:read`
 */
export declare function usePayrollsGetV1CompaniesCompanyIdPayrollsIdPartnerDisbursements(request: GetV1CompaniesCompanyIdPayrollsIdPartnerDisbursementsRequest, options?: QueryHookOptions<PayrollsGetV1CompaniesCompanyIdPayrollsIdPartnerDisbursementsQueryData, PayrollsGetV1CompaniesCompanyIdPayrollsIdPartnerDisbursementsQueryError>): UseQueryResult<PayrollsGetV1CompaniesCompanyIdPayrollsIdPartnerDisbursementsQueryData, PayrollsGetV1CompaniesCompanyIdPayrollsIdPartnerDisbursementsQueryError>;
/**
 * Get partner disbursements for a payroll
 *
 * @remarks
 * Get partner disbursements for a specific payroll.
 *
 * scope: `partner_disbursements:read`
 */
export declare function usePayrollsGetV1CompaniesCompanyIdPayrollsIdPartnerDisbursementsSuspense(request: GetV1CompaniesCompanyIdPayrollsIdPartnerDisbursementsRequest, options?: SuspenseQueryHookOptions<PayrollsGetV1CompaniesCompanyIdPayrollsIdPartnerDisbursementsQueryData, PayrollsGetV1CompaniesCompanyIdPayrollsIdPartnerDisbursementsQueryError>): UseSuspenseQueryResult<PayrollsGetV1CompaniesCompanyIdPayrollsIdPartnerDisbursementsQueryData, PayrollsGetV1CompaniesCompanyIdPayrollsIdPartnerDisbursementsQueryError>;
export declare function setPayrollsGetV1CompaniesCompanyIdPayrollsIdPartnerDisbursementsData(client: QueryClient, queryKeyBase: [
    companyId: string,
    id: string,
    parameters: {
        xGustoAPIVersion?: GetV1CompaniesCompanyIdPayrollsIdPartnerDisbursementsHeaderXGustoAPIVersion | undefined;
    }
], data: PayrollsGetV1CompaniesCompanyIdPayrollsIdPartnerDisbursementsQueryData): PayrollsGetV1CompaniesCompanyIdPayrollsIdPartnerDisbursementsQueryData | undefined;
export declare function invalidatePayrollsGetV1CompaniesCompanyIdPayrollsIdPartnerDisbursements(client: QueryClient, queryKeyBase: TupleToPrefixes<[
    companyId: string,
    id: string,
    parameters: {
        xGustoAPIVersion?: GetV1CompaniesCompanyIdPayrollsIdPartnerDisbursementsHeaderXGustoAPIVersion | undefined;
    }
]>, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
export declare function invalidateAllPayrollsGetV1CompaniesCompanyIdPayrollsIdPartnerDisbursements(client: QueryClient, filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">): Promise<void>;
//# sourceMappingURL=payrollsGetV1CompaniesCompanyIdPayrollsIdPartnerDisbursements.d.ts.map