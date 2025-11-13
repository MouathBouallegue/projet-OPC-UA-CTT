include( "./library/AlarmsAndConditions/AlarmNodeSet.js" );
include( "./library/AlarmsAndConditions/AlarmRecommendedNames.js" );
include( "./library/Information/BuildLocalCacheMap.js" );

/**
 * AlarmUtilities is a collection of helper functions used by multiple alarm test tools
 */
function AlarmUtilities () {

    this.AlarmNodeSet = null;
    this.ModelMapHelper = null;
    this.NullNodeId = new UaNodeId();
    this.HasSubtypeNodeId = new UaNodeId( Identifier.HasSubtype );
    this.PropertyNodeId = new UaNodeId( Identifier.HasProperty );
    this.NumberOfItemsToRead = 100;
    this.AlarmNameHelper = null;

    //#region NodeSet

    /**
     * Retrieves the NodeSet Utility specifically for alarms
     * @returns {Object}
     */
    this.GetNodeSetUtility = function () {
        this.CreateAlarmNodeSet();
        return this.AlarmNodeSet.GetNodeSetUtility();
    }

    /**
     * Retrieves the nodeset map from the nodeset utility
     * @returns {KeyPairCollection}
     */
    this.GetNodeSet = function () {
        return this.GetNodeSetUtility().GetNodeSet();
    }

    /**
     * Creates the alarm nodeset if it not already created
     */
    this.CreateAlarmNodeSet = function () {
        if ( !isDefined( this.AlarmNodeSet ) ) {
            this.AlarmNodeSet = new AlarmNodeSet();
            this.AlarmNodeSet.CreateNodeSet();
        }
    }

    /**
     * Retrieves the Alarm Name Helper for validation of recommended names
     * @returns {object}
     */
    this.GetAlarmNameHelper = function () {
        if ( !isDefined( this.AlarmNameHelper ) ) {
            this.AlarmNameHelper = new AlarmRecommendedNames();
        }
        return this.AlarmNameHelper;
    }

    /**
     * @typedef {KeyPairCollection} SelectFieldEntry
     * @param {int} Index - Index of the value in the event fields
     * @param {int} Identifier - Numeric node id value specifying the TypeDefinitionId for the select operand creation
     * @param {string[]} BrowsePaths - The name of the event field, separated into an array for select operand creation
     * @param {object} Reference - the actual Nodeset reference used to describe this event field 
     */

    /**
     * @typedef {KeyPairCollection} SelectFieldMap
     * @param {string} key - Event Field Name, like EventId, or AckedState.Id
     * @param {SelectFieldEntry} value - details about how to find the Event Field 
     */

    /**
     * Creates a map to retrieve all event fields possible for all supported alarm types
     * @param {KeyPairCollection} typeMap - a map of all alarm types supported by the server
     * @returns {SelectFieldMap} - a map describing which event fields to request
     */
    this.CreateAllSelectFields = function ( typeMap ) {
        print( "CreateAllSelectFields Started" );
        var map = new KeyPairCollection();
        var keys = typeMap.Keys();
        var startIndexObject = new Object();
        startIndexObject.startIndex = 0;
        for ( var index = 0; index < keys.length; index++ ) {
            var mandatory = false;
            this.CreateSelectFieldsMap( keys[ index ], map, mandatory, startIndexObject );
        }
        print( "CreateAllSelectFields Completed" );
        return map;
    }

    /**
     * Creates a map to retrieve all event fields for a specified alarm type
     * @param {string} typeId - alarm type node id in string format
     * @param {KeyPairCollection} typeMap - all alarm types supported by the server 
     * @param {boolean} mandatory - retrieve all fields, or only the mandatory ones if true 
     */
    this.CreateSelectFields = function ( typeId, typeMap, mandatory ) {

        var specTypeId = this.GetSpecTypeId( typeId, typeMap );
        var typeObject = typeMap.Get( specTypeId );

        var map = new KeyPairCollection();
        var startIndexObject = new Object();
        startIndexObject.startIndex = 0;

        if ( mandatory ) {
            if ( !isDefined( typeObject.TypeSelectFieldsMapMandatory ) ) {
                this.CreateSelectFieldsMap( specTypeId, map, mandatory, startIndexObject );
                typeObject.TypeSelectFieldsMapMandatory = map;
            } else {
                map = typeObject.TypeSelectFieldsMapMandatory;
            }
        } else {
            if ( !isDefined( typeObject.TypeSelectFieldsMap ) ) {
                this.CreateSelectFieldsMap( specTypeId, map, mandatory, startIndexObject );
                typeObject.TypeSelectFieldsMap = map;
            } else {
                map = typeObject.TypeSelectFieldsMap;
            }
        }

        return map;
    }

    /**
     * Creates a map to retrieve all event fields for a specified alarm type.  
     * This call is recursive for two scenarios
     * 1. hiearchical towards parent objects in order to  find all select fields up to the base event type
     * 2. hiearchical to child objects in order to find object fields such as ShelvingState, AckedState, Methods, etc.
     * 
     * @param {string} typeId - alarm type node id in string format
     * @param {*} map - select fields map to create
     * @param {*} mandatory - retrieve all fields, or only the mandatory ones if true
     * @param {*} startIndexObject - Placeholder for child object types to create proper browse paths
     * @param {*} browsePaths - previous browse paths for the property creation of browse paths for child objects
     */
    this.CreateSelectFieldsMap = function ( typeId, map, mandatory, startIndexObject, browsePaths ) {

        var nodeSetUtility = this.GetNodeSetUtility();
        var entity = nodeSetUtility.GetEntity( typeId );
        var properties = [];
        var components = [];
        if ( isDefined( entity ) && isDefined( entity.References ) && isDefined( entity.References.Reference ) ) {
            var references = entity.References.Reference;
            for ( var index = 0; index < references.length; index++ ) {
                var reference = references[ index ];
                var referenceObject = nodeSetUtility.GetEntity( reference.__text );

                if ( referenceObject._BrowseName == "InputArguments" ||
                    referenceObject._BrowseName == "OutputArguments" ||
                    referenceObject._BrowseName.indexOf( "<" ) >= 0 ) {
                    continue;
                }

                // browsePaths means reverse recurse so don't look for sub type of
                if ( !isDefined( browsePaths ) && nodeSetUtility.IsSubType( reference ) ) {
                    // Recurse to base class
                    this.CreateSelectFieldsMap( referenceObject._NodeId, map, mandatory, startIndexObject );
                } else if ( nodeSetUtility.IsForward( reference ) ) {

                    if ( reference._ReferenceType == "HasProperty" ) {
                        properties.push( referenceObject );
                    } else if ( reference._ReferenceType == "HasComponent" ) {
                        if ( isDefined( referenceObject._DataType ) ) {
                            properties.push( referenceObject );
                        }
                        components.push( referenceObject );
                    }
                }
            }
        }

        // This ensures the highest Heirarchy properties and components show up first
        for ( var index = 0; index < properties.length; index++ ) {

            var selectBrowsePaths = [];
            if ( isDefined( browsePaths ) ) {
                browsePaths.forEach( function ( path ) {
                    selectBrowsePaths.push( path );
                } );
            }

            selectBrowsePaths.push( properties[ index ]._BrowseName );
            var identifier = selectBrowsePaths.join( '.' );

            if ( properties[ index ]._BrowseName != "EffectiveDisplayName" ) {
                var isMandatory = nodeSetUtility.IsMandatory( properties[ index ] );
                var add = true;
                if ( mandatory ) {
                    if ( !isMandatory ) {
                        add = false;
                    }
                }

                if ( add ) {
                    if ( !map.Contains( identifier ) ) {

                        var store = {
                            Index: startIndexObject.startIndex++,
                            Reference: properties[ index ],
                            Identifier: Identifier.BaseEventType,
                            BrowsePaths: selectBrowsePaths
                        };

                        map.Set( identifier, store );
                    }
                }
            }
        }

        // This ensures the highest Heirarchy properties and components show up first
        for ( var index = 0; index < components.length; index++ ) {
            var referenceObject = components[ index ];

            if ( !isDefined( referenceObject._MethodDeclarationId ) ) {
                var recurseBrowsePaths = [];
                if ( isDefined( browsePaths ) ) {
                    browsePaths.forEach( function ( path ) {
                        recurseBrowsePaths.push( path );
                    } );
                }
                recurseBrowsePaths.push( referenceObject._BrowseName );
                // reverse recurse through a has component
                this.CreateSelectFieldsMap( referenceObject._NodeId, map, mandatory, startIndexObject, recurseBrowsePaths );
            }
        }
    }

    /**
     * Retrieves a numerically indexed map of references that correspond to the indexes found in the 
     * Select Fields Map
     * @param {SelectFieldMap} allMap - a SelectFields map 
     * @param {string} typeId - desired alarm type 
     * @param {KeyPairCollection} typeMap - a map of all alarm types supported 
     * @param {boolean} mandatory - retrieve all fields, or only the mandatory ones if true
     * @returns {KeyPairCollection}
     */
    this.RetrieveSelectFieldsForType = function ( allMap, typeId, typeMap, mandatory ) {
        var specTypeId = this.GetSpecTypeId( typeId, typeMap );

        // This is not the desired map.
        var typeSelectFieldsMap = this.CreateSelectFields( specTypeId, typeMap, mandatory );

        var allFields = allMap.Keys();
        var typeFieldMap = new KeyPairCollection();
        for ( var index = 0; index < allFields.length; index++ ) {
            var fieldName = allFields[ index ];
            var typeField = typeSelectFieldsMap.Get( fieldName );
            if ( isDefined( typeField ) ) {
                // Keep it
                var fieldIndex = allMap.Get( fieldName ).Index;
                typeFieldMap.Set( fieldIndex, typeField.Reference );
            }
        }

        return typeFieldMap;
    }

    this.PrintEventBuffers = function ( eventBuffers, allMap, typeMap ) {
        var eventTypeIndex = allMap.Get( "EventType" ).Index;
        var mandatory = true;
        for ( var index = 0; index < eventBuffers.length; index++ ) {
            var event = eventBuffers[ index ];
            if ( eventTypeIndex < event.EventFieldList.EventFields.length ) {
                var eventType = event.EventFieldList.EventFields[ eventTypeIndex ].toString();
                var eventName = typeMap.Get( eventType ).Attribute.BrowseName.Name;
                var specTypeId = this.GetSpecTypeId( eventType, typeMap );
                var specEventName = typeMap.Get( specTypeId ).Attribute.BrowseName.Name;
                print( "Event [" + index + "] of " + eventBuffers.length + " ID = [" + event.EventHandle + "]" +
                    " Event Name " + eventName + " spec event name " + specEventName +
                    " Client Handle " + event.EventFieldList.ClientHandle );

                var eventTypeFieldMapMandatory = this.RetrieveSelectFieldsForType( allMap, specTypeId, typeMap, mandatory );
                var eventTypeFieldMapOptional = this.RetrieveSelectFieldsForType( allMap, specTypeId, typeMap, !mandatory );
                var fieldKeys = allMap.Keys();
                for ( var fieldIndex = 0; fieldIndex < fieldKeys.length; fieldIndex++ ) {
                    var eventFieldName = eventTypeFieldMapMandatory.Get( fieldIndex );
                    if ( isDefined( eventFieldName ) ) {
                        var fieldValue = event.EventFieldList.EventFields[ fieldIndex ];
                        print( "Index [" + fieldIndex + "] " + eventFieldName + ": " + fieldValue.toString() );
                    } else {
                        eventFieldName = eventTypeFieldMapOptional.Get( fieldIndex );
                        if ( isDefined( eventFieldName ) ) {
                            var fieldValue = event.EventFieldList.EventFields[ fieldIndex ];
                            print( "Optional - Index [" + fieldIndex + "] " + eventFieldName + ": " + fieldValue.toString() );
                        } else {
                            print( "\tIndex [" + fieldIndex + "] Field " + fieldKeys[ fieldIndex ] +
                                " Not required by alarm type " + specEventName );
                        }
                    }
                }

                var actualEventLength = event.EventFieldList.EventFields.length;
                if ( actualEventLength > fieldKeys.length ) {
                    var lastIndex = actualEventLength - 1;
                    print( "Last Event Index [" + lastIndex + "] should be condition id " + event.EventFieldList.EventFields[ lastIndex ].toString() );
                }

            } else {
                addError( "Unable to retrieve Event Type from event" );
            }
        }
    }

    /**
     * Retrieves the alarm type name that the specified type is derived from in string format
     * Spec alarm types just return their own node id
     * @param {string} typeId - specified alarm type 
     * @param {KeyPairCollection} - typeMap a map of all alarm types supported 
     * @returns {string} - closest spec id to the requested type id
     */
    this.GetSpecTypeId = function ( typeId, typeMap ) {
        var initialObject = typeMap.Get( typeId );
        var specTypeId = "";
        if ( initialObject.SpecAlarmTypeId ) {
            specTypeId = initialObject.SpecAlarmTypeId;
        } else {
            addError( "GetSpecTypeObject unable to find spec type id" );
            stopCurrentUnit();
        }
        return specTypeId;
    }

    /**
     * Retrieves the alarm type that the specified type is derived from
     * Spec alarm types just return their own object
     * @param {string} typeId - specified alarm type 
     * @param {KeyPairCollection} - typeMap a map of all alarm types supported 
     * @returns {object} - closest alarm type to the requested type id
     */
    this.GetSpecTypeObject = function ( typeId, typeMap ) {
        var initialObject = typeMap.Get( typeId );
        var typeObject = null;
        if ( initialObject.SpecAlarmTypeId ) {
            typeObject = typeMap.Get( initialObject.SpecAlarmTypeId );
        } else {
            addError( "GetSpecTypeObject unable to find spec type id" );
        }
        return typeObject;
    }

    //#endregion

    //#region ModelMap

    /**
     * @returns {object} Model map helper which contains the model map, and helper functions
     */
    this.GetModelMapHelper = function () {
        this.CreateModelMapHelper();
        return this.ModelMapHelper;
    }

    /**
     * @returns {KeyPairCollection} Model map
     */
    this.GetModelMap = function () {
        return this.GetModelMapHelper().GetModelMap();
    }

    this.CreateModelMapHelper = function () {
        if ( !isDefined( this.ModelMapHelper ) ) {
            this.ModelMapHelper = new BuildLocalCacheMapService();
        }
    }

    //#endregion

    //#region Reads

    /**
     * Read specified attributes of items found in input map
     * @param {KeyPairCollection} map - a map of items to read, map value contains objects found in model map 
     * @param {object[]} attributes - an array of attributes to be read from each item, and where to put the result
     * @param {object} attributes[].Attribute - a definition of the Attribute to be read for each item
     * @param {object} attributes[].ObjectPath - a placeholder in the map value where the result of the read data is to be inserted
     */
    this.ReadData = function ( map, attributes ) {

        // For each variable in the map, read the desiredAttributes

        var keys = map.Keys();

        var totalRead = 0;

        while ( totalRead < ( keys.length ) ) {
            var totalToRead = keys.length - totalRead;
            if ( totalToRead > this.NumberOfItemsToRead ) {
                totalToRead = this.NumberOfItemsToRead;
            }

            var items = [];

            for ( var index = 0; index < totalToRead; index++ ) {
                var itemIndex = index + totalRead;
                for ( var attributeIndex = 0; attributeIndex < attributes.length; attributeIndex++ ) {
                    var item = MonitoredItem.fromNodeIds( new UaNodeId( UaNodeId.fromString( keys[ itemIndex ] ) ) )[ 0 ];
                    item.AttributeId = attributes[ attributeIndex ].Attribute;
                    items.push( item );
                }
            }

            ReadHelper.Execute( {
                NodesToRead: items,
                TimestampsToReturn: TimestampsToReturn.Neither,
                SuppressMessaging: true,
                SuppressWarnings: true,
                SuppressBadValueStatus: [ StatusCode.BadAttributeIdInvalid ]
            } );

            for ( var index = 0; index < totalToRead; index++ ) {
                var itemIndex = index + totalRead;
                var itemValue = map.Get( keys[ itemIndex ] );

                if ( isDefined( itemValue ) ) {
                    var readItemIndex = ( index * attributes.length );
                    for ( var attributeIndex = 0; attributeIndex < attributes.length; attributeIndex++ ) {

                        //#region Create Dynamic path
                        // This goofiness allows for generic creation of an object path,
                        // allowing the code to be reused for several purposes.
                        // For example a type can be given the desired structure of
                        // type.Attribute.BrowseName
                        // type.Attribute.IsAbstract

                        var objectPath = attributes[ attributeIndex ].ObjectPath;
                        var itemValueLocation = itemValue;
                        var lastUsableIndex = objectPath.length - 1;
                        var lastObjectName = objectPath[ lastUsableIndex ];
                        for ( var pathIndex = 0; pathIndex < lastUsableIndex; pathIndex++ ) {
                            var objectPathInstance = objectPath[ pathIndex ];
                            if ( !isDefined( itemValueLocation[ objectPathInstance ] ) ) {
                                itemValueLocation[ objectPathInstance ] = new Object();
                            }
                            var shifter = itemValueLocation[ objectPathInstance ];
                            itemValueLocation = shifter;
                        }
                        //#endregion

                        var expandedIndex = readItemIndex + attributeIndex;
                        if ( items[ expandedIndex ].Value.StatusCode.isGood() ) {
                            itemValueLocation[ lastObjectName ] = UaVariant.FromUaType(
                                { Value: items[ expandedIndex ].Value.Value } );
                            if ( isDefined( itemValueLocation[ lastObjectName ] ) ) {
                                itemValueLocation[ lastObjectName ].Original = items[ expandedIndex ].Value.Value;
                            }
                        }
                    }
                }
            }

            totalRead += totalToRead;
        }
    }


    //#endregion

    /**
     * Retrieves all alarm types from the object model of the server.
     * @param {KeyPairCollection} map - Model Map 
     * @param {UaNodeId} type - desired Alarm Type 
     * @returns {KeyPairCollection} map of all alarm types
     */
    this.GetAlarmTypesFromModel = function ( map, type ) {

        var typeMap = new KeyPairCollection();

        var key = type.toString();
        var modelValue = map.Get( key );

        if ( isDefined( modelValue ) && isDefined( modelValue.ReferenceDescriptions ) ) {

            typeMap.Set( key, modelValue );

            for ( var index = 0; index < modelValue.ReferenceDescriptions.length; index++ ) {

                var referenceDescription = modelValue.ReferenceDescriptions[ index ];

                if ( this.HasSubType( referenceDescription ) ) {
                    typeMap.Append( this.GetAlarmTypesFromModel( map, referenceDescription.NodeId.NodeId ) );
                }
            }
        }

        return typeMap;
    }

    /**
     * Get a semi colon separated name of all model map entities in the array that have the Name retrieved
     * @param {object[]} array - array of entities
     * @returns {string} 
     */
    this.GetAlarmEntityName = function ( array ) {
        var name = "";
        var lastIndex = array.length - 1;
        array.forEach( function ( entity, index ) {
            var separator = "";
            if ( index < lastIndex ) {
                separator = ":";
            }

            name = name + entity.Name + separator;
        } );

        return name;
    }


    //#region Comparisons

    /**
     * Checks to see if a method has any input parameters so a method compare can continue
     * @param {object} nodesetReference - a subreference of a method
     * @returns {boolean} if a subreference is of type HasProperty, then comparison can continue
     */
    this.CanCompareMethod = function ( nodesetReference ) {

        var canCompare = false;
        var nodeSetUtility = this.GetNodeSetUtility();
        if ( nodeSetUtility.IsForward( nodesetReference ) ) {
            var referenceTypeName = nodeSetUtility.GetReferenceTypeName( nodesetReference );
            if ( referenceTypeName == "HasProperty" ) {
                canCompare = true;
            }
        }

        return canCompare;
    }

    /**
     * Compares all aspects of a method to the spec
     * @param {object} alarmObject - server alarm type definition
     * @param {object} nodeSetObject  - spec alarm type definition
     * @param {object} alarmReference - server alarm method definition
     * @param {object} nodeSetEntity - spec alarm method definition
     * @returns {boolean}
     */
    this.CompareMethod = function ( alarmObject, nodeSetObject, alarmReference, nodeSetEntity ) {

        var success = true;

        print( "CompareMethod for " + this.GetAlarmEntityName( [ alarmObject, alarmReference ] ) );

        var nodeSetHelper = this.GetNodeSetUtility();

        // Get the references of the nodeSet Entity
        if ( isDefined( nodeSetEntity ) &&
            isDefined( nodeSetEntity.References ) &&
            isDefined( nodeSetEntity.References.Reference ) ) {
            var references = nodeSetEntity.References.Reference;

            for ( var index = 0; index < references.length; index++ ) {
                var reference = references[ index ];
                var nodeSetParameterNodeId = reference.__text;
                var nodeSetParameterObject = nodeSetHelper.GetEntity( nodeSetParameterNodeId );

                if ( this.CanCompareMethod( reference ) ) {

                    if ( isDefined( alarmReference.Parameters ) ) {
                        var alarmParameter = alarmReference.Parameters.Get( nodeSetParameterNodeId );
                        if ( isDefined( alarmParameter ) &&
                            isDefined( alarmParameter.Value ) &&
                            isDefined( alarmParameter.Value.Original ) ) {

                            var alarmArguments = alarmParameter.Value.Original.toExtensionObjectArray();

                            if ( isDefined( alarmArguments ) ) {
                                if ( !this.CompareMethodParameters( alarmObject,
                                    nodeSetObject, alarmArguments, nodeSetParameterObject ) ) {
                                    success = false;
                                }
                            } else {
                                addError( "No Alarm Arguments found for " +
                                    this.GetAlarmEntityName( [ alarmObject, alarmReference, alarmParameter ] ) );
                                success = false;
                            }
                        } else {
                            addError( "Alarm Method does not have a value for the desired parameter nodeid " +
                                nodeSetParameterNodeId + " for " +
                                this.GetAlarmEntityName( [ alarmObject, alarmReference ] ) );
                            success = false;
                        }
                    } else {
                        addError( "Alarm Method does not have any parameter properties " +
                            this.GetAlarmEntityName( [ alarmObject, alarmReference ] ) );
                        success = false;
                    }
                }
            }

        } else {
            addError( "CompareMethod nodeSetEntity is invalid" );
            success = false;
        }

        return success;
    }

    /**
     * Compares parameters of a method to the spec
     * @param {object} alarmObject - server alarm type definition
     * @param {object} nodeSetObject  - spec alarm type definition
     * @param {object} alarmReference - server alarm parameters definition
     * @param {object} nodeSetParameters - spec alarm parameters definition
     * @returns {boolean}
     */
    this.CompareMethodParameters = function ( alarmObject, nodeSetObject, alarmReference, nodeSetParameters ) {
        var success = true;

        if ( isDefined( nodeSetParameters.Value ) &&
            isDefined( nodeSetParameters.Value.ListOfExtensionObject ) &&
            isDefined( nodeSetParameters.Value.ListOfExtensionObject.ExtensionObject ) ) {

            var parameters = nodeSetParameters.Value.ListOfExtensionObject.ExtensionObject;

            var alarmParameterMap = this.GetAlarmParameterMap( alarmReference );

            for ( var index = 0; index < parameters.length; index++ ) {
                var parameter = parameters[ index ];
                if ( isDefined( parameter.Body ) && isDefined( parameter.Body.Argument ) ) {
                    var nodeSetArgument = parameter.Body.Argument;
                    var alarmArgument = alarmParameterMap.Get( nodeSetArgument.Name );

                    if ( isDefined( alarmArgument ) ) {
                        if ( !this.CompareMethodParameterArgument( alarmObject, nodeSetObject,
                            alarmArgument, nodeSetArgument ) ) {
                            success = false;
                        }
                    } else {
                        addError( "Unable to find argument " + nodeSetArgument.Name + " in alarm parameter " +
                            this.GetAlarmEntityName( [ alarmObject, alarmReference ] ) );
                        success = false;
                    }
                } else {
                    addError( "Unable to find argument value in Method parameter " +
                        this.GetAlarmEntityName( [ alarmObject, alarmReference ] ) );
                    success = false;
                }
            }
        } else {
            addError( "Unable to find pararameter value in Method parameter " +
                this.GetAlarmEntityName( [ alarmObject, alarmReference ] ) );
            success = false;
        }

        return success;
    }

    /**
     * Compares parameter arguements of a method to the spec
     * @param {object} alarmObject - server alarm type definition
     * @param {object} nodeSetObject  - spec alarm type definition
     * @param {object} alarmArgument - server alarm argument definition
     * @param {object} nodeSetArgument - spec alarm argument definition
     * @returns {boolean}
     */
    this.CompareMethodParameterArgument = function ( alarmObject, nodeSetObject, alarmArgument, nodeSetArgument ) {

        var success = true;

        print( "CompareMethodParameterArgument " + this.GetAlarmEntityName( [ alarmObject ] ) + ":" + alarmArgument.Name );

        // No easy way as nodeSet is just an object, and alarm is a UAArgument.
        var errorPreface = "Error Method Parameter Argument ";

        if ( !this.CompareValues( "CompareMethodParameterArgument:Name", alarmObject, nodeSetObject,
            nodeSetArgument.Name, alarmArgument.Name ) ) {
            success = false;
        }

        if ( !this.CompareObjects( "CompareMethodParameterArgument:DataType", alarmObject, nodeSetObject,
            this.GetNodeSetUtility().GetNodeId( nodeSetArgument.DataType.Identifier ),
            alarmArgument.DataType ) ) {
            success = false;
        }

        if ( !this.CompareValues( "CompareMethodParameterArgument:ValueRank", alarmObject, nodeSetObject,
            parseInt( nodeSetArgument.ValueRank ), alarmArgument.ValueRank ) ) {
            success = false;
        }

        if ( alarmArgument.ArrayDimensions.length > 0 ) {
            addError( errorPreface + " ArrayDimensions are unexpected size " + alarmArgument.ArrayDimensions.length );
            success = false;
        }

        var description = new UaLocalizedText();
        description.Text = nodeSetArgument.Description.Text;

        if ( !this.CompareObjects( "CompareMethodParameterArgument:Description", alarmObject, nodeSetObject,
            description,
            alarmArgument.Description ) ) {
            success = false;
        }

        return success;
    }

    /**
     * Internal to Method compare
     */
    this.GetAlarmParameterMap = function ( alarmArguments ) {
        var map = new KeyPairCollection();
        for ( var index = 0; index < alarmArguments.length; index++ ) {
            var argument = alarmArguments[ index ].toArgument();
            if ( isDefined( argument ) ) {
                map.Set( argument.Name, argument );
            } else {
                addError( "Alarm Parameters contains an invalid parameter which should be an Argument" );
            }
        }
        return map;
    }

    /**
     * Compares two UA objects
     * @param {string} definition - definition of what is being compared   
     * @param {object} alarm - alarm definition 
     * @param {object} nodeSet - spec definition
     * @param {object} expected - expected value
     * @param {object} actual - actual value
     * @returns {boolean}
     */
    this.CompareObjects = function ( definition, alarm, nodeSet, expected, actual ) {
        var success = false;

        if ( isDefined( expected ) && isDefined( actual ) ) {
            if ( !isDefined( expected.equals ) ) {
                print( "Compare Objects does not have equal method" );
                stopCurrentUnit();
            }
            if ( expected.equals( actual ) ) {
                success = true;
            } else {
                this.AddComparisonError( definition, alarm, nodeSet, expected, actual );
            }
        } else {
            this.AddError( definition, alarm, nodeSet, "Null Value comparison error" );
        }
        return success;
    }

    /**
     * Compares two UA objects that do not have equal methods
     * @param {string} definition - definition of what is being compared   
     * @param {object} alarm - alarm definition 
     * @param {object} nodeSet - spec definition
     * @param {object} expected - expected value
     * @param {object} actual - actual value
     * @returns {boolean}
     */
    this.CompareValues = function ( definition, alarm, nodeSet, expected, actual ) {
        var success = false;
        if ( isDefined( expected ) && isDefined( actual ) ) {
            if ( actual == expected ) {
                success = true;
            } else {
                this.AddComparisonError( definition, alarm, nodeSet, expected, actual );
            }
        } else {
            this.AddError( definition, alarm, nodeSet, "Null Value comparison error" );
        }
        return success;
    }

    /**
     * Creates an error
     * @param {string} definition - definition of what is being compared   
     * @param {object} alarm - alarm definition 
     * @param {object} nodeSet - spec definition
     * @param {object} expected - expected value
     * @param {object} actual - actual value
     */
    this.AddComparisonError = function ( definition, alarm, nodeSet, expected, actual ) {
        this.AddError( definition, alarm, nodeSet, "Expected " + expected.toString() + " actual " + actual.toString() );
    }

    /**
     * Compares two UA objects
     * @param {string} definition - definition of what is being compared   
     * @param {object} alarm - alarm definition 
     * @param {object} nodeSet - spec definition
     * @param {string} message - error message
     */
    this.AddError = function ( definition, alarm, nodeSet, message ) {
        addError( "Error comparing " + definition + " alarm " + this.GetAlarmEntityName( [ alarm ] ) +
            " to nodeSet " + nodeSet._BrowseName + " " + message );
    }

    //#endregion

    //#region Verifications
    this.VerifyNodeClass = function ( alarmObject, nodeSetObject, alarm, nodeSet ) {
        this.CompareValues( "NodeClass", alarmObject, nodeSetObject,
            this.GetNodeSetUtility().GetNodeClass( nodeSet ),
            alarm.NodeClass );
    }

    this.VerifyBrowseName = function ( alarmObject, nodeSetObject, alarm, nodeSet ) {
        this.CompareObjects( "BrowseName", alarmObject, nodeSetObject,
            this.GetNodeSetUtility().GetBrowseName( nodeSet ),
            alarm.BrowseName );
    }


    this.VerifyDataType = function ( alarmObject, nodeSetObject, alarm, nodeSet ) {
        var nodeClass = this.GetNodeSetUtility().GetNodeClass( nodeSet );

        if ( nodeClass == NodeClass.Variable ) {
            this.CompareObjects( "DataType", alarmObject, nodeSetObject,
                this.GetNodeSetUtility().GetDataType( nodeSet ),
                alarm.ModelObject.DataType );
        }
    }

    this.VerifyTypeDefinition = function ( alarmObject, nodeSetObject, alarm, nodeSet ) {
        var nodeClass = this.GetNodeSetUtility().GetNodeClass( nodeSet );

        if ( nodeClass == NodeClass.Variable || nodeClass == NodeClass.Object ) {

            var nodeSetUtility = this.GetNodeSetUtility();

            var expected = nodeSetUtility.GetTypeDefinition( nodeSet );
            var expectedObject = nodeSetUtility.GetEntity( expected );

            var actual = alarm.TypeDefinition;

            print( "VerifyTypeDefinition for " + nodeSet.DisplayName + " typeDefinition is " + expected.toString() + " type = " + expectedObject._BrowseName );

            this.CompareValues( "TypeDefinition for " + alarmObject.Name, alarmObject, nodeSetObject,
                expected.toString(), actual.toString() );
        }
    }

    this.VerifyModellingRule = function ( alarmObject, nodeSetObject, alarm, nodeSet ) {
        var nodeClass = this.GetNodeSetUtility().GetNodeClass( nodeSet );

        if ( nodeClass != NodeClass.ObjectType ) {
            var modellingRule = this.GetNodeSetUtility().GetModellingRule( nodeSet );
            if ( isDefined( modellingRule ) ) {
                if ( !isDefined( alarm.ModellingRule ) ) {
                    addError( "Alarm Type Reference " + this.GetAlarmEntityName( [ alarm ] ) +
                        " does not have a modelling rule" );
                } else {
                    this.CompareValues( "ModellingRule", alarmObject, nodeSetObject,
                        modellingRule.toString(),
                        alarm.ModellingRule.toString() );
                }
            } else {
                // This is not an error.
                //                print( "Unable to find node set Alarm Type Reference " + this.GetAlarmEntityName( [ alarm ] ) + " Modelling Rule" );
            }
        }
    }


    //#endregion

    /**
     * Retrieves an alarm modelling rule and type definition from the model map
     * @param {object} modelObject - object to find references on
     * @returns {object} discovered attributes
     */
    this.GetAttributeFromModel = function ( modelObject ) {

        var searchDefinitionModellingRuleIndex = 0;
        var searchDefinitionTypeDefinitionIndex = 1;

        var attribute = new Object();

        if ( !isDefined( modelObject.ModellingRule ) ||
            !isDefined( modelObject.TypeDefinition ) ) {

            // Get attributes
            var searchDefinitions = this.GetSearchDefinitions();

            this.GetModelMapHelper().FindReferences( modelObject.ReferenceDescriptions, searchDefinitions );

            for ( var index = 0; index < searchDefinitions.length; index++ ) {
                var foundReferenceIndex = searchDefinitions[ index ].ReferenceIndex;

                if ( foundReferenceIndex >= 0 ) {
                    if ( index == searchDefinitionModellingRuleIndex ) {
                        attribute.ModellingRule = modelObject.ReferenceDescriptions[ foundReferenceIndex ].NodeId.NodeId;
                        modelObject.ModellingRule =
                            modelObject.ReferenceDescriptions[ foundReferenceIndex ].NodeId.NodeId;
                    } else if ( index == searchDefinitionTypeDefinitionIndex ) {
                        attribute.TypeDefinition = modelObject.ReferenceDescriptions[ foundReferenceIndex ].NodeId.NodeId;
                        modelObject.TypeDefinition =
                            modelObject.ReferenceDescriptions[ foundReferenceIndex ].NodeId.NodeId;
                    }
                }
            }
        }

        return attribute;
    }

    /**
     * Gets the expected ConditionClassName from the spec for comparison
     * @param {UaNodeId} conditionClassId 
     * @returns {UaLocalizedText} conditionClassName
     */
    this.GetConditionClassName = function ( conditionClassId ) {
        var name = null;
        var conditionClassIdString = conditionClassId.toString();
        var specObject = this.GetNodeSetUtility().GetEntity( conditionClassIdString );
        if ( isDefined( specObject ) ) {
            name = new UaLocalizedText();
            name.Text = specObject.DisplayName;
        } else {
            // Go Read it.
            var map = new KeyPairCollection();
            var conditionClassIdObject = this.GetModelMap().Get( conditionClassIdString );

            if ( isDefined( conditionClassIdObject ) ) {
                if ( !( isDefined( conditionClassIdObject.Attribute ) &&
                    isDefined( conditionClassIdObject.Attribute.DisplayName ) ) ) {
                    map.Set( conditionClassIdString, conditionClassIdObject );
                    var attributes = [
                        { Attribute: Attribute.BrowseName, ObjectPath: [ "Attribute", "BrowseName" ] },
                        { Attribute: Attribute.DisplayName, ObjectPath: [ "Attribute", "DisplayName" ] }
                    ];

                    this.ReadData( map, attributes );
                }

                if ( isDefined( conditionClassIdObject.Attribute ) &&
                    isDefined( conditionClassIdObject.Attribute.DisplayName ) ) {
                    name = conditionClassIdObject.Attribute.DisplayName;
                }
            }
        }
        return name;
    }

    /**
     * Retrieves search definitions for this.GetAttributeFromModel
     * @returns {object[]}
     */
    this.GetSearchDefinitions = function () {
        return [
            {
                ReferenceTypeId: new UaNodeId( Identifier.HasModellingRule ),
                IsForward: true
            },
            {
                ReferenceTypeId: new UaNodeId( Identifier.HasTypeDefinition ),
                IsForward: true
            },
            {
                ReferenceTypeId: new UaNodeId( Identifier.HasTypeDefinition ),
                IsForward: false
            }
        ];
    }

    /**
     * Adds method parameters to the alarm object reference description
     * @param {object} referenceDescription Alarm method parameter ReferenceDescription
     * @param {object} methodObject Model Object ReferenceDetail 
     * @param {KeyPairCollection} readMethodMap Method map for ReferenceDetail
     */
    this.AddMethodParameters = function ( referenceDescription, methodObject, readMethodMap ) {

        if ( this.HasProperty( referenceDescription ) ) {
            var parameterNodeId = referenceDescription.NodeId.NodeId.toString();
            var parameterObject = this.GetModelMap().Get( parameterNodeId );

            if ( !readMethodMap.Contains( parameterNodeId ) ) {
                readMethodMap.Set( parameterNodeId, parameterObject );
            }

            if ( !isDefined( methodObject.Parameters ) ) {
                methodObject.Parameters = new KeyPairCollection();
            }

            if ( !methodObject.Parameters.Contains( parameterNodeId ) ) {
                methodObject.Parameters.Set( parameterNodeId, parameterObject );
            }
        }
    }

    /**
     * Retrieve all alarm type node ids in the parent hierarchy from the spec
     * @param {object} nodeSetTypeObject spec alarm type
     * @returns {string[]} parent node ids
     */
    this.GetParentHeirarchy = function ( nodeSetTypeObject ) {
        var heirarchy = [];

        var BaseEventTypeNodeId = "i=2041";
        var workingObject = nodeSetTypeObject;

        if ( isDefined( nodeSetTypeObject._NodeId ) ) {
            heirarchy.push( nodeSetTypeObject._NodeId );
        }

        var nodeSetUtility = this.GetNodeSetUtility();

        var keepLooking = true;

        while ( keepLooking ) {
            var parentNodeId = nodeSetUtility.GetParentNodeId( workingObject );
            workingObject = nodeSetUtility.GetNodeSet().Get( parentNodeId );
            if ( isDefined( workingObject ) ) {
                heirarchy.push( parentNodeId );
                if ( workingObject._NodeId == BaseEventTypeNodeId ) {
                    keepLooking = false;
                }
            }
        }

        return heirarchy;
    }

    this.IsSubTypeOf = function ( referenceDescription ) {
        var isSubType = false;

        if ( !referenceDescription.IsForward &&
            referenceDescription.ReferenceTypeId.equals( this.HasSubtypeNodeId ) ) {
            isSubType = true;
        }

        return isSubType;
    }

    this.HasSubType = function ( referenceDescription ) {
        var hasSubType = false;

        if ( referenceDescription.IsForward &&
            referenceDescription.ReferenceTypeId.equals( this.HasSubtypeNodeId ) ) {
            hasSubType = true;
        }

        return hasSubType;
    }

    this.PropertyOf = function ( referenceDescription ) {
        var propertyOf = false;

        if ( !referenceDescription.IsForward &&
            referenceDescription.ReferenceTypeId.equals( this.PropertyNodeId ) ) {
            propertyOf = true;
        }

        return propertyOf;
    }

    this.HasProperty = function ( referenceDescription ) {
        var hasProperty = false;

        if ( referenceDescription.IsForward &&
            referenceDescription.ReferenceTypeId.equals( this.PropertyNodeId ) ) {
            hasProperty = true;
        }

        return hasProperty;
    }

    /**
     * Gets the desired eventField value from the specified SelectFields Map
     * @param {UaVariant[]} eventFields - All event fields for an event
     * @param {string} selectField - Name of the desired event field
     * @param {KeyPairCollection} selectFields - Map containing the desired selectFields
     * @returns {UaVariant} - Desired EventField Value
     */
    this.GetSelectFieldFromMap = function ( eventFields, selectField, selectFields ) {
        var field = selectFields.Get( selectField );
        if ( !isDefined( field ) || !isDefined( field.Index ) ) {
            // Leaving this message in to find programming errors
            debugger;
        }
        var index = field.Index;
        return eventFields[ index ];
    }

    /**
     * Read all items in the select field map from an alarm instance
     * This allows using the return variants to run through this.TestMandatoryProperty
     * @param {object} alarmInstance 
     * @param {KeyPairCollection} selectFieldMap 
     * @returns {UaVariants} a variant array to simulate a typical event variant array ordered 
     *                       according to the selectFieldMap. 
     */
    this.ReadEventFields = function( alarmInstance, selectFieldMap ){
        var eventFields = null;

        var modelMapHelper = this.GetModelMapHelper();

        var instanceMap = modelMapHelper.BuildAlarmReferenceDescriptionMap( alarmInstance );

        var readMap = new KeyPairCollection();
        var readArray = [];

        selectFieldMap.Iterate( function ( property, propertyField ) {
            var instanceProperty = instanceMap.Get( property );
            if ( isDefined( instanceProperty ) ) {
                var item = MonitoredItem.fromNodeIds( instanceProperty.NodeId.NodeId )[0];
                readArray.push( item );
                readMap.Set( property, item );
            }
        } );

        if ( selectFieldMap.Length() > 0 ){
            
            if ( ReadHelper.Execute( { NodesToRead: readArray } ) ){

                eventFields = new UaVariants( selectFieldMap.Length() );
    
                readMap.Iterate( function( propertyName, propertyValue ){
                    var field = selectFieldMap.Get( propertyName );
                    if ( isDefined( field ) && isDefined( field.Index ) ){
                        if ( propertyValue.Value.StatusCode.isGood() ){
                            eventFields[ field.Index ] = new UaVariant( propertyValue.Value.Value );
                        }
                    }
                } );
            }else{
                addError("Unable to read Alarm Instance Values" + ReadHelper.UaStatus.toString() );
            }
        }        

        return eventFields;
    }

    /**
     * Test whether a value in an UaVariants array value matches the spec defined datatype depending if the spec 
     * states it is mandatory or optional
     * @param {string} name Field Name
     * @param {UaVariants} eventFields All Values
     * @param {KeyPairCollection} selectFields - fields included in an event
     * @param {KeyPairCollection} mandatoryMap - fields that are mandatory
     * @param {KeyPairCollection} optionalMap - fields that are optional
     * @returns {string} errorMessage - contains a value if error condition, empty if success
     */
    this.TestMandatoryProperty = function ( name, eventFields, selectFields, mandatoryMap, optionalMap ) {

        var errorMessage = "";

        var value = this.GetSelectFieldFromMap( eventFields, name, selectFields );
        var mandatory = mandatoryMap.Get( name );
        var optional = optionalMap.Get( name );

        var optionalName = "optional";
        var testOptional = true;
        if ( isDefined( mandatory ) ) {
            optionalName = "mandatory";
            if ( this.IsMandatoryProperty( name, eventFields, selectFields, mandatoryMap ) ) {
                testOptional = false;
                var expectedDataType = this.GetNodeSetUtility().GetExpectedDataTypeIdentifier( mandatory.Reference );
                print( "Testing mandatory field " + name + " value " + value.toString() + " datatype " + expectedDataType + " reference " + mandatory.Reference._DataType );
                if ( value.DataType != expectedDataType ) {
                    errorMessage = " Unexpected mandatory datatype for event field " + name +
                        ", Expected " + expectedDataType + " Actual " + value.DataType;
                }
            }
        }
        
        if ( testOptional ){
            if ( value.DataType != 0 ) {
                if ( isDefined( optional ) ) {
                    var expectedDataType = this.GetNodeSetUtility().GetExpectedDataTypeIdentifier( optional.Reference );
                    print( "Testing " + optionalName + " field " + name + " value " + value.toString() + " datatype " + expectedDataType + " reference " + optional.Reference._DataType );

                    if ( value.DataType != expectedDataType ) {
                        errorMessage = " Unexpected " + optionalName + " datatype for event field " + name +
                            ", Expected " + expectedDataType + " Actual " + value.DataType;
                    }
                }
            }
        }

        return errorMessage;
    }


    /**
     * Determines if a mandatory property should actually be tested
     * This is for cases like .Id  ShelvingState.LastTransition.Id is mandatory, but ShelvingState.LastTransition is Optional
     * 
     * @param {string} name Property Name
     * @param {UaVariant[]} eventFields - All event fields for an event
     * @param {KeyPairCollection} selectFields - select fields map for eventFields 
     * @param {KeyPairCollection} mandatoryMap 
     * @returns {boolean} whether the property is mandatory or not based off exceptions and parent availability
     */
    this.IsMandatoryProperty = function ( name, eventFields, selectFields, mandatoryMap ) {
        var separator = '.';
        var isMandatory = false;
        var mandatory = mandatoryMap.Get( name );
        if ( isDefined( mandatory ) ) {
            if ( this.MandatoryException( name, eventFields, selectFields ) ) {
                isMandatory = true;
                var parts = name.split( separator );
                while ( parts.length > 1 ) {
                    parts.pop();
                    var parentName = parts.join( separator );

                    // Need the original value.
                    var originalParentSelectField = selectFields.Get( parentName );
                    if ( isDefined( originalParentSelectField ) ) {
                        var parentValue = this.GetSelectFieldFromMap( eventFields, parentName, selectFields );
                        if ( parentValue.DataType > 0 ) {
                            isMandatory = true;
                            break;
                        } else {
                            var parentMandatory = mandatoryMap.Get( parentName );
                            if ( !isDefined( parentMandatory ) ) {
                                print( "Mandatory Property " + name + " is marked as not mandatory as optional parent propery " +
                                    parentName + " is not supported" );

                                isMandatory = false;
                                break;
                            }
                        }
                    } else if ( parentName == "LimitState" ) {
                        var activeState = this.GetSelectFieldFromMap( eventFields, "ActiveState.Id", selectFields ).toBoolean();
                        if ( !activeState ) {
                            // TODO, not sure of the proper spec behaviour.
                            isMandatory = false;
                        } else {
                            isMandatory = true;
                        }
                        break;
                    } else if ( parentName == "ShelvingState" ) {
                        isMandatory = false;
                        break;
                    }
                }
            }
        }

        return isMandatory;
    }

    /**
     * Mantis 8315
     * It is expected that mandatory fields contain a valid non null variant.  
     * However there are exceptions to this rule
     * This function is intended to identify those exceptions
     * @param {string} name - name of the event field to check
     * @param {UaVariant[]} eventFields - All event fields for an event
     * @param {KeyPairCollection} selectFields - select fields map for eventFields 
     * @returns {boolean} whether the property is mandatory or not based off exceptions
     */
    this.MandatoryException = function ( name, eventFields, selectFields ) {
        var isMandatory = true;

        if ( name == "SourceNode" ||
            name == "SourceName" ||
            name == "BranchId" ||
            name.indexOf("LastSeverity") == 0 ||
            name == "InputNode" ||
            name == "SetpointNode") {
            print( "Mandatory Property " + name + " is marked as not mandatory due to exceptions" );
            isMandatory = false;
        } else {
            var hasComment = false
            var commentString = "Comment";
            if ( selectFields.Contains( commentString ) ) {
                var commentVariant = this.GetSelectFieldFromMap( eventFields, commentString, selectFields );
                if ( commentVariant.DataType > 0 ) {
                    var commentLocalizedText = commentVariant.toLocalizedText();
                    if ( isDefined( commentLocalizedText.Text.length ) && commentLocalizedText.Text.length > 0 ) {
                        hasComment = true;
                    }
                }
            }

            if ( !hasComment ) {
                if ( name == "ClientUserId" ||
                    name == "Comment.SourceTimestamp" ) {
                    print( "Mandatory Property " + name + " is marked as not mandatory due to empty comment" );
                    isMandatory = false;
                }
            }
        }

        return isMandatory;
    }


    /**
     * Retrieves an array of Alarm Source nodes configured by the user in Server Test/Alarms and Conditions/Supported Condition Types/Alarm type
     * @param {string} alarmTypeNodeId - alarm/event type node id in string format
     * @returns array of source nodes
     */
    this.GetAlarmInputNodes = function ( alarmTypeNodeId ) {
        var inputNodes = [];

        var alarmName = this.GetAlarmName( alarmTypeNodeId );
        if ( alarmName.length > 0 ) {
            var alarmSourceSettingName = alarmName + "InputNodes";
            if ( isDefined( Settings.ServerTest.AlarmsAndConditions.SupportedConditionTypes[ alarmSourceSettingName ] ) ) {
                inputNodes = Settings.ServerTest.AlarmsAndConditions.SupportedConditionTypes[ alarmSourceSettingName ];
            }
        }

        return inputNodes;
    }

    /**
     * Retrieves the spec name for a specified alarm type
     * Used by GetAlarmSourceNames to retrieve configured source names
     * @param {string} alarmTypeNodeId - alarm/event type node id in string format
     * @returns alarm name as defined by the spec
     */
    this.GetAlarmName = function ( alarmTypeNodeId ) {
        var alarmName = "";
        var nodeSetUtility = this.GetNodeSetUtility();
        var alarmNode = nodeSetUtility.GetEntity( alarmTypeNodeId.toString() );
        if ( isDefined( alarmNode ) && isDefined( alarmNode.DisplayName ) ) {
            alarmName = alarmNode.DisplayName;
        }

        return alarmName;
    }

    /**
     * Gets all derived alarm types not in the spec.
     * @param {string} alarmTypeString - Specification Alarm Type as string
     * @returns {string[]} All Derived Alarm types not in the specification
     */
    this.GetDerivedTypes = function ( alarmTypeString ) {
        var modelMapHelper = this.GetModelMapHelper();
        var nodeSetUtility = this.GetNodeSetUtility()
        return modelMapHelper.GetDerivedTypes( alarmTypeString, nodeSetUtility );
    }

    /**
     * Gets all alarm types including any derived types not in the spec.
     * Function is to AddIgnoreSkips so test results will only show these alarm types
     * @param {string} alarmTypeString - Specification Alarm Type as string
     * @returns {string[]} All Alarm types interesting for specified test
     */
    this.GetAlarmTypeAndDerivedTypes = function ( alarmTypeString ) {

        var alarmTypes = [];

        alarmTypes.push( alarmTypeString );

        var derivedAlarmTypes = this.GetDerivedTypes( alarmTypeString );
        for ( var index = 0; index < derivedAlarmTypes.length; index++ ) {
            alarmTypes.push( derivedAlarmTypes[ index ] );
        }

        return alarmTypes;
    }
}