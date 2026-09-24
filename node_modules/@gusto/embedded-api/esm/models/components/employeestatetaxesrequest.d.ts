import * as z from "zod/v3";
export type EmployeeStateTaxesRequestValue = string | number | boolean;
export type Answers = {
    value: string | number | boolean | null;
    validFrom: string;
    validUpTo?: string | null | undefined;
};
export type Questions = {
    key: string;
    answers?: Array<Answers> | undefined;
};
export type States = {
    state: string;
    questions?: Array<Questions> | undefined;
};
export type EmployeeStateTaxesRequest = {
    states: Array<States>;
};
/** @internal */
export type EmployeeStateTaxesRequestValue$Outbound = string | number | boolean;
/** @internal */
export declare const EmployeeStateTaxesRequestValue$outboundSchema: z.ZodType<EmployeeStateTaxesRequestValue$Outbound, z.ZodTypeDef, EmployeeStateTaxesRequestValue>;
export declare function employeeStateTaxesRequestValueToJSON(employeeStateTaxesRequestValue: EmployeeStateTaxesRequestValue): string;
/** @internal */
export type Answers$Outbound = {
    value: string | number | boolean | null;
    valid_from: string;
    valid_up_to?: string | null | undefined;
};
/** @internal */
export declare const Answers$outboundSchema: z.ZodType<Answers$Outbound, z.ZodTypeDef, Answers>;
export declare function answersToJSON(answers: Answers): string;
/** @internal */
export type Questions$Outbound = {
    key: string;
    answers?: Array<Answers$Outbound> | undefined;
};
/** @internal */
export declare const Questions$outboundSchema: z.ZodType<Questions$Outbound, z.ZodTypeDef, Questions>;
export declare function questionsToJSON(questions: Questions): string;
/** @internal */
export type States$Outbound = {
    state: string;
    questions?: Array<Questions$Outbound> | undefined;
};
/** @internal */
export declare const States$outboundSchema: z.ZodType<States$Outbound, z.ZodTypeDef, States>;
export declare function statesToJSON(states: States): string;
/** @internal */
export type EmployeeStateTaxesRequest$Outbound = {
    states: Array<States$Outbound>;
};
/** @internal */
export declare const EmployeeStateTaxesRequest$outboundSchema: z.ZodType<EmployeeStateTaxesRequest$Outbound, z.ZodTypeDef, EmployeeStateTaxesRequest>;
export declare function employeeStateTaxesRequestToJSON(employeeStateTaxesRequest: EmployeeStateTaxesRequest): string;
//# sourceMappingURL=employeestatetaxesrequest.d.ts.map