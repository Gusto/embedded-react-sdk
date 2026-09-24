import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
import { Compensation } from "./compensation.js";
import { Location } from "./location.js";
/**
 * The representation of a job in Gusto.
 */
export type Job = {
    /**
     * The UUID of the job.
     */
    uuid: string;
    /**
     * The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/idempotency) for information on how to use this field.
     */
    version?: string | undefined;
    /**
     * The UUID of the employee to which the job belongs.
     */
    employeeUuid?: string | undefined;
    /**
     * The date when the employee was hired or rehired for the job.
     */
    hireDate?: string | undefined;
    /**
     * The title for the job.
     */
    title: string | null;
    /**
     * Whether this is the employee's primary job. The value will be set to true unless an existing job exists for the employee.
     */
    primary?: boolean | undefined;
    /**
     * The employee's pay rate for this job (e.g., hourly wage or annual salary). This is sensitive compensation data and requires the `compensations:read` scope.
     */
    rate?: string | undefined;
    /**
     * How the employee is paid for this job (e.g., Hour, Week, Month, Year, Paycheck). This is sensitive compensation data and requires the `compensations:read` scope.
     */
    paymentUnit?: string | null | undefined;
    /**
     * The UUID of the current active compensation record for this job. Requires the `compensations:read` scope.
     */
    currentCompensationUuid?: string | undefined;
    /**
     * Whether the employee owns at least 2% of the company.
     */
    twoPercentShareholder?: boolean | undefined;
    /**
     * Whether this job is eligible for workers' compensation coverage in the state of Washington (WA).
     */
    stateWcCovered?: boolean | null | undefined;
    /**
     * The risk class code for workers' compensation in Washington state. Please visit [Washington state's Risk Class page](https://www.lni.wa.gov/insurance/rates-risk-classes/risk-classes-for-workers-compensation/risk-class-lookup#/) to learn more.
     */
    stateWcClassCode?: string | null | undefined;
    /**
     * The compensation history for this job, including pay rate, payment unit, FLSA status, and effective dates. This is sensitive pay information and requires the `compensations:read` scope.
     */
    compensations?: Array<Compensation> | undefined;
    /**
     * The uuid of the employee's work location.
     */
    locationUuid?: string | undefined;
    /**
     * The representation of an address in Gusto.
     */
    location?: Location | undefined;
};
/** @internal */
export declare const Job$inboundSchema: z.ZodType<Job, z.ZodTypeDef, unknown>;
export declare function jobFromJSON(jsonString: string): SafeParseResult<Job, SDKValidationError>;
//# sourceMappingURL=job.d.ts.map