import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
/**
 * The representation of an unprocessed termination pay period.
 */
export type UnprocessedTerminationPayPeriod = {
    /**
     * The start date of the pay period.
     */
    startDate?: string | undefined;
    /**
     * The end date of the pay period.
     */
    endDate?: string | undefined;
    /**
     * The check date of the pay period.
     */
    checkDate?: string | undefined;
    /**
     * The debit date of the pay period.
     */
    debitDate?: string | undefined;
    /**
     * The full name of the employee.
     */
    employeeName?: string | undefined;
    /**
     * A unique identifier of the employee.
     */
    employeeUuid?: string | undefined;
    /**
     * A unique identifier of the pay schedule to which the pay period belongs.
     */
    payScheduleUuid?: string | undefined;
};
/** @internal */
export declare const UnprocessedTerminationPayPeriod$inboundSchema: z.ZodType<UnprocessedTerminationPayPeriod, z.ZodTypeDef, unknown>;
export declare function unprocessedTerminationPayPeriodFromJSON(jsonString: string): SafeParseResult<UnprocessedTerminationPayPeriod, SDKValidationError>;
//# sourceMappingURL=unprocessedterminationpayperiod.d.ts.map