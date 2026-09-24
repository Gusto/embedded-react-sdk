import { ClientSDK, RequestOptions } from "../lib/sdks.js";
import { GetV1ContractorFormRequest, GetV1ContractorFormResponse } from "../models/operations/getv1contractorform.js";
import { GetV1ContractorFormPdfRequest, GetV1ContractorFormPdfResponse } from "../models/operations/getv1contractorformpdf.js";
import { GetV1ContractorFormsRequest, GetV1ContractorFormsResponse } from "../models/operations/getv1contractorforms.js";
import { PostV1SandboxGenerate1099Request, PostV1SandboxGenerate1099Response } from "../models/operations/postv1sandboxgenerate1099.js";
export declare class ContractorForms extends ClientSDK {
    /**
     * Get all contractor forms
     *
     * @remarks
     * Get a list of all contractor's forms
     *
     * scope: `contractor_forms:read`
     */
    list(request: GetV1ContractorFormsRequest, options?: RequestOptions): Promise<GetV1ContractorFormsResponse>;
    /**
     * Get a contractor form
     *
     * @remarks
     * Get a contractor form
     *
     * scope: `contractor_forms:read`
     */
    get(request: GetV1ContractorFormRequest, options?: RequestOptions): Promise<GetV1ContractorFormResponse>;
    /**
     * Get the contractor form pdf
     *
     * @remarks
     * Get the link to the form PDF
     *
     * scope: `contractor_forms:read`
     */
    getPdf(request: GetV1ContractorFormPdfRequest, options?: RequestOptions): Promise<GetV1ContractorFormPdfResponse>;
    /**
     * Generate a 1099 form [DEMO]
     *
     * @remarks
     * > 🚧 Demo action
     * >
     * > This action is only available in the Demo environment
     *
     * Generates a 1099 document for testing purposes.
     *
     * scope: `contractors:write`
     */
    generate1099(request: PostV1SandboxGenerate1099Request, options?: RequestOptions): Promise<PostV1SandboxGenerate1099Response>;
}
//# sourceMappingURL=contractorforms.d.ts.map