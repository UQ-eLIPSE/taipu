import { TypeDefinition, TypeDefinitionSetOr } from "./TypeDefinition";
import { ValidationResult } from "./ValidationResult";
export declare class Taipu<T = any> {
    /** Name of the Taipu type */
    readonly name: string;
    /** Type definition of the Taipu type */
    private readonly typeDefinition;
    /** Set of Taipu instances instantiated */
    private static readonly InstanceSet;
    /** Set of object interfaces registered; used to keep track of interfaces */
    private static readonly ObjectInterfaceSet;
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
    /**
     * Determines if the value is a Taipu instance.
     *
     * @param value Value to test
     */
    static IsTaipuInstance(value: any): value is Taipu;
    /**
     * Creates a type union type definition from all supplied types.
     *
     * @param types All types to include in the type union
     */
    static CreateTypeUnion(...types: TypeDefinition[]): TypeDefinitionSetOr;
    private static AddToInstanceSet(instance);
    private static Validate(typeDefinition, value);
    private static ValidateUndefined(value);
    private static ValidateNull(value);
    private static ValidateString(value);
    private static ValidateNumber(value);
    private static ValidateBoolean(value);
    private static ValidateSymbol(value);
    private static ValidateInstanceOf(constructor, value);
    private static ValidateObjectInterface(objInterface, value);
    private static ValidateTypeUnion(typeUnion, value);
    /**
     * Returns the string representation of the given type.
     *
     * @param typeDefinition Given type to get name of
     */
    static GetTypeName(typeDefinition: TypeDefinition): string;
    private static RegisterTypeDefinitionObjectInterface(interfaceDesc);
    private static IsTypeDefinitionUndefined(interfaceDesc);
    private static IsTypeDefinitionNull(interfaceDesc);
    private static IsTypeDefinitionString(interfaceDesc);
    private static IsTypeDefinitionNumber(interfaceDesc);
    private static IsTypeDefinitionBoolean(interfaceDesc);
    private static IsTypeDefinitionSymbol(interfaceDesc);
    private static IsTypeDefinitionConstructor(interfaceDesc);
    private static IsTypeDefinitionObjectInterface(interfaceDesc);
    private static IsTypeDefinitionSetOr(obj);
}
export declare const or: typeof Taipu.CreateTypeUnion;
