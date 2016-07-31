var assert = require("assert");
var path = require("path");
var _ = require("underscore");

exports.install = function(opcua) {

    var BrowseDirection = opcua.browse_service.BrowseDirection;

    if (opcua.hasOwnProperty("ISA95")){
        return false;
    }

    var Enum = opcua.Enum;//require("enum");

    var EquipmentLevel = new Enum({
        // ISA95EquipmentElementLevelEnum
        //
        // This DataType is an enumeration that defines the equipment element levels defined in ISA-95. Its values are
        // defined in a below table.
        // Note:  for enumeration DataTypes it is recommended that variables that use the enumeration also expose the EnumStrings
        //        property. This property allows a client to easily translate the enumeration (integer value) to a string for
        //        display (see OPC Part 3).
        // Table 36 – ISA95EquipmentElementLevelEnum Values
        //
        // Value              Description
        // ENTERPRISE_0       An enterprise is a collection of sites and areas and represents the top level of a role based
        //                    equipment hierarchy.
        Enterprise: 0,

        // SITE_1             A site is a physical, geographical, or logical grouping determined by the enterprise. It may contain
        //                    areas, production lines, process cells, and production units.
        Site: 1,

        // AREA_2             An area is a physical, geographical, or logical grouping determined by the site. It may contain work
        //                    centres such as process cells, production units, production lines, and storage zones.
        Area: 2,

        // PROCESSCELL_3      Process cells are the low level of equipment typically scheduled by the Level 4 and Level 3
        //                    functions for batch manufacturing processes. The definitions for process cells are
        //                    contained in IEC 61512-1.
        ProcessCell: 3,

        // UNIT_4             Units are low level of equipment typically scheduled by the Level 4 and Level 3 functions for batch
        //                    manufacturing processes and continuous manufacturing processes. The definition of the unit for batch
        //                    manufacturing processes is contained in IEC 61512-1.
        Unit: 4,

        // PRODUCTIONLINE_5   Production lines are low levels of equipment typically scheduled by the Level 4 or Level 3
        //                    functions for discrete manufacturing processes.
        ProductionLine: 5,

        // WORKCELL_6         Work cells are low levels of equipment typically scheduled by the Level 4 or Level 3 functions for
        //                    discrete manufacturing processes.
        WorkCell: 6,

        // PRODUCTIONUINT_7   Production units are the lowest level of equipment typically scheduled by the Level 4 or Level
        //                    functions for continuous manufacturing processes.
        ProductionUnit: 7,

        // STORAGEZONE_8      Storage zones are low level of material movement equipment typically scheduled by the Level 4 and
        //                    Level 3 functions for discrete, batch and continuous manufacturing processes.
        StorageZone: 8,

        // STORAGEUNIT_9      Storage units are low level of material movement equipment typically scheduled by the  Level 4 and
        //                    Level 3 functions for discrete, batch and continuous manufacturing processes.
        //                    WORKCENTER_10 Work centres are typically the grouping of equipment scheduled by the Level 4 or
        //                    Level 3 functions.
        StorageUnit: 9,
        // WORKUNIT_11        A work unit is any element of the equipment hierarchy under a work centre. Work units are the lowest
        //                    form of elements in an equipment hierarchy that are typically scheduled by Level 3 functions.
        WorkUnit: 11,

        // EQUIPMENTMODULE_12 An equipment module entity is an engineered subdivision of a process cell, a unit, or another
        //                    equipment module. The definition of the equipment module is contained in IEC61512-1.
        EquipmentModule: 12,

        // CONTROLMODULE_13   A control module entity is an engineered subdivision of a process cell, a unit, an equipment module,
        //                    or another control module. The definition of the equipment module is contained in IEC 61512-1.
        ControlModule: 13,
        // OTHER_14           The types of work centres may be extended when required for application specific role based
        //                    equipment hierarchies where the defined types do not apply. In that case, the equipment element
        //                    level shall be specified as this value, and actual value that identifies the level shall be
        //                    specified by OtherValue Property of ISAHierarchyScopeType defined in 7.4.1.
        Other: 14
        // When a new type is added it shall maintain the same relationship within the hierarchy as the defined work centre
        // types (within an area and contains work units).
    });

    assert(!opcua.hasOwnProperty('ISA95'),"already initialized ?");

    opcua.ISA95= {};

    opcua.ISA95.EquipmentLevel = EquipmentLevel;

    var isa95_xml_file = path.join(__dirname, "../nodesets/Opc.ISA95.NodeSet2.xml");
    opcua.ISA95.nodeset_file = isa95_xml_file;


    function coerceISA95TypeDefinition(addressSpace,typeDefinition,baseType) {

        var baseType = addressSpace.findISA95VariableType(baseType);
        assert(baseType,baseType + " must exists ");
        if (typeof typeDefinition === "string") {
            var _typeDefinition = addressSpace.findISA95VariableType(typeDefinition);
            assert(_typeDefinition,typeDefinition + " must exists ");
            typeDefinition = _typeDefinition;
        }
        if (typeDefinition instanceof opcua.NodeId) {
            typeDefinition = addressSpace.findNode(typeDefinition);
        }
        assert(typeDefinition.nodeId instanceof opcua.NodeId);

        // istanbul ignore next
        if (!baseType.isSupertypeOf(typeDefinition)) {
            //xx throw new Error(typeDefinition.browseName.toString() + " must be a subtype of " + baseType.browseName.toString());
        }
        return typeDefinition;
    }

    /**
     *
     * @param options
     * @param options.browseName
     * @param options.ISA95ClassPropertyOf
     * @param options.dataType
     * @param options.value
     */
    opcua.AddressSpace.prototype.addISA95ClassProperty = function(options) {

        assert(options.dataType,"expecting a dataType here");
        assert(!options.componentOf && !options.organizedBy && !options.propertyOf);
        assert(options.typeDefinition, "expecting a typeDefinition");
        assert(options.ISA95ClassPropertyOf,"expecting a parent object");
        // todo ; check that nodeISA95 is a ...ClassType
        var nodeISA95 = options.ISA95ClassPropertyOf;
        var addressSpace = nodeISA95.addressSpace;


        function coerceISA95ClassPropertyTypeDefinition(typeDefinition) {
            return coerceISA95TypeDefinition(addressSpace,typeDefinition,"ISA95ClassPropertyType");
        }
        var typeDefinition = coerceISA95ClassPropertyTypeDefinition(options.typeDefinition);

        var ns = addressSpace.getISA95Namespace();


        // placeHolder  => HasISA95ClassProperty => <PropertyName>
        //              => TestedByEquipmentTest => <TestSpecification>
        //
        var property = addressSpace._addVariable({
            typeDefinition: typeDefinition,
            browseName: options.browseName,
            dataType: options.dataType,
            value: options.value
        });

        // not : the hasISA95ClassProperty reference will be turned into a  hasISA95Property in the instantiated object
        var hasISA95ClassProperty = addressSpace.findReferenceType("HasISA95ClassProperty",ns);

        nodeISA95.addReference({
            referenceType: hasISA95ClassProperty.nodeId,
            nodeId: property
        });
        return property;
    };

    /**
     *
     * @param options
     * @param options.browseName
     * @param options.typeDefinition
     * @param options.ISA95PropertyOf
     * @returns {UAVariable}
     */
    opcua.AddressSpace.prototype.addISA95Property = function(options) {

        assert(options.browseName,"expecting a browseName");
        assert(options.dataType,"expecting a dataType here");
        assert(!options.componentOf && !options.organizedBy && !options.propertyOf);
        assert(options.typeDefinition, "expecting a typeDefinition");
        assert(options.ISA95PropertyOf,"expecting a parent object");

        // todo ; check that nodeISA95 is a ...ClassType
        var nodeISA95 = options.ISA95PropertyOf;
        var addressSpace = nodeISA95.addressSpace;

        var ns = addressSpace.getISA95Namespace();
        var hasISA95Property = addressSpace.findReferenceType("HasISA95Property",ns);

        function coerceISA95PropertyTypeDefinition(typeDefinition) {
            return coerceISA95TypeDefinition(addressSpace,typeDefinition,"ISA95PropertyType");
        }
        var typeDefinition = coerceISA95PropertyTypeDefinition(options.typeDefinition);

        var property = addressSpace.addVariable({
            browseName: options.browseName,
            typeDefinition: typeDefinition,
            dataType: options.dataType,
            value: options.value

        });
        nodeISA95.addReference({
            referenceType: hasISA95Property.nodeId,
            nodeId: property
        });
        return property;

    };

    /**
     *
     * @param options
     * @param options.browseName
     * @param options.dataType
     * @param options.value
     * @param options.ISA95AttributeOf
     */
    opcua.AddressSpace.prototype.addISA95Attribute = function(options) {

        assert(options.ISA95AttributeOf);
        var nodeISA95 = options.ISA95AttributeOf;
        var addressSpace = nodeISA95.addressSpace;
        var ns = addressSpace.getNamespaceIndex("http://www.OPCFoundation.org/UA/2013/01/ISA95");

        var hasISA95Attribute = addressSpace.findReferenceType("HasISA95Attribute",ns);

        var dataType =  options.dataType;
        if (typeof dataType === "string") {
            dataType = addressSpace.findDataType(dataType,ns);
        }


        var property = addressSpace.addVariable({
            //xx typeDefinition: "PropertyType",
            browseName: options.browseName,
            dataType: dataType,
            value: options.value
        });
        nodeISA95.addReference({
            referenceType: hasISA95Attribute.nodeId,
            nodeId: property
        });
        return property;
    };

    /**
     * find a ReferenceType in the ISA95 namespace
     * @param name {String}
     * @return {opcua.ReferenceType}
     */
    opcua.AddressSpace.prototype.getISA95Namespace = function() {
        var addressSpace  = this;
        var ns = addressSpace.getNamespaceIndex("http://www.OPCFoundation.org/UA/2013/01/ISA95");
        return ns;
    };

    opcua.AddressSpace.prototype.findISA95ReferenceType = function(name) {
        var addressSpace  = this;
        return addressSpace.findReferenceType(name,addressSpace.getISA95Namespace());
    };

    opcua.AddressSpace.prototype.findISA95ObjectType = function(name) {
        var addressSpace  = this;
        return addressSpace.findObjectType(name,addressSpace.getISA95Namespace());
    };

    opcua.AddressSpace.prototype.findISA95VariableType = function(name) {
        var addressSpace  = this;
        return addressSpace.findVariableType(name,addressSpace.getISA95Namespace());
    };


    function _equipment_makeUpOfEquipments() {
        var node = this;
        var addressSpace = node.addressSpace;
        var madeUpOfEquipment = addressSpace.findISA95ReferenceType("MadeUpOfEquipment");
        return node.findReferencesExAsObject(madeUpOfEquipment);
    };

    /**
     * @method addEquipment
     * @param options
     * @param options.browseName {String|QualifiedName}
     * @param [options.typeDefinition {String|UAObjectType} = "EquipmentType"]
     *         the ISA95  Type of the equipment to instantiate. if not specified, EquipmentType will be used
     *         the provided typeDefinition must be a sub type of "EquipmentType".
     * @param options.definedByEquipmentClass {UAObjectType}
     *         Must be a subtype of "EquipmentClassType"
     * @param options.containedByEquipment {UAObject}.
     *
     */
    opcua.AddressSpace.prototype.addEquipment = function(options) {

        var addressSpace  = this;
        // The TargetNode of this ReferenceType shall be an Object of EquipmentClassType or its subtype.
        var equipmentClassType = addressSpace.findISA95ObjectType("EquipmentClassType");
        var equipmentType = addressSpace.findISA95ObjectType("EquipmentType");

        options.typeDefinition = options.typeDefinition || equipmentType;

        // The SourceNode of this ReferenceType shall be an Object of EquipmentType or its subtype.
        assert(equipmentType.isSupertypeOf(options.typeDefinition),"TypeDefinition of Equipment to create shall be of type EquipmentType");


        //
        //
        //
        if(options.containedByEquipment) {

            if (!options.containedByEquipment.typeDefinitionObj.isSupertypeOf(equipmentType)) {
                console.log("equipmentType = ",equipmentType.toString());
                console.log("equipmentType = ",options.containedByEquipment.toString());
                throw new Error("options.containedByEquipment must have a type definition which is a subtype of 'EquipmentType' ");
            }

            // add containedByEquipment

        }

        var equipment = addressSpace.addObject({
            typeDefinition: options.typeDefinition,
            browseName:    options.browseName,
        });

        // -------------------------------------------------------------------------------------------------------------
        // Duplicate features defined in definedByEquipmentClass and all
        //
        //    MyEquipmentClassType                                         EquipmentType
        //          |                                                            |
        //          |                                                            +---definedByEquipmentClass-->MyEquipmentClassType
        //          |                                                            |
        //          +-HasISA95ClassProperty-> "Property1"                        +-HasISA95Property-->"Property1"
        //
        // -------------------------------------------------------------------------------------------------------------
        // The Object identified by the SourceNode has the same features as that defined by the Object specified by TargetNode.
        assert(options.definedByEquipmentClass," expecting a definedByEquipmentClass options");
        //xx console.log("equipmentClassType",equipmentClassType.toString());
        //xx console.log("options.definedByEquipmentClass",options.definedByEquipmentClass.toString());
        assert(options.definedByEquipmentClass.isSupertypeOf(equipmentClassType));

        _addDefinedByEquipmentClassReference(equipment,options.definedByEquipmentClass);

        function _transferISA95Attributes(instance,classType) {
            var addressSpace = instance.addressSpace;
            var hasISA95Attribute = addressSpace.findISA95ReferenceType("HasISA95Attribute");
            assert(hasISA95Attribute);
            var refs = classType.findReferencesEx(hasISA95Attribute);

            function constructIsa95AttributeFromISA95Attribute(reference) {
                var attribute = addressSpace.findNode(reference.nodeId);
                var _clone = attribute.clone();

                instance.addReference({
                    referenceType: reference.referenceType,
                    nodeId: _clone
                });
            }
            refs.forEach(constructIsa95AttributeFromISA95Attribute);

        }
        _transferISA95Attributes(equipment,options.definedByEquipmentClass);


        if (options.containedByEquipment) {
            _addContainedByEquipmentReference(equipment,options.containedByEquipment);
        }


        equipment.makeUpOfEquipments = _equipment_makeUpOfEquipments;
        return equipment;

    };

    function _addDefinedByEquipmentClassReference(instance,type) {

        var addressSpace = instance.addressSpace;
        var definedByEquipmentClass = addressSpace.findISA95ReferenceType("DefinedByEquipmentClass");
        assert(definedByEquipmentClass,"definedByEquipmentClass should exists");
        instance.addReference({
            referenceType: definedByEquipmentClass.nodeId,
            nodeId: type
        });
        assert(!instance.definedByEquipmentClass,"instance.definedByEquipmentClass already defined ?");
        instance.definedByEquipmentClass = type;
    }
    function _addContainedByEquipmentReference(node,equipment) {

        var addressSpace = node.addressSpace;
        assert(equipment.nodeId instanceof opcua.NodeId);
        // verify that containedByEquipment is really a equipment !
        var equipmentType = addressSpace.findISA95ObjectType("EquipmentType");
        var t = equipment.typeDefinitionObj;

        //xx console.log(t.toString());
        //xx assert(equipmentType.isSupertypeOf(t),"options.containedByEquipment object must be of EquipmentType");
        var madeUpOfEquipment = addressSpace.findISA95ReferenceType("MadeUpOfEquipment");

        node.addReference({
            referenceType: madeUpOfEquipment.nodeId,
            isForward:     false,
            nodeId:        equipment.nodeId
        });
        node.containedByEquipment = equipment;
    }

    /**
     * @param options
     * @param options.browseName {String/QualifiedName} : the new EquipmentClassType name
     * @param [options.equipmentLevel {EquipmentLevel}] : the EquipmentLevel
     * @param options.containedByEquipment
     */
    opcua.AddressSpace.prototype.addEquipmentClassType = function(options) {

        assert(options.browseName);
        var addressSpace  = this;

        var ns = addressSpace.getISA95Namespace();
        var equipmentClassType = addressSpace.findObjectType("EquipmentClassType",ns);

        var newEquipmentClassType = addressSpace.addObjectType({
            browseName: options.browseName,
            subtypeOf: equipmentClassType
        });

        function addEquipmentLevelAttribute(node,equipmentLevel) {
            // add a equipmentLevel property
            // HasA95Attribute Variable EquipmentLevel ISA95Equipment
            addressSpace.addISA95Attribute({
                ISA95AttributeOf: node,
                browseName: "EquipmentLevel",
                dataType: "ISA95EquipmentElementLevelEnum",
                value: { dataType: opcua.DataType.Int32 , value: equipmentLevel.value}
            });
        }
        // add optional property Equipment Level
        if (options.equipmentLevel) {
            addEquipmentLevelAttribute(newEquipmentClassType, options.equipmentLevel);
        }

        // create equipmentLevel
        if (options.equipmentLevel) {
            function installEquipmentLevelOnInstance(instance,type) {
                addEquipmentLevelAttribute(instance, options.equipmentLevel);
            }

            // make sure optional property equipmentLevel gets duplicated during Type instantiation
            newEquipmentClassType.installPostInstallFunc(installEquipmentLevelOnInstance);
        }

        newEquipmentClassType.installPostInstallFunc(_addDefinedByEquipmentClassReference);

        function addContainedByEquipmentRefPostFunc(instance,type,options) {
            if (options.containedByEquipment) {

                _addContainedByEquipmentReference(instance,options.containedByEquipment);
            }
        }
        //xx newEquipmentClassType.installPostInstallFunc(addContainedByEquipmentRefPostFunc);

        //xx newEquipmentType.addISA95ClassProperty = addISA95ClassProperty;
        return newEquipmentClassType;
    };

    /**
     * @param options
     * @param options.browseName {String/QualifiedName} : the new EquipmentClassType name
     * @param [options.equipmentLevel {EquipmentLevel}] : the EquipmentLevel
     * @param options.definedByEquipmentClass = [] : a array of EquipmentClassType that defines this equipment Type
     */
    opcua.AddressSpace.prototype.addEquipmentType = function(options) {

        assert(options.browseName);
        var addressSpace  = this;

        var ns = addressSpace.getISA95Namespace();
        var equipmentType = addressSpace.findObjectType("EquipmentType",ns);

        options.subtypeOf = options.subtypeOf || equipmentType;
        assert(equipmentType.isSupertypeOf(options.subtypeOf),"#addEquipmentType options.subtypeOf must be a subtype of EquipmentType");

        var newEquipmentType = addressSpace.addObjectType({
            browseName: options.browseName,
            subtypeOf: options.subtypeOf
        });

        var definedByEquipmentClass = addressSpace.findISA95ReferenceType("DefinedByEquipmentClass");

        options.definedByEquipmentClass = options.definedByEquipmentClass || [];
        if (!_.isArray(options.definedByEquipmentClass)) {
            options.definedByEquipmentClass = [options.definedByEquipmentClass];
        }

        function addDefinedByEquipmentClassReference(classType) {

            newEquipmentType.addReference({
                referenceType: definedByEquipmentClass.nodeId, nodeId: classType
            });

            // also duplicate all hasIsa95ClassProperty of classType into HasIsa95Property on type
            var hasISA95ClassProperty = addressSpace.findISA95ReferenceType("HasISA95ClassProperty");
            var hasISA95Property = addressSpace.findISA95ReferenceType("HasISA95ClassProperty");
            var refs = classType.findReferencesExAsObject(hasISA95ClassProperty,BrowseDirection.Forward);

            function constructIsa95PropertyFromISA95ClassProperty(reference) {

                var srcProperty = addressSpace.findNode(reference.nodeId);


                // clone property
                var property = addressSpace.addISA95Property({
                    ISA95PropertyOf: newEquipmentType,
                    browseName:  srcProperty.browseName,
                    dataType: srcProperty.dataType,
                    value: srcProperty.readValue().value,
                    typeDefinition: "EquipmentPropertyType"
                });
            }
            refs.forEach(constructIsa95PropertyFromISA95ClassProperty);

            //xx console.log("[==>", refs.map(f => f.toString()).join("\n"));
        }
        options.definedByEquipmentClass.forEach(addDefinedByEquipmentClassReference);


        return newEquipmentType;

    }

};
