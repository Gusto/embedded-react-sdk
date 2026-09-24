import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
/**
 * The representation of a termination in Gusto.
 */
export type Termination = {
    /**
     * The UUID of the termination object.
     */
    uuid: string;
    /**
     * The current version of the object. See the [versioning guide](https://docs.gusto.com/embedded-payroll/docs/idempotency) for information on how to use this field.
     */
    version?: string | undefined;
    /**
     * The UUID of the employee to which this termination is attached.
     */
    employeeUuid?: string | undefined;
    /**
     * Whether the employee's termination has gone into effect.
     */
    active?: boolean | undefined;
    /**
     * Whether the employee's termination is cancelable. Cancelable is true if `run_termination_payroll` is false and `effective_date` is in the future.
     */
    cancelable?: boolean | undefined;
    /**
     * The employee's last day of work.
     */
    effectiveDate?: string | undefined;
    /**
     * If true, the employee should receive their final wages via an off-cycle payroll. If false, they should receive their final wages on their current pay schedule.
     */
    runTerminationPayroll?: boolean | undefined;
};
/** @internal */
export declare const Termination$inboundSchema: z.ZodType<Termination, z.ZodTypeDef, unknown>;
export declare function terminationFromJSON(jsonString: string): SafeParseResult<Termination, SDKValidationError>;
//# sourceMappingURL=termination.d.ts.map