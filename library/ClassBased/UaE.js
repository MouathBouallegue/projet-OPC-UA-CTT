/* Includes: 
    UaElementOperand.New()                   : Creates new instance
    UaExpandedNodeId.New = function()        : creates a new type
    UaEndpointDescription.FindTokenType()    : Searches a given endpoint for a specific token-type
    UaEndpointDescription.FindSecurityMode() : Searches a given endpoint for a specific security mode
    UaEnumDefinition.FromNodeSet()           : Loads an EnumDefinition from NodeSet file
    UaEnumDefinition.FromTypeNodeId()        : Loads an EnumDefinition from the server
    UaEventFilter.New = function( args )     : Creates a new EventFilter object
    **UaExtensionObject.FromUaType()         : Converts an ExtensionObject to its encoded type

                ** is INCOMPLETE
*/

UaElementOperand.New = function( args ) {
    var e = new UaElementOperand();
    if( isDefined( args ) && isDefined( args.Index ) ) {
        e.Index = args.Index;
    }
    e.toExtensionObject = function() {
        var e = new UaExtensionObject();
        e.setElementOperand( this );
        return( e );
    };
    return( e );
}

UaExpandedNodeId.New = function( args ) {
    var x = new UaExpandedNodeId();
    if( isDefined( args ) )  {
        if( isDefined( args.NamespaceUri ) ) x.NamespaceUri = args.NamespaceUri;
        if( isDefined( args.ServerIndex ) )  x.ServerIndex  = args.ServerIndex;
        if( isDefined( args.NodeId ) ) x.NodeId = args.NodeId;
    }
    return( x );
}

/* Converts a UaExpandedNodeId to Json format */
UaExpandedNodeId.toJson = function( arg ) {
    if( !isDefined( arg ) ) return( null );
    if( !isDefined( arg.NamespaceUri ) || !isDefined( arg.NodeId ) || !isDefined( arg.ServerIndex ) ) return( null );
    var s = "{ NamespaceUri: " + arg.NamespaceUri +
            ", NodeId: " + arg.NodeId +
            ", ServerIndex: " + arg.ServerIndex + " }";
    return( s );
}

UaEndpointDescription.FindTokenType = function( args ) {
    if( !isDefined( args ) ) throw( "UaEndpointDescription::FindTokenType: args not specified" );
    if( !isDefined( args.Endpoint ) || !isDefined( args.Endpoint.UserIdentityTokens ) ) throw( "UaEndpointDescription::FindTokenType: args.Endpoint not specified or is of the wrong type" );
    if( !isDefined( args.TokenType ) ) throw( "UaEndpointDescription::FindTokenType: args.TokenType not specified" );
    for( var u=0; u<args.Endpoint.UserIdentityTokens.length; u++ ) { // iterate thru each user identity token
        if( args.TokenType === args.Endpoint.UserIdentityTokens[u].TokenType ) {
            // some servers do not put the securityPolicyUri and leave the field empty; if so, grab it from the parent endpoint
            if( args.Endpoint.UserIdentityTokens[u].SecurityPolicyUri.length < 1 ) {
                args.Endpoint.UserIdentityTokens[u].SecurityPolicyUri = args.Endpoint.SecurityPolicyUri;
                print( "SecurityPolicyUri empty in the UserIdentityTokens in the EndpointDescription. In this case the SecurityPolicyUri for the SecureChannel is being used." );
            }
            return( args.Endpoint.UserIdentityTokens[u].clone() );
        }
    }//for u
    return( null );
}

UaEndpointDescription.FindSecurityMode = function( args ) {
    if( !isDefined( args ) ) throw( "UaEndpointDescription::FindSecurityMode: args not specified" );
    if( !isDefined( args.Endpoints ) || !isDefined( args.Endpoints.length ) ) throw( "UaEndpointDescription::FindSecurityMode: args.Endpoints not specified or is of the wrong type" );
    if( !isDefined( args.MessageSecurityMode ) ) throw( "UaEndpointDescription::FindSecurityMode: args.MessageSecurityMode not specified" );
    for( var e=0; e<args.Endpoints.length; e++ ) { // iterate thru each endpoint
        if( args.MessageSecurityMode === args.Endpoints[e].SecurityMode ) return( args.Endpoints[e] );
    }//for u
    return( null );
}

/**
 * Can be used for finding endpoints with the desired parameters in a list of endpoints.
 * 
 * @param args.Endpoints - (Required) A list of endpoints for example 'gServerCapabilities.Endpoints'
 * @param args.SecurityMode - (Optional) MessageSecurityMode.SignAndEncrypt, MessageSecurityMode.Sign, MessageSecurityMode.None
 * @param args.SecurityPolicyUri - (Optional) SecurityPolicy of the Endpoint
 * @param args.TokenType - (Optional) TokenType for the User Identification Policy.
 * @param args.MostSecure - (Optional) If set to true the endpoint with the most secure SecurityPolicy will be returned as a scalar.
 * @param args.FilterHTTPS - (Optional) If set to false endpoints of the https protocol will be returned.
 * @param args.ReturnAll - (Optional) True: if more than one endpoint matches the criteria an array of these endpoints will be returned. False: The returned endpoint is a scalar.
 * 
 * @returns The Endpoint(s) which meet(s) the passed criteria(s); null if no endoint has been found.
 */
UaEndpointDescription.Find = function( args ) {
    if( !isDefined( args ) ) throw( "UaEndpointDescription::Find: args not specified" );
    if( !isDefined( args.Endpoints ) || !isDefined( args.Endpoints.length ) ) throw( "UaEndpointDescription::FindSecurityMode: args.Endpoints not specified or is of the wrong type" );
    if( !isDefined( args.SecurityMode ) )        args.SecurityMode        = null;
    if( !isDefined( args.SecurityPolicyUri ) )   args.SecurityPolicyUri   = null;
    if( !isDefined( args.TokenType ) )           args.TokenType           = null;
    if( !isDefined( args.MostSecure ) )          args.MostSecure          = false;
    if( !isDefined( args.FilterHTTPS ) )         args.FilterHTTPS         = true;
    if( !isDefined( args.ReturnAll ) )           args.ReturnAll           = false;
    var matches = [];
    for( var e=0; e<args.Endpoints.length; e++ ) { // iterate thru each endpoint
        if( args.FilterHTTPS && args.Endpoints[e].EndpointUrl.substring( 0, 4 ) == "http" ) continue;
        if( args.SecurityMode      !== null && args.SecurityMode      !== args.Endpoints[e].SecurityMode ) continue;
        if( args.SecurityPolicyUri !== null && args.SecurityPolicyUri !== args.Endpoints[e].SecurityPolicyUri ) continue;
        if( args.TokenType         !== null ) {
            var tokenMatch = UaEndpointDescription.FindTokenType( { Endpoint: args.Endpoints[e], TokenType: args.TokenType } );
            if( tokenMatch == null ) continue;
        }
        // we got here, then it's a match
        matches.push( args.Endpoints[e] );
    }//for u
    if (args.MostSecure) {
        if (matches.length == 0) return (null);
        var bestMatch = matches[0];
        for( var i=1; i<matches.length; i++ ) {
            if( bestMatch.SecurityLevel < matches[i].SecurityLevel ) bestMatch = matches[i];
        }
        if (bestMatch.SecurityLevel === 0) bestMatch = null;

        return (bestMatch);
    }
    
    if( matches.length < 1 ) return( null );
    if( matches.length !== undefined && args.ReturnAll === false ) return ( matches[0] );
    else return( matches );
}

/**
 * Builds a UaEnumDefinition object from the NodeSet file
 * 
 * @param {UaNodeId} typeId - The type NodeId
 * 
 * @returns {UaEnumDefinition|boolean} Returns the created UaEnumDefinition on success, FALSE otherwise
 */
UaEnumDefinition.FromNodeSet = function( typeId ) {
    if( !isDefined( typeId ) ) throw( "UaEnumDefinition.FromNodeSet(typeId): Argument 'typeId' is not defined" );
    IsSubTypeOfTypeHelper.Execute( { ItemNodeId: typeId, TypeNodeId: Identifier.Enumeration, SuppressErrors: true } );
    if( !IsSubTypeOfTypeHelper.Response.IsSubTypeOf ) {
        addError( "UaEnumDefinition.FromNodeSet(typeId): Provided type '" + typeId + "' is no Subtype of Enumeration." );
        return false;
    }
    var nodeSetUtility = new NodeSetUtility();
    var nodeSet = nodeSetUtility.GetNodeSet();
    var node = nodeSet[typeId];
    
    if( !isDefined( node ) ) {
        addError( "UaEnumDefinition.FromNodeSet(typeId): Could not find Node '" + typeId + "' in the NodeSetFile" );
        return false;
    }
    if( !isDefined( node['Definition'] ) ) {
        addError( "UaEnumDefinition.FromNodeSet(typeId): Could not find 'Definition' on node '" + typeId + "' in the NodeSetFile." );
        return false;
    }
    var fields = node['Definition']['Field'];
    if( !isDefined( fields ) ) {
        addLog( "UaEnumDefinition.FromNodeSet(typeId): Definition of node '" + typeId + "' in the NodeSetFile, does not define any fields." );
        fields = [];
    }
    
    var resultEnumDefinition = new UaEnumDefinition();
    resultEnumDefinition.setDataTypeId( typeId );
    if( isDefined( node['Definition']['_Name'] ) ) resultEnumDefinition.setName( node['Definition']['_Name'] );
    
    for( var i=0; i<fields.length; i++ ) {
        var name = isDefined( fields[i]['_Name'] ) ? fields[i]['_Name'] : "";
        var value = isDefined( fields[i]['_Value'] ) ? fields[i]['_Value'] : i;
        resultEnumDefinition.addChild( name, value );
    }
    
    return( resultEnumDefinition );
}

/**
 * Function to dynamically learn EnumDefinitions from the server during runtime given the Type NodeId
 * 
 * @param {UaNodeId} nodeId - The NodeId of the Enumeration type to learn
 * 
 * @returns {UaEnumDefinition|boolean} Returns the created UaEnumDefinition on success, FALSE otherwise
 */
UaEnumDefinition.FromTypeNodeId = function( nodeId ) {
    if( !isDefined( nodeId ) ) throw( "UaEnumDefinition.FromTypeNodeId(nodeId): Argument 'nodeId' is not defined" );
    var result = new UaEnumDefinition();
    var resultDataTypeId = nodeId;
    result.setDataTypeId( resultDataTypeId );
    try{
        var mI = new MonitoredItem( nodeId );
    } catch( ex ) {
        addError( "UaEnumDefinition.FromTypeNodeId(nodeId): Error creating new MonitoredItem from argument 'nodeId':\n\t==> " + ex );
        return false;
    }
    mI.AttributeId = Attribute.BrowseName;
    if( !ReadHelper.Execute( { NodesToRead: mI } ) ) {
        addError( "UaEnumDefinition.FromTypeNodeId(nodeId): Could not read BrowseName attribute of Node '" + nodeId + "'" );
        return false;
    }
    var resultName = mI.Value.Value.toQualifiedName().Name;
    result.setName( resultName );
    mI.AttributeId = Attribute.DataTypeDefinition;
    ReadHelper.Execute( { NodesToRead: mI, OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Good, StatusCode.BadAttributeIdInvalid ) ], TimestampsToReturn: TimestampsToReturn.Neither } );
    if( !mI.Value.Value.isEmpty() ) {
        var enumDefinition_extObj = mI.Value.Value.toExtensionObject();
        if( isDefined( enumDefinition_extObj.TypeId ) ) {
            if( enumDefinition_extObj.TypeId.NodeId.getIdentifierNumeric() == Identifier.EnumDefinition_Encoding_DefaultBinary ) {
                var flatEnumDefinition = enumDefinition_extObj.toEnumDefinition();
                flatEnumDefinition.setDataTypeId( resultDataTypeId );
                flatEnumDefinition.setName( resultName );
                return flatEnumDefinition;
            }
            else {
                addWarning( "UaEnumDefinition.FromTypeNodeId(nodeId): Could not read DataTypeDefinition attribute of Node '" + nodeId + "'.\n" +
                            "TypeId of returned ExtensionObject is not 'i=123' (EnumDefinition_Encoding_DefaultBinary), but is '" + enumDefinition_extObj.TypeId.NodeId + "' (" + Identifier.toString( enumDefinition_extObj.TypeId.NodeId ) + ")" );
                return false;
            }
        }
        else {
            addError( "UaEnumDefinition.FromTypeNodeId(nodeId): Could not read DataTypeDefinition attribute of Node '" + nodeId + "'. Returned variant does not appear to be of type ExtensionObject." );
            return false;
        }
    }
    // if generating the EnumDefinition by the value attribute failed, try reading EnumValues or EnumStrings properties
    if( ReadHelper.Response.ResponseHeader.ServiceResult.isGood() && ReadHelper.Response.Results[0].StatusCode.StatusCode == StatusCode.BadAttributeIdInvalid ) {
        addLog( "UaEnumDefinition.FromTypeNodeId(nodeId): Node '" + nodeId + "' has no DataTypeDefinition attribute. Trying to read EnumStrings instead." );
    }
    else addLog( "UaEnumDefinition.FromTypeNodeId(nodeId): Reading DataTypeDefinition attribute of Node '" + nodeId + "' returned an empty variant. Trying to read EnumStrings instead." );
    
    // Check for property EnumValues or EnumStrings
    var modelMapHelper = new BuildLocalCacheMapService();
    var modelMap = modelMapHelper.GetModelMap();
    var referenceDescriptions = modelMap.Get( nodeId ).ReferenceDescriptions;
    var searchDefinitions = [
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: 0, Name: "EnumValues" } )
        },
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: 0, Name: "EnumStrings" } )
        }
    ];    
    modelMapHelper.FindReferences( referenceDescriptions, searchDefinitions );
    if( isDefined( searchDefinitions[0].ReferenceIndex ) ) {
        var mI_EnumValues = new MonitoredItem( referenceDescriptions[searchDefinitions[0].ReferenceIndex].NodeId.NodeId );
        if( ReadHelper.Execute( { NodesToRead: mI_EnumValues } ) ) {
            if( !mI_EnumValues.Value.Value.isEmpty() ) {
                var enumValueTypeArray = mI_EnumValues.Value.Value.toExtensionObjectArray();
                for( var i=0; i<enumValueTypeArray.length; i++ ) result.addChild( enumValueTypeArray[i].toEnumValueType().DisplayName.Text, enumValueTypeArray[i].toEnumValueType().Value );
            }
            else {
                addError( "UaEnumDefinition.FromTypeNodeId(nodeId): Could not read value attribute of EnumValues property of Node '" + nodeId + "'. Returned variant is empty." );
                return false;
            }
        }
        else {
            addError( "UaEnumDefinition.FromTypeNodeId(nodeId): Failed to read value attribute of EnumValues of type '" + nodeId + "'" );
            return false;
        }
    }
    else if( isDefined( searchDefinitions[1].ReferenceIndex ) ) {
        var mI_EnumStrings = new MonitoredItem( referenceDescriptions[searchDefinitions[1].ReferenceIndex].NodeId.NodeId );
        if( ReadHelper.Execute( { NodesToRead: mI_EnumStrings } ) ) {
            if( !mI_EnumStrings.Value.Value.isEmpty() ) {
                var enumStringsArray = mI_EnumStrings.Value.Value.toLocalizedTextArray();
                for( var i=0; i<enumStringsArray.length; i++ ) result.addChild( enumStringsArray[i].Text, i );
            }
            else {
                addError( "UaEnumDefinition.FromTypeNodeId(nodeId): Could not read value attribute of EnumStrings property of Node '" + nodeId + "'. Returned variant is empty." );
                return false;
            }
        }
        else {
            addError( "UaEnumDefinition.FromTypeNodeId(nodeId): Failed to read value attribute of EnumStrings of type '" + nodeId + "'" );
            return false;
        }
    }
    return result;
}

UaEventFilter.New = function( args ) {
    var ef = new UaEventFilter();
    if( args != undefined && args != null ) {
        // select clauses?
        if( args.SelectClauses != undefined && args.SelectClauses != null && args.SelectClauses.length != undefined ) {
            for( var s=0; s<args.SelectClauses.length; s++ ) ef.SelectClauses[s] = args.SelectClauses[s];
        }
        // where clausse?
        if( args.WhereClause != undefined && args.WhereClause != null ) ef.WhereClause = args.WhereClause;
    }
    ef.toExtensionObject = function() {
        var xo = new UaExtensionObject();
        xo.setEventFilter( this );
        return( xo );
    }
    return( ef );
}

UaExtensionObject.FromUaType = function( xo ) {
    if( !isDefined( xo ) ) throw( "UaExtensionObject.FromUaType() extensionObject not specified." );
    if( isDefined( xo.toExtensionObject ) ) xo = xo.toExtensionObject();
    if( xo.TypeId.NodeId.equals( new UaNodeId( Identifier.AddNodesItem ) ) )           return( xo.toAddNodesItem() );
    if( xo.TypeId.NodeId.equals( new UaNodeId( Identifier.AddNodesResult ) ) )         return( xo.toAddNodesResult() );
    if( xo.TypeId.NodeId.equals( new UaNodeId( Identifier.AddReferencesItem ) ) )      return( xo.toAddReferencesItem() );
    if( xo.TypeId.NodeId.equals( new UaNodeId( Identifier.AggregateConfiguration ) ) ) return( xo.toAggregateConfiguration() );
    if( xo.TypeId.NodeId.equals( new UaNodeId( Identifier.AggregateFilter ) ) )        return( xo.toAggregateFilter() );
    if( xo.TypeId.NodeId.equals( new UaNodeId( Identifier.AggregateFilterResult ) ) )  return( xo.toAggregateFilterResult() );
    if( xo.TypeId.NodeId.equals( new UaNodeId( Identifier.Annotation ) ) )             return( xo.toAnnotation() );
    if( xo.TypeId.NodeId.equals( new UaNodeId( Identifier.Range ) )         || xo.TypeId.NodeId.equals( new UaNodeId( Identifier.Range_Encoding_DefaultXml ) )         || xo.TypeId.NodeId.equals( new UaNodeId( Identifier.Range_Encoding_DefaultBinary ) ) ) return( xo.toRange() );
    if( xo.TypeId.NodeId.equals( new UaNodeId( Identifier.EUInformation ) ) || xo.TypeId.NodeId.equals( new UaNodeId( Identifier.EUInformation_Encoding_DefaultXml ) ) || xo.TypeId.NodeId.equals( new UaNodeId( Identifier.EUInformation_Encoding_DefaultBinary ) ) ) return( xo.toEUInformation() );
    throw( "UaExtensionObject.FromUaType() unrecognized type '" + xo.TypeId.NodeId + "' (BuiltInType: " + BuiltInType.toString( xo.TypeId.NodeId ) + ")." );
}

/**
 * Triggers an event utilizing the EvenTrigger nodes configured via the CTT settings
 *  
 * @param args.NumberOfEvents - (Optional) Defines the number of events to be triggered. Default is 1.
 * @param args.Delay - (Optional) Delay between triggering the events. Default is 100ms.
 *  
 * @returns True if successfully triggered, false if trigger failed
 */
function triggerEvent( args ) {
    if( !isDefined( args ) ) args = new Object();
    if ( !isDefined( args.NumberOfEvents ) ) args.NumberOfEvents = 1;
    if ( !isDefined( args.Delay ) ) args.Delay = 100;
    //Define trigger functions for the configured trigger Nodes
    var eventTriggerItems = MonitoredItem.fromSettings( ["/Server Test/NodeIds/Events/TriggerNode01", "/Server Test/NodeIds/Events/TriggerNode02"], undefined, Attribute.NodeClass );
    var eventTriggerItemValues = MonitoredItem.fromSettings( ["/Server Test/NodeIds/Events/TriggerNode01", "/Server Test/NodeIds/Events/TriggerNode02"], undefined, Attribute.Value );
    if ( !isDefined( eventTriggerItems ) || eventTriggerItems.length === 0 ) {
        addSkipped( "Not enough event trigger node items configured." );
        return ( false );
    }

    // determine the type of the triggers
    if (!ReadHelper.Execute( { NodesToRead: eventTriggerItems } ) ) {
        addError( "Unable to read trigger nodes. Aborting test." );
        return ( false );
    }
    for ( var i = 0; i < args.NumberOfEvents; i++ ) {
        if ( eventTriggerItems[ i % eventTriggerItems.length ].Value.Value.toInt32() == NodeClass.Variable ) {
            ReadHelper.Execute( { NodesToRead: eventTriggerItemValues[i % eventTriggerItemValues.length ] } );             // read the value, so that we have it
            UaVariant.Increment( { Item: eventTriggerItemValues[i % eventTriggerItemValues.length] } );                // increment the value
            if( WriteHelper.Execute( { NodesToWrite: eventTriggerItemValues[i % eventTriggerItemValues.length] } ) ) {  // write the value to the server
                addLog( "Trigger has been written successful." );
            }
            else {
                return ( false );
            }
        }
        else if ( eventTriggerItems[ i % eventTriggerItems.length ].Value.Value.toInt32() == NodeClass.Method ) {
            var parentObject = GetMethodParent( eventTriggerItems[i % eventTriggerItemValues.length].NodeId );
            if (CallHelper.Execute( { MethodsToCall: [ { MethodId: eventTriggerItems[i % eventTriggerItemValues.length].NodeId, ObjectId: parentObject.NodeId } ] } ) ) {
                addLog( "Trigger has been called successful." );
            }
            else {
                return ( false );
            }
        }
        else {
            return ( false );
        }
        UaDateTime.CountDown( { Msecs: args.Delay } );
    }//for i...
}