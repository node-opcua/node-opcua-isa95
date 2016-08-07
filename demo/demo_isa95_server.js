/*global require,setInterval,console */

var opcua = require("node-opcua");

// let's add the ISA95 server extensions
require("node-opcua-isa95")(opcua);

var xmlFiles = [
    opcua.standard_nodeset_file,
    opcua.ISA95.nodeset_file
];


// Let's create an instance of OPCUAServer
var server = new opcua.OPCUAServer({

    port: 4334, // the port of the listening socket of the server

    nodeset_filename: xmlFiles,
    resourcePath: "UA/MyLittleISA95Server", // this path will be added to the endpoint resource name
    buildInfo : {
        productName: "MySampleServerISA95"
    }
});


function post_initialize() {
    console.log("initialized");

    var instantiateSampleISA95Model = require("../test/helpers/isa95_demo_address_space").instantiateSampleISA95Model;
    var addressSpace = server.engine.addressSpace;
    instantiateSampleISA95Model(addressSpace);

    server.start(function() {
        console.log("Server is now listening ... ( press CTRL+C to stop)");
        console.log("port ", server.endpoints[0].port);
        var endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
        console.log(" the primary server endpoint url is ", endpointUrl );
    });
}

server.initialize(post_initialize);
