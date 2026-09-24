import * as z from "zod/v3";
import { ClosedEnum } from "../../types/enums.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
/**
 * One of the "onboarding_status" enum values.
 */
export declare const ContractorOnboardingStatusOnboardingStatus: {
    readonly OnboardingCompleted: "onboarding_completed";
    readonly AdminOnboardingReview: "admin_onboarding_review";
    readonly AdminOnboardingIncomplete: "admin_onboarding_incomplete";
    readonly SelfOnboardingNotInvited: "self_onboarding_not_invited";
    readonly SelfOnboardingInvited: "self_onboarding_invited";
    readonly SelfOnboardingStarted: "self_onboarding_started";
    readonly SelfOnboardingReview: "self_onboarding_review";
};
/**
 * One of the "onboarding_status" enum values.
 */
export type ContractorOnboardingStatusOnboardingStatus = ClosedEnum<typeof ContractorOnboardingStatusOnboardingStatus>;
export type ContractorOnboardingStatusOnboardingStep = {
    /**
     * User-friendly description of the onboarding step.
     */
    title?: string | undefined;
    /**
     * String identifier for the onboarding step.
     */
    id?: string | undefined;
    /**
     * When true, this step is required.
     */
    required?: boolean | undefined;
    /**
     * When true, this step has been completed.
     */
    completed?: boolean | undefined;
    /**
     * A list of onboarding steps required to begin this step.
     */
    requirements?: Array<string> | undefined;
};
/**
 * The representation of an contractor's onboarding status.
 */
export type ContractorOnboardingStatus = {
    /**
     * Unique identifier for this contractor.
     */
    uuid: string;
    /**
     * One of the "onboarding_status" enum values.
     */
    onboardingStatus?: ContractorOnboardingStatusOnboardingStatus | undefined;
    /**
     * List of steps required to onboard a contractor.
     */
    onboardingSteps?: Array<ContractorOnboardingStatusOnboardingStep> | undefined;
};
/** @internal */
export declare const ContractorOnboardingStatusOnboardingStatus$inboundSchema: z.ZodNativeEnum<typeof ContractorOnboardingStatusOnboardingStatus>;
/** @internal */
export declare const ContractorOnboardingStatusOnboardingStep$inboundSchema: z.ZodType<ContractorOnboardingStatusOnboardingStep, z.ZodTypeDef, unknown>;
export declare function contractorOnboardingStatusOnboardingStepFromJSON(jsonString: string): SafeParseResult<ContractorOnboardingStatusOnboardingStep, SDKValidationError>;
/** @internal */
export declare const ContractorOnboardingStatus$inboundSchema: z.ZodType<ContractorOnboardingStatus, z.ZodTypeDef, unknown>;
export declare function contractorOnboardingStatusFromJSON(jsonString: string): SafeParseResult<ContractorOnboardingStatus, SDKValidationError>;
//# sourceMappingURL=contractoronboardingstatus.d.ts.map