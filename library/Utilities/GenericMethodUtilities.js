/**
 * Functions to use the ability to expose/hook custom methods in the AddressSpace
 * of the global OpcServer embedded in the CTT
 * 
 * 2024-01-11:
 *   The method hooking functions are currently restricted to the internal custom NodeManager
 *   of the global OpcServer (gOpcServer object started in beforeTest.js and shut down in afterTest.js)
 *   using the static NamespaceIndex 3 (NamespaceUri: "http://opcfoundation.org/CTT/").
 *   The functions available are CreateGenericMethod() to create a Method node on NamespaceIndex 3
 *   under object node 'GenericMethods' and HookMethodsAndWaitForCall() to fetch the InputArguments on
 *   a call, handle them on script-side and send a customized Response back to the calling client.
 *   The hooking only works for Nodes of the custom NodeManager on NamespaceIndex 3 as well, as this
 *   NodeManager is customized to inform the scripts when a call request is received and wait for script response.
 *
 * 2024-02-01:
 *   The method hooking functions can now be used on every Method Node created using the UaOpcServer.* Helper functions
 *   like UaOpcServer.addMethodNode() or UaOpcServer.ImportNodeSet() on every available Namespace. After all, nodes that were
 *   already available on startup of the server on NamespaceIndex 0 (e.g. GetMonitoredItems()) still cannot be hooked yet
 *   as they are already handled with a standard implementation (which is not communicating with the scripts).
 */
 
 
/**
 * Function to create a new method in the AddressSpace of the global OpcServer object, including
 * the InputArguments/OutputArguments properties. A new object node 'GenericMethods' will be created
 * in the Objects folder, if not already exposed. The new method will be a Component of this object.
 * Every Node created in this function is part of the CTT Namespace ("http://opcfoundation.org/CTT/")
 * 
 * @param {object} args - An object containing all parameter
 * @param {string} args.MethodName - (Optional) The desired name for the new method, which will be used in the NodeId, BrowseName and DisplayName (default="GenericMethod")
 * @param {UaArgument[]} args.InputArguments - (Optional) The InputArguments the method shall expose (default=empty)
 * @param {UaArgument[]} args.OutputArguments - (Optional) The OutputArguments the method shall expose (default=empty)
 * @param {Int32} args.StandardResult - (Optional) The standard result code the method shall return when currently not hooked (default=Bad_NotImplemented)
 * @param {UaVariant[]} args.StandardOutputArguments - (Optional) The standard OutputArguments to return when the method is currently not hooked (default=empty)
 * 
 * @returns {UaStatusCode} Returns the UaStatusCode returned by the internal call to UaOpcServer.createGenericMethod(), or Bad if the args are invalid
 */
function CreateGenericMethod( args ) {
    var result = new UaStatusCode( StatusCode.Good );
    
    if( !isDefined( args ) ) args = new Object();
    if( !isDefined( args.MethodName ) ) args.MethodName = "GenericMethod";
    if( !isDefined( args.InputArguments ) ) args.InputArguments = [];
    if( !isDefined( args.OutputArguments ) ) args.OutputArguments = [];
    if( !isDefined( args.StandardResult ) ) args.StandardResult = StatusCode.BadNotImplemented;
    
    var newNodeId = new UaNodeId.fromString( "ns=3;s=GenericMethods." + args.MethodName );
    
    var inputArgumentsArray = new UaArguments();
    var outputArgumentsArray = new UaArguments();
    for( var i=0; i<args.InputArguments.length; i++ ) {
        if( !isDefined( args.InputArguments[i].Name ) ) {
            addError( "CreateGenericMethod(): InputArgument at index " + i + " has no Name." );
            return new UaStatusCode( StatusCode.Bad );
        }
        inputArgumentsArray[i] = args.InputArguments[i];
    }
    for( var o=0; o<args.OutputArguments.length; o++ ) {
        if( !isDefined( args.OutputArguments[o].Name ) ) {
            addError( "CreateGenericMethod(): OutputArgument at index " + o + " has no Name." );
            return new UaStatusCode( StatusCode.Bad );
        }
        outputArgumentsArray[o] = args.OutputArguments[o];
    }
    
    result = gOpcServer.createGenericMethod( args.MethodName, inputArgumentsArray, outputArgumentsArray );
    
    if( isDefined( args.StandardOutputArguments ) ) {
        
        var standardOutputArgumentsArray = new UaVariants();
        
        if( !isDefined( args.StandardOutputArguments.length ) ) args.StandardOutputArguments = [ args.StandardOutputArguments ];
        for( var s=0; s<args.StandardOutputArguments.length; s++ ) {
            standardOutputArgumentsArray[s] = args.StandardOutputArguments[s];
        }
        gOpcServer.setMethodInfoStandardOutputArguments( newNodeId, standardOutputArgumentsArray );
        
    }
    
    gOpcServer.setMethodInfoStandardResult( newNodeId, args.StandardResult );
    
    if( result.StatusCode != StatusCode.Good && result.StatusCode != StatusCode.BadNodeIdExists ) addError( "CreateGenericMethod failed: " + result );
    
    return( result );
}

/**
 * Function to generate Method information off an existing Method Node in the AddressSpace of the CTT Server
 * and register it in the corresponding custom NodeManager. This can either be used to be able to hook the Method or
 * to define a standard return result and/or standard OutputArguments to return when the method is currently
 * not hooked.
 * 
 * @param {object} args - An object containing all parameter
 * @param {string} args.MethodNodeId - The NodeId of the method to register in the NodeManager
 * @param {Int32} args.StandardResult - (Optional) The standard result code the method shall return when currently not hooked (default=Bad_NotImplemented)
 * @param {UaVariant[]} args.StandardOutputArguments - (Optional) The standard OutputArguments to return when the method is currently not hooked (default=empty)
 * 
 * @returns {UaStatusCode} Returns the UaStatusCode returned by the internal call to UaOpcServer.addGenericMethodInfo(), or Bad if the function fails
 */
function RegisterGenericMethod( args ) {
    var result = new UaStatusCode( StatusCode.Good );
    
    if( !isDefined( args ) ) throw( "RegisterGenericMethod(): No args defined" );
    if( !isDefined( args.MethodNodeId ) ) throw( "RegisterGenericMethod(): No MethodNodeId defined" );
    if( !isDefined( args.StandardResult ) ) args.StandardResult = StatusCode.BadNotImplemented;
    
    // read Input/OutputArgument counts
    var methodArgumentCounts = GetMethodArgumentCounts( args.MethodNodeId );
    
    if( !isDefined( methodArgumentCounts ) ) {
        addError( "RegisterGenericMethod(): Could not get method InputArguments/OutputArgument counts of method '" + args.MethodNodeId + "'" );
        return new UaStatusCode( StatusCode.Bad );
    }
    
    result = gOpcServer.addGenericMethodInfo( args.MethodNodeId, methodArgumentCounts.InputArgumentCount, methodArgumentCounts.OutputArgumentCount );
    
    if( isDefined( args.StandardOutputArguments ) ) {
        
        var standardOutputArgumentsArray = new UaVariants();
        
        if( !isDefined( args.StandardOutputArguments.length ) ) args.StandardOutputArguments = [ args.StandardOutputArguments ];
        for( var s=0; s<args.StandardOutputArguments.length; s++ ) {
            standardOutputArgumentsArray[s] = args.StandardOutputArguments[s];
        }
        gOpcServer.setMethodInfoStandardOutputArguments( args.MethodNodeId, standardOutputArgumentsArray );
        
    }
    
    gOpcServer.setMethodInfoStandardResult( args.MethodNodeId, args.StandardResult );
    
    if( result.StatusCode != StatusCode.Good ) addError( "RegisterGenericMethod failed: " + result );
    
    return( result );
}

function GetMethodArgumentCounts( methodNodeId ) {
    if( !isDefined( methodNodeId ) ) throw( "GetMethodArgumentCounts(): No methodNodeId defined" );
    
    var result = { 
        InputArgumentCount: 0,
        OutputArgumentCount: 0
    }
    
    var doDisconnect = false;
    
    if( !isDefined( UaOpcServer.Session ) ) {
        UaOpcServer.Connect();
        doDisconnect = true;
    }
    
    // Get InputArguments/OutputArguments
    var tempTBPTNI = new TranslateBrowsePathsToNodeIdsService( { Session: UaOpcServer.Session } );
    var tempReadHelper = new ReadService( { Session: UaOpcServer.Session } );
    
    if( !tempTBPTNI.Execute( {
        UaBrowsePaths: [
            UaBrowsePath.New( { StartingNode: methodNodeId, RelativePathStrings: [ "InputArguments" ] } ),
            UaBrowsePath.New( { StartingNode: methodNodeId, RelativePathStrings: [ "OutputArguments" ] } )
        ],
        OperationResults: [
            new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadNoMatch ] ),
            new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadNoMatch ] )
        ]
    } ) ) return null;

    // Read InputArguments if found
    if( tempTBPTNI.Response.Results[0].StatusCode.StatusCode != StatusCode.BadNoMatch ) {
        var inputArguments  = MonitoredItem.fromNodeIds( tempTBPTNI.Response.Results[0].Targets[0].TargetId.NodeId )[0];
        tempReadHelper.Execute( { NodesToRead: inputArguments } );
        result.InputArgumentCount = (!inputArguments.Value.Value.isEmpty()) ? inputArguments.Value.Value.toExtensionObjectArray().length : 0;
    }
    
    // Read OutputArguments if found
    if( tempTBPTNI.Response.Results[1].StatusCode.StatusCode != StatusCode.BadNoMatch ) {
        var outputArguments = MonitoredItem.fromNodeIds( tempTBPTNI.Response.Results[1].Targets[0].TargetId.NodeId )[0];
        tempReadHelper.Execute( { NodesToRead: outputArguments } );
        result.OutputArgumentCount = (!outputArguments.Value.Value.isEmpty()) ? outputArguments.Value.Value.toExtensionObjectArray().length : 0;
    }
    
    if( doDisconnect ) UaOpcServer.Disconnect();
    
    return result;
}

/**
 * Function to hook methods of the NodeManager in the global OpcServer object of the CTT.
 * It can be used to define script-side implementations for exposed methods, waiting for
 * according calls within a certain Timeout window.
 * After a method has been called, the hook is released for this method and the defined
 * standard values will be returned for every subsequent call.
 * This function will block until all hooked methods have been called once or when the Timeout is exceeded
 * 
 * @param {object} args - An object containing all parameter
 * @param {UaNodeId[]} args.MethodNodeIds - The NodeIds of the methods to be hooked.
 * @param {function[]} args.Methods - (Optional) An array of anonymous functions to be used as implementation for the method at the same index on the MethodNodeIds array above.
 *                                    Each function shall have two arguments, (in)inputArguments[UaVariants] and (out)outputArguments[UaVariants].
 *                                    The value returned by the function will be used as the returned result code (shall be an Int32 from the StatusCode enum).
 * @param {Number} args.Timeout - (Optional) The maximum time the function should wait for calls in milliseconds (default=10000)
 *
 * @returns {UaStatusCode} Returns Good if all methods have been called successfully, Bad_InternalError if at least one
 *                         of the method implementations throw an error or Bad_Timeout if at least one method has not been called within the Timeout window.
 */
function HookMethodsAndWaitForCall( args ) {
    var result = new UaStatusCode( StatusCode.Good );
    
    if( !isDefined( args ) ) args = new Object();
    if( !isDefined( args.MethodNodeIds ) ) args.MethodNodeIds = [];
    if( !isDefined( args.MethodNodeIds.length ) ) args.MethodNodeIds = [ args.MethodNodeIds ];
    if( !isDefined( args.Methods ) ) args.Methods = [];
    if( !isDefined( args.Timeout ) ) args.Timeout = 10000;
    
    // Filling the Methods array with placeholder functions returning Bad_NotImplemented, if the Methods array does not cover the MethodNodeIds array
    while( args.MethodNodeIds.length > args.Methods.length ) args.Methods.push( function( inArgs, outArgs ) { return StatusCode.BadNotImplemented; } );
    
    var startTime = UaDateTime.Now();
    addLog( "Waiting for call of methods '" + args.MethodNodeIds + "' (Timeout at " + args.Timeout + " ms)..." );
    
    var finishedTask = [];
    var methodCallsPending = 0;
    
    // configure MethodInfos for hook
    for( var m=0; m<args.MethodNodeIds.length; m++ ) {
        var ret = gOpcServer.setMethodInfoMode( args.MethodNodeIds[m], GenericMethodMode.WaitForScriptResponse );
        
        // If setMethodInfoMode returns Bad_NodeIdUnknown, try to register it and try again
        if( ret.StatusCode == StatusCode.BadNodeIdUnknown ) {
            RegisterGenericMethod( { MethodNodeId: args.MethodNodeIds[m] } );
            ret = gOpcServer.setMethodInfoMode( args.MethodNodeIds[m], GenericMethodMode.WaitForScriptResponse );
        }
        
        if( ret.isGood() ) {
            gOpcServer.setMethodInfoMethodStatus( args.MethodNodeIds[m], GenericMethodStatus.WaitingForCall );
            finishedTask.push( false );
            methodCallsPending++;
        }
        else {
            addError( "HookMethodsAndWaitForCall(): Error setting MethodInfoMode for Method '" + args.MethodNodeIds[m] + "': " + ret + ". Method will be skipped." );
            finishedTask.push( true );
        }
    }
    
    while( true ) {
        CheckResourceError();
        CheckUserStop();
        if( startTime.msecsTo( UaDateTime.Now() ) > args.Timeout ) {
            addError( "HookMethodsAndWaitForCall(): Timeout limit of " + args.Timeout + " ms exceeded. Not all methods have been called." );
            result = new UaStatusCode( StatusCode.BadTimeout );
            break;
        }
        wait( 10 );
        
        for( var m=0; m<args.MethodNodeIds.length; m++ ) {
            if( finishedTask[m] ) continue;
            var currentStatus = gOpcServer.getMethodInfoMethodStatus( args.MethodNodeIds[m] );
            
            if( currentStatus == GenericMethodStatus.WaitingForCall ) continue;
            else if( currentStatus == GenericMethodStatus.WaitingForExecution ) {
                
                // Get passed InputArguments and create empty OutputArguments
                var inputArguments = gOpcServer.getMethodInfoMethodInputArguments( args.MethodNodeIds[m] );
                var outputArguments = new UaVariants();
                // Call Method
                var callFailed = false;
                try {
                    var methodResult = args.Methods[m]( inputArguments, outputArguments );
                } catch( ex ) {
                    var methodResult = StatusCode.BadInternalError;
                    addError( "HookMethodsAndWaitForCall(): Unexpected error in method implementation for method '" + args.MethodNodeIds[m] + "':\n\t=> " + ex );
                    result = new UaStatusCode( StatusCode.BadInternalError );
                    callFailed = true;
                }
                // Return OutputArguments
                gOpcServer.setMethodInfoScriptOutputArguments( args.MethodNodeIds[m], outputArguments );
                // Return call result
                gOpcServer.setMethodInfoScriptResult( args.MethodNodeIds[m], methodResult );
                gOpcServer.setMethodInfoMethodStatus( args.MethodNodeIds[m], GenericMethodStatus.None );
                
                if( !callFailed ) {
                    var successMessage = "Method '" + args.MethodNodeIds[m] + "' called successfully\n\tInputArguments:";
                    for( var iA=0; iA<inputArguments.length; iA++ ) successMessage += "\n\t\t[" + iA + "]: " + inputArguments[iA];
                    successMessage += "\n\tOutputArguments:";
                    for( var oA=0; oA<outputArguments.length; oA++ ) successMessage += "\n\t\t[" + oA + "]: " + outputArguments[oA];
                    addLog( successMessage );
                }
                else addLog( "Method call of method '" + args.MethodNodeIds[m] + "' failed" );
                
            }
            else if( currentStatus == GenericMethodStatus.None ) addLog( "Method '" + args.MethodNodeIds[m] + "' not executed: Unknown error" );
            
            gOpcServer.setMethodInfoMode( args.MethodNodeIds[m], GenericMethodMode.ReturnStandardValues );
            finishedTask[m] = true;
            methodCallsPending--;
            if( methodCallsPending > 0 ) addLog( "Method calls pending: " + methodCallsPending );
        }
        
        if( methodCallsPending == 0 ) break;
    }
    
    return( result );
}

/**
 * Example usage of CreateGenericMethod and HookMethodsAndWaitForCall
 */
function CreateAndHookMethod_Example() {
    
    // Example of a method to hook and implement on script side with scalar inputArguments
    CreateGenericMethod( {
        MethodName: "Multiply",
        InputArguments: [
            UaArgument.New( {
                DataType: new UaNodeId( Identifier.Double ),
                Description: UaLocalizedText.New( { Locale: "", Text: "Operand A" } ),
                Name: "Operand A",
                ValueRank: -1
            } ),
            UaArgument.New( {
                DataType: new UaNodeId( Identifier.Double ),
                Description: UaLocalizedText.New( { Locale: "", Text: "Operand B" } ),
                Name: "Operand B",
                ValueRank: -1
            } )
        ],
        OutputArguments: [
            UaArgument.New( {
                DataType: new UaNodeId( Identifier.Double ),
                Description: UaLocalizedText.New( { Locale: "", Text: "The product of A and B" } ),
                Name: "Result",
                ValueRank: -1
            } )
        ]
    } );
    
    // Example of a method to hook and implement on script side with structure inputArguments
    CreateGenericMethod( {
        MethodName: "GetSizeOfRange",
        InputArguments: [
            UaArgument.New( {
                DataType: new UaNodeId( Identifier.Range ),
                Description: UaLocalizedText.New( { Locale: "", Text: "The Range to get the size of" } ),
                Name: "Range",
                ValueRank: -1
            } )
        ],
        OutputArguments: [
            UaArgument.New( {
                DataType: new UaNodeId( Identifier.Double ),
                Description: UaLocalizedText.New( { Locale: "", Text: "The size of the provided Range" } ),
                Name: "Size",
                ValueRank: -1
            } )
        ]
    } );
    
    // Example of method to not be hooked, returning standard values instead
    CreateGenericMethod( {
        MethodName: "ReturnUncertainStandardMessage",
        OutputArguments: [
            UaArgument.New( {
                DataType: new UaNodeId( Identifier.String ),
                Description: UaLocalizedText.New( { Locale: "", Text: "A standard message" } ),
                Name: "Message",
                ValueRank: -1
            } )
        ],
        StandardOutputArguments: [
            UaVariant.New( { Type: BuiltInType.String, Value: "Value is Uncertain" } )
        ],
        StandardResult: StatusCode.Uncertain
    } );
    
    // Hooking the methods providing the script side implementation and waiting for calls
    var hookMethodsResult = HookMethodsAndWaitForCall( {
        Timeout: 45000,
        MethodNodeIds: [
            new UaNodeId.fromString( "ns=3;s=GenericMethods.GetSizeOfRange" ),
            new UaNodeId.fromString( "ns=3;s=GenericMethods.Multiply" )
        ],
        Methods: [
            function ( inArgs, outArgs ) {
                var range = inArgs[0].toExtensionObject().toRange();
                outArgs[0].setDouble( Math.abs( range.High - range.Low ) );
                return StatusCode.Good;
            },
            function ( inArgs, outArgs ) {
                var opA = inArgs[0].toDouble();
                var opB = inArgs[1].toDouble();
                outArgs[0].setDouble( opA * opB );
                return StatusCode.Good;
            }
        ]
    } );
    
    print( "CreateAndHookMethod_Example(): HookMethodsAndWaitForCall returned: " + hookMethodsResult );
    
}