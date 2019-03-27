const assert = require("assert");
const path = require("path");
const _ = require("underscore");


module.exports = function (opcua) {

    opcua.ISA95.utils = {};

    const BrowseDirection = opcua.browse_service.BrowseDirection;

    function _coerceISA95ReferenceType(addressSpace,obj) {
        const _coerced = typeof obj === "string" ? addressSpace.findISA95ReferenceType(obj) : obj;
        assert(_coerced,obj + " should exists in ISA95  addressSpace");
        return _coerced;
    }
    function _coerceISA95ObjectType(addressSpace,obj) {
        const _coerced = typeof obj === "string" ? addressSpace.findISA95ObjectType(obj) : obj;
        assert(_coerced,obj.toString() + " should exists in ISA95  addressSpace");
        return _coerced;
    }

    /**
     *
     * @param instance
     * @param FooClassReference
     * @param FooClassType
     * @param type                     must be a subtype Of FooClassType
     * @private
     *
     *
     *     _addDefinedByFooClassReference(instance,"DefinedByEquipmentClass","EquipmentClassType",type);
     *     will:
     *        verify that type is a EquipmentClassType
     *        add to instance, a DefinedByEquipmentClass reference pointing to type
     *        update  instance.definedByEquipmentClass by adding type to it.
     *
     */
    function _addDefinedByFooClassReference(instance,FooClassReference,FooClassType,type) {

        assert(type," expecting a type");
        assert(FooClassReference, "expecting a ClassReference");
        assert(FooClassType, "expecting a FooClassType");
        const addressSpace = instance.addressSpace;


        const definedByEquipmentClass = _coerceISA95ReferenceType(addressSpace,FooClassReference);

        const equipmentClassType = _coerceISA95ObjectType(addressSpace,FooClassType);

        // istanbul ignore next
        if(!type.isSupertypeOf(equipmentClassType)) {
            throw new Error(type.browseName.toString() + " must be of type "+ equipmentClassType.browseName.toString() );
        }

        instance.addReference({
            referenceType: definedByEquipmentClass.nodeId,
            nodeId: type
        });

        // TODO : Add a __Getter__ property and use cache instead ...
        // set definedByEquipmentClass
        const attribute = opcua.utils.lowerFirstLetter(FooClassReference);
        if (!instance[attribute]) {
            instance[attribute] = [];
        }
        instance[attribute].push(type);


    }


    function addDefinedByFooClass(node,definedByFooClass,isa95PropertyType,options) {

        const addressSpace = node.addressSpace;

        const name = opcua.utils.capitalizeFirstLetter(definedByFooClass);
        const attribute = opcua.utils.lowerFirstLetter(definedByFooClass);

        const definedByFooClassReference = addressSpace.findISA95ReferenceType(name);
        if (!definedByFooClassReference) {
            throw new Error(" Cannot find ISA Reference Type " + name);
        }
        options[attribute] = options[attribute] || [];
        if (!_.isArray(options[attribute])) {
            options[attribute] = [options[attribute]];
        }

        function addDefinedByFooClassReference(classType) {

            node.addReference({
                referenceType: definedByFooClassReference.nodeId, nodeId: classType
            });

            // also duplicate all hasIsa95ClassProperty of classType into HasIsa95Property on type
            const hasISA95ClassProperty = addressSpace.findISA95ReferenceType("HasISA95ClassProperty");
            const hasISA95Property = addressSpace.findISA95ReferenceType("HasISA95ClassProperty");
            const refs = classType.findReferencesExAsObject(hasISA95ClassProperty,BrowseDirection.Forward);

            function constructIsa95PropertyFromISA95ClassProperty(reference) {
                const srcProperty = addressSpace.findNode(reference.nodeId);

                // clone property
                const property = addressSpace.addISA95Property({
                    ISA95PropertyOf: node,
                    browseName:  srcProperty.browseName,
                    dataType: srcProperty.dataType,
                    value: srcProperty.readValue().value,
                    typeDefinition: isa95PropertyType
                });
            }
            refs.forEach(constructIsa95PropertyFromISA95ClassProperty);

            //xx console.log("[==>", refs.map(f => f.toString()).join("\n"));
        }

        options[attribute].forEach(addDefinedByFooClassReference);

    }
    opcua.ISA95.utils.addDefinedByFooClass = addDefinedByFooClass;

    /**
     *
     * @param params
     * @param params.node                {UAObject} the node to add the DefinedBy...ClassType reference
     * @param params.definedByFooClass   {String|UAObjectType|[]}
     * @param params.fooClassType
     * @param params.fooType
     * @param params.definedByFooClassRef  = the r i.e "DefinedByEquipmentClass"
     *
     * example :
     *
     */
    opcua.ISA95.utils.installDefinedByFooClassReferences = function(params) {

        assert(params.node);
        const addressSpace = params.node.addressSpace;

        // -------------------------------------------------------------------------------------------------------------
        // Duplicate features defined in definedBy(Equipment|PhysicalAsset)Class
        //
        //    My(Equipment|PhysicalAsset)ClassType                          (Equipment|PhysicalAsset)Type
        //          |                                                            |
        //          |                                               \            +---definedBy(Equipment|PhysicalAsset)Class-->My(Equipment|PhysicalAsset)ClassType
        //          |                                         -------\           |
        //          +-HasISA95ClassProperty-> "Property1"             >          +-HasISA95Property-->"Property1"
        //          |                                         -------/
        //          +- hasSubtypeOf ->                              /
        //                             (Equipment|PhysicalAsset)ClassType
        // -------------------------------------------------------------------------------------------------------------
        // The Object identified by the SourceNode has the same features as that defined by the Object specified by TargetNode.


        if (typeof params.definedByFooClass === "string") {
            const node = addressSpace.findISA95ObjectType(params.definedByFooClass);
            if (!node) {
                throw Error(params.definedByFooClass +" must be a valid ISA95 Class Type");
            }
            params.definedByFooClass = node;
        }
        if (!_.isArray(params.definedByFooClass)) {
            params.definedByFooClass =[params.definedByFooClass];
        }

        if (typeof params.fooClassType === "string") {
            params.fooClassType = addressSpace.findISA95ObjectType(params.fooClassType);
        }
        for (const xxxxClass of params.definedByFooClass){
            // we need to exclude OptionalPlaceHolder
            if (xxxxClass.modellingRule === "OptionalPlaceholder") {
                return;
            }
            assert(xxxxClass.isSupertypeOf(params.fooClassType),"expecting ");

            _addDefinedByFooClassReference(
                params.node,
                params.definedByFooClassRef,  // "DefinedByEquipmentClass"
                params.fooClassType,          // "EquipmentClassType",
                xxxxClass);
        }
    };

    opcua.ISA95.utils._transferISA95Attributes = function (instance,classType) {

        // we need to exclude OptionalPlaceHolder
        if (classType.modellingRule === "OptionalPlaceholder") {
            return;
        }
        assert(classType.constructor.name == "UAObjectType");

        const addressSpace = instance.addressSpace;
        const hasISA95Attribute = addressSpace.findISA95ReferenceType("HasISA95Attribute");

        assert(hasISA95Attribute);
        const refs = classType.findReferencesEx(hasISA95Attribute);

        function constructIsa95AttributeFromISA95Attribute(reference) {
            const attribute = addressSpace.findNode(reference.nodeId);
            const _clone = attribute.clone();

            instance.addReference({
                referenceType: reference.referenceType,
                nodeId: _clone
            });
        }
        refs.forEach(constructIsa95AttributeFromISA95Attribute);

    };

    opcua.ISA95.utils._addContainedByFooReference = function (node,foo,fooType,madeUpOfFoo) {

        const addressSpace = node.addressSpace;
        assert(foo.nodeId instanceof opcua.NodeId);

        assert(typeof fooType === "string");
        fooType = addressSpace.findISA95ObjectType(fooType);

        assert(typeof madeUpOfFoo === "string");
        madeUpOfFoo = addressSpace.findISA95ReferenceType(madeUpOfFoo);

        // verify that containedByEquipment is really a equipment !
        const t = foo.typeDefinitionObj;

        //xx console.log(t.toString());
        //xx assert(equipmentType.isSupertypeOf(t),"options.containedByEquipment object must be of EquipmentType");

        node.addReference({
            referenceType: madeUpOfFoo.nodeId,
            isForward:     false,
            nodeId:        foo.nodeId
        });

        let inverseName = madeUpOfFoo.inverseName.text.toString();
        inverseName = opcua.utils.lowerFirstLetter(inverseName);
        // for inestance containedByEquipment
        node[inverseName] = foo;
    }

};
