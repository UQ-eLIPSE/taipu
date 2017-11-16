import { TypeDefinition } from "./TypeDefinition";
import { ValidationResult } from "./ValidationResult";
import { TaipuStatic } from "./TaipuStatic";
export declare class Taipu<T = any> {
    /** Name of the Taipu type */
    readonly name: string;
    /** Type definition of the Taipu type */
    private readonly typeDefinition;
    /**
     * @param name Name of the Taipu type
     * @param typeDefinition Type definition of the Taipu type
     */
    constructor(name: string, typeDefinition: TypeDefinition);
    toString(): string;
    /**
     * Validates the given value to the type definition defined in the Taipu
     * instance.
     *
     * @param value Value to test
     */
    validate(value: any): ValidationResult;
    /**
     * Runs validation of the given value, but only returns the success value.
     *
     * @param value Value to test
     */
    is(value: any): value is T;
    static readonly IsTaipuInstance: typeof TaipuStatic.IsTaipuInstance;
    static readonly CreateTypeUnion: typeof TaipuStatic.CreateTypeUnion;
    static readonly GetTypeName: typeof TaipuStatic.GetTypeName;
}
export declare const or: typeof TaipuStatic.CreateTypeUnion;
