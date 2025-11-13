/*    This class object is responsible for calling the SetTriggering() service and for also
      performing any validation etc. This is a quick-use class. */

function SetTriggeringService( args ) {
    this.Name = "SetTriggering";
    this.Session = null;
    this.Request = new UaSetTriggeringRequest();
    this.Response = new UaSetTriggeringResponse();
    this.UaStatus = null;

    if( !isDefined( args ) ) throw( this.Name + " CTOR, arguments not specified." );
    if( !isDefined( args.Session ) ) throw( this.Name + " CTOR, session not specified." );
    else this.Session = args.Session;
    
    
    /**
     * Execute method - Calls the ExecuteExt method with the given arguments either once or
     * split up into multiple calls if needed, depending on the OperationLimits of the server
     * 
     * @param {object} args An object containing all parameter
     * @param {Subscription} args.SubscriptionId - Subscription to work with.
     * @param {MonitoredItem} args.TriggeringItemId - The MonitoredItem object to use as triggering item.
     * @param {MonitoredItem[]} args.LinksToAdd - Array of MonitoredItem objects to use for Links to add.
     * @param {MonitoredItem[]} args.LinksToRemove - Array of MonitoredItem objects to use for Links to remove.
     * @param {ExpectedAndAcceptedResults} args.ServiceResult - (Optional) An ExpectedAndAcceptedResults object.
     * @param {ExpectedAndAcceptedResults[]} args.AddResults - An array of ExpectedAndAcceptedResults for expected OperationResults of the LinksToAdd (optional if no LinksToAdd are defined)
     * @param {ExpectedAndAcceptedResults[]} args.DeleteResults - An array of ExpectedAndAcceptedResults for expected OperationResults of the LinksToRemove (optional if no LinksToRemove are defined)
     * @param {boolean} args.SuppressMessaging - (Optional) Do not log messages
     * @param {boolean} args.SuppressErrors - (Optional) Do not log errors
     * @param {function} args.PreHook - (Optional) Function to invoke immediately before the Service call
     * @param {function} args.PostHook - (Optional) Function to invoke immediately after the Server call
     * @param {boolean} args.ProhibitSplitting - (Optional) Forces operations to be executed in one call
     *
     * @returns {boolean} True if call was successful, false otherwise
     */          
    this.Execute = function (args) {
        if (!isDefined(args.ProhibitSplitting)) args.ProhibitSplitting = false;
        if( !isDefined( args ) ) throw( "SetTriggering::Execute() args not specified." );
        if( isDefined( args.OperationResults ) ) throw( "SetTriggering::Execute() 'OperationResults' was specified. Use 'AddResults' and/or 'DeleteResults' instead." );
        if( !isDefined( args.SubscriptionId ) ) throw( "SetTriggering::Execute() SubscriptionId not specified." );
        if( !isDefined( args.SubscriptionId.SubscriptionId ) ) throw( "SetTriggering::Execute() SubscriptionId is not the correct type." );
        if( !isDefined( args.TriggeringItemId ) ) throw( "SetTriggering::Execute() TriggeringItemId not specified." );
        if( !isDefined( args.TriggeringItemId.MonitoredItemId ) ) throw( "SetTriggering::Execute() TriggeringItemId is not of the correct type." );
        if( !isDefined( args.LinksToAdd ) ) args.LinksToAdd = [];
        if( isDefined( args.LinksToAdd ) && !isDefined( args.LinksToAdd.length ) ) args.LinksToAdd = [ args.LinksToAdd ];
        if( !isDefined( args.LinksToRemove ) ) args.LinksToRemove = [];
        if( isDefined( args.LinksToRemove ) && !isDefined( args.LinksToRemove.length ) ) args.LinksToRemove = [ args.LinksToRemove ];
        if( isDefined( args.AddResults ) && !isDefined( args.LinksToAdd ) ) throw( "SetTriggering.Execute() argument mismatch: AddResults are specified although LinksToAdd is not." );
        if( isDefined( args.AddResults ) && !isDefined( args.AddResults.length ) ) args.AddResults = [ args.AddResults ];
        if( isDefined( args.DeleteResults ) && !isDefined( args.LinksToRemove ) ) throw( "SetTriggering.Execute() argument mismatch: DeleteResults are specified although LinksToRemove is not." );
        if( isDefined( args.DeleteResults ) && !isDefined( args.DeleteResults.length ) ) args.DeleteResults = [ args.DeleteResults ];
        if( !isDefined( args.SuppressMessaging ) ) args.SuppressMessaging = false;
        var result = true;
        var MaxMonitoredItemsPerCall = 65535;
        var NumberOfAlreadySetLinks = 0;
        var AllLinksToAdd = args.LinksToAdd;
        var AllLinksToRemove = args.LinksToRemove;

        if (isDefined(args.AddResults) && isDefined(args.AddResults.length))   var AllAddResults = args.AddResults;
        if (isDefined(args.DeleteResults) && isDefined(args.DeleteResults.length))   var AllDeleteResults = args.DeleteResults;
        if (gServerCapabilities.OperationLimits !== null && gServerCapabilities.OperationLimits !== undefined) {
            if (gServerCapabilities.OperationLimits.MaxMonitoredItemsPerCall != 0) MaxMonitoredItemsPerCall = gServerCapabilities.OperationLimits.MaxMonitoredItemsPerCall;
        }
        if ((MaxMonitoredItemsPerCall < ( args.LinksToAdd.length + args.LinksToRemove.length )) && (args.ProhibitSplitting == false)) {
            if( isDefined( args.PreHook ) ) args.PreHook();
            args.SkipHooks = true;
            addLog("=== SetTriggering.Execute > Exceeding the limit MaxMonitoredItemsPerCall on the server, splitting the call into multiple Requests.");
            // temporary variables to collect and reassemble the split requests and responses
            var tempLinksToAdd = new UaUInt32s();
            var tempLinksToRemove = new UaUInt32s();
            var tempAddResults = new UaStatusCodes();
            var tempRemoveResults = new UaStatusCodes();
            while (NumberOfAlreadySetLinks < (AllLinksToAdd.length + AllLinksToRemove.length)) {
                var innerResult = true;
                var currentListOfLinksToAdd = [];
                var currentListOfLinksToRemove = [];
                var currentListOfAddResults = [];
                var currentListOfDeleteResults = [];
                for (var i = 0; (i < MaxMonitoredItemsPerCall) && ((AllLinksToAdd.length + AllLinksToRemove.length) > NumberOfAlreadySetLinks + i); i++) {
                    if( NumberOfAlreadySetLinks + i < AllLinksToRemove.length ) {
                        currentListOfLinksToRemove.push(AllLinksToRemove[NumberOfAlreadySetLinks + i]);
                        if (isDefined(args.DeleteResults) && isDefined(args.DeleteResults.length))   currentListOfDeleteResults.push(AllDeleteResults[NumberOfAlreadySetLinks + i]);
                    }
                    else {
                        currentListOfLinksToAdd.push(AllLinksToAdd[(NumberOfAlreadySetLinks-AllLinksToRemove.length) + i]);
                        if (isDefined(args.AddResults) && isDefined(args.AddResults.length))   currentListOfAddResults.push(AllAddResults[(NumberOfAlreadySetLinks-AllLinksToRemove.length) + i]);
                    }
                }
                if (currentListOfLinksToAdd.length + currentListOfLinksToRemove == 0) break;
                args.LinksToAdd = currentListOfLinksToAdd;
                args.LinksToRemove = currentListOfLinksToRemove;
                if (currentListOfAddResults.length > 0) args.AddResults = currentListOfAddResults;
                else args.AddResults = undefined;
                if (currentListOfDeleteResults.length > 0) args.DeleteResults = currentListOfDeleteResults;
                else args.DeleteResults = undefined;
                innerResult = this.ExecuteExt(args);
                result = result && innerResult ? true : false;  // validation failed, so override *this* result
                NumberOfAlreadySetLinks += currentListOfLinksToAdd.length + currentListOfLinksToRemove.length;
                // append the split requests LinksToAdd/LinksToRemove and the responses AddResults/DeleteResults to a temporary variable
                var tempLinksToAddLength = tempLinksToAdd.length;
                var tempAddResultsLength = tempAddResults.length;
                var tempLinksToRemoveLength = tempLinksToRemove.length;
                var tempRemoveResultsLength = tempRemoveResults.length;
                for( var i=0; i < this.Request.LinksToAdd.length; i++ ) tempLinksToAdd[tempLinksToAddLength+i] = this.Request.LinksToAdd[i];
                for( var i=0; i < this.Response.AddResults.length; i++ ) tempAddResults[tempAddResultsLength+i] = this.Response.AddResults[i].clone();
                for( var i=0; i < this.Request.LinksToRemove.length; i++ ) tempLinksToRemove[tempLinksToRemoveLength+i] = this.Request.LinksToRemove[i];
                for( var i=0; i < this.Response.RemoveResults.length; i++ ) tempRemoveResults[tempRemoveResultsLength+i] = this.Response.RemoveResults[i].clone();
            }
            // set the reassembled requests LinksToAdd/LinksToRemove and responses AddResults/DeleteResults
            this.Request.LinksToAdd = new UaUInt32s(tempLinksToAdd.length);
            this.Response.AddResults = new UaStatusCodes(tempAddResults.length);
            this.Request.LinksToRemove = new UaUInt32s(tempLinksToRemove.length);
            this.Response.RemoveResults = new UaStatusCodes(tempRemoveResults.length);
            for( var i=0; i < tempLinksToAdd.length; i++ ) this.Request.LinksToAdd[i] = tempLinksToAdd[i];
            for( var i=0; i < tempAddResults.length; i++ ) this.Response.AddResults[i] = tempAddResults[i].clone();
            for( var i=0; i < tempLinksToRemove.length; i++ ) this.Request.LinksToRemove[i] = tempLinksToRemove[i];
            for( var i=0; i < tempRemoveResults.length; i++ ) this.Response.RemoveResults[i] = tempRemoveResults[i].clone();
            
            CheckResourceError();
            if( isDefined( args.PostHook ) ) args.PostHook();
            CheckUserStop();
        }
        else {
            return (this.ExecuteExt(args));
        }
        return (result);
    }//this.Execute = function( args )

    /*  Invokes the call to SetTriggering()
        Parameters: 
            SubscriptionId        (required) - The subscription (Subscription object)
            TriggerItemId         (requred)  - A MonitoredItem for the TRIGGER
            LinksToAdd           (optional) - Array of MonitoredItems for LINKSTOADD
            LinksToRemove        (optional) - Array of MonitoredItems for LINKSTOREMOVE
            ServiceResults (optional) - True=expect Errors; FALSE=expect FAIL
            AddResults   (optional) - An array of ExpectedAndAcceptedResults
            DeleteResults (optional) - An array of ExpectedAndAcceptedResults
            SuppressMessaging (optional) - true/false; show/hide messages
    */
    this.ExecuteExt = function( args ) {
        // parameter validation
        if( !isDefined( args ) ) throw( "SetTriggering::Execute() args not specified." );
        if( isDefined( args.OperationResults ) ) throw( "SetTriggering::Execute() 'OperationResults' was specified. Use 'AddResults' and/or 'DeleteResults' instead." );
        if( !isDefined( args.SubscriptionId ) ) throw( "SetTriggering::Execute() SubscriptionId not specified." );
        if( !isDefined( args.SubscriptionId.SubscriptionId ) ) throw( "SetTriggering::Execute() SubscriptionId is not the correct type." );
        if( !isDefined( args.TriggeringItemId ) ) throw( "SetTriggering::Execute() TriggeringItemId not specified." );
        if( !isDefined( args.TriggeringItemId.MonitoredItemId ) ) throw( "SetTriggering::Execute() TriggeringItemId is not of the correct type." );
        if( !isDefined( args.LinksToAdd ) ) args.LinksToAdd = [];
        if( isDefined( args.LinksToAdd ) && !isDefined( args.LinksToAdd.length ) ) args.LinksToAdd = [ args.LinksToAdd ];
        if( !isDefined( args.LinksToRemove ) ) args.LinksToRemove = [];
        if( isDefined( args.LinksToRemove ) && !isDefined( args.LinksToRemove.length ) ) args.LinksToRemove = [ args.LinksToRemove ];
        if( isDefined( args.AddResults ) && !isDefined( args.LinksToAdd ) ) throw( "SetTriggering.Execute() argument mismatch: AddResults are specified although LinksToAdd is not." );
        if( isDefined( args.AddResults ) && !isDefined( args.AddResults.length ) ) args.AddResults = [ args.AddResults ];
        if( isDefined( args.DeleteResults ) && !isDefined( args.LinksToRemove ) ) throw( "SetTriggering.Execute() argument mismatch: DeleteResults are specified although LinksToRemove is not." );
        if( isDefined( args.DeleteResults ) && !isDefined( args.DeleteResults.length ) ) args.DeleteResults = [ args.DeleteResults ];
        if( !isDefined( args.SuppressMessaging ) ) args.SuppressMessaging = false;

        // register that this service is tested
        ServiceRegister.Register( { Service: ServiceRegister.UaService( { Name: this.Name, Available: true, Tested: true } ) } );

        var result = true;// return parameter, i.e. TRUE = Successfully executed.

        // built the SetTriggeringRequest request...
        this.Request = new UaSetTriggeringRequest();
        this.Response = new UaSetTriggeringResponse();
        var session = isDefined( this.Session.Session )? this.Session.Session : this.Session;
        this.Request.RequestHeader = UaRequestHeader.New( { Session: session, ReturnDiagnostics: args.ReturnDiagnostics } );

        this.Request.SubscriptionId = args.SubscriptionId.SubscriptionId;
        this.Request.TriggeringItemId = args.TriggeringItemId.MonitoredItemId;

        // now to add any LinksToAdd/Delete 
        if( isDefined( args.LinksToAdd ) ) for( var a=0; a<args.LinksToAdd.length; a++ ) this.Request.LinksToAdd[a] = args.LinksToAdd[a].MonitoredItemId;
        if( isDefined( args.LinksToRemove ) ) for( var a=0; a<args.LinksToRemove.length; a++ ) this.Request.LinksToRemove[a] = args.LinksToRemove[a].MonitoredItemId;

        // update the timestamp in the RequestHeader before sending it out
        this.Request.RequestHeader.Timestamp = UaDateTime.utcNow();

        if( isDefined( args.PreHook ) && ( !isDefined( args.SkipHooks ) || !args.SkipHooks ) ) args.PreHook();
        this.UaStatus = session.setTriggering( this.Request, this.Response );
        CheckResourceError();
        if( isDefined( args.PostHook ) && ( !isDefined( args.SkipHooks ) || !args.SkipHooks ) ) args.PostHook();
        CheckUserStop();
        if( this.UaStatus.isGood() ) {
            result = UaResponseHeader.IsValid( { Service: this, ServiceResult: args.ServiceResult, SuppressMessaging: args.SuppressMessaging, SuppressErrors: args.SuppressErrors, ServiceInfo: "TriggeringItemId: " + this.Request.TriggeringItemId + "; LinksToAdd #" + this.Request.LinksToAdd.length + "; LinksToRemove #" + this.Request.LinksToRemove.length + "; SubscriptionId: " + this.Request.SubscriptionId } );
            if( result ) {
                if( isDefined( args.AddResults ) || isDefined( args.DeleteResults ) ) result = checkSetTriggeringError( this.Request, this.Response, args.AddResults, args.DeleteResults, args.SuppressMessaging );
                else if( !isDefined( args.ServiceResult ) ) result = checkSetTriggeringValidParameter( this.Request, this.Response, args.SuppressMessaging );
            }
            else {
                // check to make sure other parameters are not specified whenever there is a Bad service result. See UA Part 4 7.30 ServiceFault.
                Assert.Equal( 0, this.Response.AddResults.length, this.Name + ".Response.AddResults are not needed when a ServiceFault is returned." );
                Assert.Equal( 0, this.Response.RemoveResults.length, this.Name + ".Response.RemoveResults are not needed when a ServiceFault is returned." );
            }
        }
        else {
            Assert.StatusCodeIsOneOf( args.ServiceResult, this.UaStatus, this.Name + " the ErrorCode in the Error Message received doesn't match the expectation." );
            result = false;
        }// else... if( uaStatus.isGood() )
        // if the call failed then register that 
        if( !result ) ServiceRegister.SetFailed( { Name: this.Name } )
        return( result );
    }// ExecuteExt()
}



// the service is expected to succeed
// all operations are expected to succeed
function checkSetTriggeringValidParameter( Request, Response, suppressMessaging ) {
    // make sure the parameters contain something
    if( Request === undefined || Request === null || Response === undefined || Response === null ) {
        addError( "function checkSetTriggeringValidParameter(Request, Response). These parameters were specified, but not correctly." );
        return( false );
    }
    // not implemented?
    if( Response.ResponseHeader.ServiceResult.StatusCode === StatusCode.BadNotImplemented || Response.ResponseHeader.ServiceResult.StatusCode === StatusCode.BadServiceUnsupported ) {
        addNotSupported( "SetTriggering" );
        if( Response.ResponseHeader.ServiceResult.StatusCode === StatusCode.BadServiceUnsupported ) addError( "SetTriggering is a required Service. Verify if this Conformance Unit should be selected for testing." );
        if( Response.ResponseHeader.ServiceResult.StatusCode === StatusCode.BadNotImplemented ) addError( "SetTriggering is a required Service. Verify if this Conformance Unit should be selected for testing. In addition the server provided a wrong StatusCode. Expected: StatusCode.BadServiceUnsupported, Received: StatusCOde.BadNotImplemented" );
        return( false );
    }
    var result = true; // return code
    // as this is a valid parameter test we don't expect any diagnositcinfo
    if( Response.AddDiagnosticInfos.length !== 0 ) {
        addError( "SetTriggering().Response.AddDiagnosticInfos was returned. No DiagnosticInfos were expected" );
        result = false;
    }
    if( Response.RemoveDiagnosticInfos.length !== 0 ) {
        addError( "SetTriggering().Response.RemoveDiagnosticInfos was returned. No DiagnosticInfos were expected" );
        result = false;
    }
    // check add results
    if( Response.AddResults.length !== Request.LinksToAdd.length ) {
        addError( "The number of SetTriggering().Response.AddResults (" + Request.LinksToAdd.length + ") does not match the number of SetTriggering.Request.LinksToAdd (" + Response.AddResults.length + ")." );
        result = false;
    }
    else {
        // check each result
        for( var i=0; i<Response.AddResults.length; i++ ) {
            // status code
            if( Response.AddResults[i].isNotGood() ) {
                addError( "SetTriggering().Response.AddResults[" + i + "] is not good: " + Response.AddResults[i], Response.AddResults[i] );
                result = false;
            }
        }
    }
    // check remove results 
    if( Response.RemoveResults.length !== Request.LinksToRemove.length ) {
        addError( "The number of SetTriggering().Response.RemoveResults (" + Response.RemoveResults.length + ") does not match the number of LinksToRemove (" + Request.LinksToRemove.length + ")." );
        result = false;
    }
    else {        
        // check each result
        for( var i=0; i<Response.RemoveResults.length; i++ ) {
            // status code
            if( Response.RemoveResults[i].isNotGood() ) {
                addError( "SetTriggering().Response.RemoveResults[" + i + "] is not good: " + Response.RemoveResults[i], Response.RemoveResults[i] );
                result = false;
            }
        }
    }
    // check diagnostic infos for add and remove
    // no error is expected so the DiagnosticInfos should be empty
    if( Response.AddDiagnosticInfos.length !== 0 ) {
        addError( "SetTriggering().Response.AddDiagnosticInfos are not empty:" + Response.AddDiagnosticInfos );
        result = false;
    }
    if( Response.RemoveDiagnosticInfos.length !== 0 ) {
        addError( "SetTriggering().Response.RemoveDiagnosticInfos are not empty: " + Response.RemoveDiagnosticInfos );
        result = false;
    }
    return( result );
}





// the service is expected to succeed
// one, some or all operations are expected to fail
// This function checks if the server returned the expected error codes
// Request is of Type UaModifyMonitoredItemsRequest
// Response is of Type UaModifyMonitoredItemsResponse
// ExpectedOperationResultsArray is an array ExpectedAndAcceptedResult (defined in Base/objects.js)
function checkSetTriggeringError( Request, Response, ExpectedOperationResultsAdd, ExpectedOperationResultsRemove, suppressMessaging ) {
    // check service result
    if( Response.ResponseHeader.ServiceResult.StatusCode === StatusCode.BadNotImplemented || Response.ResponseHeader.ServiceResult.StatusCode === StatusCode.BadServiceUnsupported ) {
        addNotSupported( "SetTriggering" );
        if( Response.ResponseHeader.ServiceResult.StatusCode === StatusCode.BadServiceUnsupported ) addError( "SetTriggering is a required Service. Verify if this Conformance Unit should be selected for testing." );
        if( Response.ResponseHeader.ServiceResult.StatusCode === StatusCode.BadNotImplemented ) addError( "SetTriggering is a required Service. Verify if this Conformance Unit should be selected for testing. In addition the server provided a wrong StatusCode. Expected: StatusCode.BadServiceUnsupported, Received: StatusCOde.BadNotImplemented" );
        return( false );
    }
    // ExpectedOperationResultsAdd and ExpectedOperationResultsRemove needs to have the correct size
    if( Request.LinksToAdd.length > 0 ) {
        if( ExpectedOperationResultsAdd.length !== Request.LinksToAdd.length ) {
            addError( "function checkSetTriggeringError(): ExpectedOperationResultsAdd[] must have the same size as Request.LinksToAdd[]" );
            return( false );
        }
    }
    if( Request.LinksToRemove.length > 0 ) {
        if( ExpectedOperationResultsRemove.length != Request.LinksToRemove.length ) {
            addError( "function checkSetTriggeringError(): ExpectedOperationResultsRemove[] must have the same size as Request.LinksToRemove[]" );
            return( false );
        }
    }
    var results = true;
    // check AddResults
    if( Response.AddResults.length !== Request.LinksToAdd.length ) {
        addError( "SetTriggering().LinksToAdd.length=" + Request.LinksToAdd.length + " AddResults.length=" + Response.AddResults.length );
        results = false;
    }
    else {
        // check each result
        for( var i=0; i<Response.AddResults.length; i++ ) {
            // StatusCode
            var bMatch = false;
            // check if result matches any of the expected status codes
            for( var j = 0; j < ExpectedOperationResultsAdd[i].ExpectedResults.length; j++ ) {
                if( Response.AddResults[i].StatusCode == ExpectedOperationResultsAdd[i].ExpectedResults[j].StatusCode ) {
                    if( !suppressMessaging ) addLog( "SetTriggering().Response.AddResults[" + i + "] = " + Response.AddResults[i], Response.AddResults[i] );
                    bMatch = true;
                    break;
                }
            }
            if( !bMatch ) {
                // check if result matches any of the accepted status codes
                for( var j=0; j<ExpectedOperationResultsAdd[i].AcceptedResults.length; j++ ) {
                    if( Response.AddResults[i].StatusCode == ExpectedOperationResultsAdd[i].AcceptedResults[j].StatusCode ) {
                        bMatch = true;
                        break;
                    }
                }
                if( bMatch ) {
                    addWarning( "SetTriggering().Response.AddResults[" + i + "] = " + Response.AddResults[i] + " but " + ExpectedOperationResultsAdd[i].ExpectedResults[0] + " was expected", Response.AddResults[i] );
                }
                else {
                    addError( "SetTriggering().Response.AddResults[" + i + "] = " + Response.AddResults[i] + " but " + ExpectedOperationResultsAdd[i].ExpectedResults[0] + " was expected", Response.AddResults[i] );
                    results = false;
                }
            }
        }//for i...
        // check the ADD diagnositcinfo
        Assert.Equal( 0, Response.AddDiagnosticInfos.length, "SetTriggeringResponse.DiagnosticInfos was returned. No DiagnosticInfos were expected" );
    }
    // check RemoveResults
    if( Response.RemoveResults.length !== Request.LinksToRemove.length ) {
        addError( "The number of SetTriggering().Response.RemoveResults (" + Response.LinksToRemove +  ") does not match the number of SetTriggering().Request.LinksToRemove (" + Request.LinksToRemove.length + ")." );
        results = false;
    }
    else {   
        // check each result
        for( var i=0; i<Response.RemoveResults.length; i++ ) {
            var bMatch = false;
            // check if result matches any of the expected status codes
            for( var j=0; j<ExpectedOperationResultsRemove[i].ExpectedResults.length; j++ ) {
                if( Response.RemoveResults[i].StatusCode == ExpectedOperationResultsRemove[i].ExpectedResults[j].StatusCode ) {
                    if( !suppressMessaging ) addLog( "SetTriggering().Response.RemoveResults[" + i + "] = " + Response.RemoveResults[i], Response.RemoveResults[i] );
                    bMatch = true;
                    break;
                }
            }
            if( !bMatch ) {
                // check if result matches any of the accepted status codes
                for( var j=0; j<ExpectedOperationResultsRemove[i].AcceptedResults.length; j++ ) {
                    if( Response.RemoveResults[i].StatusCode == ExpectedOperationResultsRemove[i].AcceptedResults[j].StatusCode ) {
                        bMatch = true;
                        break;
                    }
                }
                if( bMatch ) addWarning( "SetTriggering().Response.RemoveResults[" + i + "] = " + Response.RemoveResults[i] + " but " + ExpectedOperationResultsRemove[i].ExpectedResults[0] + " was expected", Response.RemoveResults[i] );
                else {
                    addError( "SetTriggering().Response.RemoveResults[" + i + "] = " + Response.RemoveResults[i] + " but " + ExpectedOperationResultsRemove[i].ExpectedResults[0] + " was expected", Response.RemoveResults[i] );
                    results = false;
                }
            }// for j...
            // check the REMOVE diagnosticinfo
            Assert.Equal( 0, Response.RemoveDiagnosticInfos.length, "SetTriggering().Response.DiagnosticInfos was returned. No DiagnosticInfos were expected" );
        }
    }
    return( results );
}