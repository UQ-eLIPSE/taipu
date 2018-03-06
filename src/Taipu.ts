import { TaipuStatic } from "./TaipuStatic";
import { TypeDefinition } from "./TypeDefinition";
import { ValidationResult } from "./ValidationResult";

export class Taipu<T = any> {
    /** Name of the Taipu type */
    public readonly name: string;

    /** Type definition of the Taipu type */
    public readonly typeDefinition: Readonly<TypeDefinition>;

    /**
     * @param name Name of the Taipu type
     * @param typeDefinition Type definition of the Taipu type
     */
    constructor(name: string, typeDefinition: TypeDefinition) {
        // Check that the number of arguments is always 2
        if (arguments.length !== 2) {
            throw new Error("Expected 2 arguments");
        }

        // Set props
        this.name = name;
        this.typeDefinition = typeDefinition;

        // Add to global instance set
        TaipuStatic.RegisterTaipuInstance(this);

        // Register object interface
        //
        // The below `if` statement narrows the expected type of the type 
        // definition down to what we expect to be 
        // `TypeDefinitionObjectInterface`
        if (typeDefinition !== null &&
            typeof typeDefinition === "object" &&
            !TaipuStatic.IsTaipuInstance(typeDefinition) &&
            !TaipuStatic.IsTypeDefinitionSetOr(typeDefinition)) {
            TaipuStatic.RegisterTypeDefinitionObjectInterface(typeDefinition);
        }
    }

    public toString() {
        return `Taipu("${this.name}")`;
    }

    public get type() {
        return TaipuStatic.GetTypeName(this.typeDefinition);
    }

    /**
     * Validates the given value to the type definition defined in the Taipu
     * instance.
     * 
     * @param value Value to test
     */
    public validate(value: any): ValidationResult {
        const result = TaipuStatic.Validate(this.typeDefinition, value);
        return TaipuStatic.PrependTaipuInstanceNameToValidationMessage(result, this);
    }

    /**
     * Runs validation of the given value, but only returns the success value.
     * 
     * @param value Value to test
     */
    public is(value: any): value is T {
        return this.validate(value).success;
    }

    // Determines if value is a Taipu instance.
    public static readonly IsTaipuInstance = TaipuStatic.IsTaipuInstance;

    // Creates a type union type definition from all supplied types.
    public static readonly CreateTypeUnion = TaipuStatic.CreateTypeUnion;

    // Translates a type definition or Taipu instance to one which accepts
    // `undefined` on its properties.
    public static readonly CreatePartialType = TaipuStatic.CreatePartialType;

    // Returns the string representation of the given type.
    public static readonly GetTypeName = TaipuStatic.GetTypeName;
}

export const or = Taipu.CreateTypeUnion;
export const partial = Taipu.CreatePartialType;
