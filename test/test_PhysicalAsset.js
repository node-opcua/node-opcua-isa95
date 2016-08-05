var should = require("should");

var construct_ISA95_addressSpace = require("./helpers/bootstrap").construct_ISA95_addressSpace;

var opcua = require("node-opcua");

describe("ISA95 ",function() {

    var addressSpace = null;

    before(function (done) {
        construct_ISA95_addressSpace(function (err, r) {
            addressSpace = r;
            done(err);
        });
    });

    after(function () {
        if (addressSpace) {
            addressSpace.dispose();
            addressSpace = null;
        }
    });


    describe("ISA95 PhysicalAsset support", function () {

        it("should extend the model with new methods dedicated to IS95 Physical Asset",function() {

            opcua.AddressSpace.prototype.addPhysicalAssetClassType.should.be.instanceOf(Function);
           //xx opcua.AddressSpace.prototype.addPhysicalAssetType.should.be.instanceOf(Function);
            opcua.AddressSpace.prototype.addPhysicalAsset.should.be.instanceOf(Function);

        });

        it("should add a PhysicalAssetClassType",function() {

            var myPhysicalAssetClassType = addressSpace.addPhysicalAssetClassType({
                browseName:"MyPhysicalAssetClassType",
                manufacturer: {
                    dataType: "String",
                    value: {}
                }
            });
            myPhysicalAssetClassType.browseName.toString().should.eql("MyPhysicalAssetClassType");
            myPhysicalAssetClassType.subtypeOfObj.browseName.toString().should.eql("1:PhysicalAssetClassType");

        });

        it ("should instantiate a physical asset",function() {

            var physicalAsset = addressSpace.addPhysicalAsset({
                browseName:"MyPhysicalAsset",
                description: "my description",
                definedByPhysicalAssetClass: "PhysicalAssetClassType"
            });

            physicalAsset.browseName.toString().should.eql("MyPhysicalAsset");
            //xx physicalAsset.description.toString().should.eql("my description");
            physicalAsset.typeDefinitionObj.browseName.toString().should.eql("1:PhysicalAssetType");

        });
        it ("should instantiate a physical asset with a custom type definition",function() {

            var customPhysicalAssetType = addressSpace.addObjectType({
                browseName: "CustomPhysicalAssetType",
                subtypeOf: addressSpace.findISA95ObjectType("PhysicalAssetType")
            });

            var physicalAsset = addressSpace.addPhysicalAsset({
                browseName:"MyPhysicalAsset2",
                definedByPhysicalAssetClass: "PhysicalAssetClassType",
                typeDefinition: customPhysicalAssetType
            });

            physicalAsset.typeDefinitionObj.browseName.toString().should.eql("CustomPhysicalAssetType");
            physicalAsset.definedByPhysicalAssetClass.length.should.eql(1);
            physicalAsset.definedByPhysicalAssetClass[0].should.eql(addressSpace.findISA95ObjectType("PhysicalAssetClassType"));

        });

        it("should implement a temperature sensor with a temperature Attribute",function () {
            var temperatureSensorClassType = addressSpace.addPhysicalAssetClassType({
                browseName:"TemperatureSensorClassType",
                manufacturer: {
                    dataType: "String",
                    value: {}
                }
            });
            temperatureSensorClassType.browseName.toString().should.eql("TemperatureSensorClassType");
            temperatureSensorClassType.subtypeOfObj.browseName.toString().should.eql("1:PhysicalAssetClassType");

            addressSpace.addISA95ClassProperty({
                ISA95ClassPropertyOf: temperatureSensorClassType,
                typeDefinition: "PhysicalAssetClassPropertyType",
                browseName: "Temperature",
                dataType: "Double"
            });

            // extend type with units

            // now implement a temperature sensor object

            var asset = addressSpace.addPhysicalAsset({
                browseName: "MyThermometer",
                definedByPhysicalAssetClass: temperatureSensorClassType,
                vendorId: "#123456732423"
            });

            asset.browseName.toString().should.eql("MyThermometer");
            asset.definedByPhysicalAssetClass.length.should.eql(1);
            asset.definedByPhysicalAssetClass[0].should.eql(temperatureSensorClassType);
        });

        it("should create physical Asset made up of other physical asset",function() {

            var computer = addressSpace.addPhysicalAsset({
                browseName:"Computer",
                definedByPhysicalAssetClass: "PhysicalAssetClassType"
            });
            var displayDevice = addressSpace.addPhysicalAsset({
                browseName:"DisplayDevice",
                definedByPhysicalAssetClass: "PhysicalAssetClassType",
                containedByPhysicalAsset: computer
            });
            var keyboard = addressSpace.addPhysicalAsset({
                browseName:"Keyboard",
                definedByPhysicalAssetClass: "PhysicalAssetClassType",
                containedByPhysicalAsset: computer
            });
            var mainUnit = addressSpace.addPhysicalAsset({
                browseName:"MainUnit",
                definedByPhysicalAssetClass: "PhysicalAssetClassType",
                containedByPhysicalAsset: computer
            });


            computer.madeUpOfPhysicalAssets().length.should.eql(3);
            displayDevice.madeUpOfPhysicalAssets().length.should.eql(0);
            keyboard.madeUpOfPhysicalAssets().length.should.eql(0);
            mainUnit.madeUpOfPhysicalAssets().length.should.eql(0);

            displayDevice.containedByPhysicalAsset.should.eql(computer);
            keyboard.containedByPhysicalAsset.should.eql(computer);
            mainUnit.containedByPhysicalAsset.should.eql(computer);
        });

    });
});
