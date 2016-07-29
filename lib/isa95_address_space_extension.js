var assert = require("assert");

exports.install = function(opcua) {



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

    function ISA95Class() {
    }

    ISA95Class.prototype.addISAClassProperty = function(options) {

    };

    ISA95Class.prototype.addEquipmentTest = function(options) {

    };

    /**
     *
     * @param options
     * @param options.browseName
     * @param options.dataType
     * @param options.value
     */
    function addISA95ClassProperty(options) {

        assert(options.dataType,"expecting a dataType here");
        // todo ; check that nodeISA95 is a ...ClassType
        var nodeISA95 = this;
        var addressSpace = nodeISA95.addressSpace;

        var ns = addressSpace.getNamespaceIndex("http://www.OPCFoundation.org/UA/2013/01/ISA95");

        // placeHolder  => HasISA95ClassProperty => <PropertyName>
        //              => TestedByEquipmentTest => <TestSpecification>
        //
        var property = addressSpace.addVariable({
            //xx typeDefinition: "PropertyType",
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
    }

    /**
     *
     * @param options
     * @param options.browseName
     * @param options.dataType
     * @param options.value
     */
    function addISA95Attribute(options) {
        var nodeISA95 = this;
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
    }
    /**
     * find a ReferenceType in the ISA95 namespace
     * @param name {String}
     * @return {opcua.ReferenceType}
     */
    opcua.AddressSpace.prototype.findISA95ReferenceType = function(name) {

        var addressSpace  = this;
        var ns = addressSpace.getNamespaceIndex("http://www.OPCFoundation.org/UA/2013/01/ISA95");
        return addressSpace.findReferenceType(name,ns);
    };
    /**
     * @param options
     * @param options.browseName {String/QualifiedName} : the new EquipmentClassType name
     * @param [options.equipmentLevel {EquipmentLevel}] : the EquipmentLevel
     * @param options.containedByEquipment
     */
    opcua.AddressSpace.prototype.addEquipmentClassType = function(options) {
        assert(options.browseName);
        var addressSpace  = this;

        var ns = addressSpace.getNamespaceIndex("http://www.OPCFoundation.org/UA/2013/01/ISA95");
        var equipmentClassType = addressSpace.findObjectType("EquipmentClassType",ns);

        var newEquipmentType = addressSpace.addObjectType({
            browseName: options.browseName,
            subtypeOf: equipmentClassType
        });

        function addEquipmentLevelAttribute(node,equipmentLevel) {
            // add a equipmentLevel properety
            // HasA95Attribute Variable EquipmentLevel ISA95Equipment
            addISA95Attribute.call(node,{
                browseName: "EquipmentLevel",
                dataType: "ISA95EquipmentElementLevelEnum",
                value: { dataType: opcua.DataType.Int32 , value: equipmentLevel.value}
            });

        }
        // add optional property Equipment Level
        if ( options.equipmentLevel) {
            addEquipmentLevelAttribute(newEquipmentType, options.equipmentLevel);
        }

        if (options.containedByEquipment) {
            function addContainingEquipement(equipment) {

            }
            if (_.isArray(options.containedByEquipment) ) {
            }
        }

        // create equipmentLevel
        if (options.equipmentLevel) {
            function installEquipmentLevelOnInstance(instance,type) {
                addEquipmentLevelAttribute(instance, options.equipmentLevel);
            }

            // make sure optional property equipmentLevel gets duplicated during Type instantiation
            newEquipmentType.installPostInstallFunc(installEquipmentLevelOnInstance);
        }

        newEquipmentType.addISA95ClassProperty = addISA95ClassProperty;
        return newEquipmentType;
    };

};
