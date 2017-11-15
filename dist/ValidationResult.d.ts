export declare type ValidationResult = ValidationResultSuccess | ValidationResultFailure;
export interface ValidationResultSuccess {
    success: true;
}
export interface ValidationResultFailure {
    success: false;
}
