import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
export type DepartmentEmployees = {
    uuid?: string | undefined;
};
export type Contractors = {
    uuid?: string | undefined;
};
export type Department = {
    /**
     * The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/idempotency) for information on how to use this field.
     */
    version?: string | undefined;
    /**
     * The UUID of the department
     */
    uuid?: string | undefined;
    /**
     * The UUID of the company
     */
    companyUuid?: string | undefined;
    /**
     * Name of the department
     */
    title?: string | undefined;
    /**
     * Array of employees assigned to the department.
     */
    employees?: Array<DepartmentEmployees> | undefined;
    /**
     * Array of contractors assigned to the department.
     */
    contractors?: Array<Contractors> | undefined;
};
/** @internal */
export declare const DepartmentEmployees$inboundSchema: z.ZodType<DepartmentEmployees, z.ZodTypeDef, unknown>;
export declare function departmentEmployeesFromJSON(jsonString: string): SafeParseResult<DepartmentEmployees, SDKValidationError>;
/** @internal */
export declare const Contractors$inboundSchema: z.ZodType<Contractors, z.ZodTypeDef, unknown>;
export declare function contractorsFromJSON(jsonString: string): SafeParseResult<Contractors, SDKValidationError>;
/** @internal */
export declare const Department$inboundSchema: z.ZodType<Department, z.ZodTypeDef, unknown>;
export declare function departmentFromJSON(jsonString: string): SafeParseResult<Department, SDKValidationError>;
//# sourceMappingURL=department.d.ts.map