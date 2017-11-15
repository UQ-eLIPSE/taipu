import { TypeDefinition, TypeDefinitionObjectInterface, TypeDefinitionSetOr, InternalSymbol } from "./TypeDefinition";
import { ValidationResult } from "./ValidationResult";

export class Taipu<T = any> {
    /** Name of the Taipu type */
    public readonly name: string;

    /** Type definition of the Taipu type */
    private readonly typeDefinition: TypeDefinition;

    /** Set of Taipu instances instantiated */
    private static readonly InstanceSet = new WeakSet<Taipu<any>>();

    /** Set of object interfaces registered; used to keep track of interfaces */
    private static readonly ObjectInterfaceSet = new WeakSet<TypeDefinitionObjectInterface>();

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
        Taipu.AddToInstanceSet(this);

        // Register object interface
        if (typeDefinition !== null &&
            typeof typeDefinition === "object" &&
            !Taipu.IsTaipuInstance(typeDefinition) &&
            !Taipu.IsTypeDefinitionSetOr(typeDefinition)) {
            Taipu.RegisterTypeDefinitionObjectInterface(typeDefinition);
        }
    }

    public toString() {
        return `Taipu("${this.name}" = ${Taipu.GetTypeName(this.typeDefinition)})`;
    }

    /**
     * Validates the given value to the type definition defined in the Taipu
     * instance.
     * 
     * @param value Value to test
     */
    public validate(value: any) {
        const success = Taipu.Validate(this.typeDefinition, value);

        const validationResult: ValidationResult = {
            success: success as any,        // TODO: Fix up discriminated type union (true | false)
        }

        return validationResult;
    }

    /**
     * Runs validation of the given value, but only returns the success value.
     * 
     * @param value Value to test
     */
    public is(value: any): value is T {
        return this.validate(value).success;
    }

    /**
     * Determines if the value is a Taipu instance.
     * 
     * @param value Value to test
     */
    public static IsTaipuInstance(value: any): value is Taipu {
        return Taipu.InstanceSet.has(value);
    }

    /**
     * Creates a type union type definition from all supplied types.
     * 
     * @param types All types to include in the type union
     */
    public static CreateTypeUnion(...types: TypeDefinition[]) {
        const typeDefSetOr: TypeDefinitionSetOr = {
            __type: InternalSymbol.Or,
            types,
        };

        return typeDefSetOr;
    }

    private static AddToInstanceSet(instance: Taipu) {
        Taipu.InstanceSet.add(instance);
        return instance;
    }

    private static Validate(typeDefinition: TypeDefinition, value: any): boolean {
        // Undefined and null
        if (typeDefinition === undefined) { return Taipu.ValidateUndefined(value); }
        if (typeDefinition === null) { return Taipu.ValidateNull(value); }

        // Primitives are defined by their constructors
        if (Taipu.IsTypeDefinitionString(typeDefinition)) { return Taipu.ValidateString(value); }
        if (Taipu.IsTypeDefinitionNumber(typeDefinition)) { return Taipu.ValidateNumber(value); }
        if (Taipu.IsTypeDefinitionBoolean(typeDefinition)) { return Taipu.ValidateBoolean(value); }
        if (Taipu.IsTypeDefinitionSymbol(typeDefinition)) { return Taipu.ValidateSymbol(value); }

        // Checking values (object instances) against constructors
        if (Taipu.IsTypeDefinitionConstructor(typeDefinition)) { return Taipu.ValidateInstanceOf(typeDefinition, value); }

        // Taipu instance
        if (Taipu.IsTaipuInstance(typeDefinition)) { return Taipu.Validate(typeDefinition.typeDefinition, value); }

        // Object interface 
        if (Taipu.IsTypeDefinitionObjectInterface(typeDefinition)) { return Taipu.ValidateObjectInterface(typeDefinition, value); }

        // Type union
        if (Taipu.IsTypeDefinitionSetOr(typeDefinition)) { return Taipu.ValidateTypeUnion(typeDefinition, value); }

        throw new Error("Cannot validate value with type definition");
    }

    private static ValidateUndefined(value: any) {
        return value === undefined;
    }

    private static ValidateNull(value: any) {
        return value === null;
    }

    private static ValidateString(value: any) {
        return typeof value === "string";
    }

    private static ValidateNumber(value: any) {
        return typeof value === "number";
    }

    private static ValidateBoolean(value: any) {
        return typeof value === "boolean";
    }

    private static ValidateSymbol(value: any) {
        return typeof value === "symbol";
    }

    private static ValidateInstanceOf(constructor: Function, value: any) {
        return value instanceof constructor;
    }

    private static ValidateObjectInterface(objInterface: TypeDefinitionObjectInterface, value: any) {
        return Object.keys(objInterface).every((prop) => {
            return Taipu.Validate(objInterface[prop], value[prop]);
        });
    }

    private static ValidateTypeUnion(typeUnion: TypeDefinitionSetOr, value: any) {
        return typeUnion.types.some((typeDef) => {
            return Taipu.Validate(typeDef, value);
        });
    }

    /**
     * Returns the string representation of the given type.
     * 
     * @param typeDefinition Given type to get name of
     */
    public static GetTypeName(typeDefinition: TypeDefinition): string {
        // Undefined and null, Taipu instances use their string representations
        if (Taipu.IsTypeDefinitionUndefined(typeDefinition) ||
            Taipu.IsTypeDefinitionNull(typeDefinition) ||
            Taipu.IsTaipuInstance(typeDefinition)) {
            return "" + typeDefinition;
        }

        // Primitives are defined by their constructors
        if (Taipu.IsTypeDefinitionString(typeDefinition)) { return "string"; }
        if (Taipu.IsTypeDefinitionNumber(typeDefinition)) { return "number"; }
        if (Taipu.IsTypeDefinitionBoolean(typeDefinition)) { return "boolean"; }
        if (Taipu.IsTypeDefinitionSymbol(typeDefinition)) { return "symbol"; }

        // Constructor functions
        if (Taipu.IsTypeDefinitionConstructor(typeDefinition)) {
            // Attempt to get the constructor name
            const constructorName = typeDefinition.name;

            // [function].name may not be defined or may not be a string value
            // (e.g. when it has been declared as a method)
            if (typeof constructorName !== "string") {
                return "[Function]";
            }

            return constructorName;
        }

        // Object interface
        if (Taipu.IsTypeDefinitionObjectInterface(typeDefinition)) {
            return "[Interface]";
        }

        // Type union
        if (Taipu.IsTypeDefinitionSetOr(typeDefinition)) {
            return `(${typeDefinition.types.map(Taipu.GetTypeName).join(" | ")})`;
        }

        throw new Error("Cannot convert type definition to string");
    }

    private static RegisterTypeDefinitionObjectInterface(interfaceDesc: TypeDefinitionObjectInterface) {
        Taipu.ObjectInterfaceSet.add(interfaceDesc);
        return interfaceDesc;
    }

    private static IsTypeDefinitionUndefined(interfaceDesc: any): interfaceDesc is undefined {
        return interfaceDesc === undefined;
    }

    private static IsTypeDefinitionNull(interfaceDesc: any): interfaceDesc is null {
        return interfaceDesc === null;
    }

    private static IsTypeDefinitionString(interfaceDesc: any): interfaceDesc is StringConstructor {
        return interfaceDesc === String;
    }

    private static IsTypeDefinitionNumber(interfaceDesc: any): interfaceDesc is NumberConstructor {
        return interfaceDesc === Number;
    }

    private static IsTypeDefinitionBoolean(interfaceDesc: any): interfaceDesc is BooleanConstructor {
        return interfaceDesc === Boolean;
    }

    private static IsTypeDefinitionSymbol(interfaceDesc: any): interfaceDesc is SymbolConstructor {
        return interfaceDesc === Symbol;
    }

    private static IsTypeDefinitionConstructor(interfaceDesc: any): interfaceDesc is Function {
        return typeof interfaceDesc === "function";
    }

    private static IsTypeDefinitionObjectInterface(interfaceDesc: any): interfaceDesc is TypeDefinitionObjectInterface {
        return Taipu.ObjectInterfaceSet.has(interfaceDesc);
    }

    private static IsTypeDefinitionSetOr(obj: any): obj is TypeDefinitionSetOr {
        return (obj || {}).__type === InternalSymbol.Or;
    }
}

export const or = Taipu.CreateTypeUnion;
