import { Taipu } from "./index";
import { PropChain } from "./PropChain";
import { ValidationResult } from "./ValidationResult";
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
        if (IsTypeDefinitionConstructor(typeDefinition)) { return GetFunctionName(typeDefinition); }

        // Object interface
        if (IsTypeDefinitionObjectInterface(typeDefinition)) { return "[Interface]"; }

        // Type union
        if (IsTypeDefinitionSetOr(typeDefinition)) { return GetTypeUnionName(typeDefinition); }

        throw new Error("Cannot convert type definition to string");
    }

    /**
     * Returns the name of the function, where available.
     * 
     * @param fn Given function to get name of
     */
    export function GetFunctionName(fn: Function): string {
        // Attempt to get the function name
        const functionName: any = fn.name;

        // [function].name may not be defined or may not be a string value
        // (e.g. when it has been declared as a method)
        if (typeof functionName !== "string") {
            return "[Function]";
        }

        return functionName;
    }

    /**
     * Returns a string representation of a type union.
     * 
     * @param typeUnion
     */
    export function GetTypeUnionName(typeUnion: TypeDefinitionSetOr): string {
        return `(${typeUnion.types.map(Taipu.GetTypeName).join(" | ")})`;
    }

    /**
     * Runs validation of the value against the type definition.
     * 
     * @param typeDefinition Type definition
     * @param value Value to test
     * @param propChain Property access chain
     */
    export function Validate(typeDefinition: Readonly<TypeDefinition>, value: any, propChain: PropChain = []): ValidationResult {
        // Undefined and null
        if (typeDefinition === undefined) { return ValidateUndefined(value, propChain); }
        if (typeDefinition === null) { return ValidateNull(value, propChain); }

        // Primitives are defined by their constructors
        if (IsTypeDefinitionString(typeDefinition)) { return ValidateString(value, propChain); }
        if (IsTypeDefinitionNumber(typeDefinition)) { return ValidateNumber(value, propChain); }
        if (IsTypeDefinitionBoolean(typeDefinition)) { return ValidateBoolean(value, propChain); }
        if (IsTypeDefinitionSymbol(typeDefinition)) { return ValidateSymbol(value, propChain); }

        // Checking values (object instances) against constructors
        if (IsTypeDefinitionConstructor(typeDefinition)) { return ValidateInstanceOf(typeDefinition, value, propChain); }

        // Taipu instance
        if (IsTaipuInstance(typeDefinition)) { return Validate(typeDefinition.typeDefinition, value, propChain); }

        // Object interface 
        if (IsTypeDefinitionObjectInterface(typeDefinition)) { return ValidateObjectInterface(typeDefinition, value, propChain); }

        // Type union
        if (IsTypeDefinitionSetOr(typeDefinition)) { return ValidateTypeUnion(typeDefinition, value, propChain); }

        throw new Error("Cannot validate value with type definition");
    }

    export function ValidateUndefined(value: any, propChain: PropChain): ValidationResult {
        const success = (value === undefined);
        const message = success ? undefined : "Value is not `undefined`";

        return {
            propChain,
            success,
            message,
        };
    }

    export function ValidateNull(value: any, propChain: PropChain): ValidationResult {
        const success = (value === null);
        const message = success ? undefined : "Value is not `null`";

        return {
            propChain,
            success,
            message,
        };
    }

    export function ValidateString(value: any, propChain: PropChain): ValidationResult {
        const success = (typeof value === "string");
        const message = success ? undefined : `Value is not of type "string"`;

        return {
            propChain,
            success,
            message,
        };
    }

    export function ValidateNumber(value: any, propChain: PropChain): ValidationResult {
        const success = (typeof value === "number");
        const message = success ? undefined : `Value is not of type "number"`;

        return {
            propChain,
            success,
            message,
        };
    }

    export function ValidateBoolean(value: any, propChain: PropChain): ValidationResult {
        const success = (typeof value === "boolean");
        const message = success ? undefined : `Value is not of type "boolean"`;

        return {
            propChain,
            success,
            message,
        };
    }

    export function ValidateSymbol(value: any, propChain: PropChain): ValidationResult {
        const success = (typeof value === "symbol");
        const message = success ? undefined : `Value is not of type "symbol"`;

        return {
            propChain,
            success,
            message,
        };
    }

    export function ValidateInstanceOf(constructor: Function, value: any, propChain: PropChain): ValidationResult {
        const success = (value instanceof constructor);
        const message = success ? undefined : `Value is not instance of "${GetFunctionName(constructor)}"`;

        return {
            propChain,
            success,
            message,
        };
    }

    export function ValidateObjectInterface(objInterface: TypeDefinitionObjectInterface, value: any, propChain: PropChain): ValidationResult {
        // If undefined or null, we can't read any properties regardless
        if (value === undefined || value === null) {
            return {
                propChain,
                success: false,
                message: `Expected object value, got \`${value}\``,
            };
        }

        for (let prop in objInterface) {
            const propValidationResult = Validate(objInterface[prop], value[prop], [...propChain, prop]);

            // Return the inner validation result if the validation fails
            if (propValidationResult.success === false) {
                return propValidationResult;
            }
        }

        return {
            propChain,
            success: true,
            message: undefined,
        };
    }

    export function ValidateTypeUnion(typeUnion: TypeDefinitionSetOr, value: any, propChain: PropChain): ValidationResult {
        const success = typeUnion.types.some((typeDef) => {
            return Validate(typeDef, value, propChain).success;
        });
        const message = success ? undefined : `Value is not of type "${GetTypeUnionName(typeUnion)}"`;

        return {
            propChain,
            success,
            message,
        };
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
