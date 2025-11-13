include( "./library/Utilities/PerformanceTimer/PerformanceTimer.js" );


/**
 * Object to facilitate testing of Alarm Instances found in the server.
 * @param {object} alarmUtilities AlarmUtilities object for common alarm functionality
 */

function AlarmInstance ( alarmUtilities ) {

    this.MaxInstancesToCompare = 5;
    this.HasProperty = new UaNodeId( Identifier.HasProperty );
    this.HasComponent = new UaNodeId( Identifier.HasComponent );

    this.alarmUtilities = alarmUtilities;

    this.GetAlarmUtilities = function () {
        return this.alarmUtilities;
    }

    //#region Data Gathering

    /**
     * Searches the object model for all alarm instances
     * @param {KeyPairCollection} typeMap Map of all Alarm Types in the server
     */
    this.BuildAlarmInstances = function ( typeMap ) {

        var keys = typeMap.Keys();

        for ( var index = 0; index < keys.length; index++ ) {
            var key = keys[ index ];
            var type = typeMap.Get( key );
            this.GetAlarmInstancesFromType( key, type );
            this.GetInstancePaths( type );

        }
    }

    /**
     * Searches the object model for all alarm instances of a specific type
     * @param {string} type Alarm type node Id String
     * @param {object} typeValue Alarm type object
     */
    this.GetAlarmInstancesFromType = function ( type, typeValue ) {

        var instanceMap = new KeyPairCollection();
        var modelMap = this.GetAlarmUtilities().GetModelMap();

        if ( isDefined( typeValue ) ) {

            if ( !isDefined( typeValue.Instances ) ) {

                var typeNodeId = UaNodeId.fromString( type );

                var nodesToReturn = 100;
                // This does not need a thread session helper call
                var instances = FindObjectsOfTypeHelper.Execute( {
                    TypeToFind: typeNodeId,
                    IncludeSubTypes: false,
                    MaxNodesToReturn: nodesToReturn
                } );

                if ( instances.result == true ) {
                    var alarmGroupPlaceholder = new UaNodeId(
                        Identifier.AlarmGroupType_AlarmConditionInstance_Placeholder );
                    for ( var index = 0; index < instances.nodes.length; index++ ) {
                        var instanceId = instances.nodes[ index ]
                        if ( instanceId.equals( alarmGroupPlaceholder ) ) {
                            continue;
                        }
                        var modelValue = modelMap.Get( instanceId );
                        if ( isDefined( modelValue ) ) {
                            modelValue.Name = instanceId;
                            instanceMap.Set( instanceId, modelValue );
                        } else {
                            addError( "Unable to find alarm " + instanceId + " in the model map" );
                        }
                    }

                    typeValue.Instances = instanceMap;
                } else {
                    addError( "Unable to retrieve instances of alarm type " + type );
                }
            } else {
                instanceMap = typeValue.Instances;
            }
        } else {
            addError( "Type " + type + " not found in type map" );
        }

        return instanceMap;
    }

    /**
     * Finds all the object model paths for instances found for a specified alarm type
     * This is a debugging tool to help find an alarm instance in the object model
     * @param {object} type Alarm Type Object
     */
    this.GetInstancePaths = function ( type ) {

        if ( isDefined( type.Instances ) ) {
            this.GetAlarmUtilities().GetModelMapHelper().FindAllPaths( type.Instances );
        }
    }

    //#endregion

    //#region Comparison

    /**
     * Read all data of an alarm instance
     * @param {object} alarmInstance Alarm Instance as found in the object model
     * @param {} nodeSetAlarmTypeDefinition Alarm Type Spec definition
     */
    this.RetrieveInstanceData = function ( alarmInstance, nodeSetAlarmTypeDefinition ) {

        // Optimization, as this function takes a good deal of time
        if ( !isDefined( alarmInstance.RetrieveInstanceDataPlaceHolders ) ) {

            // Retrieve information about the nodeset, this states what is expected from the instance
            var nodeSetReferenceMap = this.GetAllNodesetReferences( nodeSetAlarmTypeDefinition );

            var nodeSetPlaceholders = this.BuildNodeSetPlaceholder( nodeSetReferenceMap );

            // Retrieve all information from Instance in the Model Map
            var searchDefinitions = this.RetrieveSearchDefinitions( nodeSetPlaceholders );

            this.GetAlarmUtilities().GetModelMapHelper().FindReferences(
                alarmInstance.ReferenceDescriptions, searchDefinitions );

            this.ReadReferenceObjects( alarmInstance, nodeSetPlaceholders );

            alarmInstance.RetrieveInstanceDataPlaceHolders = nodeSetPlaceholders;
        }

        return alarmInstance.RetrieveInstanceDataPlaceHolders;
    }

    /**
     * Retrieves all references for a specified alarm type, including parent type references
     * @param {object} nodeSetAlarmTypeDefinition Alarm type as defined by the spec
     */
    this.GetAllNodesetReferences = function ( nodeSetAlarmTypeDefinition ) {

        var nodeSetUtility = this.GetAlarmUtilities().GetNodeSetUtility();

        // Start with the same as the type, with the exception that need to look for parent objects.
        var parentObjectIds = this.GetAlarmUtilities().GetParentHeirarchy( nodeSetAlarmTypeDefinition );

        // Put together a list of all the references for all parents

        var nodeSetReferenceMap = new KeyPairCollection();

        for ( var typeNameIndex = 0; typeNameIndex < parentObjectIds.length; typeNameIndex++ ) {
            var typeName = parentObjectIds[ typeNameIndex ];
            var nodeSetTypeObject = nodeSetUtility.GetEntity( typeName );
            print( "ParentObjects " + nodeSetTypeObject._BrowseName );
            var nodeSetReferences = nodeSetTypeObject.References.Reference;

            for ( var typeReferenceIndex = 0; typeReferenceIndex < nodeSetReferences.length; typeReferenceIndex++ ) {
                var typeReference = nodeSetReferences[ typeReferenceIndex ];
                var typeReferenceObject = nodeSetUtility.GetEntity( typeReference.__text );
                if ( typeReference._ReferenceType != "HasSubtype" ) {
                    typeReferenceObject.Mandatory = nodeSetUtility.IsMandatory( typeReferenceObject );
                    if ( !nodeSetReferenceMap.Contains( typeReferenceObject._BrowseName ) ) {
                        nodeSetReferenceMap.Set( typeReferenceObject._BrowseName, typeReferenceObject );
                    }
                }
            }
        }

        return nodeSetReferenceMap;
    }

    /**
     * Creates an object to retrieve reference description instance data.
     * @param {object} nodeSetReferenceMap Map containing reference descriptions to find
     */
    this.BuildNodeSetPlaceholder = function ( nodeSetReferenceMap ) {
        var nodeSetPlaceholder = [];

        var nodeSetReferenceKeys = nodeSetReferenceMap.Keys();
        for ( var referenceIndex = 0; referenceIndex < nodeSetReferenceKeys.length; referenceIndex++ ) {
            var referenceKey = nodeSetReferenceKeys[ referenceIndex ];
            var referenceObject = nodeSetReferenceMap.Get( referenceKey );

            var searchDefinition = {
                BrowseName: UaQualifiedName.New( {
                    NamespaceIndex: 0,
                    Name: referenceObject._BrowseName
                } )
            };

            nodeSetPlaceholder.push( {
                NodeSetReference: referenceObject,
                SearchDefinition: searchDefinition
            } );
        }

        return nodeSetPlaceholder;
    }

    /**
     * Retrieves all the search definitions in the map
     * @param {object[]} nodeSetPlaceholderArray 
     */
    this.RetrieveSearchDefinitions = function ( nodeSetPlaceholderArray ) {
        var searchDefinitions = [];

        for ( var index = 0; index < nodeSetPlaceholderArray.length; index++ ) {
            searchDefinitions.push( nodeSetPlaceholderArray[ index ].SearchDefinition );
        }

        return searchDefinitions;
    }

    /**
     * Reads all the references for a specified Alarm Instance
     * @param {object} alarmInstance Alarm Instance to check
     * @param {object[]} nodeSetPlaceholders Nodeset placeholders with browse names to find alarm instance reference description
     * @param {KeyPairCollection} itemsToReadMap Items to read
     * @param {KeyPairCollection} methodsToReadMap Methods to read
     * @param {KeyPairCollection} methodParametersMap Method parameters to read
     */
    this.ReadReferenceObjects = function ( alarmInstance, nodeSetPlaceholders, itemsToReadMap, methodsToReadMap, methodParametersMap ) {

        var itemsToReadMap = new KeyPairCollection();
        var methodsToReadMap = new KeyPairCollection();
        var methodParametersMap = new KeyPairCollection();

        var alarmUtilities = this.GetAlarmUtilities();

        for ( var referenceIndex = 0; referenceIndex < nodeSetPlaceholders.length; referenceIndex++ ) {
            var placeHolder = nodeSetPlaceholders[ referenceIndex ];

            if ( isDefined( placeHolder.SearchDefinition.ReferenceIndex ) &&
                placeHolder.SearchDefinition.ReferenceIndex >= 0 ) {

                this.BuildReadObjects( alarmInstance, placeHolder, itemsToReadMap, methodsToReadMap, methodParametersMap );

            } else {
                if ( placeHolder.NodeSetReference.Mandatory ) {
                    addError( "Error: Alarm Instance " + alarmUtilities.GetAlarmEntityName( [ alarmInstance ] ) +
                        " does not contain mandatory reference " + placeHolder.NodeSetReference._BrowseName );
                }
            }
        }

        this.ReadInstanceItems( itemsToReadMap );
        this.ReadInstanceMethods( methodsToReadMap );
        this.ReadMethodParameters( methodParametersMap );
    }

    /**
     * Determines which items/methods/method parameters to read from server
     * @param {object} alarmInstance Alarm Instance to check
     * @param {object[]} nodeSetPlaceholders Nodeset placeholders with browse names to find alarm instance reference description
     * @param {KeyPairCollection} itemsToReadMap Items to read
     * @param {KeyPairCollection} methodsToReadMap Methods to read
     * @param {KeyPairCollection} methodParametersMap Method parameters to read
     */
    this.BuildReadObjects = function ( alarmInstance, placeHolder, itemsToReadMap, methodsToReadMap, methodParametersMap ) {
        placeHolder.AlarmReference = alarmInstance.ReferenceDescriptions[
            placeHolder.SearchDefinition.ReferenceIndex ];

        placeHolder.AlarmReferenceObject = this.GetAlarmUtilities().GetModelMap().Get(
            placeHolder.NodeSetReference._NodeId );

        this.GetAlarmUtilities().GetAttributeFromModel( placeHolder.AlarmReferenceObject );

        // This is valid.  The referenceDescription guarantees the NodeClass
        if ( placeHolder.AlarmReference.NodeClass == NodeClass.Method ) {

            methodsToReadMap.Set( placeHolder.NodeSetReference._NodeId, placeHolder.AlarmReferenceObject );

            // Now walk through the references for the method.

            // This just states that there is a method
            placeHolder.Method = placeHolder.AlarmReferenceObject;

            for ( var index = 0; index < placeHolder.AlarmReferenceObject.ReferenceDescriptions.length; index++ ) {

                var reference = placeHolder.AlarmReferenceObject.ReferenceDescriptions[ index ];

                this.GetAlarmUtilities().AddMethodParameters(
                    reference, placeHolder.AlarmReferenceObject, methodParametersMap );
            }
        } else {
            itemsToReadMap.Set( placeHolder.NodeSetReference._NodeId, placeHolder.AlarmReferenceObject );
        }
    }

    /**
     * Reads a variety of attributes for a map of items
     * Updates the objects with the values for each attribute
     * @param {KeyPairCollection} itemsToReadMap 
     */
    this.ReadInstanceItems = function ( itemsToReadMap ) {
        var numberOfItemsToRead = 100;

        if ( itemsToReadMap.Length() > 0 ) {
            var attributes = [
                { Attribute: Attribute.BrowseName, ObjectPath: [ "Attribute", "BrowseName" ] },
                { Attribute: Attribute.BrowseName, ObjectPath: [ "Name" ] },
                { Attribute: Attribute.NodeClass, ObjectPath: [ "Attribute", "NodeClass" ] },
                { Attribute: Attribute.DataType, ObjectPath: [ "Attribute", "DataType" ] },
                { Attribute: Attribute.ValueRank, ObjectPath: [ "Attribute", "ValueRank" ] }
            ];

            print( "Read Instance Reference Data for " + itemsToReadMap.Length() + " References " );

            this.GetAlarmUtilities().ReadData( itemsToReadMap, attributes, numberOfItemsToRead );
        }
    }

    /**
     * Reads a variety of attributes for a map of methods
     * Updates the objects with the values for each attribute
     * @param {KeyPairCollection} itemsToReadMap 
     */
     this.ReadInstanceMethods = function ( methodsToReadMap ) {
        var numberOfItemsToRead = 100;

        if ( methodsToReadMap.Length() > 0 ) {
            var attributes = [
                { Attribute: Attribute.BrowseName, ObjectPath: [ "Name" ] },
                { Attribute: Attribute.BrowseName, ObjectPath: [ "Attribute", "BrowseName" ] },
                { Attribute: Attribute.NodeClass, ObjectPath: [ "Attribute", "NodeClass" ] }
            ];

            print( "Read Method Data for " + methodsToReadMap.Length() + " Methods " );

            this.GetAlarmUtilities().ReadData( methodsToReadMap, attributes, numberOfItemsToRead );
        }
    }

    /**
     * Reads a variety of attributes for a map of method parameters
     * Updates the objects with the values for each attribute
     * @param {KeyPairCollection} itemsToReadMap 
     */
     this.ReadMethodParameters = function ( methodParametersMap ) {
        var numberOfItemsToRead = 100;

        if ( methodParametersMap.Length() > 0 ) {
            var attributes = [
                { Attribute: Attribute.BrowseName, ObjectPath: [ "Attribute", "BrowseName" ] },
                { Attribute: Attribute.BrowseName, ObjectPath: [ "Name" ] },
                { Attribute: Attribute.DataType, ObjectPath: [ "Attribute", "DataType" ] },
                { Attribute: Attribute.ValueRank, ObjectPath: [ "Attribute", "ValueRank" ] },
                { Attribute: Attribute.Value, ObjectPath: [ "Attribute", "Value" ] }
            ];

            print( "Read Method Parameters for " + methodParametersMap.Length() + " Parameters " );

            this.GetAlarmUtilities().ReadData( methodParametersMap, attributes, numberOfItemsToRead );
        }
    }


    //#endregion

    //#region Instance Compare

    /**
     * Does a compare of all instances for a specific type against spec
     * @param {string} type - Node Id of the type in string format
     * @param {KeyPairCollection} typeMap - map of all alarm types
     * @returns success or failure
     */
    this.InstanceCompare = function ( type, typeMap ) {

        var success = true;
        var types = [];
        typeMap.Iterate( function ( alarmTypeNodeIdString, alarmType ) {
            if ( isDefined( alarmType.SpecAlarmTypeId ) && alarmType.SpecAlarmTypeId == type ) {
                types.push( alarmTypeNodeIdString );
            }
        } );

        if ( types.length > 0 ) {
            for ( var typeIndex = 0; typeIndex < types.length; typeIndex++ ) {
                var alarmTypeNodeIdString = types[ typeIndex ];
                var alarmTypeObject = typeMap.Get( alarmTypeNodeIdString );
                if ( isDefined( alarmTypeObject ) ) {
                    if ( !this.InstanceCompareType( alarmTypeNodeIdString, alarmTypeObject ) ) {
                        success = false;
                    }
                } else {
                    print( "Alarm Type " + type + " Spec Type Id " + alarmTypeNodeIdString + " not found in server alarm types" );
                    success = false;
                }
            }
        } else {
            print( "Alarm Type " + type + " not found in server alarm types" );
            success = false;
        }

        return success;
    }

    /**
     * Does a compare of all instances for a specific type against spec
     * @param {string} alarmTypeNodeIdString - Node Id of the type in string format
     * @param {Object} alarmTypeObject - Alarm Type object, as constructed by AlarmType
     * @returns success or failure
     */
     this.InstanceCompareType = function ( alarmTypeNodeIdString, alarmTypeObject ) {
        var success = true;

        var instances = this.GetAlarmInstancesFromType( alarmTypeNodeIdString, alarmTypeObject );

        if ( isDefined( instances ) && instances.Length() > 0 ) {
            var alarmUtilities = this.GetAlarmUtilities();
            var mandatoryMap = new KeyPairCollection();
            var optionalMap = new KeyPairCollection();
            var mandatory = true;
            var startIndexObject = new Object();
            startIndexObject.startIndex = 0;

            alarmUtilities.CreateSelectFieldsMap( alarmTypeNodeIdString, mandatoryMap, mandatory, startIndexObject );

            print( "mandatoryMap SelectFields" );
            mandatoryMap.Iterate( function ( key, field ) {
                print( "\t" + key + "\t" + field.Index );
            } );

            startIndexObject.startIndex = 0;
            alarmUtilities.CreateSelectFieldsMap( alarmTypeNodeIdString, optionalMap, !mandatory, startIndexObject );
            print( "optionalMap SelectFields" );
            optionalMap.Iterate( function ( key, field ) {
                print( "\t" + key + "\t" + field.Index );
            } );

            // Need to read all the values in the optional list.  First, I need the node Ids to read.

            var instanceKeys = instances.Keys();
            for ( var index = 0; index < instanceKeys.length; index++ ) {
                var alarmInstanceNodeIdString = instanceKeys[ index ];
                var alarmInstanceModelObject = instances.Get( alarmInstanceNodeIdString );
                if ( !this.InstanceCompareInstance( alarmInstanceNodeIdString, alarmInstanceModelObject, mandatoryMap, optionalMap ) ) {
                    success = false;
                }
            }
        }

        return success;
    }

    /**
     * Retrieves Spec information for all properties of the desired object
     * Call is Recursive
     * @param {object} modelObject - alarm object and all sub objects
     * @returns spec properties
     */
    this.GetPropertiesComponents = function ( modelObject ) {
        if ( !isDefined( modelObject.PropertiesComponents ) ) {
            var map = new KeyPairCollection();
            if ( isDefined( modelObject.ReferenceDescriptions ) ) {
                for ( var index = 0; index < modelObject.ReferenceDescriptions.length; index++ ) {
                    var referenceDescription = modelObject.ReferenceDescriptions[ index ];
                    if ( referenceDescription.IsForward == true ) {
                        if ( referenceDescription.ReferenceTypeId.equals( this.HasProperty ) ) {
                            map.Set( referenceDescription.BrowseName.Name, referenceDescription );
                        } else if ( referenceDescription.ReferenceTypeId.equals( this.HasComponent ) ) {
                            map.Set( referenceDescription.BrowseName.Name, referenceDescription );
                            var modelMap = this.GetAlarmUtilities().GetModelMap();
                            var referenceObject = modelMap.Get( referenceDescription.NodeId.NodeId );
                            if ( isDefined( referenceObject ) ) {
                                referenceDescription.ModelObject = referenceObject;
                                // recurse
                                this.GetPropertiesComponents( referenceObject );
                            } else {
                                addError( "AlarmInstance::GetPropertiesComponents unable to find " +
                                    referenceObject.NodeId.NodeId.toString() + " in Model Map" );
                            }
                        }
                    }
                }
            }

            if ( !isDefined( modelObject.PropertiesComponents ) ) {
                modelObject.PropertiesComponents = map;
            }
        }

        return modelObject.PropertiesComponents;
    }

    /**
     * Get all node ids for all properties
     * @param {object} alarmInstance - Alarm Instance
     * @param {KeyPairCollection} optionalMap - all values that could be read
     * @returns map of items and nodeIds
     */
    this.GetAllInstanceNodeIds = function ( alarmInstance, optionalMap ) {
        var items = new KeyPairCollection();
        var mapKeys = optionalMap.Keys();
        for ( var index = 0; index < mapKeys.length; index++ ) {
            var variableToRead = mapKeys[ index ];
            var nodeId = this.GetNodeIdFromReferences( variableToRead, alarmInstance );
            if ( isDefined( nodeId ) ) {
                var item = MonitoredItem.fromNodeIds( nodeId )[ 0 ];
                items.Set( variableToRead, { NodeId: nodeId, Item: item } );
            }
        }

        return items;
    }

    /**
     * Retrieves a node id from a model referenceDescription
     * @param {string} propertyName - property name to get node Id
     * @param {object} modelObject - model map object that contains reference descriptions
     * @returns desired Node Id
     */
    this.GetNodeIdFromReferences = function ( propertyName, modelObject ) {
        var nodeId = "";
        var separator = '.';

        var propertiesComponents = this.GetPropertiesComponents( modelObject );
        if ( isDefined( propertiesComponents ) ) {
            var parts = propertyName.split( separator );
            var referenceDescription = propertiesComponents.Get( parts[ 0 ] );
            if ( isDefined( referenceDescription ) ) {
                if ( parts.length > 1 ) {
                    var levelOne = propertiesComponents.Get( parts[ 0 ] );
                    if ( isDefined( levelOne ) && isDefined( levelOne.ModelObject ) ) {
                        parts.shift();
                        var nextLevelProperty = parts.join( separator );
                        nodeId = this.GetNodeIdFromReferences( nextLevelProperty, levelOne.ModelObject );
                    } else {
                        throw ( "GetNodeIdFromReferences Could not find " + parts[ 0 ] + " model object" );
                    }
                } else {
                    // Finished
                    nodeId = referenceDescription.NodeId.NodeId;
                }
            } else {
                print( "GetNodeIdFromReferences Could not find " + parts[ 0 ] + " referenceDescription" );
            }

        } else {
            throw ( "GetNodeIdFromReferences unexpected error" );
        }

        return nodeId;
    }

    /**
     * Compares a specific instance against the spec
     * @param {string} alarmNodeIdString - NodeId of the Alarm in string format
     * @param {object} alarmInstance - Alarm Object
     * @param {KeyPairCollection} mandatoryMap - map of all mandatory properties
     * @param {KeyPairCollection} optionalMap - map of all properties including optional
     * @returns success or failure
     */
    this.InstanceCompareInstance = function ( alarmNodeIdString, alarmInstance, mandatoryMap, optionalMap ) {
        // Get the node Ids, read them, compare them.

        print( "AlarmInstance::CompareInstance " + alarmNodeIdString + " Start" );
        var success = false;

        this.GetPropertiesComponents( alarmInstance );

        var itemsToRead = this.GetAllInstanceNodeIds( alarmInstance, optionalMap );

        var monitoredItemsToRead = [];
        var mapKeys = itemsToRead.Keys();
        for ( var index = 0; index < mapKeys.length; index++ ) {
            var variableToRead = mapKeys[ index ];
            var mapObject = itemsToRead.Get( variableToRead );
            if ( isDefined( mapObject ) && isDefined( mapObject.Item ) ) {
                monitoredItemsToRead.push( mapObject.Item );
            }
        }

        // Read.  No need to use Alarm Thread Session

        print( "InstanceCompareInstance " + alarmNodeIdString + " items to read " + monitoredItemsToRead.length );

        if ( monitoredItemsToRead.length > 0 ) {
            var readResult = ReadHelper.Execute( {
                NodesToRead: monitoredItemsToRead,
                SuppressErrors: true,
                SuppressMessaging: true,
                SuppressWarnings: true,
                SuppressBadValueStatus: true
            } );

            if ( readResult == true ) {

                var alarmUtilities = this.GetAlarmUtilities();

                var eventFields = new UaVariants( itemsToRead.Length() );
                var itemKeys = itemsToRead.Keys();

                // Create a simulated EventFields so the AlarmUtilities.TestMandatoryProperty can be used.
                for ( var index = 0; index < itemKeys.length; index++ ) {
                    var itemKey = itemKeys[ index ];
                    var itemObject = itemsToRead.Get( itemKey );
                    if ( isDefined( itemObject ) && isDefined( itemObject.Item ) && isDefined( itemObject.Item.Value ) && isDefined( itemObject.Item.Value.Value ) ) {
                        eventFields[ index ] = itemObject.Item.Value.Value;
                    } else {
                        eventFields[ index ] = new UaVariant();
                    }
                }

                for ( var index = 0; index < itemKeys.length; index++ ) {
                    var itemKey = itemKeys[ index ];
                    var itemObject = itemsToRead.Get( itemKey );
                    var optionalObject = optionalMap.Get( itemKey );
                    print( "Test index[" + index + "] field " + itemKey + " read index " + optionalObject.Index );
                    var errorMessage = alarmUtilities.TestMandatoryProperty( itemKey, eventFields, optionalMap, mandatoryMap, optionalMap );
                    if ( errorMessage.length > 0 ) {
                        addError( "AlarmInstance::InstanceCompareInstance " + errorMessage + " node id " + itemObject.NodeId.toString() + " statusCode " + itemObject.Item.Value.toString() );
                    }
                }
            } else {
                addError( "AlarmInstance::InstanceCompareInstance Read Failed for " + alarmNodeIdString );
            }
        }

        print( "AlarmInstance::CompareInstance " + alarmNodeIdString + " Complete" );

        return success;
    }

    //#endregion

    //#region Debug

    /**
     * Debug - Print all instances
     * @param {KeyPairCollection} typeMap 
     */
    this.PrintAlarmInstances = function ( typeMap ) {

        var triggersMissed = 0;

        var typeKeys = typeMap.Keys();
        for ( var index = 0; index < typeKeys.length; index++ ) {
            var typeKey = typeKeys[ index ];
            var typeValue = typeMap.Get( typeKey );


            var instances = this.GetAlarmInstancesFromType( typeKey, typeValue );
            var instanceKeys = instances.Keys();

            print( "Type " + typeKey + " " + typeValue.Name + " has " + instanceKeys.length + " instances " );

            for ( var instanceIndex = 0; instanceIndex < instanceKeys.length; instanceIndex++ ) {
                var instanceKey = instanceKeys[ instanceIndex ];
                var instanceObject = instances.Get( instanceKey )
                var instanceName = instanceObject.Name;

                print( "Index [" + instanceIndex + "]\t" + instanceKey + " " + instanceName );


                this.PrintPaths( instanceObject );

                this.PrintObject( "\tTrigger Value", instanceObject.TriggerValue );
                this.PrintObject( "\tNormalValue Value", instanceObject.NormalValue );
                if ( !isDefined( instanceObject.TriggerValue ) ) {
                    triggersMissed++;
                }

                if ( isDefined( instanceObject.Properties ) ) {
                    Object.keys( instanceObject.Properties ).forEach( function ( property ) {

                        print( "\t" + property );

                        Object.keys( instanceObject.Properties[ property ] ).forEach( function ( detail ) {

                            print( "\t\t" + detail + ": " + instanceObject.Properties[ property ][ detail ] );
                        } );
                    } );
                }
            }
        }
        print( "There are " + triggersMissed + " instances without a trigger value" );
    }

    /**
     * Debug - Print Paths
     * @param {object} instanceObject - alarm instance
     */
    this.PrintPaths = function ( instanceObject ) {
        if ( isDefined( instanceObject.Paths ) ) {
            for ( var pathIndex = 0; pathIndex < instanceObject.Paths.length; pathIndex++ ) {
                var path = instanceObject.Paths[ pathIndex ];
                print( "\t" + path );
            }
        }
    }

    /**
     * Debug - print an object
     * @param {string} intro - name of the object to print
     * @param {object} object - object to print
     */
    this.PrintObject = function ( intro, object ) {
        if ( isDefined( object ) ) {
            print( intro + " " + object.toString() );
        }
    }

    //#endregion
}
