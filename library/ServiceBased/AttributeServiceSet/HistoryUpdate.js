/*  This class object is responsible for calling the HistoryUpdate() service and for also 
    performing any validation etc. This is a quick-use class.
    Helper object for the HistoryRead UA Service call.
        Properties:
            Session:    the sesson object, defined during instanciation.
            Request:    the historyRead request object created by the helper.
            Response:   the response received from the UA Server being tested.
            Success:    a simple true/false flag to indicate a success/fail of the call.
        Functions:
            Execute:                        invokes the HistoryRead call.
            CheckHistoryReadValidParameter: validates the HistoryRead response. */

function HistoryUpdateService( args ) {
    this.Name = "HistoryUpdate";
    this.Session = null;       // session object reference
    this.Request = null;       // copy of the last/current HistoryRead request header
    this.Response = null;      // copy of the last/current HistoryRead server response header
    this.Success  = false;     // simple flag indicating if the last/current call succeeded or not.

    if( !isDefined( args ) ) throw( this.Name + " CTOR, arguments not specified." );
    if( !isDefined( args.Session ) ) throw( this.Name + " CTOR, session not specified." );
    else this.Session = args.Session;


    /**
     * Execute method - Calls the ExecuteExt method with the given arguments either once or
     * split up into multiple calls if needed, depending on the OperationLimits of the server
     * 
     * @param {object} args An object containing all parameter
     * @param {HistoryUpdateDetails} args.HistoryUpdateDetails - One or more HistoryUpdateDetails objects.
     * @param {boolean} args.Debug - True/False to show verbose info (default=false).
     * @param {ExpectedAndAcceptedResults} args.ServiceResult - (Optional) An ExpectedAndAcceptedResults object.
     * @param {ExpectedAndAcceptedResults[]} args.OperationResults - (Optional) An array of ExpectedAndAcceptedResults objects.
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
        if (!isDefined(args)) throw ("HistoryUpdate.js::Execute() args not specified.");
        if (!isDefined(args.HistoryUpdateDetails)) args.HistoryUpdateDetails = [];
        if (!isDefined(args.HistoryUpdateDetails.length)) args.HistoryUpdateDetails = [args.HistoryUpdateDetails];
        if( !isDefined( args.OperationResults ) ) { args.OperationResults = []; }
        if( !isDefined( args.OperationResults.length ) ) { args.OperationResults = [ args.OperationResults ]; }
        var result = true;
        var MaxNodesPerHistoryUpdateData = 65535;
        var NumberOfAlreadyUpdatedNodes = 0;
        var AllHistoryUpdateDetails = args.HistoryUpdateDetails;

        if (isDefined(args.OperationResults) && isDefined(args.OperationResults.length))   var AllOperationResults = args.OperationResults;
        if (gServerCapabilities.OperationLimits !== null && gServerCapabilities.OperationLimits !== undefined) {
            if (gServerCapabilities.OperationLimits.MaxNodesPerHistoryUpdateData != 0) MaxNodesPerHistoryUpdateData = gServerCapabilities.OperationLimits.MaxNodesPerHistoryUpdateData;
        }
        if ((MaxNodesPerHistoryUpdateData < args.HistoryUpdateDetails.length) && (args.ProhibitSplitting == false)) {
            if( isDefined( args.PreHook ) ) args.PreHook();
            args.SkipHooks = true;
            addLog("=== HistoryUpdate.Execute > Exceeding the limit MaxNodesPerHistoryUpdateData on the server, splitting the call into multiple Requests.");
            // temporary variables to collect and reassemble the split requests and responses
            var tempHistoryUpdateDetails = new UaExtensionObjects();
            var tempResults = new UaHistoryUpdateResults();
            while (NumberOfAlreadyUpdatedNodes < AllHistoryUpdateDetails.length) {
                var innerResult = true;
                var currentListOfNodes = [];
                var currentListOfOperationResults = [];
                for (var i = 0; (i < MaxNodesPerHistoryUpdateData) && (AllHistoryUpdateDetails.length > NumberOfAlreadyUpdatedNodes + i); i++) {
                    currentListOfNodes.push(AllHistoryUpdateDetails[NumberOfAlreadyUpdatedNodes + i]);
                    if (isDefined(args.OperationResults) && isDefined(args.OperationResults.length) && args.OperationResults.length > 0)   currentListOfOperationResults.push(AllOperationResults[NumberOfAlreadyUpdatedNodes + i]);
                }
                if (currentListOfNodes.length == 0) break;
                args.HistoryUpdateDetails = currentListOfNodes;
                if (isDefined(args.OperationResults) && isDefined(args.OperationResults.length)) args.OperationResults = currentListOfOperationResults;
                innerResult = this.ExecuteExt(args);
                result = result && innerResult ? true : false;  // validation failed, so override *this* result
                NumberOfAlreadyUpdatedNodes += currentListOfNodes.length;
                // append the split requests HistoryUpdateDetails and the responses Results to a temporary variable
                var tempHistoryUpdateDetailsLength = tempHistoryUpdateDetails.length;
                var tempResultsLength = tempResults.length;
                for( var i=0; i < this.Request.HistoryUpdateDetails.length; i++ ) tempHistoryUpdateDetails[tempHistoryUpdateDetailsLength+i] = this.Request.HistoryUpdateDetails[i].clone();
                for( var i=0; i < this.Response.Results.length; i++ ) tempResults[tempResultsLength+i] = this.Response.Results[i].clone();
            }
            // set the reassembled requests HistoryUpdateDetails and responses Results
            this.Request.HistoryUpdateDetails = new UaExtensionObjects(tempHistoryUpdateDetails.length);
            this.Response.Results = new UaHistoryUpdateResults(tempResults.length);
            for( var i=0; i < tempHistoryUpdateDetails.length; i++ ) this.Request.HistoryUpdateDetails[i] = tempHistoryUpdateDetails[i].clone();
            for( var i=0; i < tempResults.length; i++ ) this.Response.Results[i] = tempResults[i].clone();
            
            args.HistoryUpdateDetails = AllHistoryUpdateDetails;
            
            CheckResourceError();
            if( isDefined( args.PostHook ) ) args.PostHook();
            CheckUserStop();
        }
        else {
            return (this.ExecuteExt(args));
        }
        return (result);
    }//this.Execute = function( args )
    
    /* Reads values.
         Default values shown in [ ]
          Parameters are: 
              HistoryUpdateDetails = one or more HistoryUpdateDetails objects
              Debug                = [empty] True/False to show verbose info. FALSE=default. */
    this.ExecuteExt = function( args ) {
        if( !isDefined( args ) ) throw( "HistoryUpdate.Execute() arguments missing" );
        if( !isDefined( args.Debug ) ) args.Debug = false;
        if( !isDefined( args.Verify ) ) args.Verify = true;

        // register that this service is tested
        ServiceRegister.Register( { Service: ServiceRegister.UaService( { Name: this.Name, Available: true, Tested: true } ) } );

        // prepare our return value
        var result = true;

        // define the historyUpdate headers
        this.Request  = new UaHistoryUpdateRequest.New( args.HistoryUpdateDetails );
        this.Response = new UaHistoryUpdateResponse();
        var session = isDefined( this.Session.Session )? this.Session.Session : this.Session;
        this.Request.RequestHeader = UaRequestHeader.New( { Session: session, ReturnDiagnostics: args.ReturnDiagnostics } );

        // issue the update
        if( isDefined( args.PreHook ) && ( !isDefined( args.SkipHooks ) || !args.SkipHooks ) ) args.PreHook();
        var uaStatus = session.historyUpdate( this.Request, this.Response );
        CheckResourceError();
        if( isDefined( args.PostHook ) && ( !isDefined( args.SkipHooks ) || !args.SkipHooks ) ) args.PostHook();
        CheckUserStop();
        // check result
        this.Success = uaStatus.isGood();
        if( uaStatus.isGood() ) {
            result = UaResponseHeader.IsValid( { Service: this, ServiceResult: args.ServiceResult, SuppressMessaging: args.SuppressMessaging, SuppressErrors: args.SuppressErrors, ServiceInfo: "HistoryUpdateDetails #" + this.Request.HistoryUpdateDetails.length } );
            if( result ) result = this.CheckHistoryUpdateValidParameter( { Request: this.Request, Response: this.Response, ServiceResult: args.ServiceResult, OperationResults: args.OperationResults } );
            else {
                // check to make sure other parameters are not specified whenever there is a Bad service result. See UA Part 4 7.30 ServiceFault.
                Assert.Equal( 0, this.Response.Results.length, this.Name + ".Response.Results are not needed when a ServiceFault is returned." );
            }
            //TODO: Insert routine to READ the data back from the server
        }
        else {
            addError( "HistoryUpdate() status: " + uaStatus, uaStatus );
            result = false;
        }

        // if the call failed then register that 
        if( !result ) ServiceRegister.SetFailed( { Name: this.Name } )
        return( result );
    }// this.ExecuteExt = function( args )

    // check the response, which contains: DiagnosticInfos[], ResponseHeader, Results[]
    this.CheckHistoryUpdateValidParameter = function( args ) {
        // check in parameters
        if( !isDefined( args ) ){ throw( "HistoryReadHelper.CheckHistoryReadValidParameter missing required argument." ); }
        if( !isDefined( args.Request ) ){ throw( "HistoryReadHelper.CheckHistoryReadValidParameter missing required argument: Request." ); }
        if( !isDefined( args.Response ) ){ throw( "HistoryReadHelper.CheckHistoryReadValidParameter missing required argument: Response." ); }
        if( args.Response.ResponseHeader.ServiceResult.isBad() ) return( false ); // don't check response if overall called failed
        var result = false;
        // check the individual results 
        if( Assert.Equal( args.Request.HistoryUpdateDetails.length, args.Response.Results.length, "HistoryUpdate.Results length do not match the number of requests." ) ) {
            if( isDefined( args.OperationResults ) && args.OperationResults.length > 0 && Assert.Equal( args.OperationResults.length, args.Response.Results.length, "Expected # of OperationResults does not match the number of actual results received." ) ) {
                for( var i=0; i<args.Response.Results.length; i++ ) {
                    if( !Assert.StatusCodeIsOneOf( args.OperationResults[i], args.Response.Results[i].StatusCode, "HistoryUpdate.Results[" + i + "].StatusCode does not match expectations." ) ) result = false;
                    if( isDefined( args.OperationResults[i].TransactionResults ) ) {
                        if( Assert.Equal( args.OperationResults[i].TransactionResults.length, args.Response.Results[i].OperationResults.length, "HistoryUpdate.Results[" + i + "].OperationResults[] length mismatch." ) ) {
                            for( var t=0; t<args.OperationResults[i].TransactionResults.length; t++ ) {
                                if( !Assert.StatusCodeIsOneOf( args.OperationResults[i].TransactionResults[t], args.Response.Results[i].OperationResults[t], "HistoryUpdate.Results[" + i + "].OperationResults[" + t + "].StatusCode does not match expectations." ) ) result = false;
                            }//for t...
                        }
                    }
                }//for i...
            }
            else for( var i=0; i<args.Response.Results.length; i++ ) result = result && UaHistoryUpdateResult.Validate( args.Response.Results[i] );
        }
        return( result );
    }// this.CheckHistoryUpdateValidParameter = function( args )

}// function HistoryUpdateService( session )