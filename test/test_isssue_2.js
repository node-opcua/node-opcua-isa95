const should = require("should");

const construct_ISA95_addressSpace = require("./helpers/bootstrap").construct_ISA95_addressSpace;

const opcua = require("node-opcua");

describe("GitHub Issues ",function() {

    let addressSpace = null;
    this.timeout(20000);

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


    it("#2 - should be possible to specify nodeId in addEquipment",function() {

      const equipment = addressSpace.addEquipment({
          browseName:"SomeEquiment",
          nodeId: "i=1234"
      });
      equipment.nodeId.toString().should.eql("ns=1;i=1234");
    });

});
