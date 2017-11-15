"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TypeDefinition_1 = require("./TypeDefinition");
var Taipu = /** @class */ (function () {
    /**
     * @param name Name of the Taipu type
     * @param typeDefinition Type definition of the Taipu type
     */
    function Taipu(name, typeDefinition) {
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
    Taipu.prototype.toString = function () {
        return "Taipu(\"" + this.name + "\" = " + Taipu.GetTypeName(this.typeDefinition) + ")";
    };
    /**
     * Validates the given value to the type definition defined in the Taipu
     * instance.
     *
     * @param value Value to test
     */
    Taipu.prototype.validate = function (value) {
        var success = Taipu.Validate(this.typeDefinition, value);
        var validationResult = {
            success: success,
        };
        return validationResult;
    };
    /**
     * Runs validation of the given value, but only returns the success value.
     *
     * @param value Value to test
     */
    Taipu.prototype.is = function (value) {
        return this.validate(value).success;
    };
    /**
     * Determines if the value is a Taipu instance.
     *
     * @param value Value to test
     */
    Taipu.IsTaipuInstance = function (value) {
        return Taipu.InstanceSet.has(value);
    };
    /**
     * Creates a type union type definition from all supplied types.
     *
     * @param types All types to include in the type union
     */
    Taipu.CreateTypeUnion = function () {
        var types = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            types[_i] = arguments[_i];
        }
        var typeDefSetOr = {
            __type: TypeDefinition_1.InternalSymbol.Or,
            types: types,
        };
        return typeDefSetOr;
    };
    Taipu.AddToInstanceSet = function (instance) {
        Taipu.InstanceSet.add(instance);
        return instance;
    };
    Taipu.Validate = function (typeDefinition, value) {
        // Undefined and null
        if (typeDefinition === undefined) {
            return Taipu.ValidateUndefined(value);
        }
        if (typeDefinition === null) {
            return Taipu.ValidateNull(value);
        }
        // Primitives are defined by their constructors
        if (Taipu.IsTypeDefinitionString(typeDefinition)) {
            return Taipu.ValidateString(value);
        }
        if (Taipu.IsTypeDefinitionNumber(typeDefinition)) {
            return Taipu.ValidateNumber(value);
        }
        if (Taipu.IsTypeDefinitionBoolean(typeDefinition)) {
            return Taipu.ValidateBoolean(value);
        }
        if (Taipu.IsTypeDefinitionSymbol(typeDefinition)) {
            return Taipu.ValidateSymbol(value);
        }
        // Checking values (object instances) against constructors
        if (Taipu.IsTypeDefinitionConstructor(typeDefinition)) {
            return Taipu.ValidateInstanceOf(typeDefinition, value);
        }
        // Taipu instance
        if (Taipu.IsTaipuInstance(typeDefinition)) {
            return Taipu.Validate(typeDefinition.typeDefinition, value);
        }
        // Object interface 
        if (Taipu.IsTypeDefinitionObjectInterface(typeDefinition)) {
            return Taipu.ValidateObjectInterface(typeDefinition, value);
        }
        // Type union
        if (Taipu.IsTypeDefinitionSetOr(typeDefinition)) {
            return Taipu.ValidateTypeUnion(typeDefinition, value);
        }
        throw new Error("Cannot validate value with type definition");
    };
    Taipu.ValidateUndefined = function (value) {
        return value === undefined;
    };
    Taipu.ValidateNull = function (value) {
        return value === null;
    };
    Taipu.ValidateString = function (value) {
        return typeof value === "string";
    };
    Taipu.ValidateNumber = function (value) {
        return typeof value === "number";
    };
    Taipu.ValidateBoolean = function (value) {
        return typeof value === "boolean";
    };
    Taipu.ValidateSymbol = function (value) {
        return typeof value === "symbol";
    };
    Taipu.ValidateInstanceOf = function (constructor, value) {
        return value instanceof constructor;
    };
    Taipu.ValidateObjectInterface = function (objInterface, value) {
        return Object.keys(objInterface).every(function (prop) {
            return Taipu.Validate(objInterface[prop], value[prop]);
        });
    };
    Taipu.ValidateTypeUnion = function (typeUnion, value) {
        return typeUnion.types.some(function (typeDef) {
            return Taipu.Validate(typeDef, value);
        });
    };
    /**
     * Returns the string representation of the given type.
     *
     * @param typeDefinition Given type to get name of
     */
    Taipu.GetTypeName = function (typeDefinition) {
        // Undefined and null, Taipu instances use their string representations
        if (Taipu.IsTypeDefinitionUndefined(typeDefinition) ||
            Taipu.IsTypeDefinitionNull(typeDefinition) ||
            Taipu.IsTaipuInstance(typeDefinition)) {
            return "" + typeDefinition;
        }
        // Primitives are defined by their constructors
        if (Taipu.IsTypeDefinitionString(typeDefinition)) {
            return "string";
        }
        if (Taipu.IsTypeDefinitionNumber(typeDefinition)) {
            return "number";
        }
        if (Taipu.IsTypeDefinitionBoolean(typeDefinition)) {
            return "boolean";
        }
        if (Taipu.IsTypeDefinitionSymbol(typeDefinition)) {
            return "symbol";
        }
        // Constructor functions
        if (Taipu.IsTypeDefinitionConstructor(typeDefinition)) {
            // Attempt to get the constructor name
            var constructorName = typeDefinition.name;
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
            return "(" + typeDefinition.types.map(Taipu.GetTypeName).join(" | ") + ")";
        }
        throw new Error("Cannot convert type definition to string");
    };
    Taipu.RegisterTypeDefinitionObjectInterface = function (interfaceDesc) {
        Taipu.ObjectInterfaceSet.add(interfaceDesc);
        return interfaceDesc;
    };
    Taipu.IsTypeDefinitionUndefined = function (interfaceDesc) {
        return interfaceDesc === undefined;
    };
    Taipu.IsTypeDefinitionNull = function (interfaceDesc) {
        return interfaceDesc === null;
    };
    Taipu.IsTypeDefinitionString = function (interfaceDesc) {
        return interfaceDesc === String;
    };
    Taipu.IsTypeDefinitionNumber = function (interfaceDesc) {
        return interfaceDesc === Number;
    };
    Taipu.IsTypeDefinitionBoolean = function (interfaceDesc) {
        return interfaceDesc === Boolean;
    };
    Taipu.IsTypeDefinitionSymbol = function (interfaceDesc) {
        return interfaceDesc === Symbol;
    };
    Taipu.IsTypeDefinitionConstructor = function (interfaceDesc) {
        return typeof interfaceDesc === "function";
    };
    Taipu.IsTypeDefinitionObjectInterface = function (interfaceDesc) {
        return Taipu.ObjectInterfaceSet.has(interfaceDesc);
    };
    Taipu.IsTypeDefinitionSetOr = function (obj) {
        return (obj || {}).__type === TypeDefinition_1.InternalSymbol.Or;
    };
    /** Set of Taipu instances instantiated */
    Taipu.InstanceSet = new WeakSet();
    /** Set of object interfaces registered; used to keep track of interfaces */
    Taipu.ObjectInterfaceSet = new WeakSet();
    return Taipu;
}());
exports.Taipu = Taipu;
exports.or = Taipu.CreateTypeUnion;
//# sourceMappingURL=index.js.map