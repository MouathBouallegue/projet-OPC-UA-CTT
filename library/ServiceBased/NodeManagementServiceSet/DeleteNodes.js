function DeleteNodeIdsService( args ) { 
    this.Name = "DeleteNodes";
    this.Session = null;       // session object reference
    this.Request = null;       // copy of the last/current call request header
    this.Response = null;      // copy of the last/current call server response header
    this.Success  = false;     // simple flag indicating if the last/current call succeeded or not.
    this.InvocationCount = 0;

    if( !isDefined( args ) ) throw( this.Name + " CTOR, arguments not specified." );
    if( !isDefined( args.Session ) ) throw( this.Name + " CTOR, session not specified." );
    else this.Session = args.Session;


    /**
     * Execute method - Calls the ExecuteExt method with the given arguments either once or
     * split up into multiple calls if needed, depending on the OperationLimits of the server
     * 
     * @param {object} args An object containing all parameter
     * @param {UaDeleteNodesItem[]} args.NodesToDelete - An array of UaDeleteNodesItem objects to delete.
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
        if (!isDefined(args)) throw ("DeleteNodes.js::Execute() args not specified.");
        if (!isDefined(args.NodesToDelete)) args.NodesToDelete = [];
        if (!isDefined(args.NodesToDelete.length)) args.NodesToDelete = [args.NodesToDelete];
        var result = true;
        var MaxNodesPerNodeManagement = 65535;
        var NumberOfAlreadyDeletedNodes = 0;
        var AllNodesToDelete = args.NodesToDelete;

        if (isDefined(args.OperationResults) && isDefined(args.OperationResults.length))   var AllOperationResults = args.OperationResults;
        if (gServerCapabilities.OperationLimits !== null && gServerCapabilities.OperationLimits !== undefined) {
            if (gServerCapabilities.OperationLimits.MaxNodesPerNodeManagement != 0) MaxNodesPerNodeManagement = gServerCapabilities.OperationLimits.MaxNodesPerNodeManagement;
        }
        if ((MaxNodesPerNodeManagement < args.NodesToDelete.length) && (args.ProhibitSplitting == false)) {
            if( isDefined( args.PreHook ) ) args.PreHook();
            args.SkipHooks = true;
            addLog("=== DeleteNodes.Execute > Exceeding the limit MaxNodesPerNodeManagement on the server, splitting the DeleteNodes into multiple Requests.");
            // temporary variables to collect and reassemble the split requests and responses
            var tempNodesToDelete = new UaDeleteNodesItems();
            var tempResults = new UaStatusCodes();
            while (NumberOfAlreadyDeletedNodes < AllNodesToDelete.length) {
                var innerResult = true;
                var currentListOfNodes = [];
                var currentListOfOperationResults = [];
                for (var i = 0; (i < MaxNodesPerNodeManagement) && (AllNodesToDelete.length > NumberOfAlreadyDeletedNodes + i); i++) {
                    currentListOfNodes.push(AllNodesToDelete[NumberOfAlreadyDeletedNodes + i]);
                    if (isDefined(args.OperationResults) && isDefined(args.OperationResults.length))   currentListOfOperationResults.push(AllOperationResults[NumberOfAlreadyDeletedNodes + i]);
                }
                if (currentListOfNodes.length == 0) break;
                args.NodesToDelete = currentListOfNodes;
                if (isDefined(args.OperationResults) && isDefined(args.OperationResults.length)) args.OperationResults = currentListOfOperationResults;
                innerResult = this.ExecuteExt(args);
                result = result && innerResult ? true : false;  // validation failed, so override *this* result
                NumberOfAlreadyDeletedNodes += currentListOfNodes.length;
                // append the split requests NodesToDelete and the responses Results to a temporary variable
                var tempNodesToDeleteLength = tempNodesToDelete.length;
                var tempResultsLength = tempResults.length;
                for( var i=0; i < this.Request.NodesToDelete.length; i++ ) tempNodesToDelete[tempNodesToDeleteLength+i] = this.Request.NodesToDelete[i].clone();
                for( var i=0; i < this.Response.Results.length; i++ ) tempResults[tempResultsLength+i] = this.Response.Results[i].clone();
            }
            // set the reassembled requests NodesToDelete and responses Results
            this.Request.NodesToDelete = new UaDeleteNodesItems(tempNodesToDelete.length);
            this.Response.Results = new UaStatusCodes(tempResults.length);
            for( var i=0; i < tempNodesToDelete.length; i++ ) this.Request.NodesToDelete[i] = tempNodesToDelete[i].clone();
            for( var i=0; i < tempResults.length; i++ ) this.Response.Results[i] = tempResults[i].clone();
            
            CheckResourceError();
            if( isDefined( args.PostHook ) ) args.PostHook();
            CheckUserStop();
        }
        else {
            return (this.ExecuteExt(args));
        }
        
        // invoke any functions that are intended to run now.
        if( isDefined( this.PostServiceCallFunction ) ) { this.PostServiceCallFunction() };
        
        return (result);
    }

    /**
     * Invokes the call to DeleteNodes.
     * 
     * @param {object} args An object containing all parameter
     * @param {UaDeleteNodesItem[]} args.NodesToDelete - An array of UaDeleteNodesItem objects to delete.
     * @param {ExpectedAndAcceptedResults} args.ServiceResult - (Optional) An ExpectedAndAcceptedResults object.
     * @param {ExpectedAndAcceptedResults[]} args.OperationResults - (Optional) An array of ExpectedAndAcceptedResults objects.
     * @param {boolean} args.SuppressMessaging - (Optional) Do not log messages
     * @param {boolean} args.SuppressErrors - (Optional) Do not log errors
     * @param {function} args.PreHook - (Optional) Function to invoke immediately before the Service call
     * @param {function} args.PostHook - (Optional) Function to invoke immediately after the Server call
     *
     * @returns {boolean} True if call was successful, false otherwise
     */
    this.ExecuteExt = function( args ) { 
        if( !isDefined( args ) ) throw( this.Name + ".Execute() arguments missing" );
        if( !isDefined( args.NodesToDelete ) ) args.NodesToDelete = [];
        if( !isDefined( args.NodesToDelete.length ) ) args.NodesToDelete = [ args.NodesToDelete ];
        if( !isDefined( args.Debug ) ) args.Debug = false;

        // register that this service is tested
        ServiceRegister.Register( { Service: ServiceRegister.UaService( { Name: this.Name, Available: true, Tested: true } ) } );

        // prepare our return value
        var result = true;

        // prepare the actual call
        this.Request  = new UaDeleteNodesRequest();
        this.Response = new UaDeleteNodesResponse();
        var session = isDefined( this.Session.Session )? this.Session.Session : this.Session;
        this.Request.RequestHeader = UaRequestHeader.New( { Session: session, ReturnDiagnostics: args.ReturnDiagnostics } );

        // specify the nodes to add
        for( var i=0; i<args.NodesToDelete.length; i++ ) this.Request.NodesToDelete[i] = args.NodesToDelete[i];

        // update the timestamp in the RequestHeader before sending it out
        this.Request.RequestHeader.Timestamp = UaDateTime.utcNow();

        if( isDefined( args.PreHook ) && ( !isDefined( args.SkipHooks ) || !args.SkipHooks ) ) args.PreHook();
        var uaStatus = session.deleteNodes( this.Request, this.Response );
        CheckResourceError();
        if( isDefined( args.PostHook ) && ( !isDefined( args.SkipHooks ) || !args.SkipHooks ) ) args.PostHook();
        CheckUserStop();
        // check the results
        this.Success = uaStatus.isGood();
        if( uaStatus.isGood() ) {
            result = UaResponseHeader.IsValid( { Service: this, ServiceResult: args.ServiceResult, SuppressMessaging: args.SuppressMessaging, SuppressErrors: args.SuppressErrors, ServiceName: "NodesToDelete #" + this.Request.NodesToDelete.length } );
            if( result ) result = this.CheckDeleteNodesResponse( { Request: this.Request, Response: this.Response, ServiceResult: args.ServiceResult, OperationResults: args.OperationResults } );
        }
        else {
            addError( this.Name + "() status: " + uaStatus, uaStatus );
            result = false;
        }

        return( result );
    };// this.ExecuteExt = function( args )

    this.CheckDeleteNodesResponse = function( args ) { 
        // check in parameters
        if( !isDefined( args ) ){ throw( "HistoryReadHelper.CheckHistoryReadValidParameter missing required argument." ); }
        if( !isDefined( args.Request ) ){ throw( "HistoryReadHelper.CheckHistoryReadValidParameter missing required argument: Request." ); }
        if( !isDefined( args.Response ) ){ throw( "HistoryReadHelper.CheckHistoryReadValidParameter missing required argument: Response." ); }
        if( isDefined( args.OperationResults ) && !isDefined( args.OperationResults.length ) ) args.OperationResults = [ args.OperationResults ];
        var result = true;
        // as this is a valid parameter test we don't expect any diagnositcinfo
        if( args.Response.DiagnosticInfos.length !== 0 ) {
            addError( "HistoryReadResponse.DiagnosticInfos was returned. No DiagnosticInfos were expected." );
            result = false;
        }
        // should we continue validation? do so if not in error
        if( args.Response.ResponseHeader.ServiceResult.isGood() ) {
            // check number of results
            if( !Assert.Equal( args.Request.NodesToDelete.length, args.Response.Results.length, "The number of NodesToDelete does not match the number of results." ) ) result = false;
            else {
                // do we need to check each result?
                // check each result
                if( isDefined( args.OperationResults ) ) 
                    for( var i=0; i<args.Response.Results.length; i++ )  {
                        Assert.StatusCodeIsOneOf( args.OperationResults[i], args.Response.Results[i] );
                        if( args.Response.Results[i].isGood() ) result = false;
                    }
                }
        }
        return result;
    };// this.CheckAddNodesResponse = function( args )

}// function DeleteNodesService( session )