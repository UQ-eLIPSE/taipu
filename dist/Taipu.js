"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TaipuStatic_1 = require("./TaipuStatic");
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
        TaipuStatic_1.TaipuStatic.RegisterTaipuInstance(this);
        // Register object interface
        //
        // The below `if` statement narrows the expected type of the type 
        // definition down to what we expect to be 
        // `TypeDefinitionObjectInterface`
        if (typeDefinition !== null &&
            typeof typeDefinition === "object" &&
            !TaipuStatic_1.TaipuStatic.IsTaipuInstance(typeDefinition) &&
            !TaipuStatic_1.TaipuStatic.IsTypeDefinitionSetOr(typeDefinition)) {
            TaipuStatic_1.TaipuStatic.RegisterTypeDefinitionObjectInterface(typeDefinition);
        }
    }
    Taipu.prototype.toString = function () {
        return "Taipu(\"" + this.name + "\")";
    };
    Object.defineProperty(Taipu.prototype, "type", {
        get: function () {
            return TaipuStatic_1.TaipuStatic.GetTypeName(this.typeDefinition);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Validates the given value to the type definition defined in the Taipu
     * instance.
     *
     * @param value Value to test
     */
    Taipu.prototype.validate = function (value) {
        var result = TaipuStatic_1.TaipuStatic.Validate(this.typeDefinition, value);
        return TaipuStatic_1.TaipuStatic.PrependTaipuInstanceNameToValidationMessage(result, this);
    };
    /**
     * Runs validation of the given value, but only returns the success value.
     *
     * @param value Value to test
     */
    Taipu.prototype.is = function (value) {
        return this.validate(value).success;
    };
    // Determines if value is a Taipu instance.
    Taipu.IsTaipuInstance = TaipuStatic_1.TaipuStatic.IsTaipuInstance;
    // Creates a type union type definition from all supplied types.
    Taipu.CreateTypeUnion = TaipuStatic_1.TaipuStatic.CreateTypeUnion;
    // Translates a type definition or Taipu instance to one which accepts
    // `undefined` on its properties.
    Taipu.CreatePartialType = TaipuStatic_1.TaipuStatic.CreatePartialType;
    // Returns the string representation of the given type.
    Taipu.GetTypeName = TaipuStatic_1.TaipuStatic.GetTypeName;
    return Taipu;
}());
exports.Taipu = Taipu;
exports.or = Taipu.CreateTypeUnion;
exports.partial = Taipu.CreatePartialType;
//# sourceMappingURL=Taipu.js.map