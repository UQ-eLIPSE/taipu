import { PropChain } from "./PropChain";
export interface ValidationResult {
    propChain: PropChain;
    success: boolean;
    message: string | undefined;
}
