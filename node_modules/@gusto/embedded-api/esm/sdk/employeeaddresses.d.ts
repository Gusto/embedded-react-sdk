import { ClientSDK, RequestOptions } from "../lib/sdks.js";
import { DeleteV1HomeAddressesHomeAddressUuidRequest, DeleteV1HomeAddressesHomeAddressUuidResponse } from "../models/operations/deletev1homeaddresseshomeaddressuuid.js";
import { DeleteV1WorkAddressesWorkAddressUuidRequest, DeleteV1WorkAddressesWorkAddressUuidResponse } from "../models/operations/deletev1workaddressesworkaddressuuid.js";
import { GetV1EmployeesEmployeeIdHomeAddressesRequest, GetV1EmployeesEmployeeIdHomeAddressesResponse } from "../models/operations/getv1employeesemployeeidhomeaddresses.js";
import { GetV1EmployeesEmployeeIdWorkAddressesRequest, GetV1EmployeesEmployeeIdWorkAddressesResponse } from "../models/operations/getv1employeesemployeeidworkaddresses.js";
import { GetV1HomeAddressesHomeAddressUuidRequest, GetV1HomeAddressesHomeAddressUuidResponse } from "../models/operations/getv1homeaddresseshomeaddressuuid.js";
import { GetV1WorkAddressesWorkAddressUuidRequest, GetV1WorkAddressesWorkAddressUuidResponse } from "../models/operations/getv1workaddressesworkaddressuuid.js";
import { PostV1EmployeesEmployeeIdHomeAddressesRequest, PostV1EmployeesEmployeeIdHomeAddressesResponse } from "../models/operations/postv1employeesemployeeidhomeaddresses.js";
import { PostV1EmployeesEmployeeIdWorkAddressesRequest, PostV1EmployeesEmployeeIdWorkAddressesResponse } from "../models/operations/postv1employeesemployeeidworkaddresses.js";
import { PutV1HomeAddressesHomeAddressUuidRequest, PutV1HomeAddressesHomeAddressUuidResponse } from "../models/operations/putv1homeaddresseshomeaddressuuid.js";
import { PutV1WorkAddressesWorkAddressUuidRequest, PutV1WorkAddressesWorkAddressUuidResponse } from "../models/operations/putv1workaddressesworkaddressuuid.js";
export declare class EmployeeAddresses extends ClientSDK {
    /**
     * Get an employee's home addresses
     *
     * @remarks
     * The home address of an employee is used to determine certain tax information about them. Addresses are geocoded on create and update to ensure validity.
     *
     * Supports home address effective dating and courtesy withholding.
     *
     * scope: `employees:read`
     */
    get(request: GetV1EmployeesEmployeeIdHomeAddressesRequest, options?: RequestOptions): Promise<GetV1EmployeesEmployeeIdHomeAddressesResponse>;
    /**
     * Create an employee's home address
     *
     * @remarks
     * The home address of an employee is used to determine certain tax information about them. Addresses are geocoded on create and update to ensure validity.
     *
     * Supports home address effective dating and courtesy withholding.
     *
     * scope: `employees:write`
     */
    create(request: PostV1EmployeesEmployeeIdHomeAddressesRequest, options?: RequestOptions): Promise<PostV1EmployeesEmployeeIdHomeAddressesResponse>;
    /**
     * Get an employee's home address
     *
     * @remarks
     * The home address of an employee is used to determine certain tax information about them. Addresses are geocoded on create and update to ensure validity.
     *
     * Supports home address effective dating and courtesy withholding.
     *
     * scope: `employees:read`
     */
    retrieveHomeAddress(request: GetV1HomeAddressesHomeAddressUuidRequest, options?: RequestOptions): Promise<GetV1HomeAddressesHomeAddressUuidResponse>;
    /**
     * Update an employee's home address
     *
     * @remarks
     * The home address of an employee is used to determine certain tax information about them. Addresses are geocoded on create and update to ensure validity.
     *
     * Supports home address effective dating and courtesy withholding.
     *
     * scope: `employees:write`
     */
    update(request: PutV1HomeAddressesHomeAddressUuidRequest, options?: RequestOptions): Promise<PutV1HomeAddressesHomeAddressUuidResponse>;
    /**
     * Delete an employee's home address
     *
     * @remarks
     * Used for deleting an employee's home address. Cannot delete the employee's active home address.
     *
     * scope: `employees:write`
     */
    delete(request: DeleteV1HomeAddressesHomeAddressUuidRequest, options?: RequestOptions): Promise<DeleteV1HomeAddressesHomeAddressUuidResponse>;
    /**
     * Get an employee's work addresses
     *
     * @remarks
     * Returns a list of an employee's work addresses. Each address includes its effective
     * date and a boolean signifying if it is the currently active work address.
     *
     * scope: `employees:read`
     */
    getWorkAddresses(request: GetV1EmployeesEmployeeIdWorkAddressesRequest, options?: RequestOptions): Promise<GetV1EmployeesEmployeeIdWorkAddressesResponse>;
    /**
     * Create an employee work address
     *
     * @remarks
     * The work address of an employee describes when an employee began working at an associated company location.
     *
     * scope: `employees:manage`
     */
    createWorkAddress(request: PostV1EmployeesEmployeeIdWorkAddressesRequest, options?: RequestOptions): Promise<PostV1EmployeesEmployeeIdWorkAddressesResponse>;
    /**
     * Get an employee work address
     *
     * @remarks
     * The work address of an employee is used for payroll tax purposes.
     *
     * scope: `employees:read`
     */
    retrieveWorkAddress(request: GetV1WorkAddressesWorkAddressUuidRequest, options?: RequestOptions): Promise<GetV1WorkAddressesWorkAddressUuidResponse>;
    /**
     * Update an employee work address
     *
     * @remarks
     * The work address of an employee is used for payroll tax purposes.
     *
     * scope: `employees:manage`
     */
    updateWorkAddress(request: PutV1WorkAddressesWorkAddressUuidRequest, options?: RequestOptions): Promise<PutV1WorkAddressesWorkAddressUuidResponse>;
    /**
     * Delete an employee's work address
     *
     * @remarks
     * Used for deleting an employee's work address. Cannot delete the employee's active work address.
     *
     * scope: `employees:manage`
     */
    deleteWorkAddress(request: DeleteV1WorkAddressesWorkAddressUuidRequest, options?: RequestOptions): Promise<DeleteV1WorkAddressesWorkAddressUuidResponse>;
}
//# sourceMappingURL=employeeaddresses.d.ts.map