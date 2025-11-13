/**
 * Node Set Utility, a mechanism to read the Node Set and turn it into a map
 * This js file is a simple conversion from xml to js 
 * from the original nodeset xml files at https://github.com/OPCFoundation/UA-Nodeset/Schema
 * This object also provides helper mechanisms for identifying entities, and searches
 */

include( "./library/Information/NodeSet2.xml/Opc.Ua.NodeSet2.js" );

function NodeSetUtility () {

    this.Map = null;
    this.MandatoryMap = null;
    this.UtcTimeDefinition = new UaNodeId( Identifier.UtcTime ).toString();
    this.TimeZoneDataType = new UaNodeId( Identifier.TimeZoneDataType ).toString();
    this.DurationDefinition = new UaNodeId( Identifier.Duration ).toString();
    this.EUInformation = new UaNodeId( Identifier.EUInformation ).toString();
    // TODO needs a binary fix
    //this.AudibleDataTypeDefinition = new UaNodeId( Identifier.AudioDataType ).toString();
    this.AudibleDataTypeDefinition = "i=16307";

    //#region Generation 

    /**
     * Generates a map with key of nodeid string to the nodeset object found in the source parts
     * @param {object[]} sourceParts - an array of nodeset objects to create a nodeset map
     * @returns {KeyPairCollection}
     */
    this.GetNodeSet = function () {

        if ( !isDefined( this.Map ) ) {
            this.Create( Opc_Ua_NodeSet2 );
        }

        return this.Map;
    }

    /**
     * Generates a map with key of nodeid string to the nodeset object found in the source parts
     * This handles the iteration through the parts
     * @param {object[]} sourceParts - an array of nodeset objects to create a nodeset map
     */
    this.Create = function ( sourceParts ) {

        this.Map = new KeyPairCollection();

        if ( isDefined( sourceParts.length ) ) {
            for ( var index = 0; index < sourceParts.length; index++ ) {
                this.CreatePart( sourceParts[ index ].UANodeSet, this.Map );
            }
        } else {
            this.CreatePart( sourceParts.UANodeSet, this.Map );
        }
    }

    /**
     * Generates a map with key of nodeid string to the nodeset object found in the source parts
     * This handles the each individual part
     * @param {object[]} sourceParts - an array of nodeset objects to create a nodeset map
     */
    this.CreatePart = function ( nodeSet, map ) {

        const sections = Object.keys( nodeSet );

        for ( var index = 0; index < sections.length; index++ ) {
            var section = sections[ index ];

            var indexOfNonSectionGroup = section.indexOf( "_" );

            if ( section == "Models" || indexOfNonSectionGroup == 0 ) {
                continue;
            } else if ( section == "Aliases" ) {
                this.AddAliases( nodeSet[ section ].Alias, map );
            } else {
                this.AddEntities( section, nodeSet[ section ], map );
            }
        }
    }

    /**
     * Adds Aliases to the nodeset map
     * This handles the each individual part
     * The alias is just to make the nodeset file more readable.
     * Don't do lookups on the nodeid
     * Do a lookup on the text, and retrieve the node id.
     * @param {object} aliases - an array of nodeset objects to create a nodeset map
     * @param {KeyPairCollection} map - nodeset map
     */
    this.AddAliases = function ( aliases, map ) {
        for ( var index = 0; index < aliases.length; index++ ) {
            var alias = aliases[ index ];
            var key = alias._Alias;
            if ( !map.Contains( key ) ) {
                map.Set( key, alias );
            }
        }
    }

    /**
     * Adds Entities to the nodeset map
     * @param {object} section - Ua Section, UaVariables for example
     * @param {object} entities - an array of nodeset objects to create a nodeset map
     * @param {KeyPairCollection} map - nodeset map
     */
    this.AddEntities = function ( section, entities, map ) {
        var nodeClass = this.GetNodeClassFromSection( section );
        for ( var index = 0; index < entities.length; index++ ) {
            var entity = entities[ index ];
            var key = entity._NodeId;
            if ( !map.Contains( key ) ) {
                if ( !isDefined( entity._IsForward ) ) {
                    entity._IsForward = "true";
                }
                entity.NodeClass = nodeClass;
                map.Set( key, entity );
            }
        }
    }

    this.GetNodeClassFromSection = function ( section ) {

        var nodeClass = NodeClass.Unspecified;

        if ( section == "UAObject" ) {
            nodeClass = NodeClass.Object;
        } else if ( section == "UAVariable" ) {
            nodeClass = NodeClass.Variable;
        } else if ( section == "UAMethod" ) {
            nodeClass = NodeClass.Method;
        } else if ( section == "UAObjectType" ) {
            nodeClass = NodeClass.ObjectType;
        } else if ( section == "UAVariableType" ) {
            nodeClass = NodeClass.VariableType;
        } else if ( section == "UAReferenceType" ) {
            nodeClass = NodeClass.ReferenceType;
        } else if ( section == "UADataType" ) {
            nodeClass = NodeClass.DataType;
        } else if ( section == "UAView" ) {
            nodeClass = NodeClass.View;
        }

        return nodeClass;
    }

    //#endregion

    //#region Helpers

    this.IsMandatory = function ( nodeSetObject ) {
        var mandatory = false;

        var readable = this.GetMandatoryNameFromObject( nodeSetObject );
        if ( readable == "Mandatory" ) {
            mandatory = true;
        }

        return mandatory;
    }

    this.GetMandatoryNameFromObject = function ( nodeSetObject ) {

        var findForward = false;
        var forward = false;
        var findOne = true;
        var nodeIdString = this.FindNodeIdsFromObject( nodeSetObject,
            "HasModellingRule", findForward, forward, findOne );

        var name = null;

        if ( nodeIdString.length > 0 ) {
            name = this.GetMandatoryName( nodeIdString );
        }

        return name;
    }

    /**
     * Get mandatory name from node id string
     * Ideally this could use \Library\ClassBased\UaM.js if it was re-factored
     * @param {string} nodeIdString 
     * @returns{string} 
     */
    this.GetMandatoryName = function ( nodeIdString ) {

        if ( !isDefined( this.MandatoryMap ) ) {
            var map = new KeyPairCollection();
            map.Set( "i=78", "Mandatory" );
            map.Set( "i=80", "Optional" );
            map.Set( "i=83", "ExposesItsArray" );
            map.Set( "i=11508", "OptionalPlacehoder" );
            map.Set( "i=11510", "MandatoryPlaceholder" );
            this.MandatoryMap = map;
        }

        return this.MandatoryMap.Get( nodeIdString );
    }

    /**
     * Gets a ReferenceType name, for example "HasProperty", or "AlwaysGeneratesEvent"
     * This reference is typically found in an entity.References.Reference
     * @param {object} referenceType 
     * @returns {string}
     */
    this.GetReferenceTypeName = function ( referenceType ) {
        var name = "";
        var useDefault = true;

        if ( referenceType._ReferenceType.indexOf( "i=" ) == 0 ) {
            var referenceObject = this.GetEntity( referenceType._ReferenceType );
            if ( isDefined( referenceObject ) ) {
                if ( isDefined( referenceObject._BrowseName ) ) {
                    name = referenceObject._BrowseName;
                    useDefault = false;
                } else {
                    if ( isDefined( referenceObject._Alias ) ) {
                        name = referenceObject._Alias;
                        useDefault = false;
                    }
                }
            }
        }

        if ( useDefault ) {
            name = referenceType._ReferenceType;
        }

        return name;
    }

    /**
     * Finds the node ids of all sub references that meet the search criteria
     * Can return a string or string array
     * @param {object} reference - Nodeset Entity 
     * @param {string} referenceType - desired reference type, like HasTypeDefinition or HasSubType 
     * @param {*} findForward - Filter on Forward/Reverse definitions
     * @param {*} forward  - find forward definitions
     * @param {*} findOne - Find the first sub reference and stop
     * @returns {string[]}
     */
    this.FindNodeIdsFromObject = function ( reference, referenceType, findForward, forward, findOne ) {

        var nodeIds = [];

        if ( isDefined( reference.References ) && isDefined( reference.References.Reference ) ) {
            var subReferences = reference.References.Reference;
            for ( var subReferenceIndex = 0; subReferenceIndex < subReferences.length; subReferenceIndex++ ) {
                var subReference = subReferences[ subReferenceIndex ];
                var add = false;
                if ( subReference._ReferenceType == referenceType ) {
                    add = true;
                    if ( findForward ) {
                        if ( this.IsForward( subReference ) != forward ) {
                            add = false;
                        }
                    }
                    if ( add ) {
                        nodeIds.push( subReference.__text );
                        if ( findOne ) {
                            break;
                        }
                    }
                }
            }
        }

        var returnValue = nodeIds;

        if ( findOne && nodeIds.length > 0 ) {
            returnValue = nodeIds[ 0 ];
        }

        return returnValue;
    }

    this.GetEntity = function ( key ) {
        return this.GetNodeSet().Get( key );
    }

    /**
     * Finds the original nodeset entity from a sub reference
     * @param {object} subReference - sub reference to lookup
     * @returns {object}
     */
    this.GetReferenceObjectFromReference = function ( subReference ) {
        var referenceObject = null;

        if ( isDefined( subReference ) && isDefined( subReference.__text ) ) {
            referenceObject = this.GetEntity( subReference.__text );
        } else {
            print( "Unable to get reference node id" );
        }

        return referenceObject;
    }

    this.GetNodeClass = function ( reference ) {
        return reference.NodeClass;
    }

    this.GetBrowseName = function ( reference ) {
        return UaQualifiedName.New( { Namespace: 0, Name: reference._BrowseName } );
    }

    this.GetDataType = function ( reference ) {
        var result = BuiltInType.StringToNodeId( "BuiltInType." + reference._DataType );
        var nodeId = new UaNodeId( result );

        return nodeId;
    }

    this.GetExpectedDataTypeIdentifier = function( reference ){

        // This function needs a better algorithm.  To fix this properly, Nodeset2.Services is required.

        var specDataType = BuiltInType.StringToNodeId( "BuiltInType." + reference._DataType );
                                
        if ( reference._DataType == this.UtcTimeDefinition ){
            // UtcTime is not a variant type, it should be DateTime
            specDataType = Identifier.DateTime;
        }else if ( reference._DataType == this.DurationDefinition ){
            // Duration is not a variant type, it should be Double
            specDataType = Identifier.Double;
        }else if ( reference._DataType == this.EUInformation ||
            reference._DataType == this.TimeZoneDataType ){
            specDataType = Identifier.Structure;
        }else if ( reference._DataType == this.AudibleDataTypeDefinition ){
            specDataType = Identifier.ByteString;
        }

        return specDataType;
    }

    this.GetTypeDefinition = function ( reference ) {
        var findForward = false;
        var findOne = true;
        var forward = true;
        var nodeIdString = this.FindNodeIdsFromObject( reference,
            "HasTypeDefinition", findForward, forward, findOne );

        return UaNodeId.fromString( nodeIdString );
    }

    this.GetModellingRule = function ( reference ) {
        var findForward = false;
        var findOne = true;
        var forward = true;
        var nodeIdString = this.FindNodeIdsFromObject( reference,
            "HasModellingRule", findForward, forward, findOne );

        return UaNodeId.fromString( nodeIdString );
    }

    this.GetNodeId = function ( nodeIdString ) {

        var createThis = null;
        var integerIdentifier = "i="

        var indexOfNumber = nodeIdString.indexOf( integerIdentifier );
        if ( indexOfNumber >= 0 ) {
            var numberString = nodeIdString.substring( indexOfNumber + integerIdentifier.length );
            createThis = parseInt( numberString );
        } else {
            createThis = nodeIdString;
        }

        return new UaNodeId( createThis );
    }

    /**
     * Gets the node id of a subreference
     * @param {object} subReference 
     * @returns {UaNodeId}
     */
    this.GetReferenceTypeNodeId = function ( subReference ) {

        if ( isDefined( subReference._ReferenceType ) ) {
            var identifierIndex = subReference._ReferenceType.indexOf( "i=" );
            if ( identifierIndex == 0 ) {
                return this.GetNodeId( subReference._ReferenceType );
            } else {
                return this.GetNodeIdFromAlias( subReference._ReferenceType );
            }
        }

        return new UaNodeId( 0 );
    }

    this.GetNodeIdFromAlias = function ( alias ) {

        var nodeIdString = "";
        var aliasObject = this.GetNodeSet().Get( alias );
        if ( isDefined( aliasObject ) ) {
            nodeIdString = aliasObject.__text;
        }

        return this.GetNodeId( nodeIdString );
    }

    this.GetParentNodeId = function ( typeObject ) {

        var findForward = true;
        var forward = false;
        var findOne = true;
        return this.FindNodeIdsFromObject( typeObject, "HasSubtype", findForward, forward, findOne );
    }

    this.IsAbstract = function ( reference ) {
        var isAbstract = false;

        if ( isDefined( reference._IsAbstract ) && reference._IsAbstract == "true" ) {
            isAbstract = true;
        }

        return isAbstract;
    }

    this.IsForward = function ( reference ) {
        var isForward = true;

        if ( isDefined( reference._IsForward ) && reference._IsForward == "false" ) {
            isForward = false;
        }

        return isForward;
    }

    this.IsAlias = function ( reference ) {
        var isAlias = false;
        var definition = this.GetNodeSet().Get( reference._NodeId );
        if ( isDefined( definition ) && isDefined( definition._Alias ) ) {
            isAlias = true;
        }

        return isAlias;
    }

    /**
     * Is a reference a particular variable type.
     * Typically used to find variables like AckedState in order to keep checking properties
     * @param {object} reference - nodeset reference entity
     * @param {int[]} identifier - variable type to look for, could be an array of variable types
     */
    this.IsVariableType = function ( reference, identifier ) {
        // reference would be something like AckedState
        var findForward = true;
        var findOne = false;
        var forward = true;
        var nodeIdStrings = this.FindNodeIdsFromObject( reference,
            "HasTypeDefinition", findForward, forward, findOne );

        var isType = false;
        if ( isDefined( nodeIdStrings.length ) && nodeIdStrings.length > 0 ) {

            var identifierStrings = [];
            if ( isDefined( identifier.length ) ) {
                identifier.forEach( function ( identity ) {
                    identifierStrings.push( new UaNodeId( identity ).toString() );
                } );
            } else {
                identifierStrings.push( new UaNodeId( identifier ).toString() );
            }

            for ( var index = 0; index < nodeIdStrings.length; index++ ) {
                for ( var identifierIndex = 0; identifierIndex < identifierStrings.length; identifierIndex++ ) {
                    if ( nodeIdStrings[ index ] == identifierStrings[ identifierIndex ] ) {
                        return true;
                    }
                }
            }
        }

        return isType;
    }

    this.IsTwoStateVariableType = function ( reference ) {
        return this.IsVariableType( reference, Identifier.TwoStateVariableType );
    }

    this.IsFiniteStateVariableType = function ( reference ) {
        return this.IsVariableType( reference, Identifier.FiniteStateVariableType );
    }

    /** 
     * Unfortunately, there are no references going forward.  They are all backwards, so this should work.
     * @param {object} subReference Sub reference to check for sub type
     * @returns {boolean}
     */
    this.IsSubType = function ( subReference ) {
        // Subtype going forward or back
        return subReference._ReferenceType == "HasSubtype";
    }

    this.HasTypeDefinition = function ( entity ) {
        var hasTypeDefinition = false;
        if ( isDefined( entity ) && isDefined( entity.References ) && isDefined( entity.References.Reference ) ) {
            for ( var index = 0; index < entity.References.Reference.length; index++ ) {
                var reference = entity.References.Reference[ index ];
                if ( reference._ReferenceType == "HasTypeDefinition" ) {
                    hasTypeDefinition = true;
                    break;
                }
            }
        }

        return hasTypeDefinition;
    }

    //#endregion
}

