import { ClientSDK, RequestOptions } from "../lib/sdks.js";
import { GetV1SalaryEstimatesIdRequest, GetV1SalaryEstimatesIdResponse } from "../models/operations/getv1salaryestimatesid.js";
import { GetV1SalaryEstimatesOccupationsRequest, GetV1SalaryEstimatesOccupationsResponse, GetV1SalaryEstimatesOccupationsSecurity } from "../models/operations/getv1salaryestimatesoccupations.js";
import { PostV1EmployeesEmployeeIdSalaryEstimatesRequest, PostV1EmployeesEmployeeIdSalaryEstimatesResponse } from "../models/operations/postv1employeesemployeeidsalaryestimates.js";
import { PostV1SalaryEstimatesUuidAcceptRequest, PostV1SalaryEstimatesUuidAcceptResponse } from "../models/operations/postv1salaryestimatesuuidaccept.js";
import { PutV1SalaryEstimatesIdRequest, PutV1SalaryEstimatesIdResponse } from "../models/operations/putv1salaryestimatesid.js";
export declare class SalaryEstimates extends ClientSDK {
    /**
     * Create a salary estimate for an employee
     *
     * @remarks
     * Create a salary estimate for an employee. This endpoint helps calculate a reasonable salary for S Corp owners based on their occupation, experience level, location, and business revenue.
     *
     * A salary estimate must include:
     * - Annual net revenue of the business
     * - ZIP code for location-based salary data
     * - One or more occupations with experience levels and time percentages (must sum to 100%)
     *
     * Only one in-progress salary estimate can exist per employee at a time. If an in-progress estimate already exists, you must either accept it or use the update endpoint.
     *
     * scope: `salary_estimates:write`
     */
    postV1EmployeesEmployeeIdSalaryEstimates(request: PostV1EmployeesEmployeeIdSalaryEstimatesRequest, options?: RequestOptions): Promise<PostV1EmployeesEmployeeIdSalaryEstimatesResponse>;
    /**
     * Get a salary estimate
     *
     * @remarks
     * Retrieve a salary estimate by its UUID. Returns the estimated salary calculation along with all occupation details, revenue, and location information.
     *
     * scope: `salary_estimates:read`
     */
    getV1SalaryEstimatesId(request: GetV1SalaryEstimatesIdRequest, options?: RequestOptions): Promise<GetV1SalaryEstimatesIdResponse>;
    /**
     * Update a salary estimate
     *
     * @remarks
     * Update an existing salary estimate. You can modify the annual net revenue, ZIP code, and occupations.
     *
     * The salary estimate must not be finalized (accepted). Once accepted, salary estimates become read-only for record-keeping purposes.
     *
     * scope: `salary_estimates:write`
     */
    putV1SalaryEstimatesId(request: PutV1SalaryEstimatesIdRequest, options?: RequestOptions): Promise<PutV1SalaryEstimatesIdResponse>;
    /**
     * Accept a salary estimate
     *
     * @remarks
     * Accept and finalize a salary estimate. This associates the estimate with an employee job and marks it as accepted.
     *
     * Once accepted, the salary estimate becomes read-only for record-keeping purposes. The accepted salary can then be used to set up compensation for the employee.
     *
     * scope: `salary_estimates:write`
     */
    postV1SalaryEstimatesUuidAccept(request: PostV1SalaryEstimatesUuidAcceptRequest, options?: RequestOptions): Promise<PostV1SalaryEstimatesUuidAcceptResponse>;
    /**
     * Search for BLS occupations
     *
     * @remarks
     * Search for Bureau of Labor Statistics (BLS) occupations by name or keyword. This endpoint helps users find the appropriate occupation codes to use when creating or updating salary estimates.
     *
     * Returns a list of matching occupations with their codes, titles, and descriptions.
     *
     * 📘 System Access Authentication
     *
     * This endpoint uses the [Bearer Auth scheme with the system-level access token in the HTTP Authorization header](https://docs.gusto.com/embedded-payroll/docs/system-access)
     *
     * scope: `salary_estimates:read`
     */
    getV1SalaryEstimatesOccupations(security: GetV1SalaryEstimatesOccupationsSecurity, request: GetV1SalaryEstimatesOccupationsRequest, options?: RequestOptions): Promise<GetV1SalaryEstimatesOccupationsResponse>;
}
//# sourceMappingURL=salaryestimates.d.ts.map