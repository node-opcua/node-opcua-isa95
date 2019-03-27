const should = require("should");

const construct_ISA95_addressSpace = require("./helpers/bootstrap").construct_ISA95_addressSpace;
const instantiateSampleISA95Model = require("../test/helpers/isa95_demo_address_space").instantiateSampleISA95Model;

const opcua = require("node-opcua");

describe("test demo address space", function() {

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

    it("should create a demo ISO 95 addressSpace",function(done) {

        instantiateSampleISA95Model(addressSpace);
        done();
    });

});