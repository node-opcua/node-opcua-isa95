var assert = require("assert");
var path = require("path");
var _ = require("underscore");


module.exports = function (opcua) {


    /**
     *
     * Attribute     Value
     * BrowseName    PhysicalAssetClassType
     * IsAbstract    False
     * Subtype of the ISA95ClassType defined in 7.6.2.
     * References                NodeClass     BrowseName         DataType           TypeDefinition                 ModellingRule
     * HasISA95ClassProperty     Variable      <PropertyName>     BaseDataType       PhysicalAssetClassPropertyType OptionalPlaceholder
     * HasISA95Attribute         Variable      Manufacturer                          CompanyType                    Optional
     * HasISA95Attribute         Variable      ModelNumber        String             BaseDataVariableType           Optional
     * TestedByPhysicalAssetTest Object       <TestSpecification>                    PhysicalAssetCapabilityTestSpecificationType
     *
     * @param options
     * @param options.browseName {String/QualifiedName} : the new PhysicalAssetClassType name
     * @param [options.manufacturer {CompanyType}] : the CompanyType
     * @param [options.modelNumber {String} ] : the model Number
     *
     */
    opcua.AddressSpace.prototype.addPhysicalAssetClassType = function(options) {

        assert(options.browseName);
        var addressSpace  = this;

        var physicalAssetClassType = addressSpace.findISA95ObjectType("PhysicalAssetClassType");
        var newPhysicalAssetClassType = addressSpace.addObjectType({
            browseName: options.browseName,
            subtypeOf: physicalAssetClassType
        });

        function addManufacturerAttribute(node,manufacturer) {
            addressSpace.addISA95Attribute({
                ISA95AttributeOf: node,
                typeDefinition: addressSpace.findISA95VariableType("CompanyType"),
                browseName: "Manufacturer",
                dataType: opcua.DataType.String,
                value: { dataType: opcua.DataType.String , value: "manufacturer"}
            });
        }
        // add optional property PhysicalAsset Level
        if (options.manufacturer) {
            addManufacturerAttribute(newPhysicalAssetClassType, options.manufacturer);
        }
        function addModelNumberAttribute(node,modelNumber) {

            assert(typeof modelNumber === "string","expecting modelNumber to be a string");
            addressSpace.addISA95Attribute({
                ISA95AttributeOf: node,
                browseName: "ModelNumber",
                dataType: "String",
                value: {dataType: opcua.DataType.String, value: modelNumber }
            });
        }
        if (options.modelNumber) {
            addModelNumberAttribute(newPhysicalAssetClassType, options.modelNumber);
        }

        return newPhysicalAssetClassType;
    };


    /**
     * Table 69 – PhysicalAssetType definition
     * Attribute   Value
     * BrowseName  PhysicalAssetType
     * IsAbstract  False
     * References                  NodeClass    BrowseName         DataType          TypeDefinition            ModellingRule
     * Subtype of the ISA95ObjectType defined in 7.6.3.
     * HasISA95Property            Variable    <PropertyName>      BaseDataType      PhysicalAssetPropertyType OptionalPlaceholder
     * MadeUpOfPhysicalAsset       Object      <PhysicalAsset>                       PhysicalAssetType         OptionalPlaceholder
     * TestedByPhysicalAssetTest   Object      <TestSpecification>                   PhysicalAssetCapabilityTestSpecificationType OptionalPlaceholder
     * DefinedByPhysicalAssetClass Object      PhysicalAssetClass                    PhysicalAssetClassType    Optional
     * LocatedIn                   Variables   PhysicalLocation    String            GeoSpatialLocationType    Optional
     * HasISA95Attribute           Variables   FixedAssetId        CDTIdentifier     BaseDataVariableType      Optional
     * HasISA95Attribute           Variables   VendorId            BaseDataType      CompanyType               Optional
     * ImplementationOf            Object      Equipment                             EquipmentType             Optional
     * HasComponent                Variable    AssetAssignment     structure         ISA95AssetAssignmentType  Optional
     *
     *  @param options
     *  @param options.browseName
     *  @param options.description
     *  @param [options.organizedBy]
     *  @param options.definedByPhysicalAssetClass
     *  @param [options.containedByPhysicalAsset {Object}
     *
     */
    opcua.AddressSpace.prototype.addPhysicalAsset = function(options) {

        var addressSpace  = this;
        var physicalAssetClassType = addressSpace.findISA95ObjectType("PhysicalAssetClassType");
        assert(physicalAssetClassType);

        var physicalAssetType = addressSpace.findISA95ObjectType("PhysicalAssetType");
        assert(physicalAssetType);

        options.typeDefinition = options.typeDefinition || physicalAssetType;

        // The SourceNode of this ReferenceType shall be an Object of EquipmentType or its subtype.
        assert(options.typeDefinition.isSupertypeOf(physicalAssetType),"TypeDefinition of PhysicalAsset to create shall be of type PhysicalAssetType");

        var physicalAsset = addressSpace.addObject({
            typeDefinition: options.typeDefinition,
            browseName:    options.browseName,
            description:   options.description,
            organizedBy: options.organizedBy,
        });

        assert(options.definedByPhysicalAssetClass," expecting a definedByPhysicalAssetClass options");
        opcua.ISA95.utils.installDefinedByFooClassReferences({
            node: physicalAsset,
            definedByFooClass :options.definedByPhysicalAssetClass,
            fooClassType: physicalAssetClassType,
            definedByFooClassRef: "DefinedByPhysicalAssetClass",
            fooType: physicalAssetType
        });


        function _physicalAsset_madeUpOfPhysicalAssets() {
            var node = this;
            var addressSpace = node.addressSpace;
            var madeUpOfEquipment = addressSpace.findISA95ReferenceType("MadeUpOfPhysicalAsset");
            return node.findReferencesExAsObject(madeUpOfEquipment);
        }

        if (options.containedByPhysicalAsset) {
            function _addContainedByPhysicalAssetReference(node,physicalAsset) {
                opcua.ISA95.utils._addContainedByFooReference(node,physicalAsset,
                    "PhysicalAssetType","MadeUpOfPhysicalAsset");
            }

            _addContainedByPhysicalAssetReference(physicalAsset,options.containedByPhysicalAsset);
        }

        physicalAsset.madeUpOfPhysicalAssets = _physicalAsset_madeUpOfPhysicalAssets;

        return physicalAsset;
    };

};
