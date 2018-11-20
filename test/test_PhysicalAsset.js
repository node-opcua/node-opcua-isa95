const should = require("should");

const construct_ISA95_addressSpace = require("./helpers/bootstrap").construct_ISA95_addressSpace;

const opcua = require("node-opcua");

describe("ISA95 ",function() {

    let addressSpace = null;

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
            opcua.AddressSpace.prototype.addPhysicalAssetType.should.be.instanceOf(Function);
            opcua.AddressSpace.prototype.addPhysicalAsset.should.be.instanceOf(Function);

        });

        it("should add a PhysicalAssetClassType",function() {

            const myPhysicalAssetClassType = addressSpace.addPhysicalAssetClassType({
                browseName:"MyPhysicalAssetClassType",
                manufacturer: {
                    dataType: "String",
                    value: {}
                }
            });
            myPhysicalAssetClassType.browseName.toString().should.eql("1:MyPhysicalAssetClassType");
            myPhysicalAssetClassType.subtypeOfObj.browseName.toString().should.eql("1:PhysicalAssetClassType");
        });

        describe("addPhysicalAssetType",function() {

            it("should addPhysicalAssetType",function() {

                const myPhysicalAssetType= addressSpace.addPhysicalAssetType({
                   browseName:"MyPhysicalAssetType"
                });

                const attr = addressSpace.addISA95Attribute({
                    ISA95AttributeOf: myPhysicalAssetType,
                    browseName: "MyAttribute",
                    dataType:"String",
                    value: { dataType: opcua.DataType.String,value:"SomeValue"},
                    modellingRule: "Mandatory"
                });


                const hasISA95Attribute = addressSpace.findISA95ReferenceType("HasISA95Attribute");
                hasISA95Attribute.browseName.toString().should.eql("1:HasISA95Attribute");

                myPhysicalAssetType.findReferencesExAsObject(hasISA95Attribute).length.should.eql(1);
                myPhysicalAssetType.findReferencesExAsObject(hasISA95Attribute)[0].browseName.toString().should.eql("1:MyAttribute");

                //
                const instance =  addressSpace.addPhysicalAsset({
                    typeDefinition:myPhysicalAssetType,
                    browseName: "MyInstance"
                });

                instance.typeDefinitionObj.browseName.toString().should.eql("1:MyPhysicalAssetType");
                instance.findReferencesExAsObject(hasISA95Attribute).length.should.eql(1);
                instance.findReferencesExAsObject(hasISA95Attribute)[0].browseName.toString().should.eql("1:MyAttribute");

           });

            it("should addPhysicalAssetType made up of a sub component, and instantiate it",function() {


                const myPhysicalAssetType= addressSpace.addPhysicalAssetType({
                    browseName:"MyPhysicalAssetType2"
                });

                const subPhysicalAsset = addressSpace.addPhysicalAsset({
                    containedByPhysicalAsset: myPhysicalAssetType,
                    browseName: "MySubComponent",
                    modellingRule: "Mandatory"
                });


                const madeUpOfPhysicalAsset = addressSpace.findISA95ReferenceType("MadeUpOfPhysicalAsset");
                madeUpOfPhysicalAsset.browseName.toString().should.eql("1:MadeUpOfPhysicalAsset");

                myPhysicalAssetType.findReferencesExAsObject(madeUpOfPhysicalAsset).length.should.eql(1);
                myPhysicalAssetType.findReferencesExAsObject(madeUpOfPhysicalAsset)[0].browseName.toString().should.eql("1:MySubComponent");

                //
                const instance =  addressSpace.addPhysicalAsset({
                    typeDefinition:myPhysicalAssetType,
                    browseName: "MyInstance"
                });

                instance.typeDefinitionObj.browseName.toString().should.eql("1:MyPhysicalAssetType2");
                instance.findReferencesExAsObject(madeUpOfPhysicalAsset).length.should.eql(1);
                instance.findReferencesExAsObject(madeUpOfPhysicalAsset)[0].browseName.toString().should.eql("1:MySubComponent");

            });


        });



        it ("should instantiate a physical asset",function() {

            const physicalAsset = addressSpace.addPhysicalAsset({
                browseName:"MyPhysicalAsset",
                description: "my description",
                definedByPhysicalAssetClass: "PhysicalAssetClassType"
            });

            physicalAsset.browseName.toString().should.eql("1:MyPhysicalAsset");
            //xx physicalAsset.description.toString().should.eql("my description");
            physicalAsset.typeDefinitionObj.browseName.toString().should.eql("1:PhysicalAssetType");

        });
        it ("should instantiate a physical asset with a custom type definition",function() {

            const namespace = addressSpace.getOwnNamespace();

            const customPhysicalAssetType = namespace.addObjectType({
                browseName: "CustomPhysicalAssetType",
                subtypeOf: addressSpace.findISA95ObjectType("PhysicalAssetType")
            });

            const physicalAsset = addressSpace.addPhysicalAsset({
                browseName:"MyPhysicalAsset2",
                definedByPhysicalAssetClass: "PhysicalAssetClassType",
                typeDefinition: customPhysicalAssetType
            });

            physicalAsset.typeDefinitionObj.browseName.toString().should.eql("1:CustomPhysicalAssetType");
            physicalAsset.definedByPhysicalAssetClass.length.should.eql(1);
            physicalAsset.definedByPhysicalAssetClass[0].should.eql(addressSpace.findISA95ObjectType("PhysicalAssetClassType"));

        });

        it("should implement a temperature sensor with a temperature Attribute",function () {
            const temperatureSensorClassType = addressSpace.addPhysicalAssetClassType({
                browseName:"TemperatureSensorClassType",
                manufacturer: {
                    dataType: "String",
                    value: {}
                }
            });
            temperatureSensorClassType.browseName.toString().should.eql("1:TemperatureSensorClassType");
            temperatureSensorClassType.subtypeOfObj.browseName.toString().should.eql("1:PhysicalAssetClassType");

            addressSpace.addISA95ClassProperty({
                ISA95ClassPropertyOf: temperatureSensorClassType,
                typeDefinition: "PhysicalAssetClassPropertyType",
                browseName: "Temperature",
                dataType: "Double"
            });

            // extend type with units

            // now implement a temperature sensor object
            const asset = addressSpace.addPhysicalAsset({
                browseName: "MyThermometer",
                definedByPhysicalAssetClass: temperatureSensorClassType,
            });

            asset.browseName.toString().should.eql("1:MyThermometer");
            asset.definedByPhysicalAssetClass.length.should.eql(1);
            asset.definedByPhysicalAssetClass[0].should.eql(temperatureSensorClassType);
        });

        it("should create physical Asset made up of other physical asset",function() {

            const computer = addressSpace.addPhysicalAsset({
                browseName:"Computer",
                definedByPhysicalAssetClass: "PhysicalAssetClassType"
            });
            const displayDevice = addressSpace.addPhysicalAsset({
                browseName:"DisplayDevice",
                definedByPhysicalAssetClass: "PhysicalAssetClassType",
                containedByPhysicalAsset: computer
            });
            const keyboard = addressSpace.addPhysicalAsset({
                browseName:"Keyboard",
                definedByPhysicalAssetClass: "PhysicalAssetClassType",
                containedByPhysicalAsset: computer
            });
            const mainUnit = addressSpace.addPhysicalAsset({
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

        it("should allow to specify implementationOf as a Equipment",function() {

            const frigeEquipment = addressSpace.addEquipment({
                browseName:"FridgeEquipment"
            });

            const fridge = addressSpace.addPhysicalAsset({
                browseName:"Fridge",
                definedByPhysicalAssetClass: "PhysicalAssetClassType",
                implementationOf: frigeEquipment
            });
            fridge.browseName.toString().should.eql("1:Fridge");

        });

        it("should allow to specify a vendorId",function() {

            const namespace = addressSpace.getOwnNamespace();
    
            const companyType = addressSpace.findISA95VariableType("CompanyType");
            companyType.browseName.toString().should.eql("1:CompanyType");

            const vendorIdNode = namespace.addVariable({
                browseName: "Vendor2",
                typeDefinition: companyType,
                dataType: "String",
                value: { dataType: opcua.DataType.String, value: "ACMO Corp Inc."}
            });


            const someAsset = addressSpace.addPhysicalAsset({
                browseName:"someAsset2",
                definedByPhysicalAssetClass: "PhysicalAssetClassType",
                vendorId: {
                    dataType: "String",
                    value : {
                        dataType: opcua.DataType.String,
                        value: "AcmeCorporation"
                    }
                }
            });
            someAsset.vendorId.browseName.toString().should.eql("1:VendorId");
            someAsset.vendorId.readValue().value.value.toString().should.eql("AcmeCorporation");
            someAsset.vendorId.dataType.toString().should.eql("ns=0;i=12"); // nodeId of DataType String

        });

        it("should allow to specify a fixedAssetId",function() {

            const someAsset = addressSpace.addPhysicalAsset({
                browseName:"someAsset1",
                definedByPhysicalAssetClass: "PhysicalAssetClassType",
                fixedAssetId: "SN12343567"
            });
            someAsset.fixedAssetId.browseName.toString().should.eql("1:FixedAssetId");
            someAsset.fixedAssetId.readValue().value.value.should.eql("SN12343567");
        });


    });
});
