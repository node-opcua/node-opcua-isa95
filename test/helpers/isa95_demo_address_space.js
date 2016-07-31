var opcua = require("node-opcua");
var _ = require("underscore");

require("../../")(opcua);

var assert = require("assert");
var should = require("should");

exports.createEquipmentClassTypes = function (addressSpace) {

    var EquipmentLevel = opcua.ISA95.EquipmentLevel;

    function defineEnterpriseClassType() {
        var enterpriseClassType = addressSpace.addEquipmentClassType({
            browseName: "EnterpriseClassType",
            equipmentLevel: EquipmentLevel.Enterprise
        });
    }
    function defineEnterpriseSiteClassType() {
        var enterpriseSiteClassType = addressSpace.addEquipmentClassType({
            browseName: "EnterpriseSiteClassType",
            equipmentLevel: EquipmentLevel.Site
        });
    }
    function defineEnterpriseSiteAreaClassType() {
        var enterpriseSiteAreaClassType = addressSpace.addEquipmentClassType({
            browseName: "EnterpriseSiteAreaClassType",
            equipmentLevel: EquipmentLevel.Area
        });
    }
    function defineEnterpriseSiteAreaProductionUnitClassType() {
        var enterpriseSiteAreaProductionUnitClassType = addressSpace.addEquipmentClassType({
            browseName: "EnterpriseSiteAreaProductionUnitClassType",
            equipmentLevel: EquipmentLevel.ProductionUnit
        });
    }
    defineEnterpriseClassType();
    defineEnterpriseSiteClassType();
    defineEnterpriseSiteAreaClassType();
    defineEnterpriseSiteAreaProductionUnitClassType();


    function defineMixingReactorClassType() {

        var mixingReactorClassType = addressSpace.addEquipmentClassType({
            browseName: "MixingReactorClassType",
            equipmentLevel: EquipmentLevel.EquipmentModule
        });

        addressSpace.addISA95ClassProperty({
            ISA95ClassPropertyOf: mixingReactorClassType,
            typeDefinition: "ISA95ClassPropertyType",
            browseName: "Pressure",
            dataType: "Double"
        });
    }

    function defineHeatingReactorClassType() {

        var heatingReactorClassType = addressSpace.addEquipmentClassType({
            browseName: "HeatingReactorClassType",
            equipmentLevel: EquipmentLevel.EquipmentModule
        });

        addressSpace.addISA95ClassProperty({
            ISA95ClassPropertyOf: heatingReactorClassType,
            typeDefinition: "ISA95ClassPropertyType",
            browseName: "Temperature",
            dataType: "Double"
        });
    }

    function defineHeatingMixingReactorType() {

        var heatingReactorClassType = addressSpace.findObjectType("HeatingReactorClassType");
        var mixingReactorClassType = addressSpace.findObjectType("MixingReactorClassType");

        var heatingMixingReactorClassType = addressSpace.addEquipmentType({
            browseName: "HeatingMixingReactorClassType",
            equipmentLevel: EquipmentLevel.EquipmentModule,
            definedByEquipmentClass: [
                heatingReactorClassType,
                mixingReactorClassType
            ]
        });


        addressSpace.addISA95ClassProperty({
            ISA95ClassPropertyOf: heatingMixingReactorClassType,
            typeDefinition: "ISA95ClassPropertyType",
            browseName: "Pressure",
            dataType: "Double"
        });
        addressSpace.addISA95ClassProperty({
            ISA95ClassPropertyOf: heatingMixingReactorClassType,
            typeDefinition: "ISA95ClassPropertyType",
            browseName: "Temperature",
            dataType: "Double"
        });
    }

    function defineCoordinateMeasuringMachineClassType() {
        var coordinateMeasuringMachineClassType = addressSpace.addEquipmentClassType({
            browseName: "CoordinateMeasuringMachineClassType"
        });
    }

    function defineRobotClassType() {
        var RobotClassType = addressSpace.addEquipmentClassType({
            browseName: "RobotClassType"
        });
    }


    defineMixingReactorClassType();
    defineHeatingReactorClassType();
    defineHeatingMixingReactorType();

    defineCoordinateMeasuringMachineClassType();
    defineRobotClassType();

};


exports.instantiateSampleISA95Model = function(addressSpace) {

    assert(addressSpace instanceof opcua.AddressSpace);

    if (!addressSpace.findObjectType("EnterpriseClassType")) {
        exports.createEquipmentClassTypes(addressSpace);
    }

    var enterpriseClassType = addressSpace.findObjectType("EnterpriseClassType");
    should(enterpriseClassType).not.eql(null);


    var enterprise = addressSpace.addEquipment({
        browseName: "ACME Corporation",
        definedByEquipmentClass: enterpriseClassType
    });
    enterprise.definedByEquipmentClass.should.eql(enterpriseClassType);

    enterprise.equipmentLevel.readValue().value.value.should.eql(opcua.ISA95.EquipmentLevel.Enterprise.value);

    var enterpriseSiteClassType = addressSpace.findObjectType("EnterpriseSiteClassType");

    var site1 = addressSpace.addEquipment({
        definedByEquipmentClass: enterpriseSiteClassType,
        browseName: "ACME Corporation- New Town site",
        // ISA properties
        containedByEquipment: enterprise
    });
    site1.equipmentLevel.readValue().value.value.should.eql(opcua.ISA95.EquipmentLevel.Site.value);

    site1.definedByEquipmentClass.should.eql(enterpriseSiteClassType);


    var site2 = addressSpace.addEquipment({
        browseName: "ACME Corporation- New Town site",
        definedByEquipmentClass: enterpriseSiteClassType,
        // ISA properties
        containedByEquipment: enterprise
    });
    site2.equipmentLevel.readValue().value.value.should.eql(opcua.ISA95.EquipmentLevel.Site.value);

    var equipmentType = addressSpace.findISA95ObjectType("EquipmentType");

    //xx site2.typeDefinition.should.eql(equipmentType);

    site2.definedByEquipmentClass.should.eql(enterpriseSiteClassType);

    site2.containedByEquipment.should.eql(enterprise);

    var r = site2.findReferencesEx(addressSpace.findISA95ReferenceType("MadeUpOfEquipment"),opcua.browse_service.BrowseDirection.Inverse);
    r.length.should.eql(1);



};
