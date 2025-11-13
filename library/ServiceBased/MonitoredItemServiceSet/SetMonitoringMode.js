/*  This object is responsible for calling and processing calls to the SetMonitoringMode() Service.
    Object definition
        Properties:
            Session      - a reference to the Session object.
            Request      - request header used in the call
            Response     - response header received from the server
            UaStatus     - result of last call invocation
        Methods:
            Execute      - invokes the call to Publish() */

function SetMonitoringModeService( args ) {
    // objects used by this class
    this.Name = "SetMonitoringMode";
    this.Session = null;
    this.Request = null;
    this.Response = null;
    this.UaStatus = null;

    if( !isDefined( args ) ) throw( this.Name + " CTOR, arguments not specified." );
    if( !isDefined( args.Session ) ) throw( this.Name + " CTOR, session not specified." );
    else this.Session = args.Session;
    
    /**
     * Invokes the SetMonitoringMode call.
     * 
     * @param {object} args An object containing all parameter
     * @param {Number} args.MonitoringMode - 'monitoringMode' enumerator.
     * @param {MonitoredItem[]} args.MonitoredItemIds - An array of 'MonitoredItem' objects to read.
     * @param {Subscription} args.SubscriptionId - Subscription object.
     * @param {ExpectedAndAcceptedResults} args.ServiceResult - (Optional) An ExpectedAndAcceptedResults object.
     * @param {ExpectedAndAcceptedResults[]} args.OperationResults - (Optional) An array of ExpectedAndAcceptedResults objects.
     * @param {boolean} args.SuppressMessaging - (Optional) Do not log messages
     * @param {boolean} args.SuppressWarnings - (Optional) Do not log warnings
     * @param {function} args.PreHook - (Optional) Function to invoke immediately before the Service call
     * @param {function} args.PostHook - (Optional) Function to invoke immediately after the Server call
     *
     * @returns {boolean} True if call was successful, false otherwise
     */          
    this.Execute = function (args) {
        if( !isDefined( args.ProhibitSplitting ) ) args.ProhibitSplitting = false;        
        if( !isDefined( args ) )throw( "SetMonitoringMode::Execute() no args specified." );
        if( !isDefined( args.MonitoringMode ) ) throw( "SetMonitoringMode::Execute() MonitoringMode not specified." );
        if( !isDefined( args.MonitoredItemIds ) ) args.MonitoredItemIds = [];
        if( !isDefined( args.MonitoredItemIds.length ) ) args.MonitoredItemIds = [ args.MonitoredItemIds ];
        if( !isDefined( args.SubscriptionId ) ) throw( "SetMonitoringMode::Execute() SubscriptionId not specified." );
        if( !isDefined( args.SuppressMessaging ) ) args.SuppressMessaging = false;
        if( isDefined ( args.OperationResults ) && !isDefined( args.OperationResults.length ) ) args.OperationResults = [ args.OperationResults ];

        var result = true;
        var MaxMonitoredItemsPerCall = 65535;
        var NumberOfAlreadySetItems = 0;
        var AllItemsToSet = args.MonitoredItemIds;

        if (isDefined(args.OperationResults) && isDefined(args.OperationResults.length))   var AllOperationResults = args.OperationResults;
        if (gServerCapabilities.OperationLimits !== null && gServerCapabilities.OperationLimits !== undefined) {
            if (gServerCapabilities.OperationLimits.MaxMonitoredItemsPerCall != 0) MaxMonitoredItemsPerCall = gServerCapabilities.OperationLimits.MaxMonitoredItemsPerCall;
        }
        if ((MaxMonitoredItemsPerCall < args.MonitoredItemIds.length) && (args.ProhibitSplitting == false)) {
            if( isDefined( args.PreHook ) ) args.PreHook();
            args.SkipHooks = true;
            addLog("=== SetMonitoringMode.Execute > Exceeding the limit MaxMonitoredItemsPerCall on the server, splitting the ModifyMonitoredItems into multiple Requests.");
            // temporary variables to collect and reassemble the split requests and responses
            var tempMonitoredItemIds = new UaUInt32s();
            var tempResults = new UaStatusCodes();
            while (NumberOfAlreadySetItems < AllItemsToSet.length) {
                var innerResult = true;
                var currentListOfNodes = [];
                var currentListOfOperationResults = [];
                for (var i = 0; (i < MaxMonitoredItemsPerCall) && (AllItemsToSet.length > NumberOfAlreadySetItems + i); i++) {
                    currentListOfNodes.push(AllItemsToSet[NumberOfAlreadySetItems + i]);
                    if (isDefined(args.OperationResults) && isDefined(args.OperationResults.length))   currentListOfOperationResults.push(AllOperationResults[NumberOfAlreadySetItems + i]);
                }
                if (currentListOfNodes.length == 0) break;
                args.MonitoredItemIds = currentListOfNodes;
                if (isDefined(args.OperationResults) && isDefined(args.OperationResults.length)) args.OperationResults = currentListOfOperationResults;
                innerResult = this.ExecuteExt(args);
                result = result && innerResult ? true : false;  // validation failed, so override *this* result
                NumberOfAlreadySetItems += currentListOfNodes.length;
                // append the split requests MonitoredItemIds and the responses Results to a temporary variable
                var tempMonitoredItemIdsLength = tempMonitoredItemIds.length;
                var tempResultsLength = tempResults.length;
                for( var i=0; i < this.Request.MonitoredItemIds.length; i++ ) tempMonitoredItemIds[tempMonitoredItemIdsLength+i] = this.Request.MonitoredItemIds[i];
                for( var i=0; i < this.Response.Results.length; i++ ) tempResults[tempResultsLength+i] = this.Response.Results[i].clone();
            }
            // set the reassembled requests MonitoredItemIds and responses Results
            this.Request.MonitoredItemIds = new UaUInt32s(tempMonitoredItemIds.length);
            this.Response.Results = new UaStatusCodes(tempResults.length);
            for( var i=0; i < tempMonitoredItemIds.length; i++ ) this.Request.MonitoredItemIds[i] = tempMonitoredItemIds[i];
            for( var i=0; i < tempResults.length; i++ ) this.Response.Results[i] = tempResults[i].clone();
            
            CheckResourceError();
            if( isDefined( args.PostHook ) ) args.PostHook();
            CheckUserStop();
        }
        else {
            return (this.ExecuteExt(args));
        }
        return (result);
    }

    /* invokes the SetMonitoringMode() call.
           Parameters:
               MonitoringMode - 'monitoringMode' enumerator.
               MonitoredItemIds - array of 'monitoredItem' objects.
               SubscriptionId - 'subscription' object.
               ServiceResult - 
               OperationResults - 
               SuppressMessaging - true/false; show/hide messages
    */
    this.ExecuteExt = function( args ) {
        if( !isDefined( args ) )throw( "SetMonitoringMode::Execute() no args specified." );
        if( !isDefined( args.MonitoringMode ) ) throw( "SetMonitoringMode::Execute() MonitoringMode not specified." );
        if( !isDefined( args.MonitoredItemIds ) ) args.MonitoredItemIds = [];
        if( !isDefined( args.MonitoredItemIds.length ) ) args.MonitoredItemIds = [ args.MonitoredItemIds ];
        if( !isDefined( args.SubscriptionId ) ) throw( "SetMonitoringMode::Execute() SubscriptionId not specified." );
        if( !isDefined( args.SuppressMessaging ) ) args.SuppressMessaging = false;
        if( isDefined ( args.OperationResults ) && !isDefined( args.OperationResults.length ) ) args.OperationResults = [ args.OperationResults ];

        // register that this service is tested
        ServiceRegister.Register( { Service: ServiceRegister.UaService( { Name: this.Name, Available: true, Tested: true } ) } );

        this.Request = new UaSetMonitoringModeRequest();
        var session = isDefined( this.Session.Session )? this.Session.Session : this.Session;
        this.Request.RequestHeader = UaRequestHeader.New( { Session: session, ReturnDiagnostics: args.ReturnDiagnostics } );
        this.Request.MonitoringMode = args.MonitoringMode;
        this.Request.SubscriptionId = args.SubscriptionId.SubscriptionId;
        this.Response = new UaSetMonitoringModeResponse();

        var ids = [];
        for( var m=0; m<args.MonitoredItemIds.length; m++ ) { // 'm' for MonitoredItem 
            this.Request.MonitoredItemIds[m] = args.MonitoredItemIds[m].MonitoredItemId;
            ids.push( args.MonitoredItemIds[m].MonitoredItemId );
        }

        var result; // function return

        // update the timestamp in the RequestHeader before sending it out
        this.Request.RequestHeader.Timestamp = UaDateTime.utcNow();

        // now to invoke the call
        if( isDefined( args.PreHook ) && ( !isDefined( args.SkipHooks ) || !args.SkipHooks ) ) args.PreHook();
        this.UaStatus = session.setMonitoringMode( this.Request, this.Response );
        CheckResourceError();
        if( isDefined( args.PostHook ) && ( !isDefined( args.SkipHooks ) || !args.SkipHooks ) ) args.PostHook();
        CheckUserStop();
        if( this.UaStatus.isGood() ) {
            result = UaResponseHeader.IsValid( { Service: this, ServiceResult: args.ServiceResult, SuppressMessaging: args.SuppressMessaging, SuppressErrors: args.SuppressErrors, ServiceInfo: "SubscriptionId: " + this.Request.SubscriptionId + "; MonitoringMode: " + this.Request.MonitoringMode + "; MonitoredItemIds #" + this.Request.MonitoredItemIds.length } );
            if( result ) {
                if( isDefined( args.OperationResults ) ) result = checkSetMonitoringModeError( this.Request, this.Response, args.OperationResults, args.SuppressMessaging );
                else if( !isDefined( args.ServiceResult ) ) result = checkSetMonitoringModeValidParameter( this.Request, this.Response, args.SuppressMessaging );
            }
            else {
                // check to make sure other parameters are not specified whenever there is a Bad service result. See UA Part 4 7.30 ServiceFault.
                Assert.Equal( 0, this.Response.Results.length, this.Name + ".Response.Results are not needed when a ServiceFault is returned." );
            }
        }
        else {
            Assert.StatusCodeIsOneOf( args.ServiceResult, this.UaStatus, this.Name + " the ErrorCode in the Error Message received doesn't match the expectation." );
            result = false;
        }

        // if the call failed then register that 
        if( !result ) ServiceRegister.SetFailed( { Name: this.Name } )
        return( result );
    }
}

// the service is expected to succeed
// one, some or all operations are expected to fail
// This function checks if the server returned the expected error codes
// Request is of Type UaModifyMonitoredItemsRequest
// Response is of Type UaModifyMonitoredItemsResponse
// ExpectedOperationResultsArray is an array ExpectedAndAcceptedResult (defined in Base/objects.js)
function checkSetMonitoringModeError( Request, Response, ExpectedOperationResultsArray, suppressMessaging ) {
    var result = true;
    // ExpectedOperationResultsArray needs to have the correct size
    if( ExpectedOperationResultsArray.length != Request.MonitoredItemIds.length ) {
        addError( "function checkSetMonitoringModeError(): ExpectedOperationResultsArray[] must have the same size as Request.MonitoredItemIds[]. Expected: " + ExpectedOperationResultsArray.length + ", but received: " + Request.MonitoredItemIds.length );
        return false;
    }  
    // check number of results
    if( Response.Results.length !== Request.MonitoredItemIds.length ) {
        addError( "The number of results does not match the number of MonitoredItemIds." );
        addError( "SetMonitoringMode().Results.length (" + Response.Results.length + ") does not match the SetMonitoringMode().Request.MonitoredItemIds.length (" + Response.Results.length + ")." );
        result = false;
    }
    else {
        // check each result
        for( var i=0; i<Response.Results.length; i++ ) {
            // StatusCode
            var bMatch = false;
            // check if result matches any of the expected status codes
            for( var j=0; j<ExpectedOperationResultsArray[i].ExpectedResults.length; j++ ) {
                if( Response.Results[i].StatusCode == ExpectedOperationResultsArray[i].ExpectedResults[j].StatusCode ) {
                    if( !suppressMessaging ) print( "\tSetMonitoringMode().Response.Results[" + i + "] = " + Response.Results[i], Response.Results[i] );
                    bMatch = true;
                    break;
                }
            }
            if( !bMatch ) {
                // check if result matches any of the accepted status codes
                for( var j=0; j<ExpectedOperationResultsArray[i].AcceptedResults.length; j++ ) {
                    if( Response.Results[i].StatusCode == ExpectedOperationResultsArray[i].AcceptedResults[j].StatusCode ) {
                        bMatch = true;
                        break;
                    }
                }
                if( bMatch && !suppressMessaging ) addWarning( "SetMonitoringMode().Response.Results[" + i + "] = " + Response.Results[i] + " but " + ExpectedOperationResultsArray[i].ExpectedResults[0] + " was expected", Response.Results[i] );
                else {
                    addError( "SetMonitoringMode().Response.Results[" + i + "] = " + Response.Results[i] + " but " + ExpectedOperationResultsArray[i].ExpectedResults[0] + " was expected", Response.Results[i] );
                    result = false;
                }
            }
        }
    }
    return result;
}

// the service is expected to succeed all operations are expected to succeed
function checkSetMonitoringModeValidParameter( Request, Response, suppressMessaging ) {
    if( Response.ResponseHeader.ServiceResult.isBad() ) return( false ); // don't proceed if the overall call failed.
    var result = true;
    // check number of results
    if( Response.Results.length !== Request.MonitoredItemIds.length ) {
        addError( "SetMonitoringMode.Results.length (" + Response.Results.length + ") does not match the SetMonitoringMode.Request.MonitoredItemIds length( " + Request.MonitoredItemIdes.length + ")." );
        result = false;
    }
    else {
        for( var i=0; i<Response.Results.length; i++ ) { // check each result
            if( Response.Results[i].isNotGood() ) {
                addError( "SetMonitoringMode().Results[" + i + "] is not good: " + Response.Results[i], Response.Results[i] );
                result = false;
            }
        }
    }
    return( result );
}