/*  TranslateBrowsePathsToNodeIds Service call helper object. This object is intended
    to reduce the level of scripting required for testing to just 1 line of code.
    Test code at the bottom of this file demonstrates the use of this class.

    Properties:
        - Session:    A live UA Session that will be used to invoke the Browse service call.
        - Request:    The current (last used) BrowseRequest object.
        - Response:   The current (last received) BrowseResponse object.

    Methods: 
        - Execute:         Invokes the Browse service call.
*/

function TranslateBrowsePathsToNodeIdsService( args ) {
    this.Name = "TranslateBrowsePathsToNodeIds";
    this.Session = null;
    this.Request = null;
    this.Response = null;
    this.UaStatus = null;
    this.callCount = 0;
    
    // CTOR
    if( !isDefined( args ) ) throw( this.Name + " CTOR, arguments not specified." );
    if( !isDefined( args.Session ) ) throw( this.Name + " CTOR, session not specified." );
    else this.Session = args.Session;

    /**
     * Execute method - Calls the ExecuteExt method with the given arguments either once or
     * split up into multiple calls if needed, depending on the OperationLimits of the server<br><br>
     * 
     * Note: Use either UaBrowsePaths or BrowsePaths - do not use both!<br>
     * Note: If using BrowsePaths - then also specify Node; otherwise node is not needed
     * 
     * @param {object} args An object containing all parameter
     * @param {UaBrowsePath[]} args.UaBrowsePaths - An array of UaBrowsePath objects
     * @param {string[]} args.BrowsePaths - An array of strings, each the name of a path
     * @param {UaNodeId} args.Node - A node id to use
     * @param {ExpectedAndAcceptedResults} args.ServiceResult - (Optional) An ExpectedAndAcceptedResults object - specify when expecting a failure only!
     * @param {ExpectedAndAcceptedResults[]} args.OperationResults - (Optional) An array of ExpectedAndAcceptedResults objects.
     * @param {boolean} args.SkipValidation - (Optional) Do not validate Response (for manual validation, default=false)
     * @param {boolean} args.SuppressMessaging - (Optional) True = No output
     * @param {boolean} args.SuppressWarnings - (Optional) True = Suppress warnings
     * @param {boolean} args.SuppressErrors - (Optional) True = Suppress errors
     * @param {boolean} args.ProhibitSplitting - (Optional) Forces operations to be executed in one call
     *
     * @returns {boolean} True if call was successful, false otherwise
     */
    this.Execute = function( args ) {
        if( !isDefined( args ) ) throw( "TranslateBrowsePathsHelper.Execute argument missing." );
        if( !isDefined( args.ProhibitSplitting ) ) args.ProhibitSplitting = false;
        var result = true;
        var NumberOfAlreadyBrowsedPaths = 0;
        var MaxNodesPerTranslateBrowsePathsToNodeIds = 65535;
        if (!isDefined(args.SkipValidation)) args.SkipValidation = false;
        
        if ( isDefined( args.OperationResults ) && isDefined( args.OperationResults.length ) ) var AllOperationResults = args.OperationResults;
        if ( isDefined( args.ExpectedResults ) && isDefined( args.ExpectedResults.length ) ) var AllExpectedResults = args.ExpectedResults;
        var AllBrowsePaths = new UaBrowsePaths();
        // check if BrowsePaths argument exists; if so then use it...
        if( isDefined( args.BrowsePaths ) ) {
            // we are converting an array of strings into browse paths...
            if( isDefined( args.Node ) ) args.NodeIds = [ args.Node ];
            if( !isDefined( args.NodeIds ) ) throw( "TranslateBrowsePathsToNodeIds.Execute() args.NodeIds not specified." );
            if( !isDefined( args.NodeIds.length ) ) args.NodeIds = [ args.NodeIds ];
            for( var n=0; n<args.NodeIds.length; n++ ) {
                AllBrowsePaths[n] = this.stringsToBrowsePaths( args.NodeIds[n], args.BrowsePaths );
            }
        }
        else if( isDefined( args.UaBrowsePaths ) ) {
            // we are passing browse paths from the request into the call...
            if( args.UaBrowsePaths.length === undefined ) args.UaBrowsePaths = [args.UaBrowsePaths];
            for( var b=0; b<args.UaBrowsePaths.length; b++ ) {
                AllBrowsePaths[b] = args.UaBrowsePaths[b];
            }//for b
        }
        else {
            throw( "TranslateBrowsePathsHelper.Execute() called with invalid arguments. No browsing paths specified!" );
        }
        
        if ( gServerCapabilities.OperationLimits !== null && gServerCapabilities.OperationLimits !== undefined ) {
            if ( gServerCapabilities.OperationLimits.MaxNodesPerTranslateBrowsePathsToNodeIds != 0 ) MaxNodesPerTranslateBrowsePathsToNodeIds = gServerCapabilities.OperationLimits.MaxNodesPerTranslateBrowsePathsToNodeIds;
        }
        if( ( MaxNodesPerTranslateBrowsePathsToNodeIds < AllBrowsePaths.length ) && ( args.ProhibitSplitting == false ) ) {
            if( isDefined( args.PreHook ) ) args.PreHook();
            args.SkipHooks = true;
            addLog("=== TranslateBrowsePathsToNodeIds.Execute > Exceeding the limit MaxNodesPerTranslateBrowsePathsToNodeIds on the server, splitting the TranslateBrowsePathsToNodeIds into multiple Requests.");
            // temporary variables to collect and reassemble the split requests and responses
            var tempBrowsePaths = new UaBrowsePaths();
            var tempResults = new UaBrowsePathResults();
            while (NumberOfAlreadyBrowsedPaths < AllBrowsePaths.length) {
                var innerResult = true;
                var currentListOfBrowsePaths = [];
                var currentListOfOperationResults = [];
                var currentListOfExpectedResults = [];
                for ( var i=0; ( i < MaxNodesPerTranslateBrowsePathsToNodeIds ) && ( NumberOfAlreadyBrowsedPaths + i < AllBrowsePaths.length ); i++ ) {
                    currentListOfBrowsePaths.push( AllBrowsePaths[NumberOfAlreadyBrowsedPaths + i] );
                    if( isDefined( args.OperationResults ) && isDefined( args.OperationResults.length ) ) currentListOfOperationResults.push( AllOperationResults[NumberOfAlreadyBrowsedPaths + i] );
                    if( isDefined( args.ExpectedResults ) && isDefined( args.ExpectedResults.length ) ) currentListOfExpectedResults.push( AllExpectedResults[NumberOfAlreadyBrowsedPaths + i] );
                }
                if ( currentListOfBrowsePaths.length == 0 ) break;
                args.UaBrowsePaths = currentListOfBrowsePaths;
                args.BrowsePaths = undefined;
                args.Node = undefined;
                args.NodeIds = undefined;
                if( isDefined( args.OperationResults ) && isDefined( args.OperationResults.length ) ) args.OperationResults = currentListOfOperationResults;
                if( isDefined( args.ExpectedResults ) && isDefined( args.ExpectedResults.length ) ) args.ExpectedResults = currentListOfExpectedResults;
                innerResult = this.ExecuteExt( args );
                result = result && innerResult ? true : false;  // validation failed, so override *this* result
                NumberOfAlreadyBrowsedPaths += currentListOfBrowsePaths.length;
                // append the split requests BrowsePaths and the responses Results to a temporary variable
                var tempBrowsePathsLength = tempBrowsePaths.length;
                var tempResultsLength = tempResults.length;
                for( var i=0; i < this.Request.BrowsePaths.length; i++ ) tempBrowsePaths[tempBrowsePathsLength+i] = this.Request.BrowsePaths[i].clone();
                for( var i=0; i < this.Response.Results.length; i++ ) tempResults[tempResultsLength+i] = this.Response.Results[i].clone();
            }
            // set the reassembled requests BrowsePaths and responses Results
            this.Request.BrowsePaths = new UaBrowsePaths( tempBrowsePaths.length );
            this.Response.Results = new UaBrowsePathResults( tempResults.length );
            for( var i=0; i < tempBrowsePaths.length; i++ ) this.Request.BrowsePaths[i] = tempBrowsePaths[i].clone();
            for( var i=0; i < tempResults.length; i++ ) this.Response.Results[i] = tempResults[i].clone();
            
            CheckResourceError();
            if( isDefined( args.PostHook ) ) args.PostHook();
            CheckUserStop();
        }
        else {
            result = this.ExecuteExt( args );
        }
        return( result );
    }// this.Execute = function( args )
       
    /**
     * ExecuteExt method - where the simplification of this call takes place<br><br>
     * 
     * Note: Use either UaBrowsePaths or BrowsePaths - do not use both!<br>
     * Note: If using BrowsePaths - then also specify Node; otherwise node is not needed
     * 
     * @param {object} args An object containing all parameter
     * @param {UaBrowsePath[]} args.UaBrowsePaths - An array of UaBrowsePath objects
     * @param {string[]} args.BrowsePaths - An array of strings, each the name of a path
     * @param {UaNodeId} args.Node - A node id to use
     * @param {ExpectedAndAcceptedResults} args.ServiceResult - (Optional) An ExpectedAndAcceptedResults object - specify when expecting a failure only!
     * @param {ExpectedAndAcceptedResults[]} args.OperationResults - (Optional) An array of ExpectedAndAcceptedResults objects.
     * @param {boolean} args.SuppressMessaging - (Optional) True = No output
     * @param {boolean} args.SuppressWarnings - (Optional) True = Suppress warnings
     * @param {boolean} args.SuppressErrors - (Optional) True = Suppress errors
     *
     * @returns {boolean} True if call was successful, false otherwise
     */
    this.ExecuteExt = function( args ) {
        if( !isDefined( args ) ) throw( "TranslateBrowsePathsHelper.Execute argument missing." );
        if( !isDefined( args.SuppressMessaging ) ) args.SuppressMessaging = false;
        if( !isDefined( args.SuppressWarnings ) ) args.SuppressWarnings = false;
        if( !isDefined( args.SuppressErrors ) ) args.SuppressErrors = false;
        if( isDefined( args.OperationResults ) && !isDefined( args.OperationResults.length ) ) args.OperationResults = [ args.OperationResults ];
        var result = true;
        // create new instances of our request and response objects
        var session = isDefined( this.Session.Session )? this.Session.Session : this.Session;
        this.Request  = new UaTranslateBrowsePathsToNodeIdsRequest();
        this.Request.RequestHeader = UaRequestHeader.New( { Session: session, ReturnDiagnostics: args.ReturnDiagnostics } );
        this.Response = new UaTranslateBrowsePathsToNodeIdsResponse();
        // check if BrowsePaths argument exists; if so then use it...
        if( isDefined( args.BrowsePaths ) ) {
            // we are converting an array of strings into browse paths...
            if( isDefined( args.Node ) ) args.NodeIds = [ args.Node ];
            if( !isDefined( args.NodeIds ) ) throw( "TranslateBrowsePathsToNodeIds.Execute() args.NodeIds not specified." );
            if( !isDefined( args.NodeIds.length ) ) args.NodeIds = [ args.NodeIds ];
            for( var n=0; n<args.NodeIds.length; n++ ) {
                this.Request.BrowsePaths[n] = this.stringsToBrowsePaths( args.NodeIds[n], args.BrowsePaths );
            }
        }
        else if( isDefined( args.UaBrowsePaths ) ) {
            // we are passing browse paths from the request into the call...
            if( args.UaBrowsePaths.length === undefined ) args.UaBrowsePaths = [args.UaBrowsePaths];
            for( var b=0; b<args.UaBrowsePaths.length; b++ ) {
                this.Request.BrowsePaths[b] = args.UaBrowsePaths[b];
            }//for b
        }
        else {
            throw( "TranslateBrowsePathsHelper.Execute() called with invalid arguments. No browsing paths specified!" );
        }

        // update the timestamp in the RequestHeader before sending it out
        this.Request.RequestHeader.Timestamp = UaDateTime.utcNow();

        // issue the call
        if( isDefined( args.PreHook ) && ( !isDefined( args.SkipHooks ) || !args.SkipHooks ) ) args.PreHook();
        this.UaStatus = session.translateBrowsePathsToNodeIds( this.Request, this.Response );
        CheckResourceError();
        if( isDefined( args.PostHook ) && ( !isDefined( args.SkipHooks ) || !args.SkipHooks ) ) args.PostHook();
        CheckUserStop();
        if( !args.SkipValidation ) {
            if( this.UaStatus.isGood() ) {
                result = UaResponseHeader.IsValid( { Service: this, ServiceResult: args.ServiceResult, SuppressMessaging: args.SuppressMessaging, SuppressErrors: args.SuppressErrors, ServiceInfo: "BrowsePaths:#" + this.Request.BrowsePaths.length } );
                if( result && this.Response.ResponseHeader.ServiceResult.isGood() ) {
                    if( isDefined( args.OperationResults ) ) { result = checkTranslateBrowsePathsToNodeIdsError( this.Request, this.Response, args.OperationResults, args.SuppressMessaging, args.SuppressWarnings, args.SuppressErrors ); }
                    else if( isDefined( args.ExpectedResults ) ) { result = checkTranslateBrowsePathsToNodeIdsError( this.Request, this.Response, args.ExpectedResults, args.SuppressMessaging, args.SuppressWarnings, args.SuppressErrors ); }
                    else result = checkTranslateBrowsePathsToNodeIdsValidParameter( this.Request, this.Response );
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
        }
        return( result );
    }// this.ExecuteExt = function( args )


    /* internal private function for converting string[] to some default
       UaBrowsePath objects where:
           - IncludeSubtypes = false;
           - IsInverse = false;
           - ReferenceTypeID = null;
           - TargetName = the specified string */
    this.stringsToBrowsePaths = function( node, strings ) {
        if( !isDefined( [ node, strings ] ) ){ throw( "TranslateBrowsePathsHelper.stringsToBrowsePaths argument(s) missing." ); }
        if( strings.length === undefined ){ strings = [strings]; }//convert to an array
        // create the browse path and specify the starting node
        var bp = new UaBrowsePath();
        if( isDefined( node.NodeId ) ) {
            bp.StartingNode = node.NodeId;
        }
        else {
            bp.StartingNode = node;
        }
        // now create the relative paths
        for( var i=0; i<strings.length; i++ ) {
            // create the relative path element
            var rpe = new UaRelativePathElement();
            rpe.IncludeSubtypes = true;
            rpe.IsInverse = false;
            rpe.TargetName.Name = strings[i];
            // add the element to the browse path elements collection
            bp.RelativePath.Elements[i] = rpe;
        }//for i
        return( bp );
    }// this.stringsToBrowsePaths = function( node, strings )

    /* internal private function for converting string[] to some default
       UaBrowsePath objects where:
           - IncludeSubtypes = false;
           - IsInverse = false;
           - ReferenceTypeID = null;
           - TargetName = the specified string */
    this.stringsToBrowsePathsWithNamespaces = function (node, strings, namespaces) {
        if (!isDefined([node, strings, namespaces])) { throw ("TranslateBrowsePathsHelper.stringsToBrowsePaths argument(s) missing."); }
        if (strings.length === undefined) { strings = [strings]; }//convert to an array
        if (namespaces.length === undefined) { namespaces = [namespaces]; }//convert to an array
        // create the browse path and specify the starting node
        var bp = new UaBrowsePath();
        if (isDefined(node.NodeId)) {
            bp.StartingNode = node.NodeId;
        }
        else {
            bp.StartingNode = node;
        }
        // now create the relative paths
        for (var i = 0; i < strings.length; i++) {
            // create the relative path element
            var rpe = new UaRelativePathElement();
            rpe.IncludeSubtypes = true;
            rpe.IsInverse = false;
            rpe.TargetName.Name = strings[i];
            rpe.TargetName.NamespaceIndex = namespaces[i];
            // add the element to the browse path elements collection
            bp.RelativePath.Elements[i] = rpe;
        }//for i
        return (bp);
    }// this.stringsToBrowsePaths = function( node, strings )
}// function TranslateBrowsePathsToNodeIdsService( session ) 





// the service is expected to succeed
// all operations are expected to succeed
function checkTranslateBrowsePathsToNodeIdsValidParameter( request, response ) {
    var succeeded = true;
    // check in parameters
    if( arguments.length !== 2 ) {
        addError( "function checkTranslateBrowsePathsToNodeIdsValidParameter(): Number of arguments must be 2!" );
        return false;
    }
    // as this is a valid parameter test we don't expect any diagnosticinfo        
    if( response.DiagnosticInfos.length !== 0 ) {
        addError( "UaTranslateBrowsePathsToNodeIdsResponse.DiagnosticInfos was returned. No DiagnosticInfos were expected" );
        succeeded = false;
    }
    // check results        
    // check number of results
    if( response.Results.length !== request.BrowsePaths.length ) {
        addError( "The number of results does not match the number of BrowsePaths." );
        addError( "BrowsePaths.length = " + request.BrowsePaths.length + "; Results.length = " + response.Results.length );
        succeeded = false;
    }
    else {
        // check each result
        for( var i=0; i<response.Results.length; i++ ) {
            var browsePathResult = response.Results[i];
            // status code
            if( !Assert.StatusCodeIs( StatusCode.Good, browsePathResult.StatusCode, "Results[" + i + "].StatusCode is not Good" ) ) {
                succeeded = false;
                continue;
            }
        }
    }
    return succeeded;
}// function checkTranslateBrowsePathsToNodeIdsValidParameter( request, response )




// the service is expected to succeed
// one, some or all operations are expected to fail
// This function checks if the server returned the expected error codes
// Request is of Type UaTranslateBrowsePathsToNodeIdsRequest
// Response is of Type UaTranslateBrowsePathsToNodeIdsResponse
// ExpectedOperationResultsArray is an array ExpectedAndAcceptedResult (defined in Base/Objects/expectedResults.js)
function checkTranslateBrowsePathsToNodeIdsError( Request, Response, ExpectedOperationResultsArray, SuppressMessaging, SuppressWarnings, SuppressErrors) {
    if (!isDefined(SuppressWarnings)) SuppressWarnings = false;
    if (!isDefined(SuppressErrors)) SuppressErrors = false;
    // check in parameters
    if( arguments.length < 3 ) {
        addError( "function checkTranslateBrowsePathsToNodeIdsError(): Number of arguments must be 3" );
        return( false );
    }
    // ExpectedOperationResultsArray needs to have the correct size
    if( ExpectedOperationResultsArray.length !== Request.BrowsePaths.length ) {
        addError( "checkTranslateBrowsePathsToNodeIdsError: ExpectedOperationResultsArray[] (size: " + ExpectedOperationResultsArray.length + ") must have the same size as Request.BrowsePaths[] (size: " + Request.BrowsePaths.length + ")." );
        return( false );
    }
    var success = true;
    // check results        
    // check number of results
    if( Response.Results.length !== Request.BrowsePaths.length ) {
        addError( "The number of results does not match the number of BrowsePaths." );
        addError( "BrowsePaths.length=" + Request.BrowsePaths.length + "; Results.length=" + Response.Results.length );
        return( false );
    }
    else {        
        // check each result
        for( var i=0; i<Response.Results.length; i++ ) {
            var browsePathResult = Response.Results[i];
            var bMatch = false;
            // check if result matches any of the expected status code
            for( var j=0; j < ExpectedOperationResultsArray[i].ExpectedResults.length; j++ ) {
                if( browsePathResult.StatusCode.StatusCode == ExpectedOperationResultsArray[i].ExpectedResults[j].StatusCode ) {
                    if( !SuppressMessaging ) print( "\tResponse.Results[" + i + "].StatusCode = " + browsePathResult.StatusCode );
                    bMatch = true;
                    break;
                }
            }
            if( !bMatch ) {
                // check if result matches any of the accepted status codes
                for( var j=0; j<ExpectedOperationResultsArray[i].AcceptedResults.length; j++ ) {
                    if( browsePathResult.StatusCode.StatusCode == ExpectedOperationResultsArray[i].AcceptedResults[j].StatusCode ) {
                        bMatch = true;
                        break;
                    }
                }
                if( bMatch ) {
                    if (!SuppressWarnings) addWarning( "Response.Results[" + i + "].StatusCode = " + browsePathResult.StatusCode + " but " + ExpectedOperationResultsArray[i].ExpectedResults[0] + " was expected", browsePathResult.StatusCode );
                }
                else {
                    if (!SuppressErrors) addError( "Response.Results[" + i + "].StatusCode = " + browsePathResult.StatusCode + " but " + ExpectedOperationResultsArray[i].ExpectedResults[0] + " was expected", browsePathResult.StatusCode );
                    success = false;
                }
            }
        }
    }    
    return( success );
}// function checkTranslateBrowsePathsToNodeIdsError( Request, Response, ExpectedOperationResultsArray, SuppressMessaging )