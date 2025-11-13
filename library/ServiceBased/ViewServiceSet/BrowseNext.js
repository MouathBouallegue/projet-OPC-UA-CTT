/*  BrowseNext Service call helper object. This object is intended to reduce the level of scripting required for testing
    of the BrowseNext service to just 1 line of code.
    Test code at the bottom of this file demonstrates the use of this class.

    Properties:
        - session:    A live UA Session that will be used to invoke the Browse service call.
        - request:    The current (last used) BrowseNextRequest object.
        - response:   The current (last received) BrowseNextResponse object.

    Methods: 
        - Execute:         Invokes the BrowseNext service call.
        - ResultsToString: Returns the BrowseNext response details in a string. */

function BrowseNextService( args ) {
    this.Name = "BrowseNext";
    this.Session  = null;
    this.Request  = null;
    this.Response = null;
    this.UaStatus = null;

    if( !isDefined( args ) ) { throw( "Invalid use of the BrowseNext helper method. Arguments must be specified when instanciating this class helper." ); }
    if( !isDefined( args.Session ) ) throw( this.Name + " CTOR failed; session not specified." );
    else this.Session = args.Session;

    /**
     * Execute method - Calls the ExecuteExt method with the given arguments either once or
     * split up into multiple calls if needed, depending on the OperationLimits of the server
     * 
     * @param {object} args An object containing all parameter
     * @param {UaByteString[]} args.ContinuationPoints - A list of Server-defined opaque values that represent continuation points.
     * @param {boolean} args.ReleaseContinuationPoints - (Optional) Release continuationPoints? (default=false)
     * @param {ExpectedAndAcceptedResults} args.ServiceResult - (Optional) An ExpectedAndAcceptedResults object.
     * @param {ExpectedAndAcceptedResults[]} args.OperationResults - (Optional) An array of ExpectedAndAcceptedResults objects.
     * @param {boolean} args.SuppressMessaging - Do not log messages
     * @param {boolean} args.SuppressErrors - Do not log errors
     * @param {function} args.PreHook - (Optional) Function to invoke immediately before the Service call
     * @param {function} args.PostHook - (Optional) Function to invoke immediately after the Server call
     * @param {boolean} args.ProhibitSplitting - (Optional) Forces operations to be executed in one call
     *
     * @returns {boolean} True if call was successful, false otherwise
     */
    this.Execute = function (args) {
        if (!isDefined(args.ProhibitSplitting)) args.ProhibitSplitting = false;
        if( !isDefined( args ) ) throw( "BrowseNext::Execute() args not specified." );
        if( isDefined( args.ContinuationPoints ) && !isDefined( args.ContinuationPoints.length ) ) args.ContinuationPoints = [ args.ContinuationPoints ];
        if( !isDefined( args.ReleaseContinuationPoints ) ) args.ReleaseContinuationPoints = false;
        var result = true;
        var MaxNodesPerBrowse = 65535;
        var NumberOfAlreadyProcessedValues = 0;
        var AllContinuationPoints = args.ContinuationPoints;

        if (isDefined(args.OperationResults) && isDefined(args.OperationResults.length))   var AllOperationResults = args.OperationResults;
        if (gServerCapabilities.OperationLimits !== null && gServerCapabilities.OperationLimits !== undefined) {
            if (gServerCapabilities.OperationLimits.MaxNodesPerBrowse != 0) MaxNodesPerBrowse = gServerCapabilities.OperationLimits.MaxNodesPerBrowse;
        }
        if( args.ContinuationPoints !== undefined && args.ContinuationPoints !== null ) {
            if ((MaxNodesPerBrowse < args.ContinuationPoints.length) && (args.ProhibitSplitting == false)) {
                if( isDefined( args.PreHook ) ) args.PreHook();
                args.SkipHooks = true;
                addLog("=== BrowseNext.Execute > Exceeding the limit MaxNodesPerBrowse on the server, splitting the BrowseNext into multiple Requests.");
                // temporary variables to collect and reassemble the split requests and responses
                var tempContinuationPoints = new UaByteStrings();
                var tempResults = new UaBrowseResults();
                while (NumberOfAlreadyProcessedValues < AllContinuationPoints.length) {
                    var innerResult = true;
                    var currentListOfContinuationPoints = [];
                    var currentListOfOperationResults = [];
                    for (var i = 0; (i < MaxNodesPerBrowse) && (AllContinuationPoints.length > NumberOfAlreadyProcessedValues + i); i++) {
                        currentListOfContinuationPoints.push(AllContinuationPoints[NumberOfAlreadyProcessedValues + i]);
                        if (isDefined(args.OperationResults) && isDefined(args.OperationResults.length))   currentListOfOperationResults.push(AllOperationResults[NumberOfAlreadyProcessedValues + i]);
                    }
                    if (currentListOfContinuationPoints.length == 0) break;
                    args.ContinuationPoints = currentListOfContinuationPoints;
                    if (isDefined(args.OperationResults) && isDefined(args.OperationResults.length)) args.OperationResults = currentListOfOperationResults;
                    innerResult = this.ExecuteExt(args);
                    result = result && innerResult ? true : false;  // validation failed, so override *this* result
                    NumberOfAlreadyProcessedValues += currentListOfContinuationPoints.length;
                    // append the split requests ContinuationPoints and the responses Results to a temporary variable
                    var tempContinuationPointsLength = tempContinuationPoints.length;
                    var tempResultsLength = tempResults.length;
                    for( var i=0; i < this.Request.ContinuationPoints.length; i++ ) tempContinuationPoints[tempContinuationPointsLength+i] = this.Request.ContinuationPoints[i].clone();
                    for( var i=0; i < this.Response.Results.length; i++ ) tempResults[tempResultsLength+i] = this.Response.Results[i].clone();
                }
                // set the reassembled requests ContinuationPoints and responses Results
                this.Request.ContinuationPoints = new UaByteStrings(tempContinuationPoints.length);
                this.Response.Results = new UaBrowseResults(tempResults.length);
                for( var i=0; i < tempContinuationPoints.length; i++ ) this.Request.ContinuationPoints[i] = tempContinuationPoints[i].clone();
                for( var i=0; i < tempResults.length; i++ ) this.Response.Results[i] = tempResults[i].clone();
                
                CheckResourceError();
                if( isDefined( args.PostHook ) ) args.PostHook();
                CheckUserStop();
            }
            else {
                return (this.ExecuteExt(args));
            }
        }
        else { // if args.ContinuationPoints is empty call ExecuteExt() (create the request/response objects)
            return (this.ExecuteExt(args));
        }
        return (result);
    }
    
    /**
     * Invokes the call to BrowseNext.
     * 
     * @param {object} args An object containing all parameter
     * @param {UaByteString[]} args.ContinuationPoints - A list of Server-defined opaque values that represent continuation points.
     * @param {boolean} args.ReleaseContinuationPoints - (Optional) Release continuationPoints? (default=false)
     * @param {ExpectedAndAcceptedResults} args.ServiceResult - (Optional) An ExpectedAndAcceptedResults object.
     * @param {ExpectedAndAcceptedResults[]} args.OperationResults - (Optional) An array of ExpectedAndAcceptedResults objects.
     * @param {boolean} args.SuppressMessaging - Do not log messages
     * @param {boolean} args.SuppressErrors - Do not log errors
     * @param {function} args.PreHook - (Optional) Function to invoke immediately before the Service call
     * @param {function} args.PostHook - (Optional) Function to invoke immediately after the Server call
     *
     * @returns {boolean} True if call was successful, false otherwise
     */
    //this.ExecuteExt = function( continuationPoints, releaseCPs, expectedErrors, expectErrorNotFail  )
    this.ExecuteExt = function( args ) {
        // parameter check
        if( !isDefined( args ) ) throw( "BrowseNext::Execute() args not specified." );
        if( isDefined( args.ContinuationPoints ) && !isDefined( args.ContinuationPoints.length ) ) args.ContinuationPoints = [ args.ContinuationPoints ];
        if( !isDefined( args.ReleaseContinuationPoints ) ) args.ReleaseContinuationPoints = false;

        // create the request/response objects
        this.Request = new UaBrowseNextRequest();
        this.Response = new UaBrowseNextResponse();
        var session = isDefined( this.Session.Session )? this.Session.Session : this.Session;
        this.Request.RequestHeader = UaRequestHeader.New( { Session: session, ReturnDiagnostics: args.ReturnDiagnostics } );

        // populate the request header with the specified parameters
        if( args.ContinuationPoints !== undefined && args.ContinuationPoints !== null ) {
            this.Request.ReleaseContinuationPoints = args.ReleaseContinuationPoints;
            // now loop through all nodes to browse and build UaBrowseDescription objects
            for( var n=0; n<args.ContinuationPoints.length; n++ ) {
                this.Request.ContinuationPoints[n] = args.ContinuationPoints[n].ContinuationPoint;
            }

            // update the timestamp in the RequestHeader before sending it out
            this.Request.RequestHeader.Timestamp = UaDateTime.utcNow();

            // now to invoke Browse 
            if( isDefined( args.PreHook ) && ( !isDefined( args.SkipHooks ) || !args.SkipHooks ) ) args.PreHook();
            this.UaStatus = session.browseNext( this.Request, this.Response );
            CheckResourceError();
            if( isDefined( args.PostHook ) && ( !isDefined( args.SkipHooks ) || !args.SkipHooks ) ) args.PostHook();
            CheckUserStop();
            // now to check the results
            var result = false;
            if( this.UaStatus.isGood() ) {
                result = UaResponseHeader.IsValid( { Service: this, ServiceResult: args.ServiceResult, SuppressMessaging: args.SuppressMessaging, SuppressErrors: args.SuppressErrors, ServiceInfo: "ContinuationPoints #" + this.Request.ContinuationPoints.length + "; ReleaseContinuationPoints: " + this.Request.ReleaseContinuationPoints } );
                if( result ) {
                    if( isDefined( args.OperationResults ) ) result = checkBrowseNextError( this.Request, this.Response, args.OperationResults );
                    else result = checkBrowseNextValidParameter( this.Request, this.Response );
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

            // now to record any continuationPoints into the monitoredItem objects
            if( this.UaStatus.isGood() ) {
                for( i=0; i<this.Response.Results.length; i++ ) {
                    args.ContinuationPoints[i].ContinuationPoint = this.Response.Results[i].ContinuationPoint;
                }//for i
            }

            return( result );
        }
    }//ExecuteExt
    
    this.ResultsToString = function() {
        var s = "BrowseNext Response:\n\tDiagnosticInfos:";
        // get the diags
        if( this.Response.DiagnosticInfos.length > 0 ) {
            for( var d=0; d<this.Response.DiagnosticInfos.length; d++ ) {
                s += "\n\t\t" + this.Response.DiagnosticInfos[d].toString();
            }//for s...
        }
        else {
            s += "\n\t\tNone.";
        }
        // get the results
        s += "\n\tResults:";
        if( this.Response.Results.length > 0 ) {
            var currResult;
            // loop thru each result
            for( var r=0; r<this.Response.Results.length; r++ ) {
                currResult = this.Response.Results[r]
                s += "\n\t[" + r + "] Status: " + currResult.StatusCode.toString() +
                    "; ContinuationPoint: " + currResult.ContinuationPoint.toString() +
                    "; References: " + currResult.References.length;
                // loop thru all references 
                var currRef;
                for( var f=0; f<currResult.References.length; f++ ) {
                    currRef = currResult.References[f];
                    s += "\n\t\t[" + f + "] BrowseName: " + currRef.BrowseName.Name +
                        "; IsForward: " + currRef.IsForward +
                        "; NodeClass: " +  NodeClass.toString( currRef.NodeClass ) +
                        "; NodeId: " + currRef.NodeId.toString() +
                        "; ReferenceType: " + currRef.ReferenceTypeId;
                }//for f
            }//for r...
        }
        else {
            s+= "\n\t\tNone."
        }
        return( s );
    }

}// BrowseNext


// the service is expected to succeed
// all operations are expected to succeed
function checkBrowseNextValidParameter( Request, Response ) {
    var bSucceeded = true;
    // check in parameters
    if( arguments.length != 2 ) {
        addError( "function checkBrowseNextValidParameter(): Number of arguments must be 2!" );
        return false;
    }
    // as this is a valid parameter test we don't expect any diagnositcinfo        
    if( Response.DiagnosticInfos.length !== 0 ) {
        addError( "BrowseNextResponse.DiagnosticInfos was returned. No DiagnosticInfos were expected" );
        bSucceeded = false;
    }    
    // check number of results
    if( Response.Results.length !== Request.ContinuationPoints.length ) {
        addError( "The number of results does not match the number of ContinuationPoints." );
        addError( "ContinuationPoints.length = " + Request.ContinuationPoints.length + "; Results.length = " + Response.Results.length );
        bSucceeded = false;
    }
    else { 
        // check each result
        for( var i=0; i<Response.Results.length; i++ ) {
            var browseResult = Response.Results[i];
            // status code
            if( browseResult.StatusCode.isNotGood() ) {
                addError( "Results[" + i + "].StatusCode expected 'Good' but received '" + browseResult.StatusCode + "'.", browseResult.StatusCode );
                bSucceeded = false;
                continue;
            }
            // check for ReleaseContinuationPoints
            if( Request.ReleaseContinuationPoints === true ) {
                if( !browseResult.ContinuationPoint.isEmpty() ) {
                    addError( "Request.ReleaseContinuationPoints = true but Results[" + i + "].ContinuationPoint is not empty. " );
                    bSucceeded = false;
                    continue;
                }
                if( browseResult.References.length !== 0 ) {
                    addError( "Request.ReleaseContinuationPoints = true but Results[" + i + "].References.length = " + browseResult.References.length );
                    bSucceeded = false;
                    continue;
                }
            }
            // check references node ids
            for( var r=0; r<Response.Results[i].References.length; r++ ) { // iterate thru all references 
                if( !Assert.False( UaQualifiedName.IsEmpty( Response.Results[i].References[r].BrowseName ), "BrowseName cannot be empty." ) ) result = false;
                if( !Assert.True( UaNodeId.Validate( Response.Results[i].References[r].NodeId.NodeId ), "NodeId is not valid." ) ) result = false;
                if( !Assert.True( UaNodeId.Validate( Response.Results[i].References[r].TypeDefinition.NodeId ), "TypeDefinition is not valid." ) ) result = false;
            }
        }
    }

    return bSucceeded;
}




// the service is expected to succeed
// one, some or all operations are expected to fail
// This function checks if the server returned the expected error codes
// Request is of Type UaBrowseNextRequest
// Response is of Type UaBrowseNextResponse
// ExpectedOperationResultsArray is an array ExpectedAndAcceptedResult (defined in Base/Objects/expectedResults.js)
function checkBrowseNextError( request, response, expectedOperationResultsArray )
{
    // check in parameters
    if( arguments.length !== checkBrowseNextError.length )
    {
        addError( "function checkBrowseNextError(): Number of arguments must be " + checkBrowseNextError.length );
        return( false );
    }
    
    // ExpectedOperationResultsArray needs to have the correct size
    if( expectedOperationResultsArray.length !== request.ContinuationPoints.length )
    {
        addError( "checkBrowseNextError: ExpectedOperationResultsArray[] must have the same size as Request.ContinuationPoints[]" );
        return( false );
    }  
    // check results        
    // check number of results
    if( response.Results.length !== request.ContinuationPoints.length )
    {
        addError( "The number of results does not match the number of ContinuationPoints." );
        addError( "ContinuationPoints.length=" + request.ContinuationPoints.length + "; Results.length=" + response.Results.length );
    }
    else
    {        
        // check each result
        for( var i=0; i<response.Results.length; i++ )
        {
            var browseResult = response.Results[i];
            // check if result matches any of the expected status code
            Assert.StatusCodeIsOneOf( expectedOperationResultsArray[i], browseResult.StatusCode, "Response.Results[" + i + "].StatusCode" );
            // check for ReleaseContinuationPoints
            if( request.ReleaseContinuationPoints === true )
            {
                if( !browseResult.ContinuationPoint.isEmpty() )
                {
                    addError( "Request.ReleaseContinuationPoints = true but Results[" + i + "].ContinuationPoint is not empty. " );
                    continue;
                }
                if( browseResult.References.length !== 0 )
                {
                    addError( "Request.ReleaseContinuationPoints = true but Results[" + i + "].References.length = " + browseResult.References.length );
                    continue;
                }
            }
        }
    }    
}