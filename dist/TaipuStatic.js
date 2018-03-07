"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./index");
var TypeDefinition_1 = require("./TypeDefinition");
var TaipuStatic;
(function (TaipuStatic) {
    /** Set of Taipu instances instantiated */
    var InstanceSet = new WeakSet();
    /** Set of object interfaces registered; used to keep track of interfaces */
    var ObjectInterfaceSet = new WeakSet();
    /**
     * Registers the Taipu instance in the set of known Taipu instances.
     *
     * @param instance Taipu instance
     */
    function RegisterTaipuInstance(instance) {
        InstanceSet.add(instance);
        return instance;
    }
    TaipuStatic.RegisterTaipuInstance = RegisterTaipuInstance;
    /**
     * Determines if the value is a Taipu instance by checking if it is in the
     * set of known Taipu instances.
     *
     * @param value Value to test
     */
    function IsTaipuInstance(value) {
        return InstanceSet.has(value);
    }
    TaipuStatic.IsTaipuInstance = IsTaipuInstance;
    /**
     * Registers the object interface type definition in the set of known object
     * interfaces.
     *
     * @param interfaceDesc Object interface type definition
     */
    function RegisterTypeDefinitionObjectInterface(interfaceDesc) {
        ObjectInterfaceSet.add(interfaceDesc);
        return interfaceDesc;
    }
    TaipuStatic.RegisterTypeDefinitionObjectInterface = RegisterTypeDefinitionObjectInterface;
    /**
     * Creates a type union type definition from all supplied types.
     *
     * @param types All types to include in the type union
     */
    function CreateTypeUnion() {
        var types = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            types[_i] = arguments[_i];
        }
        var typeDefSetOr = {
            __type: TypeDefinition_1.InternalSymbol.Or,
            types: types,
        };
        return typeDefSetOr;
    }
    TaipuStatic.CreateTypeUnion = CreateTypeUnion;
    function CreatePartialType(typeDefinition) {
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
            return __assign({}, typeDefinition, { types: typeDefinition.types.concat([undefined]) });
        }
        // Taipu instance
        if (IsTaipuInstance(typeDefinition)) {
            // Get the type definition object inside and convert the definition to a partial type
            var newTypeDefinition = CreatePartialType(typeDefinition.typeDefinition);
            return new index_1.Taipu(typeDefinition.name, newTypeDefinition);
        }
        // Object interface 
        if (IsTypeDefinitionObjectInterface(typeDefinition)) {
            var newTypeDefinitionObj = {};
            // Run through all keys, and translate them to a type union with
            // `undefined` into a new type def object
            for (var key in typeDefinition) {
                newTypeDefinitionObj[key] = CreateTypeUnion(typeDefinition[key], undefined);
            }
            return newTypeDefinitionObj;
        }
        throw new Error("Cannot convert input to a partial type");
    }
    TaipuStatic.CreatePartialType = CreatePartialType;
    /**
     * Returns the string representation of the given type.
     *
     * @param typeDefinition Given type to get name of
     */
    function GetTypeName(typeDefinition) {
        // Undefined and null, Taipu instances use their string representations
        if (IsTypeDefinitionUndefined(typeDefinition) ||
            IsTypeDefinitionNull(typeDefinition) ||
            IsTaipuInstance(typeDefinition)) {
            return "" + typeDefinition;
        }
        // Primitives are defined by their constructors
        if (IsTypeDefinitionString(typeDefinition)) {
            return "string";
        }
        if (IsTypeDefinitionNumber(typeDefinition)) {
            return "number";
        }
        if (IsTypeDefinitionBoolean(typeDefinition)) {
            return "boolean";
        }
        if (IsTypeDefinitionSymbol(typeDefinition)) {
            return "symbol";
        }
        // Constructor functions
        if (IsTypeDefinitionConstructor(typeDefinition)) {
            return GetFunctionName(typeDefinition);
        }
        // Object interface
        if (IsTypeDefinitionObjectInterface(typeDefinition)) {
            return "[Interface]";
        }
        // Type union
        if (IsTypeDefinitionSetOr(typeDefinition)) {
            return GetTypeUnionName(typeDefinition);
        }
        throw new Error("Cannot convert type definition to string");
    }
    TaipuStatic.GetTypeName = GetTypeName;
    /**
     * Returns the name of the function, where available.
     *
     * @param fn Given function to get name of
     */
    function GetFunctionName(fn) {
        // Attempt to get the function name
        var functionName = fn.name;
        // [function].name may not be defined or may not be a string value
        // (e.g. when it has been declared as a method)
        if (typeof functionName !== "string") {
            return "[Function]";
        }
        return functionName;
    }
    TaipuStatic.GetFunctionName = GetFunctionName;
    /**
     * Returns a string representation of a type union.
     *
     * @param typeUnion
     */
    function GetTypeUnionName(typeUnion) {
        return "(" + typeUnion.types.map(GetTypeName).join(" | ") + ")";
    }
    TaipuStatic.GetTypeUnionName = GetTypeUnionName;
    /**
     * Prepends the Taipu instance name to the message of a validation result,
     * and returns a new copy of the validation result object.
     *
     * @param result Validation result object
     * @param instance Taipu instance
     */
    function PrependTaipuInstanceNameToValidationMessage(result, instance) {
        // Prefix Taipu instance name if message content is not undefined
        var newMessage = result.message === undefined ? undefined : instance.toString() + ": " + result.message;
        return __assign({}, result, { message: newMessage });
    }
    TaipuStatic.PrependTaipuInstanceNameToValidationMessage = PrependTaipuInstanceNameToValidationMessage;
    /**
     * Runs validation of the value against the type definition.
     *
     * @param typeDefinition Type definition
     * @param value Value to test
     * @param propChain Property access chain
     */
    function Validate(typeDefinition, value, propChain) {
        if (propChain === void 0) { propChain = []; }
        // Undefined and null
        if (typeDefinition === undefined) {
            return ValidateUndefined(value, propChain);
        }
        if (typeDefinition === null) {
            return ValidateNull(value, propChain);
        }
        // Primitives are defined by their constructors
        if (IsTypeDefinitionString(typeDefinition)) {
            return ValidateString(value, propChain);
        }
        if (IsTypeDefinitionNumber(typeDefinition)) {
            return ValidateNumber(value, propChain);
        }
        if (IsTypeDefinitionBoolean(typeDefinition)) {
            return ValidateBoolean(value, propChain);
        }
        if (IsTypeDefinitionSymbol(typeDefinition)) {
            return ValidateSymbol(value, propChain);
        }
        // Checking values (object instances) against constructors
        if (IsTypeDefinitionConstructor(typeDefinition)) {
            return ValidateInstanceOf(typeDefinition, value, propChain);
        }
        // Taipu instance
        if (IsTaipuInstance(typeDefinition)) {
            var taipuInstance = typeDefinition;
            var result = Validate(taipuInstance.typeDefinition, value, propChain);
            return PrependTaipuInstanceNameToValidationMessage(result, taipuInstance);
        }
        // Object interface 
        if (IsTypeDefinitionObjectInterface(typeDefinition)) {
            return ValidateObjectInterface(typeDefinition, value, propChain);
        }
        // Type union
        if (IsTypeDefinitionSetOr(typeDefinition)) {
            return ValidateTypeUnion(typeDefinition, value, propChain);
        }
        throw new Error("Cannot validate value with type definition");
    }
    TaipuStatic.Validate = Validate;
    function ValidateUndefined(value, propChain) {
        var success = (value === undefined);
        var message = success ? undefined : "Value is not `undefined`";
        return {
            propChain: propChain,
            success: success,
            message: message,
        };
    }
    TaipuStatic.ValidateUndefined = ValidateUndefined;
    function ValidateNull(value, propChain) {
        var success = (value === null);
        var message = success ? undefined : "Value is not `null`";
        return {
            propChain: propChain,
            success: success,
            message: message,
        };
    }
    TaipuStatic.ValidateNull = ValidateNull;
    function ValidateString(value, propChain) {
        var success = (typeof value === "string");
        var message = success ? undefined : "Value is not of type \"string\"";
        return {
            propChain: propChain,
            success: success,
            message: message,
        };
    }
    TaipuStatic.ValidateString = ValidateString;
    function ValidateNumber(value, propChain) {
        var success = (typeof value === "number");
        var message = success ? undefined : "Value is not of type \"number\"";
        return {
            propChain: propChain,
            success: success,
            message: message,
        };
    }
    TaipuStatic.ValidateNumber = ValidateNumber;
    function ValidateBoolean(value, propChain) {
        var success = (typeof value === "boolean");
        var message = success ? undefined : "Value is not of type \"boolean\"";
        return {
            propChain: propChain,
            success: success,
            message: message,
        };
    }
    TaipuStatic.ValidateBoolean = ValidateBoolean;
    function ValidateSymbol(value, propChain) {
        var success = (typeof value === "symbol");
        var message = success ? undefined : "Value is not of type \"symbol\"";
        return {
            propChain: propChain,
            success: success,
            message: message,
        };
    }
    TaipuStatic.ValidateSymbol = ValidateSymbol;
    function ValidateInstanceOf(constructor, value, propChain) {
        var success = (value instanceof constructor);
        var message = success ? undefined : "Value is not instance of \"" + GetFunctionName(constructor) + "\"";
        return {
            propChain: propChain,
            success: success,
            message: message,
        };
    }
    TaipuStatic.ValidateInstanceOf = ValidateInstanceOf;
    function ValidateObjectInterface(objInterface, value, propChain) {
        // If undefined or null, we can't read any properties regardless
        if (value === undefined || value === null) {
            return {
                propChain: propChain,
                success: false,
                message: "Expected object value, got `" + value + "`",
            };
        }
        for (var prop in objInterface) {
            var propValidationResult = Validate(objInterface[prop], value[prop], propChain.concat([prop]));
            // Return the inner validation result if the validation fails
            if (propValidationResult.success === false) {
                return propValidationResult;
            }
        }
        return {
            propChain: propChain,
            success: true,
            message: undefined,
        };
    }
    TaipuStatic.ValidateObjectInterface = ValidateObjectInterface;
    function ValidateTypeUnion(typeUnion, value, propChain) {
        var success = typeUnion.types.some(function (typeDef) {
            return Validate(typeDef, value, propChain).success;
        });
        var message = success ? undefined : "Value is not of type \"" + GetTypeUnionName(typeUnion) + "\"";
        return {
            propChain: propChain,
            success: success,
            message: message,
        };
    }
    TaipuStatic.ValidateTypeUnion = ValidateTypeUnion;
    function IsTypeDefinitionUndefined(typeDefinition) {
        return typeDefinition === undefined;
    }
    TaipuStatic.IsTypeDefinitionUndefined = IsTypeDefinitionUndefined;
    function IsTypeDefinitionNull(typeDefinition) {
        return typeDefinition === null;
    }
    TaipuStatic.IsTypeDefinitionNull = IsTypeDefinitionNull;
    function IsTypeDefinitionString(typeDefinition) {
        return typeDefinition === String;
    }
    TaipuStatic.IsTypeDefinitionString = IsTypeDefinitionString;
    function IsTypeDefinitionNumber(typeDefinition) {
        return typeDefinition === Number;
    }
    TaipuStatic.IsTypeDefinitionNumber = IsTypeDefinitionNumber;
    function IsTypeDefinitionBoolean(typeDefinition) {
        return typeDefinition === Boolean;
    }
    TaipuStatic.IsTypeDefinitionBoolean = IsTypeDefinitionBoolean;
    function IsTypeDefinitionSymbol(typeDefinition) {
        return typeDefinition === Symbol;
    }
    TaipuStatic.IsTypeDefinitionSymbol = IsTypeDefinitionSymbol;
    function IsTypeDefinitionConstructor(typeDefinition) {
        return typeof typeDefinition === "function";
    }
    TaipuStatic.IsTypeDefinitionConstructor = IsTypeDefinitionConstructor;
    function IsTypeDefinitionObjectInterface(typeDefinition) {
        return ObjectInterfaceSet.has(typeDefinition);
    }
    TaipuStatic.IsTypeDefinitionObjectInterface = IsTypeDefinitionObjectInterface;
    function IsTypeDefinitionSetOr(typeDefinition) {
        return (typeDefinition || {}).__type === TypeDefinition_1.InternalSymbol.Or;
    }
    TaipuStatic.IsTypeDefinitionSetOr = IsTypeDefinitionSetOr;
})(TaipuStatic = exports.TaipuStatic || (exports.TaipuStatic = {}));
//# sourceMappingURL=TaipuStatic.js.map