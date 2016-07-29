var should = require("should");

var construct_ISA95_addressSpace = require("./helpers/bootstrap").construct_ISA95_addressSpace;
var opcua = require("node-opcua");

describe("ISA95 ",function() {

    var addressSpace = null;

    before(function(done) {
        construct_ISA95_addressSpace(function(err,r){
            addressSpace=r;
            done(err);
        });
    });

    after(function(){
        if (addressSpace) {
            addressSpace.dispose();
            addressSpace = null;
        }
    });


    describe("Equipment class Type",function() {


        it("should extend the model with new methods dedicated to IS95",function() {
            opcua.AddressSpace.prototype.addEquipmentClassType.should.be.instanceOf(Function);
        });

        it("should create a equipment class Type",function() {

            var myEquipmentClassType = addressSpace.addEquipmentClassType({
                browseName:"MyEquipmentClassType"
            });
            myEquipmentClassType.browseName.toString().should.eql("MyEquipmentClassType");

            // ISA object must be enriched with useful ISA95 helper method
            myEquipmentClassType.addISA95ClassProperty.should.be.instanceOf(Function);

        });

        it("should instantiate a equipment class Type, instance object must expose the same property as its class",function() {

            var EquipmentLevel = opcua.ISA95.EquipmentLevel;

            var myEquipmentClassType = addressSpace.addEquipmentClassType({
                browseName:"MyEquipment2ClassType",
                equipmentLevel: EquipmentLevel.Other
            });
            var myEquipmentClassType = addressSpace.findObjectType("MyEquipment2ClassType");

            var equipement = myEquipmentClassType.instantiate({
                browseName: "MyEquipment"
            });


        })
    });
    describe("Complete Model",function(){

        var createEquipmentClassTypes = require("./helpers/isa95_demo_address_space").createEquipmentClassTypes;

        before(function() {
            createEquipmentClassTypes(addressSpace);

        });

        it("should instantiate a MixingReactor",function(){

            var mixingReactorClassType = addressSpace.findObjectType("MixingReactorClassType");
            mixingReactorClassType.browseName.toString().should.eql("MixingReactorClassType");


        });

        it("should instantiate a demo mode",function () {
            var instantiateSampleISA95Model = require("./helpers/isa95_demo_address_space").instantiateSampleISA95Model;
            instantiateSampleISA95Model(addressSpace);
        })

    });
});

