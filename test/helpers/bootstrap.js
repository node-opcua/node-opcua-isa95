
const opcua  = require("node-opcua");
const should = require("should");
const fs = require("fs");
const path = require("path");

const construct_ISA95_addressSpace = function (callback) {


    // add ISA95 Extensions
    require("../../index")(opcua);

    let addressSpace = new opcua.AddressSpace();

    fs.existsSync(opcua.ISA95.nodeset_file).should.be.eql(true,opcua.ISA95.nodeset_file + " should exist");

    const xml_files = [
        opcua.standard_nodeset_file,
        opcua.ISA95.nodeset_file
    ];
    opcua.generate_address_space(addressSpace, xml_files, function (err) {


        callback(err,addressSpace);
    });
};

const get_node_opcua_path = function () {
  let resolvedNodeOPCUA = require.resolve('node-opcua')
  let pathToNodeOPCUA = ''

  if (this.isWindows) {
    pathToNodeOPCUA = resolvedNodeOPCUA.replace('\\index.js', '')
  } else {
    pathToNodeOPCUA = resolvedNodeOPCUA.replace('/index.js', '')
  }

  return pathToNodeOPCUA
}

exports.construct_ISA95_addressSpace = construct_ISA95_addressSpace;
exports.get_node_opcua_path = get_node_opcua_path;

process.env.NODE_PATH = get_node_opcua_path() + ";" + process.env.NODE_PATH;
require('module').Module._initPaths();

//xx after(function () {
//xx s    addressSpace.dispose();
//xx     addressSpace = null;
//xx });


