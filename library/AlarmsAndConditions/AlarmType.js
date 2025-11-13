/**
 * Object to facilitate testing of Alarm Types found in the server.
 * @param {object} alarmUtilities AlarmUtilities object for common alarm functionality
 */
function AlarmType(alarmUtilities) {

    this.alarmUtilities = alarmUtilities;
    this.HasModellingRule = UaNodeId(Identifier.HasModellingRule);

    this.GetAlarmUtilities = function () {
        return this.alarmUtilities;
    }

    //#region Create

    /**
     * Builds and returns a may of all alarm types found in the server
     * from the object model 
     * @returns {KeyPairCollection} Map of Alarm types keyed by node id string
     */
    this.GetSupportedAlarmTypes = function () {

        if (!isDefined(Test.Alarm.Types)) {

            var alarmUtilities = this.GetAlarmUtilities();

            var modelMap = alarmUtilities.GetModelMap();

            var alarmTypes = alarmUtilities.GetAlarmTypesFromModel(modelMap,
                new UaNodeId(Identifier.ConditionType));

            this.DetermineAllTypeInformation(alarmTypes);

            Test.Alarm.Types = alarmTypes;
        }

        return Test.Alarm.Types;
    }

    /**
     * Builds a usable collection of data for all alarm types found in the server 
     * from both the object model, and by reading specific data from the server
     * @param {KeyPairCollection} typeMap Map of Alarm types found in the server 
     */
    this.DetermineAllTypeInformation = function (typeMap) {
        var dataTypeMap = new KeyPairCollection();
        var isAbstractMap = new KeyPairCollection();
        var methodMap = new KeyPairCollection();

        var typeKeys = typeMap.Keys();

        for (var typeIndex = 0; typeIndex < typeKeys.length; typeIndex++) {
            var typeKey = typeKeys[typeIndex];
            var type = typeMap.Get(typeKey);

            this.DetermineTypeInformation(typeKey, type);

            isAbstractMap.Set(typeKey, type);

            this.DetermineAllInformation(type, dataTypeMap, methodMap);
        }
        this.ReadTypeAttributes(isAbstractMap);
        this.ReadDataTypeAttributes(dataTypeMap);
        this.ReadTypeMethodAttributes(methodMap);
    }

    /**
     * Builds a usable collection of data for all a specific alarm type found in the server 
     * from the object model.
     * @param {string} typeKey Node Id string of the alarm type
     * @param {object} type Alarm Type Definition
     */
    this.DetermineTypeInformation = function (typeKey, type) {

        var findMyParentTypeDefinitions = [{
            ReferenceTypeId: new UaNodeId(Identifier.HasSubtype),
            IsForward: false
        }];

        var modelMapHelper = this.GetAlarmUtilities().GetModelMapHelper();
        var modelMap = modelMapHelper.GetModelMap();

        if (!isDefined(type.ParentNodeId)) {
            modelMapHelper.FindReferences(type.ReferenceDescriptions, findMyParentTypeDefinitions);
            if (isDefined(findMyParentTypeDefinitions[0].ReferenceIndex)) {
                type.ParentNodeId = type.ReferenceDescriptions[findMyParentTypeDefinitions[0].ReferenceIndex].NodeId.NodeId.toString();
            }
        }

        if (!isDefined(type.BrowseName)) {
            if (isDefined(type.ParentNodeId)) {
                var parentObject = modelMap.Get(type.ParentNodeId);
                this.GetReferenceDetails(parentObject);
                if (isDefined(parentObject.ReferenceDetails.ObjectType)) {
                    var typeReferenceDescriptor = parentObject.ReferenceDetails.ObjectType.Get(typeKey);
                    if (isDefined(typeReferenceDescriptor)) {
                        type.BrowseName = typeReferenceDescriptor.BrowseName;
                        type.Name = typeReferenceDescriptor.BrowseName.Name;
                        type.NodeClass = typeReferenceDescriptor.NodeClass;
                    }
                }
            }
        }

        var specAlarmType = this.GetSpecType(typeKey);
        if (isDefined(specAlarmType)) {
            type.SpecAlarmTypeId = specAlarmType._NodeId;
        }
    }

    /**
     * Retrieve object properties for variables/objects/methods to determine what to read from the server.
     * Call is recursive to get information of components
     * @param {object} type Alarm Type Definition
     * @param {KeyPairCollection} dataTypeMap Map of alarm type properties and components that need to determine 
     * their data type by reading the server 
     * @param {KeyPairCollection} methodMap Map of methods that need to determine input/output parameters
     */
    this.DetermineAllInformation = function (type, dataTypeMap, methodMap) {

        // GetReferenceDetails gets information about the references.  Not the type itself.

        this.GetReferenceDetails(type);
        var modelMap = this.GetAlarmUtilities().GetModelMap();

        var organizerKeys = Object.keys(type.ReferenceDetails);
        for (var organizerIndex = 0; organizerIndex < organizerKeys.length; organizerIndex++) {
            var organizerKey = organizerKeys[organizerIndex];
            var organizerValue = type.ReferenceDetails[organizerKey];

            if (organizerKey == "Method") {
                var methodKeys = organizerValue.Keys();
                for (var methodIndex = 0; methodIndex < methodKeys.length; methodIndex++) {
                    var methodKey = methodKeys[methodIndex];
                    var method = organizerValue.Get(methodKey);

                    var methodNodeId = method.NodeId.toString();
                    var methodObject = modelMap.Get(methodNodeId);

                    // Now I need to go through the parameterObject ReferenceDescriptions
                    for (var referenceIndex = 0; referenceIndex < methodObject.ReferenceDescriptions.length; referenceIndex++) {
                        var referenceDescription = methodObject.ReferenceDescriptions[referenceIndex];

                        this.GetAlarmUtilities().AddMethodParameters(referenceDescription, method, methodMap);
                    }
                }
            } else if (organizerKey == "Variable" || organizerKey == "Object") {

                var variableKeys = organizerValue.Keys();
                for (var variableIndex = 0; variableIndex < variableKeys.length; variableIndex++) {
                    var variableKey = variableKeys[variableIndex];
                    var variableDetail = organizerValue.Get(variableKey);
                    var variableObject = modelMap.Get(variableKey);

                    if (organizerKey == "Variable") {
                        // add to map
                        if (!isDefined(variableObject.DataType)) {
                            if (!dataTypeMap.Contains(variableKey)) {
                                dataTypeMap.Set(variableKey, variableObject);
                            }
                        }
                    }

                    // Recurse
                    if (this.ShouldGetReferenceDetails(variableDetail)) {
                        variableDetail.SubTypes = true;
                        this.DetermineAllInformation(variableObject, dataTypeMap, methodMap);
                    }
                }
            }
        }
    }

    this.ShouldGetReferenceDetails = function (variableDetail) {
        var shouldGet = true;
        if (isDefined(variableDetail) && isDefined(variableDetail.TypeDefinition)) {
            if (variableDetail.TypeDefinition.equals(UaNodeId(Identifier.PropertyType)) ||
                variableDetail.TypeDefinition.equals(UaNodeId(Identifier.BaseDataVariableType)) ||
                variableDetail.TypeDefinition.equals(UaNodeId(Identifier.BaseVariableType)) ||
                variableDetail.TypeDefinition.equals(UaNodeId(Identifier.ModellingRuleType))) {
                shouldGet = false;
            }
        } else {
            shouldGet = false;
        }
        return shouldGet;
    }

    /**
     * For a given object, walk through the ReferenceDescriptions provided by the model, and organize them 
     * into a map that makes it easier to retrieve the reference description information.
     * @param {object} modelObject 
     * @returns {object} map of Reference Details organized by variable/object/method etc.
     */
    this.GetReferenceDetails = function (modelObject) {
        if (!isDefined(modelObject.ReferenceDetails)) {

            var descriptions = modelObject.ReferenceDescriptions;
            for (var index = 0; index < descriptions.length; index++) {
                this.GetReferenceDetail(index, modelObject, descriptions[index]);
            }
        }
        return modelObject.ReferenceDetails;
    }

    /**
     * Gathers data to create a ReferenceDetail, an organized object that provides an 
     * easier way to collect alarm type data.
     * @param {int} referenceIndex reference description index
     * @param {object} rootObject Model object that will store the reference detail 
     * @param {object} referenceDescription the Reference Description found in the Object model browse 
     */
    this.GetReferenceDetail = function (referenceIndex, rootObject, referenceDescription) {

        var modelKey = referenceDescription.NodeId.NodeId.toString();

        var modelObject = this.GetAlarmUtilities().GetModelMap().Get(modelKey);

        if (isDefined(modelObject)) {

            var modelAttribute = this.GetAlarmUtilities().GetAttributeFromModel(modelObject);

            if ( !isDefined( modelAttribute ) ){
                addError( "Unable to find attribute for model key" + modelKey );
                return;
            }

            if (!isDefined(rootObject.ReferenceDetails)) {
                rootObject.ReferenceDetails = new Object();
            }

            // referenceTypeId
            if (referenceDescription.IsForward &&
                !referenceDescription.ReferenceTypeId.equals(this.HasModellingRule)) {

                modelObject.Name = referenceDescription.BrowseName.Name;

                var referenceDetail = {
                    ModelObject: modelObject,
                    ModellingRule: modelAttribute.ModellingRule,
                    BrowseName: referenceDescription.BrowseName,
                    Name: referenceDescription.BrowseName.Name,
                    NodeClass: referenceDescription.NodeClass,
                    NodeId: referenceDescription.NodeId.NodeId,
                    ReferenceDescriptionIndex: referenceIndex,
                    ReferenceTypeId: referenceDescription.ReferenceTypeId,
                    TypeDefinition: modelAttribute.TypeDefinition,
                };

                var nodeClassName = NodeClass.toString(referenceDescription.NodeClass);

                if (!isDefined(rootObject.ReferenceDetails[nodeClassName])) {
                    rootObject.ReferenceDetails[nodeClassName] = new KeyPairCollection();
                }

                var nodeIdString = referenceDescription.NodeId.NodeId.toString();

                rootObject.ReferenceDetails[nodeClassName].Set(nodeIdString, referenceDetail);

            }
        } else {
            addError("Unable to find " + modelKey + " in model map");
        }
    }

    /**
     * Retrieves the alarm type defined by the spec that is the root to the provided alarm type
     * For normal spec types, like AlarmConditionType, the AlarmConditionType node is the SpecAlarmTypeId
     * For server derived alarm types, the closest parent Spec Alarm type is the SpecAlarmTypeId
     * @param {string} alarmTypeKey node id string of the alarm type to find 
     */
    this.GetSpecType = function (alarmTypeKey) {

        var nodeSetEntity = this.GetAlarmUtilities().GetNodeSetUtility().GetEntity(alarmTypeKey);

        if (!isDefined(nodeSetEntity)) {
            var modelMap = this.GetAlarmUtilities().GetModelMap();
            var alarmTypeDefinitionObject = modelMap.Get(alarmTypeKey);
            if (isDefined(alarmTypeDefinitionObject)) {
                // found a type definition in the object map.
                // Need to find the hassubtype in reverse
                var descriptions = alarmTypeDefinitionObject.ReferenceDescriptions;
                for (var index = 0; index < descriptions.length; index++) {
                    var description = descriptions[index];
                    if (this.GetAlarmUtilities().IsSubTypeOf(description)) {
                        var typeNodeId = description.NodeId.NodeId.toString();
                        print("Found Parent type of type " + alarmTypeKey + " looking for " + typeNodeId + " in node set");
                        nodeSetEntity = this.GetSpecType(typeNodeId);
                        break;
                    }
                }
            } else {
                addError("GetSpecType Unable to get Alarm type from complete model");
            }
        }

        return nodeSetEntity;
    }

    /**
     * Reads the Data Type attribute for all items in the provided map
     * @param {KeyPairCollection} map Map of Items
     */
    this.ReadDataTypeAttributes = function (map) {

        if (map.Length() > 0) {

            var attributes = [
                { Attribute: Attribute.DataType, ObjectPath: ["DataType"] }
            ];

            print("Read Data types for " + map.Length() + " entities");

            this.GetAlarmUtilities().ReadData(map, attributes);
        }
    }

    /**
     * Reads the IsAbstract attribute all items in the provided map
     * @param {KeyPairCollection} map Map of Items
     */
    this.ReadTypeAttributes = function (map) {

        if (map.Length() > 0) {

            var attributes = [
                { Attribute: Attribute.IsAbstract, ObjectPath: ["IsAbstract"] }
            ];

            print("Read Type IsAbstract for " + map.Length() + " types");

            this.GetAlarmUtilities().ReadData(map, attributes);
        }
    }

    /**
     * Reads the value for methods to determine parameters and arguements of Alarm type methods
     * @param {KeyPairCollection} map 
     */
    this.ReadTypeMethodAttributes = function (map) {

        if (map.Length() > 0) {

            var attributes = [
                { Attribute: Attribute.Value, ObjectPath: ["Value"] }
            ];

            print("Read Method Type Data for " + map.Length() + " methods ");

            this.GetAlarmUtilities().ReadData(map, attributes);
        }
    }

    //#endregion

    //#region Compare

    /**
     * Compares server alarm type definition with the spec
     * @param {string} typeId Alarm Type to compare
     * @param {boolean} compareSubTypes Recursively Compare Sub Types
     */
    this.TypeCompare = function (typeId, compareSubTypes) {

        //#region Setup

        var alarmTypeObject = this.GetSupportedAlarmTypes().Get(typeId);

        if (!isDefined(alarmTypeObject)) {
            print("Unable to retrieve information about alarm type " + typeId);
            stopCurrentUnit();
            return true;
        }

        var alarmUtilities = this.GetAlarmUtilities();

        print("TypeCompare for Alarm type " + alarmUtilities.GetAlarmEntityName([alarmTypeObject]) +
            " Initiated");

        var nodeAlarmTypeDefinition = alarmUtilities.GetNodeSetUtility().GetEntity(typeId);

        if (!isDefined(nodeAlarmTypeDefinition)) {
            print("Unable to find a type definition for " +
                alarmUtilities.GetAlarmEntityName([alarmTypeObject]) + " in Nodeset file");
            return true;
        }

        //#endregion

        this.CompareBrowseName(alarmTypeObject, nodeAlarmTypeDefinition);
        this.CompareIsAbstract(alarmTypeObject, nodeAlarmTypeDefinition);
        this.CompareReferences(alarmTypeObject, nodeAlarmTypeDefinition);

        var result = true;

        if (compareSubTypes) {
            var subTypeNodeId = new UaNodeId(Identifier.HasSubtype);

            for (var index = 0; index < alarmTypeObject.ReferenceDescriptions.length; index++) {
                var referenceDescription = alarmTypeObject.ReferenceDescriptions[index];

                if (referenceDescription.ReferenceTypeId.equals(subTypeNodeId) &&
                    referenceDescription.IsForward) {
                    if (!this.TypeCompare(referenceDescription.NodeId.NodeId.toString(), true)) {
                        result = false;
                    }
                }
            }
        }

        print("TypeCompare for " + alarmUtilities.GetAlarmEntityName([alarmTypeObject]) + " Completed");

        return result;
    }

    this.CompareBrowseName = function (alarm, nodeSet) {

        if (isDefined(nodeSet._BrowseName)) {
            this.GetAlarmUtilities().CompareObjects("Type Browse Name", alarm, nodeSet,
                UaQualifiedName.New({ NamespaceIndex: 0, Name: nodeSet._BrowseName }),
                alarm.BrowseName);
        } else {
            // not necessarily an error
            print("Nodeset does not contain browseName for " + alarm.BrowseName);
        }

    }

    this.CompareIsAbstract = function (alarm, nodeSet) {
        var alarmUtilities = this.GetAlarmUtilities();
        if (isDefined(alarm.IsAbstract)) {
            alarmUtilities.CompareValues("Type IsAbstract", alarm, nodeSet,
                alarmUtilities.GetNodeSetUtility().IsAbstract(nodeSet),
                alarm.IsAbstract);

        } else {
            addError("Unable to determine BrowseName");
        }
    }

    this.CompareReferences = function (alarm, nodeSet) {
        // Walk through all the nodeSet references
        // And verify the alarm plays by the rules
        var alarmUtilities = this.GetAlarmUtilities();

        print("CompareReferences for " + alarmUtilities.GetAlarmEntityName([alarm]));

        if (!isDefined(nodeSet.References) || !isDefined(nodeSet.References.Reference)) {
            // Not an error Can't walk through nodeSet references, for they don't exist
            print("Unable to get nodeSet references for " + alarmUtilities.GetAlarmEntityName([alarm]));
            return;
        }

        if (!isDefined(alarm.ReferenceDetails)) {
            throw ("Unable to get alarm reference details for " + alarmUtilities.GetAlarmEntityName([alarm]));
        }

        this.CompareReferencesHierarchy(alarm, nodeSet);
    }

    /**
     * Compares all alarm type components to the spec
     * @param {object} alarm Alarm Type Object
     * @param {object} nodeSet Spec Type Object
     */
    this.CompareReferencesHierarchy = function (alarm, nodeSet) {

        print("CompareReferenceHierarchy nodeSet reference " + nodeSet._BrowseName);

        if (!isDefined(nodeSet.References)) {
            print("CompareReferenceHierarchy nodeSet reference " + nodeSet._BrowseName + " does not have references ");
            return;
        }

        var alarmUtilities = this.GetAlarmUtilities();
        var alarmNodeSetHelper = alarmUtilities.GetNodeSetUtility();

        var nodeSetReferences = nodeSet.References.Reference;
        var alarmReferenceDetails = this.GetReferenceDetails(alarm);

        for (var nodeSetReferenceIndex = 0; nodeSetReferenceIndex < nodeSetReferences.length; nodeSetReferenceIndex++) {

            var nodeSetReference = nodeSetReferences[nodeSetReferenceIndex];

            if (!this.CanCheckReferenceTypeDetails(nodeSetReference)) {
                print("Not checking reference type " + nodeSetReference._ReferenceType);
                continue;
            }

            var referenceObject = alarmNodeSetHelper.GetReferenceObjectFromReference(nodeSetReference);

            if (isDefined(referenceObject)) {
                var mandatory = alarmNodeSetHelper.IsMandatory(referenceObject);
                var nodeSetNodeClassName = NodeClass.toString(referenceObject.NodeClass);
                var unableToFind = true;

                if (isDefined(alarmReferenceDetails[nodeSetNodeClassName])) {
                    var alarmMap = alarmReferenceDetails[nodeSetNodeClassName];
                    if (isDefined(alarmMap)) {
                        var alarmReference = alarmMap.Get(referenceObject._NodeId);
                        if (isDefined(alarmReference)) {
                            unableToFind = false;

                            this.CheckReferenceType(alarm, nodeSet, alarmReference, nodeSetReference);
                            // print( "Debug: " + alarmUtilities.GetAlarmEntityName( [ alarm, alarmReference ] ) +
                            //     " Verifying " );

                            alarmUtilities.VerifyNodeClass(alarm, nodeSet, alarmReference, referenceObject);
                            alarmUtilities.VerifyBrowseName(alarm, nodeSet, alarmReference, referenceObject);
                            alarmUtilities.VerifyDataType(alarm, nodeSet, alarmReference, referenceObject);
                            alarmUtilities.VerifyTypeDefinition(alarm, nodeSet, alarmReference, referenceObject);
                            alarmUtilities.VerifyModellingRule(alarm, nodeSet, alarmReference, referenceObject);
                            if (referenceObject.NodeClass == NodeClass.Method) {
                                alarmUtilities.CompareMethod(alarm, nodeSet, alarmReference, referenceObject);
                            }

                            //recurse
                            if (this.ShouldCheckReference(referenceObject, alarmNodeSetHelper)) {
                                this.CompareReferencesHierarchy(alarmReference.ModelObject, referenceObject);
                            }
                        }
                    }
                }

                if (unableToFind) {
                    if (mandatory) {
                        addError("Unable to find node " + referenceObject._BrowseName +
                            " for alarm type " + alarmUtilities.GetAlarmEntityName([alarm]));
                    }
                }
            }
        }

        print("CompareReferenceHierarchy nodeSet reference " + nodeSet._BrowseName + " Completed");
    }

    this.CheckReferenceType = function (alarmObject, nodeSetObject, alarmReference, nodeSetReference) {

        var referenceDescriptionIndex = -1;
        if (isDefined(alarmReference.ReferenceDescriptionIndex)) {
            var index = alarmReference.ReferenceDescriptionIndex;
            if (index >= 0 && index < alarmObject.ReferenceDescriptions.length) {
                referenceDescriptionIndex = index;
            }
        }

        if (referenceDescriptionIndex >= 0) {
            var alarmUtilities = this.GetAlarmUtilities();

            var nodeSetHelper = alarmUtilities.GetNodeSetUtility();

            var referenceDescription = alarmObject.ReferenceDescriptions[referenceDescriptionIndex];

            alarmUtilities.CompareObjects("CheckReferenceType:NodeId:" + alarmReference.Name, 
                alarmObject, nodeSetObject,
                nodeSetHelper.GetNodeId(nodeSetReference.__text),
                referenceDescription.NodeId.NodeId);

            alarmUtilities.CompareValues("CheckReferenceType:IsForward:" + alarmReference.Name,
                alarmObject, nodeSetObject,
                nodeSetHelper.IsForward(nodeSetReference),
                referenceDescription.IsForward);

            alarmUtilities.CompareObjects("CheckReferenceType:ReferenceTypeId:" + alarmReference.Name,
                alarmObject, nodeSetObject,
                nodeSetHelper.GetReferenceTypeNodeId(nodeSetReference),
                referenceDescription.ReferenceTypeId);
        } else {
            addError("CheckReferenceType Unable to get ReferenceDescriptionIndex for " + alarmReference.Name + ":" + nodeSetReference.__text);
        }
    }

    /**
     * Determines if the property reference should be checked against the spec.
     * @param {object} nodeSetReference Spec Reference
     * @returns {boolean}
     */
    this.CanCheckReferenceTypeDetails = function (nodeSetReference) {

        var process = false;

        if (this.GetAlarmUtilities().GetNodeSetUtility().IsForward(nodeSetReference)) {
            if (nodeSetReference._ReferenceType == "HasComponent" ||
                nodeSetReference._ReferenceType == "HasProperty") {
                process = true;
            }
        }

        return process;
    }

    /**
     * Determines if an alarm type component should check references
     * @param {object} nodeSetReference Spec Reference
     * @param {object} nodeSetHelper Node Set Helper Object
     * @returns {boolean}
     */
    this.ShouldCheckReference = function (nodeSetReference, nodeSetHelper) {
        var shouldCheck = true;

        var typeDefinition = nodeSetHelper.GetTypeDefinition(nodeSetReference);

        if (isDefined(typeDefinition)) {
            if (typeDefinition.equals(UaNodeId(Identifier.PropertyType)) ||
                typeDefinition.equals(UaNodeId(Identifier.BaseDataVariableType)) ||
                typeDefinition.equals(UaNodeId(Identifier.BaseVariableType))) {
                shouldCheck = false;
            }
        } else {
            shouldCheck = false;
        }

        return shouldCheck;
    }

    //#endregion

    //#region Debug

    this.PrintAlarmTypes = function () {

        var typeMap = this.GetSupportedAlarmTypes();

        var typeKeys = typeMap.Keys();
        for (var index = 0; index < typeKeys.length; index++) {
            var typeKey = typeKeys[index];
            var typeValue = typeMap.Get(typeKey);
            this.PrintAlarmType(typeKey, typeValue);
        }
    }

    this.PrintAlarmType = function (typeKey, typeValue) {

        print("");
        print("Type " + typeKey + " " + typeValue.Name + " NodeClass " + typeValue.NodeClass + " IsAbstract " + typeValue.IsAbstract);
        print("");

        this.PrintReferenceDetails(typeValue);
    }

    this.PrintReferenceDetails = function (modelEntry) {

        print("");
        print("PrintReferenceDetails: " + modelEntry.Name + " Start");
        if (isDefined(modelEntry.ReferenceDetails)) {
            var organizerKeys = Object.keys(modelEntry.ReferenceDetails);
            for (var organizerIndex = 0; organizerIndex < organizerKeys.length; organizerIndex++) {
                var organizerKey = organizerKeys[organizerIndex];
                var organizerValue = modelEntry.ReferenceDetails[organizerKey];

                this.PrintTypeReferenceDetails(organizerKey, organizerValue);
            }
        } else {
            print("Model Entry " + modelEntry.Name + " does not have ReferenceDetails");
        }
        print("");
        print("PrintReferenceDetails: " + modelEntry.Name + " End");
    }

    this.PrintTypeReferenceDetails = function (prefix, referenceDetailsMap) {
        print("Organization " + prefix);

        // referenceDetailsMap should be a KeyPairCollection
        var referenceDetailsKeys = referenceDetailsMap.Keys();
        for (var index = 0; index < referenceDetailsKeys.length; index++) {
            var key = referenceDetailsKeys[index];
            // is this the object?  or reference descriptions
            var referenceDetails = referenceDetailsMap.Get(key);
            print(referenceDetails.Name + ": " + key);

            var modelKeys = Object.keys(referenceDetails);
            for (var modelIndex = 0; modelIndex < modelKeys.length; modelIndex++) {
                var modelKey = modelKeys[modelIndex];
                var modelValue = referenceDetails[modelKey];
                var output = true;
                if (modelKey == "ModellingRule") {
                    modelValue = this.GetAlarmUtilities().GetNodeSetUtility().GetMandatoryName(modelValue);
                } else if (modelKey == "Parameters") {
                    output = false;
                }

                if (output) {
                    print("\t" + prefix + "." + modelKey + " = " + modelValue);
                }
            }

            if (isDefined(referenceDetails.Parameters)) {
                // This is a method
                var keys = referenceDetails.Parameters.Keys();
                for (var methodIndex = 0; methodIndex < keys.length; methodIndex++) {
                    var parameterName = keys[methodIndex];
                    var value = referenceDetails.Parameters.Get(parameterName).Value;
                    var arguments = value.Original.toExtensionObjectArray();
                    for (var valueIndex = 0; valueIndex < arguments.length; valueIndex++) {
                        var argument = arguments[valueIndex].toArgument();
                        print("\tArgument [" + valueIndex + "] Name " + argument.Name + " DataType " + argument.DataType.toString() +
                            " Value Rank " + argument.ValueRank.toString() + " Array Dimensions " + argument.ArrayDimensions);
                        print("\tDescription " + argument.Description.Text);
                    }
                }
            }

            if (referenceDetails.SubTypes) {
                print(key + " " + referenceDetails.Name + " has subtypes");
                // Need to call all the way back with the object at ReferenceDetails.ModelObject.
                this.PrintReferenceDetails(referenceDetails.ModelObject);
            }
        }
    }

    //#endregion


}
