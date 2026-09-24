import * as z from "zod/v3";
import { ClosedEnum } from "../../types/enums.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
/**
 * The payment method for the pay stub.
 */
export declare const EmployeePayStubsListPaymentMethod: {
    readonly DirectDeposit: "Direct Deposit";
    readonly Check: "Check";
};
/**
 * The payment method for the pay stub.
 */
export type EmployeePayStubsListPaymentMethod = ClosedEnum<typeof EmployeePayStubsListPaymentMethod>;
/**
 * The representation of an employee pay stub information.
 */
export type EmployeePayStubsList = {
    /**
     * The UUID of the employee pay stub.
     */
    uuid: string;
    /**
     * The check date of the pay stub.
     */
    checkDate?: string | undefined;
    /**
     * The gross pay amount for the pay stub.
     */
    grossPay?: string | undefined;
    /**
     * The net pay amount for the pay stub.
     */
    netPay?: string | undefined;
    /**
     * A unique identifier of the payroll to which the pay stub belongs.
     */
    payrollUuid?: string | undefined;
    /**
     * The check amount for the pay stub.
     */
    checkAmount?: string | undefined;
    /**
     * The payment method for the pay stub.
     */
    paymentMethod?: EmployeePayStubsListPaymentMethod | undefined;
};
/** @internal */
export declare const EmployeePayStubsListPaymentMethod$inboundSchema: z.ZodNativeEnum<typeof EmployeePayStubsListPaymentMethod>;
/** @internal */
export declare const EmployeePayStubsList$inboundSchema: z.ZodType<EmployeePayStubsList, z.ZodTypeDef, unknown>;
export declare function employeePayStubsListFromJSON(jsonString: string): SafeParseResult<EmployeePayStubsList, SDKValidationError>;
//# sourceMappingURL=employeepaystubslist.d.ts.map