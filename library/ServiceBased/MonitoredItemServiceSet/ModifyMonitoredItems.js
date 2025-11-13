/*  Nathan Pocock; compliance@opcfoundation.org
    This helper object simplifies the task of calling the ModifyMonitoredItems service call via the test-scripts.
        Methods:
            Execute = function( args) */

function ModifyMonitoredItemsService( args ) {
    this.Name = "ModifyMonitoredItems";
    this.Session = null;
    this.Request  = new UaModifyMonitoredItemsRequest();
    this.Response = new UaModifyMonitoredItemsResponse();
    this.uaStatus = null;

    if( !isDefined( args ) ) throw( this.Name + " CTOR, arguments not specified." );
    if( !isDefined( args.Session ) ) throw( this.Name + " CTOR, session not specified." );
    else this.Session = args.Session;

    /**
     * Invokes the call to ModifyMonitoredItems.
     * 
     * @param {object} args An object containing all parameter
     * @param {MonitoredItem[]} args.ItemsToModify - An array of MonitoredItem objects to modify.
     * @param {Subscription|Number} args.SubscriptionId - SubscriptionId as Number or Subscription
     * @param {Number} args.TimestampsToReturn - (Optional) TimestampsToReturn enum.
     * @param {ExpectedAndAcceptedResults} args.ServiceResult - (Optional) An ExpectedAndAcceptedResults object.
     * @param {ExpectedAndAcceptedResults[]} args.OperationResults - (Optional) An array of ExpectedAndAcceptedResults objects.
     * @param {boolean} args.SuppressMessaging - (Optional) Do not log messages
     * @param {boolean} args.SuppressErrors - (Optional) Do not log errors
     * @param {function} args.PreHook - (Optional) Function to invoke immediately before the Service call
     * @param {function} args.PostHook - (Optional) Function to invoke immediately after the Server call
     * @param {boolean} args.ProhibitSplitting - (Optional) Forces operations to be executed in one call (if MaxItemsPerCall is not set)
     *
     * @returns {boolean} True if call was successful, false otherwise
     */        
    this.Execute = function (args) {
        if( !isDefined( args.ProhibitSplitting ) ) args.ProhibitSplitting = false;
        if( !isDefined( args ) ) throw ("ModifyMonitoredItems.js::Execute() args not specified.");
        if( !isDefined( args.SubscriptionId ) )throw( "ModifyMonitoredItems.js::Execute() SubscriptionId not specified." );
        if( isDefined( args.ExpectError ) ) throw( "ModifyMonitoredItems.js::Execute() ExpectError deprecated." );
        if( !isDefined( args.ItemsToModify ) ) args.ItemsToModify = [];
        if( !isDefined( args.TimestampsToReturn ) ) args.TimestampsToReturn = TimestampsToReturn.Both;
        if( args.ItemsToModify.length == undefined ) args.ItemsToModify = [ args.ItemsToModify ];
        if( isDefined( args.OperationResults ) && !isDefined( args.OperationResults.length ) ) args.OperationResults = [ args.OperationResults ];
        if( !isDefined( args.SuppressMessaging ) ) args.SuppressMessaging = false;
        if( !args.SuppressMessaging ) print( "ModifyMonitoredItems (helper). Items to modify: " + args.ItemsToModify.length + 
                "\n\t\tSubscriptionId: " + args.SubscriptionId.SubscriptionId + 
                "\n\t\tTimestampsToReturn: " + TimestampsToReturn.toString( args.TimestampsToReturn  ) );
                
        var result = true;
        var MaxMonitoredItemsPerCall = 65535;
        var NumberOfAlreadyModifiedItems = 0;
        var AllItemsToModify = args.ItemsToModify;

        if (isDefined(args.OperationResults) && isDefined(args.OperationResults.length))   var AllOperationResults = args.OperationResults;
        if (gServerCapabilities.OperationLimits !== null && gServerCapabilities.OperationLimits !== undefined) {
            if (gServerCapabilities.OperationLimits.MaxMonitoredItemsPerCall != 0) MaxMonitoredItemsPerCall = gServerCapabilities.OperationLimits.MaxMonitoredItemsPerCall;
        }
        if ((MaxMonitoredItemsPerCall < args.ItemsToModify.length) && (args.ProhibitSplitting == false)) {
            if( isDefined( args.PreHook ) ) args.PreHook();
            args.SkipHooks = true;
            addLog("=== ModifyMonitoredItems.Execute > Exceeding the limit MaxMonitoredItemsPerCall on the server, splitting the ModifyMonitoredItems into multiple Requests.");
            // temporary variables to collect and reassemble the split requests and responses
            var tempItemsToModify = new UaMonitoredItemModifyRequests();
            var tempResults = new UaMonitoredItemModifyResults();
            while (NumberOfAlreadyModifiedItems < AllItemsToModify.length) {
                var innerResult = true;
                var currentListOfNodes = [];
                var currentListOfOperationResults = [];
                for (var i = 0; (i < MaxMonitoredItemsPerCall) && (AllItemsToModify.length > NumberOfAlreadyModifiedItems + i); i++) {
                    currentListOfNodes.push(AllItemsToModify[NumberOfAlreadyModifiedItems + i]);
                    if (isDefined(args.OperationResults) && isDefined(args.OperationResults.length))   currentListOfOperationResults.push(AllOperationResults[NumberOfAlreadyModifiedItems + i]);
                }
                if (currentListOfNodes.length == 0) break;
                args.ItemsToModify = currentListOfNodes;
                if (isDefined(args.OperationResults) && isDefined(args.OperationResults.length)) args.OperationResults = currentListOfOperationResults;
                innerResult = this.ExecuteExt(args);
                result = result && innerResult ? true : false;  // validation failed, so override *this* result
                NumberOfAlreadyModifiedItems += currentListOfNodes.length;
                // append the split requests ItemsToModify and the responses Results to a temporary variable
                var tempItemsToModifyLength = tempItemsToModify.length;
                var tempResultsLength = tempResults.length;
                for( var i=0; i < this.Request.ItemsToModify.length; i++ ) tempItemsToModify[tempItemsToModifyLength+i] = this.Request.ItemsToModify[i].clone();
                for( var i=0; i < this.Response.Results.length; i++ ) tempResults[tempResultsLength+i] = this.Response.Results[i].clone();
            }
            // set the reassembled requests ItemsToModify and responses Results
            this.Request.ItemsToModify = new UaMonitoredItemModifyRequests(tempItemsToModify.length);
            this.Response.Results = new UaMonitoredItemModifyResults(tempResults.length);
            for( var i=0; i < tempItemsToModify.length; i++ ) this.Request.ItemsToModify[i] = tempItemsToModify[i].clone();
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

    /* Executes the call to ModifyMonitoredItems.
       Parameters:
           - SubscriptionId      - Subscription object
           - ItemsToModify       - MonitoredItems objects to modify
           - TimestampsToReturn  - TimestampsToReturn
           - SubscriptionObject  - Subscription object to use
           - ExpectedResults     - Array of ExpectedAndAcceptedResults
           - ErrorNotFail        - TRUE=expect Error, FALSE=expect Fail.
       Returns:
           TRUE:  the call completed as expected. Otherwise FALSE.
    */
    this.ExecuteExt = function( args ) {
        if( !isDefined( args.SubscriptionId ) )throw( "ModifyMonitoredItems.js::Execute() SubscriptionId not specified." );
        if( isDefined( args.ExpectError ) ) throw( "ModifyMonitoredItems.js::Execute() ExpectError deprecated." );
        if( !isDefined( args.ItemsToModify ) ) args.ItemsToModify = [];
        if( !isDefined( args.TimestampsToReturn ) )args.TimestampsToReturn = TimestampsToReturn.Both;
        if( args.ItemsToModify.length == undefined ) args.ItemsToModify = [ args.ItemsToModify];
        if( isDefined( args.OperationResults ) && !isDefined( args.OperationResults.length ) ) args.OperationResults = [ args.OperationResults ];
        if( !isDefined( args.SuppressMessaging ) ) args.SuppressMessaging = false;
        if( !args.SuppressMessaging ) print( "ModifyMonitoredItems (helper). Items to modify: " + args.ItemsToModify.length + 
                "\n\t\tSubscriptionId: " + args.SubscriptionId.SubscriptionId + 
                "\n\t\tTimestampsToReturn: " + TimestampsToReturn.toString( args.TimestampsToReturn  ) );

        // register that this service is tested
        ServiceRegister.Register( { Service: ServiceRegister.UaService( { Name: this.Name, Available: true, Tested: true } ) } );

        // build the header
        this.Request  = new UaModifyMonitoredItemsRequest();
        this.Response = new UaModifyMonitoredItemsResponse();
        var session = isDefined( this.Session.Session )? this.Session.Session : this.Session;
        this.Request.RequestHeader = UaRequestHeader.New( { Session: session, ReturnDiagnostics: args.ReturnDiagnostics } );
        // specify the subscription and timestamp details
        this.Request.SubscriptionId = args.SubscriptionId.SubscriptionId;
        this.Request.TimestampsToReturn = args.TimestampsToReturn;
        // now to modify the items themselves...
        if( args.SuppressMessaging === undefined || args.SuppressMessaging == false ) print( "\tModifying items as follows:" );
        for( var i=0; i<args.ItemsToModify.length; i++ ) {
            this.Request.ItemsToModify[i].MonitoredItemId = args.ItemsToModify[i].MonitoredItemId;
            this.Request.ItemsToModify[i].RequestedParameters.ClientHandle = args.ItemsToModify[i].ClientHandle;
            this.Request.ItemsToModify[i].RequestedParameters.DiscardOldest = args.ItemsToModify[i].DiscardOldest;
            this.Request.ItemsToModify[i].RequestedParameters.QueueSize = args.ItemsToModify[i].QueueSize;
            this.Request.ItemsToModify[i].RequestedParameters.SamplingInterval = args.ItemsToModify[i].SamplingInterval;
            if( args.ItemsToModify[i].Filter !== null ) {
                this.Request.ItemsToModify[i].RequestedParameters.Filter = args.ItemsToModify[i].Filter;
            }
            if( !args.SuppressMessaging ) print( "\t\tNodeId: " + args.ItemsToModify[i].MonitoredItemId +
                    "; ClientHandle: " + args.ItemsToModify[i].ClientHandle +
                    "; MonitoringMode: " + MonitoringMode.toString( args.ItemsToModify[i].MonitoringMode ) +
                    "; DiscardOldest: " + args.ItemsToModify[i].DiscardOldest +
                    "; QueueSize:" + args.ItemsToModify[i].QueueSize +
                    "; SamplingInterval: " + args.ItemsToModify[i].SamplingInterval +
                    "; Filter: " + args.ItemsToModify[i].Filter );
        }// for i...
        // call modify
        var result = false;

        // update the timestamp in the RequestHeader before sending it out
        this.Request.RequestHeader.Timestamp = UaDateTime.utcNow();

        if( isDefined( args.PreHook ) && ( !isDefined( args.SkipHooks ) || !args.SkipHooks ) ) args.PreHook();
        this.uaStatus = session.modifyMonitoredItems( this.Request, this.Response );
        CheckResourceError();
        if( isDefined( args.PostHook ) && ( !isDefined( args.SkipHooks ) || !args.SkipHooks ) ) args.PostHook();
        CheckUserStop();
        if( this.uaStatus.isGood() ) {
            result = UaResponseHeader.IsValid( { Service: this, ServiceResult: args.ServiceResult, SuppressMessaging: args.SuppressMessaging, SuppressErrors: args.SuppressErrors, ServiceInfo: "ItemsToModify #" + this.Request.ItemsToModify.length + "; SubscriptionId: " + this.Request.SubscriptionId + "; TimestampsToReturn: " + this.Request.TimestampsToReturn } );
            if( result ) {
                if( isDefined( args.OperationResults ) ) result = checkModifyMonitoredItemsError( this.Request, this.Response, args.OperationResults );
                else result = checkModifyMonitoredItemsValidParameter( this.Request, this.Response, args.SuppressMessaging );
            }
            else {
                // check to make sure other parameters are not specified whenever there is a Bad service result. See UA Part 4 7.30 ServiceFault.
                Assert.Equal( 0, this.Response.Results.length, this.Name + ".Response.Results are not needed when a ServiceFault is returned." );
            }
        }// if Good
        else {
            Assert.StatusCodeIsOneOf( args.ServiceResult, this.UaStatus, this.Name + " the ErrorCode in the Error Message received doesn't match the expectation." );
        }
        // if the call failed then register that 
        if( !result ) ServiceRegister.SetFailed( { Name: this.Name } )
        return( result );
    } //ExecuteExt
}// function ModifyMonitoredItemsService( Session ) 



// the service is expected to succeed
// one, some or all operations are expected to fail
// This function checks if the server returned the expected error codes
// Request is of Type UaModifyMonitoredItemsRequest
// Response is of Type UaModifyMonitoredItemsResponse
// ExpectedOperationResultsArray is an array ExpectedAndAcceptedResult (defined in Base/objects.js)
function checkModifyMonitoredItemsError( Request, Response, ExpectedOperationResultsArray ) {
    // check in parameters
    if( arguments.length !== 3 ) {
        addError( "function checkModifyMonitoredItemsError(Request, Response, ExpectedOperationResultsArray): Number of arguments must be 3" );
        return( false );
    }
    // ExpectedOperationResultsArray needs to have the correct size
    if( ExpectedOperationResultsArray.length !== Request.ItemsToModify.length ) {
        addError( "function checkModifyMonitoredItemsError(): ExpectedOperationResultsArray[] must have the same size as Request.ItemsToModify[]\n\tItems Modified: " + Request.ItemsToModify.length + ", we Expected " + ExpectedOperationResultsArray.length + " errors." );
        return( false );
    }  
    var success = true;
    // check results        
    // check number of results
    if( Response.Results.length !== Request.ItemsToModify.length ) {
        addError( "ModifyMonitoredItems().ItemsToModify.length (" + Request.ItemsToModify.length + ") does not match ModifyMonitoredItems().Results.length (" + Response.Results.length + ")." );
        success = false;
    }
    else {   
        // check each result
        for( var i=0; i<Response.Results.length; i++ ) {
            // FilterResults
            // RevisedQueueSize
            // RevisedSamplingInterval
            // StatusCode
            var bMatch = false;
            // check if result matches any of the expected status codes
            for( var j=0; j<ExpectedOperationResultsArray[i].ExpectedResults.length; j++ ) {
                if( Response.Results[i].StatusCode.StatusCode == ExpectedOperationResultsArray[i].ExpectedResults[j].StatusCode ) {
                    bMatch = true;
                    break;
                }
            }
            if( !bMatch ) {
                // check if result matches any of the accepted status codes
                for( var j=0; j<ExpectedOperationResultsArray[i].AcceptedResults.length; j++ ) {
                    if( Response.Results[i].StatusCode.StatusCode == ExpectedOperationResultsArray[i].AcceptedResults[j].StatusCode ) {
                        bMatch = true;
                        break;
                    }
                }
                if( bMatch ) {
                    addWarning( "ModifyMonitoredItems().Response.Results[" + i + "].StatusCode = " + Response.Results[i].StatusCode + ", which is acceptable, but " + ExpectedOperationResultsArray[i].ExpectedResults[0] + " was expected.", Response.Results[i].StatusCode );
                }
                else {
                    var err = "ModifyMonitoredItems().Response.Results[" + i + "].StatusCode = " + Response.Results[i].StatusCode + ", but any one of the following were expected:\n\t" + ExpectedOperationResultsArray[i].ExpectedResults.toString();
                    if( ExpectedOperationResultsArray[i].AcceptedResults.length > 0 ) err +=  "\n\tand any one of the following would have been accepted:\n\t" + ExpectedOperationResultsArray[i].AcceptedResults.toString();
                    addError( err, Response.Results[i].StatusCode );
                    success = false;
                }
            }
        }
    }
    return( success );
}// function checkModifyMonitoredItemsError( Request, Response, ExpectedOperationResultsArray )



// the service is expected to succeed
// all operations are expected to succeed
function checkModifyMonitoredItemsValidParameter( Request, Response, SuppressMessaging ) {
    if( !isDefined( Request ) || !isDefined( Response ) ) throw( "ModifyMonitoredItems::checkModifyMonitoredItemsValidParameter: Request/Response not specified." );
    if( !isDefined( SuppressMessaging ) ) SuppressMessaging = false;
    if( Response.ResponseHeader.ServiceResult.isBad() ) return( false ); // no need to proceed if the overall call failed.
    var success = true;
    // check number of results
    if( Response.Results.length !== Request.ItemsToModify.length ) {
        addError( "ModifyMonitoredItems().Request.ItemsToModify.length (" + Request.ItemsToModify.length + ") differs from ModifyMonitoredItems().Results.length (" + Response.Results.length + ")." );
    }
    else {
        // check each result
        var msg = "ModifyMonitoredItems().Results:";
        var ok = 0;
        var bad = [];
        for( var i = 0; i < Response.Results.length; i++ ) {
            var currResult = Response.Results[i];
            if( currResult.StatusCode.isNotGood() ) {
                bad.push( "[" + i.toString() + "] " + currResult.StatusCode );
            }
            else ok++;
        }
        bSucceeded = ok == 0;
        if( bad.length > 0 ) {
            msg += "\n\tPassed: " + ( ok === 0 ? "None." : ok.toString() );
            msg += "\n\tFailed: " + ( bad.length === 0 ? "None." : bad.length );
            for( var b = 0; b < bad.length; b++ ) {
                msg += bad[b];
                if( b > 15 && b < bad.length - 6 ) {
                    msg += "... <truncated>...";
                    b = bad.length - 6;
                }
            }
                addError( msg );
        }
    }
    return( success );
}// function checkModifyMonitoredItemsValidParameter( Request, Response, SuppressMessaging )