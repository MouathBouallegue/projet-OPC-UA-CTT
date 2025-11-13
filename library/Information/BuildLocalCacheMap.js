include( "./library/Information/BuildObjectCacheMap.js" );

/**
 * Object is to retrieve the Server Model map from the CTT.
 * This provides the ability to search the model for any information desired.
 */
function BuildLocalCacheMapService () {
    this.Name = "BuildLocalCacheMap";
    this.PathNodes = null;

    this.rootNodeId = new UaNodeId( Identifier.RootFolder );

    this.GetModelMap = function () {

        var timer = new PerformanceTimer();

        if ( !isDefined( Test.ModelMap ) || Test.ModelMap.Length() == 0 ) {

            var map = new UaModelMap();

            if ( !map.complete() ) {
                var builder = new BuildCacheMapService();
                builder.Execute();
            }

            if ( !map.complete() ) {
                print( "Unable to build cache map" );
            } else {
                didBuilding = true;
                var localMap = new KeyPairCollection();
                map.initializeIteration();

                for ( var index = 0; index < map.length(); index++ ) {
                    var name = map.getKey( index );
                    var descriptions = map.getReferenceDescriptions( index );
                    // This allows the scripts to put more information in.
                    var value = { ReferenceDescriptions: descriptions }
                    localMap.Set( name, value );
                }
                Test.ModelMap = localMap;
            }
            print( "Retrieved the Model Map: time " + timer.TakeReading() );
        }

        return Test.ModelMap;
    }

    /**
    * Finds all the object model paths for instances found for a specified nodeId
    * This is a debugging tool to help find a map of specific instances in the object model
    * A Paths array variable will be added to each object in the map
    * @param {KeyPairCollection} map Keyed by node id.  
    */
    this.FindAllPaths = function ( map ) {
        var keys = map.Keys();

        for ( var index = 0; index < keys.length; index++ ) {
            var value = map.Get( keys[ index ] );
            this.FindPaths( value, 0 );
        }
    }

    /**
     * Finds all the object model paths for an object instance in the model
     * A Paths array variable will be added to the object
     * @param {object} value Object Model value
     * @param {*} level counter for the times this function is recursed
     * @returns An array of paths found
     */
    this.FindPaths = function ( value, level ) {

        var paths = [];

        if ( !isDefined( value.Paths ) ) {
            if ( isDefined( value.ReferenceDescriptions ) ) {
                var globalMap = this.GetModelMap();
                var referenceDescriptions = value.ReferenceDescriptions;
                for ( var index = 0; index < referenceDescriptions.length; index++ ) {
                    var referenceDescription = referenceDescriptions[ index ];
                    if ( !referenceDescription.IsForward ) {
                        if ( this.ComparePathNodeIds( referenceDescription.ReferenceTypeId ) ) {

                            if ( referenceDescription.NodeId.NodeId.equals( this.rootNodeId ) ) {
                                paths.push( referenceDescription.DisplayName.Text );
                            } else {
                                var nextValue = globalMap.Get( referenceDescription.NodeId.NodeId.toString() );
                                if ( isDefined( nextValue ) && isDefined( nextValue.ReferenceDescriptions ) ) {
                                    var morePaths = this.FindPaths( nextValue, level + 1 );

                                    if ( morePaths.length > 0 ) {
                                        for ( var pathIndex = 0; pathIndex < morePaths.length; pathIndex++ ) {
                                            paths.push( morePaths[ pathIndex ] + "/" + referenceDescription.DisplayName.Text );
                                        }
                                    } else {
                                        paths.push( referenceDescription.DisplayName.Text );
                                    }
                                } else {
                                    print( "FindPaths for " + referenceDescription.NodeId.NodeId.toString() +
                                        " failed due to unavailable referenceDescriptions " + " Level " + level + " index " + index +
                                        " referenceType " + referenceDescription.ReferenceTypeId.toString() );
                                }
                            }
                        }
                    }
                }
            }
            value.Paths = paths;
        } else {
            for ( var index = 0; index < value.Paths.length; index++ ) {
                paths.push( value.Paths[ index ] );
            }
        }

        return paths;
    }

    /**
     * Retrieves a map of ReferenceTypeIds that are used to determine a path to a specific node Id
     * @returns map of ReferenceTypeIds, including subtypes of known reference type ids
     */
    this.GetPathNodes = function () {
        if ( !isDefined( this.PathNodes ) ) {
            var map = this.GetModelMap();

            var pathMap = new KeyPairCollection();

            componentOfNodeId = new UaNodeId( Identifier.HasComponent );
            organizedByNodeId = new UaNodeId( Identifier.Organizes );
            propertyOfNodeId = new UaNodeId( Identifier.HasProperty );
            subTypeOfNodeId = new UaNodeId( Identifier.HasSubtype );

            pathMap.Set( componentOfNodeId.toString(), componentOfNodeId );
            pathMap.Set( organizedByNodeId.toString(), organizedByNodeId );
            pathMap.Set( propertyOfNodeId.toString(), propertyOfNodeId );
            pathMap.Set( subTypeOfNodeId.toString(), subTypeOfNodeId );


            var keepGoing = true;
            while ( keepGoing ) {
                var added = false;
                var pathMapKeys = pathMap.Keys();
                for ( var nodeIndex = 0; nodeIndex < pathMapKeys.length; nodeIndex++ ) {
                    var node = pathMap.Get( pathMapKeys[ nodeIndex ] );
                    var object = map.Get( node.toString() );
                    if ( isDefined( object ) && isDefined( object.ReferenceDescriptions ) ) {
                        var referenceDescriptions = object.ReferenceDescriptions;
                        for ( var index = 0; index < referenceDescriptions.length; index++ ) {
                            var referenceDescription = referenceDescriptions[ index ];
                            if ( referenceDescription.IsForward &&
                                referenceDescription.ReferenceTypeId.equals( subTypeOfNodeId ) ) {
                                var nodeIdString = referenceDescription.NodeId.NodeId.toString();
                                if ( !pathMap.Contains( nodeIdString ) ) {
                                    pathMap.Set( nodeIdString, referenceDescription.NodeId.NodeId );
                                    added = true;
                                    print( "GetPathNodes Adding node Id " + nodeIdString );
                                }
                            }
                        }
                    }
                    if ( !added ) {
                        keepGoing = false;
                    }
                }
            }
            this.PathNodes = pathMap.Values();
        }

        return this.PathNodes;
    }

    /**
     * Determines is a reference node Id is intereresting to determining interest in building a path to a specific nodeid
     * Only used internally to BuildLocalCacheMap!
     * @param {*} referenceNodeId - ReferenceTypeId found in a reference description
     * @returns if this is a path type reference type id
     */
    this.ComparePathNodeIds = function ( referenceNodeId ) {
        var nodeIds = this.GetPathNodes();

        var isPathNodeId = false;
        for ( var index = 0; index < nodeIds.length; index++ ) {
            if ( nodeIds[ index ].equals( referenceNodeId ) ) {
                isPathNodeId = true;
                break;
            }
        }

        return isPathNodeId;
    }


    /**
     * Example of how to use FindReferences
     */
    this.FindReferencesExample = function () {
        var model = this.GetModelMap();

        var serverModelObject = model.Get( "i=2253" );
        var referenceDescriptions = serverModelObject.ReferenceDescriptions;

        var searchDefinitions = [
            {
                ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                IsForward: true,
                BrowseName: UaQualifiedName.New( { NamespaceIndex: 0, Name: "ServiceLevel" } )
            },
            {
                ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                IsForward: true,
                BrowseName: UaQualifiedName.New( { NamespaceIndex: 0, Name: "ServerStatus" } )
            } ];

        this.FindReferences( referenceDescriptions, searchDefinitions );

        for ( var index = 0; index < searchDefinitions.length; index++ ) {
            var searchDefinition = searchDefinitions[ index ];
            if ( isDefined( searchDefinition.ReferenceIndex ) ) {
                print( "Found Reference Description at index " + searchDefinition.ReferenceIndex );
                print( "Reference Description " + referenceDescriptions[ searchDefinition.ReferenceIndex ].toString() );
            }
        }
    }

    /**
     * Find specific reference descriptions from the reference description of a model object.
     * If a search definition is found, an index into the referenceDescriptions array will be added as ReferenceIndex
     * This function was created to search for multiple reference indexes at the same time, as it is inefficient to 
     * iterate the referenceDescriptions multiple times
     * @param {object[]} referenceDescriptions array of referenceDescriptions, typically from a specific model object
     * @param {object} searchDefinitions parameters that should match for a reference description to considered a match.  
     */
    this.FindReferences = function ( referenceDescriptions, searchDefinitions ) {

        var foundCount = 0;
        var desiredFoundCount = searchDefinitions.length;

        this.ClearSearchDefinitionResults( searchDefinitions );

        for ( var referenceIndex = 0; referenceIndex < referenceDescriptions.length; referenceIndex++ ) {

            var referenceDescription = referenceDescriptions[ referenceIndex ];

            for ( var searchIndex = 0; searchIndex < searchDefinitions.length; searchIndex++ ) {
                var searchDefinition = searchDefinitions[ searchIndex ];
                if ( !isDefined( searchDefinition.ReferenceIndex ) || searchDefinition.ReferenceIndex < 0 ) {

                    var meetsCriteria = true;

                    for ( var property in searchDefinition ) {
                        var currentValue;
                        var desiredValue;
                        if ( Object.prototype.hasOwnProperty.call( searchDefinition, property ) ) {
                            currentValue = referenceDescription[ property ];
                            desiredValue = searchDefinition[ property ];

                            try {
                                if ( !currentValue.equals( desiredValue ) ) {
                                    meetsCriteria = false;
                                }
                            } catch ( ex ) {
                                if ( currentValue != desiredValue ) {
                                    meetsCriteria = false;
                                }
                            }
                        }

                        if ( !meetsCriteria ) {
                            break;
                        }
                    }

                    if ( meetsCriteria ) {
                        searchDefinition.ReferenceIndex = referenceIndex;
                        foundCount++;
                        // break out of searchDefinition.
                        break;
                    }
                }
            }

            if ( foundCount == desiredFoundCount ) {
                break;
            }
        }
    }

    /**
     * Find specific reference descriptions from the reference description of a model object.
     * If a search definition is found, an index into the referenceDescriptions array will be added as ReferenceIndexes
     * This function was created to search for multiple reference indexes at the same time, as it is inefficient to 
     * iterate the referenceDescriptions multiple times
     * @param {object[]} referenceDescriptions array of referenceDescriptions, typically from a specific model object
     * @param {object} searchDefinitions parameters that should match for a reference description to considered a match.  
     */
    this.FindAllReferences = function ( referenceDescriptions, searchDefinitions ) {

        this.ClearSearchDefinitionResults( searchDefinitions );

        for ( var referenceIndex = 0; referenceIndex < referenceDescriptions.length; referenceIndex++ ) {

            var referenceDescription = referenceDescriptions[ referenceIndex ];

            for ( var searchIndex = 0; searchIndex < searchDefinitions.length; searchIndex++ ) {
                var searchDefinition = searchDefinitions[ searchIndex ];

                var meetsCriteria = true;

                for ( var property in searchDefinition ) {
                    if ( property != "ReferenceIndexes" ) {
                        var currentValue;
                        var desiredValue;
                        if ( Object.prototype.hasOwnProperty.call( searchDefinition, property ) ) {
                            currentValue = referenceDescription[ property ];
                            desiredValue = searchDefinition[ property ];

                            try {
                                if ( !currentValue.equals( desiredValue ) ) {
                                    meetsCriteria = false;
                                }
                            } catch ( ex ) {
                                if ( currentValue != desiredValue ) {
                                    meetsCriteria = false;
                                }
                            }
                        }

                        if ( !meetsCriteria ) {
                            break;
                        }
                    }
                }

                if ( meetsCriteria ) {
                    if ( !isDefined( searchDefinition.ReferenceIndexes ) ) {
                        searchDefinition.ReferenceIndexes = [];
                    }
                    searchDefinition.ReferenceIndexes.push( referenceIndex );
                }
            }
        }
    }

    /**
     * Clears the ReferenceIndexes and ReferenceIndex from all entries in an array of search definitions
     * Useful when the same searchDefinitions are used for many referenceDescription arrays
     * @param {object[]} searchDefinitions - a list of desired search definitions
     */
    this.ClearSearchDefinitionResults = function ( searchDefinitions ) {
        searchDefinitions.forEach( function ( searchDefinition ) {
            if ( isDefined( searchDefinition.ReferenceIndex ) ) {
                delete searchDefinition.ReferenceIndex;
            }
            if ( isDefined( searchDefinition.ReferenceIndexes ) ) {
                delete searchDefinition.ReferenceIndexes;
            }
        } );
    }

    /**
     * Finds all subtypes of the provided type
     * Call is recursive
     * @param {string} typeString string containing the node id of the desired typeString
     * @returns An array of all subtypes
     */
    this.GetSubTypes = function ( typeString ) {
        var subTypes = [];
        var modelMap = this.GetModelMap();
        var serverModelObject = modelMap.Get( typeString );
        if ( isDefined( serverModelObject ) && isDefined( serverModelObject.ReferenceDescriptions ) ) {
            var searchDefinition = {
                ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
                IsForward: true
            };
            var searchDefinitions = [ searchDefinition ];

            this.FindAllReferences( serverModelObject.ReferenceDescriptions, searchDefinitions );

            if ( isDefined( searchDefinition.ReferenceIndexes ) ) {
                for ( var index = 0; index < searchDefinition.ReferenceIndexes.length; index++ ) {
                    var referenceIndex = searchDefinition.ReferenceIndexes[ index ];
                    var referenceDescription = serverModelObject.ReferenceDescriptions[ referenceIndex ];
                    var nodeId = referenceDescription.NodeId.NodeId.toString();
                    subTypes.push( nodeId );
                    var moreSubTypes = this.GetSubTypes( nodeId );
                    if ( moreSubTypes.length > 0 ) {
                        subTypes.push( moreSubTypes );
                    }
                }
            }
        }

        return subTypes;
    }

    /**
     * Get a array of custom types derived from the provided type
     * @param {string} typeString string containing the node id of the desired typeString
     * @param {object} nodeSetUtility NodeSetUtility object capable of searching the spec
     * @returns an array of all derived types not found in the specification
     */
    this.GetDerivedTypes = function ( typeString, nodeSetUtility ) {
        var derivedTypes = [];
        if ( isDefined( nodeSetUtility ) ) {
            var modelMap = this.GetModelMap();
            var serverModelObject = modelMap.Get( typeString );
            if ( isDefined( serverModelObject ) && isDefined( serverModelObject.ReferenceDescriptions ) ) {
                var searchDefinition = {
                    ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
                    IsForward: true
                };
                var searchDefinitions = [ searchDefinition ];

                this.FindAllReferences( serverModelObject.ReferenceDescriptions, searchDefinitions );

                if ( isDefined( searchDefinition.ReferenceIndexes ) ) {
                    for ( var index = 0; index < searchDefinition.ReferenceIndexes.length; index++ ) {
                        var referenceIndex = searchDefinition.ReferenceIndexes[ index ];
                        var referenceDescription = serverModelObject.ReferenceDescriptions[ referenceIndex ];
                        var nodeId = referenceDescription.NodeId.NodeId.toString();
                        var nodeSetReference = nodeSetUtility.GetEntity( nodeId );
                        if ( !isDefined( nodeSetReference ) ) {
                            // Derived
                            derivedTypes.push( nodeId );
                            var moreSubTypes = this.GetSubTypes( nodeId );
                            if ( moreSubTypes.length > 0 ) {
                                derivedTypes.push( moreSubTypes );
                            }
                        }
                    }
                }
            }
        }

        return derivedTypes;
    }

    /**
     * Builds a map of all reference descriptions for a model instance, including
     * all sub objects
     * Note that this function is very expensive in terms of the time it takes
     * @param {object} instance - Model Map instance
     * @returns map of reference descriptions
     */    
    this.BuildAlarmReferenceDescriptionMap = function ( instance ) {
    
        var map = new KeyPairCollection();
        var noParent = "";
    
        var timer = new PerformanceTimer();

        this.BuildReferenceDescriptionMap( noParent, instance.ReferenceDescriptions, map );

        print( "BuildAlarmReferenceDescriptionMap for " + instance.Name + " took " + timer.TakeReading() + " ms" );
    
        return map;
    }

    /**
     * Builds a map of all reference descriptions for a model instance, including
     * all sub objects.  This is a recursive function
     * @param {string} parentName - Name of the map key value from the previous call to this method
     * @param {object[]} referenceDescriptions - list of ReferenceDescriptions to iterate through
     * @param {KeyPairCollection} map - The resulting map of ReferenceDescriptions
     */    
     this.BuildReferenceDescriptionMap = function ( parentName, referenceDescriptions, map ) {

        for ( var index = 0; index < referenceDescriptions.length; index++ ) {
            var referenceDescription = referenceDescriptions[ index ];
            if ( this.IsInterestingReferenceDescription( referenceDescription ) ) {
    
                var key = referenceDescription.BrowseName.Name;
                if ( parentName.length > 0 ) {
                    key = parentName + "." + key;
                }
                if ( map.Contains( key ) ) {
                    addError( "Unexpected duplicate name " + key );
                } else {
                    map.Set( key, referenceDescription );
    
                    var modelEntity = this.GetModelMap().Get( referenceDescription.NodeId.NodeId );
                    if ( isDefined( modelEntity ) ) {
                        if ( isDefined( modelEntity.ReferenceDescriptions ) ) {
                            this.BuildReferenceDescriptionMap( key, modelEntity.ReferenceDescriptions, map );
                        } else {
                            addError( "Unexpected lack of ReferenceDescriptions for " + referenceDescription.NodeId.NodeId.toString() );
                        }
                    } else {
                        addError( "Unable to find model map entry for " + referenceDescription.NodeId.NodeId.toString() );
                    }
                }
            }
        }
    }
    
    /**
     * Determines if a reference description should be included in the reference description map for an instance
     * @param {object} referenceDescription - the reference description to check
     * @returns boolean value
     */
    this.IsInterestingReferenceDescription = function ( referenceDescription ) {
        var isInteresting = false;

        if ( referenceDescription.IsForward ) {
            if ( referenceDescription.ReferenceTypeId.equals( this.HasProperty ) ||
                referenceDescription.ReferenceTypeId.equals( this.HasComponent ) ) {
                isInteresting = true;
            }
        }

        return isInteresting;
    }

}




