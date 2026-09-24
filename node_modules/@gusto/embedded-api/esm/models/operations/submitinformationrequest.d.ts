import * as z from "zod/v3";
import { ClosedEnum } from "../../types/enums.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { HTTPMetadata } from "../components/httpmetadata.js";
import { InformationRequest } from "../components/informationrequest.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
/**
 * Type of response - matches the question's response_type from GET
 */
export declare const ResponseType: {
    readonly Text: "text";
    readonly Document: "document";
};
/**
 * Type of response - matches the question's response_type from GET
 */
export type ResponseType = ClosedEnum<typeof ResponseType>;
export type RequiredQuestions = {
    /**
     * UUID of the question being answered
     */
    questionUuid: string;
    /**
     * Type of response - matches the question's response_type from GET
     */
    responseType: ResponseType;
    /**
     * Text response (required when response_type is text)
     */
    textResponse?: string | undefined;
    /**
     * Data URL with base64-encoded file (e.g., "data:image/png;base64,..."). Required when response_type is document.
     */
    fileResponse?: string | undefined;
    /**
     * Original filename with extension (e.g., "document.pdf"). Used for document uploads.
     */
    fileName?: string | undefined;
};
export type SubmitInformationRequestRequestBody = {
    requiredQuestions?: Array<RequiredQuestions> | undefined;
};
export type SubmitInformationRequestRequest = {
    /**
     * The UUID of the information request
     */
    informationRequestUuid: string;
    requestBody: SubmitInformationRequestRequestBody;
};
export type SubmitInformationRequestResponse = {
    httpMeta: HTTPMetadata;
    /**
     * Information request successfully submitted
     */
    informationRequest?: InformationRequest | undefined;
};
/** @internal */
export declare const ResponseType$outboundSchema: z.ZodNativeEnum<typeof ResponseType>;
/** @internal */
export type RequiredQuestions$Outbound = {
    question_uuid: string;
    response_type: string;
    text_response?: string | undefined;
    file_response?: string | undefined;
    file_name?: string | undefined;
};
/** @internal */
export declare const RequiredQuestions$outboundSchema: z.ZodType<RequiredQuestions$Outbound, z.ZodTypeDef, RequiredQuestions>;
export declare function requiredQuestionsToJSON(requiredQuestions: RequiredQuestions): string;
/** @internal */
export type SubmitInformationRequestRequestBody$Outbound = {
    required_questions?: Array<RequiredQuestions$Outbound> | undefined;
};
/** @internal */
export declare const SubmitInformationRequestRequestBody$outboundSchema: z.ZodType<SubmitInformationRequestRequestBody$Outbound, z.ZodTypeDef, SubmitInformationRequestRequestBody>;
export declare function submitInformationRequestRequestBodyToJSON(submitInformationRequestRequestBody: SubmitInformationRequestRequestBody): string;
/** @internal */
export type SubmitInformationRequestRequest$Outbound = {
    information_request_uuid: string;
    RequestBody: SubmitInformationRequestRequestBody$Outbound;
};
/** @internal */
export declare const SubmitInformationRequestRequest$outboundSchema: z.ZodType<SubmitInformationRequestRequest$Outbound, z.ZodTypeDef, SubmitInformationRequestRequest>;
export declare function submitInformationRequestRequestToJSON(submitInformationRequestRequest: SubmitInformationRequestRequest): string;
/** @internal */
export declare const SubmitInformationRequestResponse$inboundSchema: z.ZodType<SubmitInformationRequestResponse, z.ZodTypeDef, unknown>;
export declare function submitInformationRequestResponseFromJSON(jsonString: string): SafeParseResult<SubmitInformationRequestResponse, SDKValidationError>;
//# sourceMappingURL=submitinformationrequest.d.ts.map