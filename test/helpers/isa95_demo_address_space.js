var opcua = require("node-opcua");


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

        mixingReactorClassType.addISA95ClassProperty({
            browseName: "Pressure",
            dataType: "Double"

        });
    }

    function defineHeatingReactorClassType() {

        var heatingReactorClassType = addressSpace.addEquipmentClassType({
            browseName: "HeatingReactorClassType",
            equipmentLevel: EquipmentLevel.EquipmentModule
        });

        heatingReactorClassType.addISA95ClassProperty({
            browseName: "Temperature",
            dataType: "Double"
        });
    }

    function defineHeatingMixingReactorClassType() {

        var heatingMixingReactorClassType = addressSpace.addEquipmentClassType({
            browseName: "HeatingMixingReactorClassType",
            equipmentLevel: EquipmentLevel.EquipmentModule,
            definedByEquipmentClass: [
                "HeatingReactorClassType",
                "MixingReactorClassType"
            ]
        });
        var definedByEquipmentClass = addressSpace.findISA95ReferenceType("DefinedByEquipmentClass");

        var heatingReactorClassType = addressSpace.findObjectType("HeatingReactorClassType");
        var mixingReactorClassType = addressSpace.findObjectType("MixingReactorClassType");

        heatingMixingReactorClassType.addReference({
            referenceType: definedByEquipmentClass.nodeId, nodeId: heatingReactorClassType
        });

        heatingMixingReactorClassType.addReference({
            referenceType: definedByEquipmentClass.nodeId, nodeId: mixingReactorClassType
        });

        mixingReactorClassType.addISA95ClassProperty({
            browseName: "Pressure",
            dataType: "Double"
        });
        mixingReactorClassType.addISA95ClassProperty({
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
    defineHeatingMixingReactorClassType();
    defineCoordinateMeasuringMachineClassType();
    defineRobotClassType();

};


exports.instantiateSampleISA95Model = function(addressSpace) {


    var enterpriseClassType = addressSpace.findObjectType("EnterpriseClassType");


    var enterprise = enterpriseClassType.instantiate({
        browseName: "ACME Corporation"
    });

    enterprise.equipmentLevel.readValue().value.value.should.eql(opcua.ISA95.EquipmentLevel.Enterprise.value);

    var enterpriseSiteClassType = addressSpace.findObjectType("EnterpriseSiteClassType");

    var site1 = enterpriseSiteClassType.instantiate({
        browseName: "ACME Corporation- New Town site"
        // ISA properties
    });
    site1.equipmentLevel.readValue().value.value.should.eql(opcua.ISA95.EquipmentLevel.Site.value);

    var site2 = enterpriseSiteClassType.instantiate({
        browseName: "ACME Corporation- New Town site"
        // ISA properties
    });
    site2.equipmentLevel.readValue().value.value.should.eql(opcua.ISA95.EquipmentLevel.Site.value);


};
