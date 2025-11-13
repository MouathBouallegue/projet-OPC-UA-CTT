/*  Test prepared by Shane Kurr: shane.kurr@opcfoundation.org; 
    Description: Invoke method using string argument where integer type is required or vice-versa. */

// Return value for argument dependent on datatype
function getInitialValue( valueDataType ) {
    var newValue;
    switch ( valueDataType ) {
        case BuiltInType.String:  newValue = "32"; break;
        case BuiltInType.Int32:   newValue = "32"; break;
        default:
            print( "Data Type not defined: ");
            newValue = "10";
            break;
    }
    return ( newValue );
}

// Change data type of argument to string, if it is string, then change to Int32
function getNewDataType( origDataType ) {
    var newDataType;
    if( origDataType === BuiltInType.String ) newDataType = BuiltInType.Int32;
    else newDataType = BuiltInType.String;   
    return( newDataType );
}

function methodCallTest( session, objectId, methodId ) {
    // Read method name setting. If setting is empty, skip test
    var methodName = MonitoredItem.fromNodeIds( UaNodeId.fromString( Settings.ServerTest.NodeIds.Methods.IOArgs ) )[0];
    if ( !isDefined( methodName ) ) {
       addSkipped( "Method with 'in' and 'out' args not configured in settings." );
       return false;
    }

    // Read method object. If setting is empty, return
    var methodObject = GetMethodParent( methodName );
    if ( !isDefined( methodObject ) ) {
       addSkipped( "Method object is not configured within the setting:" );
       return false;
    }

    // Make sure method exists with both InputArguments and OutputArguments
    if( !TranslateBrowsePathsToNodeIdsHelper.Execute( { 
        Node: methodName,
        UaBrowsePaths: [ TranslateBrowsePathsToNodeIdsHelper.stringsToBrowsePaths( methodName, [ "InputArguments" ] ),
                         TranslateBrowsePathsToNodeIdsHelper.stringsToBrowsePaths( methodName, [ "OutputArguments" ] ) ],
        OperationResults: [ new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadNoMatch ] ),
                            new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadNoMatch ] ) ]
    } ) ) return false;
    for( var i=0; i<TranslateBrowsePathsToNodeIdsHelper.Response.Results.length; i++ ) {
        if( !TranslateBrowsePathsToNodeIdsHelper.Response.Results[i].StatusCode.isGood() ) {
            addSkipped( "Method signature does not match." );
            return false;
        }
    }

    // Read input parameters
    var inputArgument  = MonitoredItem.fromNodeIds( TranslateBrowsePathsToNodeIdsHelper.Response.Results[0].Targets[0].TargetId.NodeId )[0];
    var outputArgument = MonitoredItem.fromNodeIds( TranslateBrowsePathsToNodeIdsHelper.Response.Results[1].Targets[0].TargetId.NodeId )[0];
    ReadHelper.Execute( { NodesToRead: [ inputArgument, outputArgument ] } );
    var dataType = [], testValue = [], args = [], originalDataType = [];
    var inputArgumentArray = inputArgument.Value.Value.toExtensionObjectArray();
    // Find datatype
    for( var i=0; i<inputArgumentArray.length; i++ ) {
        var inputArg = inputArgumentArray[i].toArgument();
        var dataTypeNodeId = inputArg.DataType;
        // Retrieve datatype of argument and then change to opposite datatype
        originalDataType[i] = getDataTypeFromNodeId( dataTypeNodeId );
        dataType[i]= getNewDataType( originalDataType[i] );
        testValue[i] = getInitialValue( dataType[i] );
        var newVar = new UaVariant()
        // Create new argument using new datatype and value of new datatype
        args[i] = UaVariant.New( { Type: dataType[i], Value: testValue[i] } );
    }

    var result = CallHelper.Execute( {  ServiceResult       :   new ExpectedAndAcceptedResults( StatusCode.Good ),
                                        OperationResults    : [ new ExpectedAndAcceptedResults( StatusCode.BadInvalidArgument ) ],
                                        InputArgumentResults: [ new ExpectedAndAcceptedResults( StatusCode.BadTypeMismatch ) ],
                                        MethodsToCall       : [ { MethodId: methodName.NodeId, ObjectId: methodObject.NodeId, InputArguments: args } ] } );

    for( var i=0; i<dataType.length; i++ ) {
        originalDataType[i] = BuiltInType.toString( originalDataType[i] );
        dataType[i] = BuiltInType.toString( dataType[i] );
    }

    addLog( "\nRequired datatypes of arguments are: " + originalDataType );
    addLog( "Datatypes used for Method Call are: " + dataType );

    return( result );
}

Test.Execute( { Procedure: methodCallTest } );