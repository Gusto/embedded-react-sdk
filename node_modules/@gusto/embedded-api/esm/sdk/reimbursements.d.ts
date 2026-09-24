import { ClientSDK, RequestOptions } from "../lib/sdks.js";
import { DeleteV1RecurringReimbursementsRequest, DeleteV1RecurringReimbursementsResponse } from "../models/operations/deletev1recurringreimbursements.js";
import { GetV1EmployeesEmployeeIdRecurringReimbursementsRequest, GetV1EmployeesEmployeeIdRecurringReimbursementsResponse } from "../models/operations/getv1employeesemployeeidrecurringreimbursements.js";
import { GetV1RecurringReimbursementsRequest, GetV1RecurringReimbursementsResponse } from "../models/operations/getv1recurringreimbursements.js";
import { PostV1EmployeesEmployeeIdRecurringReimbursementsRequest, PostV1EmployeesEmployeeIdRecurringReimbursementsResponse } from "../models/operations/postv1employeesemployeeidrecurringreimbursements.js";
import { PutV1RecurringReimbursementsRequest, PutV1RecurringReimbursementsResponse } from "../models/operations/putv1recurringreimbursements.js";
export declare class Reimbursements extends ClientSDK {
    /**
     * Get recurring reimbursements for an employee
     *
     * @remarks
     * Get all active recurring reimbursements for an employee.
     *
     * scope: `reimbursements:read`
     */
    getV1EmployeesEmployeeIdRecurringReimbursements(request: GetV1EmployeesEmployeeIdRecurringReimbursementsRequest, options?: RequestOptions): Promise<GetV1EmployeesEmployeeIdRecurringReimbursementsResponse>;
    /**
     * Create a recurring reimbursement
     *
     * @remarks
     * Create a recurring reimbursement for an employee.
     *
     * scope: `reimbursements:write`
     */
    postV1EmployeesEmployeeIdRecurringReimbursements(request: PostV1EmployeesEmployeeIdRecurringReimbursementsRequest, options?: RequestOptions): Promise<PostV1EmployeesEmployeeIdRecurringReimbursementsResponse>;
    /**
     * Get a recurring reimbursement
     *
     * @remarks
     * Get a specific recurring reimbursement.
     *
     * scope: `reimbursements:read`
     */
    getV1RecurringReimbursements(request: GetV1RecurringReimbursementsRequest, options?: RequestOptions): Promise<GetV1RecurringReimbursementsResponse>;
    /**
     * Update a recurring reimbursement
     *
     * @remarks
     * Update a recurring reimbursement.
     *
     * scope: `reimbursements:write`
     */
    putV1RecurringReimbursements(request: PutV1RecurringReimbursementsRequest, options?: RequestOptions): Promise<PutV1RecurringReimbursementsResponse>;
    /**
     * Delete a recurring reimbursement
     *
     * @remarks
     * Delete (soft delete) a recurring reimbursement for an employee.
     *
     * scope: `reimbursements:write`
     */
    deleteV1RecurringReimbursements(request: DeleteV1RecurringReimbursementsRequest, options?: RequestOptions): Promise<DeleteV1RecurringReimbursementsResponse>;
}
//# sourceMappingURL=reimbursements.d.ts.map