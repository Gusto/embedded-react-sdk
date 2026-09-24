import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
import { EmployeeStateTaxAnswer } from "./employeestatetaxanswer.js";
import { EmployeeStateTaxInputQuestionFormat } from "./employeestatetaxinputquestionformat.js";
export type EmployeeStateTaxQuestion = {
    /**
     * A short title for the question
     */
    label: string;
    /**
     * An explaination of the question - this may contain inline html formatted links.
     */
    description: string | null;
    /**
     * A unique identifier of the question (for the given state) - used for updating the answer.
     */
    key: string;
    isQuestionForAdminOnly: boolean;
    inputQuestionFormat: EmployeeStateTaxInputQuestionFormat;
    answers: Array<EmployeeStateTaxAnswer>;
};
/** @internal */
export declare const EmployeeStateTaxQuestion$inboundSchema: z.ZodType<EmployeeStateTaxQuestion, z.ZodTypeDef, unknown>;
export declare function employeeStateTaxQuestionFromJSON(jsonString: string): SafeParseResult<EmployeeStateTaxQuestion, SDKValidationError>;
//# sourceMappingURL=employeestatetaxquestion.d.ts.map