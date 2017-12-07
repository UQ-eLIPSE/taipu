import { Taipu } from "./index";
import { TypeDefinition, TypeDefinitionObjectInterface, TypeDefinitionSetOr, InternalSymbol } from "./TypeDefinition";

export namespace TaipuStatic {
    /** Set of Taipu instances instantiated */
    const InstanceSet = new WeakSet<Taipu>();

    /** Set of object interfaces registered; used to keep track of interfaces */
    const ObjectInterfaceSet = new WeakSet<TypeDefinitionObjectInterface>();

    /**
     * Registers the Taipu instance in the set of known Taipu instances.
     * 
     * @param instance Taipu instance
     */
    export function RegisterTaipuInstance(instance: Taipu) {
        InstanceSet.add(instance);
        return instance;
    }

    /**
     * Determines if the value is a Taipu instance by checking if it is in the 
     * set of known Taipu instances.
     * 
     * @param value Value to test
     */
    export function IsTaipuInstance(value: any): value is Taipu {
        return InstanceSet.has(value);
    }

    /**
     * Registers the object interface type definition in the set of known object
     * interfaces.
     * 
     * @param interfaceDesc Object interface type definition
     */
    export function RegisterTypeDefinitionObjectInterface(interfaceDesc: TypeDefinitionObjectInterface) {
        ObjectInterfaceSet.add(interfaceDesc);
        return interfaceDesc;
    }

    /**
     * Creates a type union type definition from all supplied types.
     * 
     * @param types All types to include in the type union
     */
    export function CreateTypeUnion(...types: Readonly<TypeDefinition>[]) {
        const typeDefSetOr: TypeDefinitionSetOr = {
            __type: InternalSymbol.Or,
            types,
        };

        return typeDefSetOr;
    }

    /**
     * Translates a type definition or Taipu instance to one which accepts
     * `undefined` on its properties.
     * 
     * @param typeDefinition A Taipu instance or type definition object
     */
    export function CreatePartialType<T>(taipu: Taipu<T>): Taipu<Partial<T>>;
    export function CreatePartialType(typeDefinition: TypeDefinitionObjectInterface): TypeDefinitionObjectInterface;
    export function CreatePartialType(typeDefinition: TypeDefinitionSetOr): TypeDefinitionSetOr;
    export function CreatePartialType(typeDefinition: TypeDefinition): TypeDefinition;
    export function CreatePartialType(typeDefinition: TypeDefinition) {
        // Primitives and constructors are not partial-able
        if (typeDefinition === undefined ||
            typeDefinition === null ||
            IsTypeDefinitionString(typeDefinition) ||
            IsTypeDefinitionNumber(typeDefinition) ||
            IsTypeDefinitionBoolean(typeDefinition) ||
            IsTypeDefinitionSymbol(typeDefinition) ||
            IsTypeDefinitionConstructor(typeDefinition)) {
            throw new Error("Primitives and constructor functions are not able to be converted to a partial type");
        }

        // Type unions are simply expanded to add undefined to it
        if (IsTypeDefinitionSetOr(typeDefinition)) {
            return { ...typeDefinition, types: [...typeDefinition.types, undefined] } as TypeDefinitionSetOr;
        }

        // Taipu instance
        if (IsTaipuInstance(typeDefinition)) {
            // Get the type definition object inside and convert the definition to a partial type
            const newTypeDefinition = CreatePartialType(typeDefinition.typeDefinition as TypeDefinition);

            return new Taipu(typeDefinition.name, newTypeDefinition);
        }

        // Object interface 
        if (IsTypeDefinitionObjectInterface(typeDefinition)) {
            const newTypeDefinitionObj: TypeDefinitionObjectInterface = {};

            // Run through all keys, and translate them to a type union with
            // `undefined` into a new type def object
            for (let key in typeDefinition) {
                newTypeDefinitionObj[key] = CreateTypeUnion(typeDefinition[key], undefined);
            }

            return newTypeDefinitionObj;
        }

        throw new Error("Cannot convert input to a partial type");
    }

    /**
     * Returns the string representation of the given type.
     * 
     * @param typeDefinition Given type to get name of
     */
    export function GetTypeName(typeDefinition: Readonly<TypeDefinition>): string {
        // Undefined and null, Taipu instances use their string representations
        if (IsTypeDefinitionUndefined(typeDefinition) ||
            IsTypeDefinitionNull(typeDefinition) ||
            IsTaipuInstance(typeDefinition)) {
            return "" + typeDefinition;
        }

        // Primitives are defined by their constructors
        if (IsTypeDefinitionString(typeDefinition)) { return "string"; }
        if (IsTypeDefinitionNumber(typeDefinition)) { return "number"; }
        if (IsTypeDefinitionBoolean(typeDefinition)) { return "boolean"; }
        if (IsTypeDefinitionSymbol(typeDefinition)) { return "symbol"; }

        // Constructor functions
        if (IsTypeDefinitionConstructor(typeDefinition)) {
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
        if (IsTypeDefinitionObjectInterface(typeDefinition)) {
            return "[Interface]";
        }

        // Type union
        if (IsTypeDefinitionSetOr(typeDefinition)) {
            return `(${typeDefinition.types.map(Taipu.GetTypeName).join(" | ")})`;
        }

        throw new Error("Cannot convert type definition to string");
    }

    /**
     * Runs validation of the value against the type definition.
     * 
     * @param typeDefinition Type definition
     * @param value Value to test
     */
    export function Validate(typeDefinition: Readonly<TypeDefinition>, value: any): boolean {
        // Undefined and null
        if (typeDefinition === undefined) { return ValidateUndefined(value); }
        if (typeDefinition === null) { return ValidateNull(value); }

        // Primitives are defined by their constructors
        if (IsTypeDefinitionString(typeDefinition)) { return ValidateString(value); }
        if (IsTypeDefinitionNumber(typeDefinition)) { return ValidateNumber(value); }
        if (IsTypeDefinitionBoolean(typeDefinition)) { return ValidateBoolean(value); }
        if (IsTypeDefinitionSymbol(typeDefinition)) { return ValidateSymbol(value); }

        // Checking values (object instances) against constructors
        if (IsTypeDefinitionConstructor(typeDefinition)) { return ValidateInstanceOf(typeDefinition, value); }

        // Taipu instance
        if (IsTaipuInstance(typeDefinition)) { return typeDefinition.is(value); }

        // Object interface 
        if (IsTypeDefinitionObjectInterface(typeDefinition)) { return ValidateObjectInterface(typeDefinition, value); }

        // Type union
        if (IsTypeDefinitionSetOr(typeDefinition)) { return ValidateTypeUnion(typeDefinition, value); }

        throw new Error("Cannot validate value with type definition");
    }

    export function ValidateUndefined(value: any) {
        return value === undefined;
    }

    export function ValidateNull(value: any) {
        return value === null;
    }

    export function ValidateString(value: any) {
        return typeof value === "string";
    }

    export function ValidateNumber(value: any) {
        return typeof value === "number";
    }

    export function ValidateBoolean(value: any) {
        return typeof value === "boolean";
    }

    export function ValidateSymbol(value: any) {
        return typeof value === "symbol";
    }

    export function ValidateInstanceOf(constructor: Function, value: any) {
        return value instanceof constructor;
    }

    export function ValidateObjectInterface(objInterface: TypeDefinitionObjectInterface, value: any) {
        // If undefined or null, we can't read any properties regardless
        if (value === undefined || value === null) {
            return false;
        }

        return Object.keys(objInterface).every((prop) => {
            return Validate(objInterface[prop], value[prop]);
        });
    }

    export function ValidateTypeUnion(typeUnion: TypeDefinitionSetOr, value: any) {
        return typeUnion.types.some((typeDef) => {
            return Validate(typeDef, value);
        });
    }

    export function IsTypeDefinitionUndefined(typeDefinition: any): typeDefinition is undefined {
        return typeDefinition === undefined;
    }

    export function IsTypeDefinitionNull(typeDefinition: any): typeDefinition is null {
        return typeDefinition === null;
    }

    export function IsTypeDefinitionString(typeDefinition: any): typeDefinition is StringConstructor {
        return typeDefinition === String;
    }

    export function IsTypeDefinitionNumber(typeDefinition: any): typeDefinition is NumberConstructor {
        return typeDefinition === Number;
    }

    export function IsTypeDefinitionBoolean(typeDefinition: any): typeDefinition is BooleanConstructor {
        return typeDefinition === Boolean;
    }

    export function IsTypeDefinitionSymbol(typeDefinition: any): typeDefinition is SymbolConstructor {
        return typeDefinition === Symbol;
    }

    export function IsTypeDefinitionConstructor(typeDefinition: any): typeDefinition is Function {
        return typeof typeDefinition === "function";
    }

    export function IsTypeDefinitionObjectInterface(typeDefinition: any): typeDefinition is TypeDefinitionObjectInterface {
        return ObjectInterfaceSet.has(typeDefinition);
    }

    export function IsTypeDefinitionSetOr(typeDefinition: any): typeDefinition is TypeDefinitionSetOr {
        return (typeDefinition || {}).__type === InternalSymbol.Or;
    }
}
