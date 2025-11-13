include( "./library/ServiceBased/ViewServiceSet/RegisterNodes/check_registerNodes_valid.js" );

function RegisterNodesService( args ) {
    this.Name = "RegisterNodes";
    this.Session   = null;
    this.Request   = null;
    this.Response  = null;
    this.UaStatus  = null;
    this.CallCount = 0;
    if( !isDefined( args ) ) throw( "RegisterNodes() instanciation failed, arguments is missing or not a Session object." );
    if( !isDefined( args.Session ) ) throw( this.Name + " CTOR failed; session not specified." );
    else this.Session = args.Session;

    /**
     * Execute method - Calls the ExecuteExt method with the given arguments either once or
     * split up into multiple calls if needed, depending on the OperationLimits of the server
     * 
     * @param {object} args An object containing all parameter
     * @param {MonitoredItem[] | NodeId[]} args.NodesToRegister - A NodeID/MonitoredItem or an array of one to register.
     * @param {ExpectedAndAcceptedResults} args.ServiceResult - (Optional) An ExpectedAndAcceptedResults object.
     * @param {ExpectedAndAcceptedResults[]} args.OperationResults - (Optional) An array of ExpectedAndAcceptedResults objects.
     * @param {boolean} args.SkipValidation - (Optional) Do not validate Response (for manual validation, default=false)
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
        if (!isDefined(args)) throw ("RegisterNodes.js::Execute() args not specified.");
        if (!isDefined(args.NodesToRegister)) args.NodesToRegister = [];
        if (!isDefined(args.NodesToRegister.length)) args.NodesToRegister = [args.NodesToRegister];
        if (!isDefined(args.SkipValidation)) args.SkipValidation = false;
        var result = true;
        var MaxNodesPerRegisterNodes = 65535;
        var NumberOfAlreadyRegisteredNodes = 0;
        var AllNodesToRegister = args.NodesToRegister;

        if (isDefined(args.OperationResults) && isDefined(args.OperationResults.length))   var AllOperationResults = args.OperationResults;
        if (gServerCapabilities.OperationLimits !== null && gServerCapabilities.OperationLimits !== undefined) {
            if (gServerCapabilities.OperationLimits.MaxNodesPerRegisterNodes != 0) MaxNodesPerRegisterNodes = gServerCapabilities.OperationLimits.MaxNodesPerRegisterNodes;
        }
        if ((MaxNodesPerRegisterNodes < args.NodesToRegister.length) && (args.ProhibitSplitting == false)) {
            if( isDefined( args.PreHook ) ) args.PreHook();
            args.SkipHooks = true;
            addLog("=== RegisterNodes.Execute > Exceeding the limit MaxNodesPerRegisterNodes on the server, splitting the call into multiple Requests.");
            // temporary variables to collect and reassemble the split requests and responses
            var tempNodesToRegister = new UaNodeIds();
            var tempRegisteredNodeIds = new UaNodeIds();
            while (NumberOfAlreadyRegisteredNodes < AllNodesToRegister.length) {
                var innerResult = true;
                var currentListOfNodes = [];
                var currentListOfOperationResults = [];
                for (var i = 0; (i < MaxNodesPerRegisterNodes) && (AllNodesToRegister.length > NumberOfAlreadyRegisteredNodes + i); i++) {
                    currentListOfNodes.push(AllNodesToRegister[NumberOfAlreadyRegisteredNodes + i]);
                    if (isDefined(args.OperationResults) && isDefined(args.OperationResults.length))   currentListOfOperationResults.push(AllOperationResults[NumberOfAlreadyRegisteredNodes + i]);
                }
                if (currentListOfNodes.length == 0) break;
                args.NodesToRegister = currentListOfNodes;
                if (isDefined(args.OperationResults) && isDefined(args.OperationResults.length)) args.OperationResults = currentListOfOperationResults;
                innerResult = this.ExecuteExt(args);
                result = result && innerResult ? true : false;  // validation failed, so override *this* result
                NumberOfAlreadyRegisteredNodes += currentListOfNodes.length;
                // append the split requests NodesToRegister and the responses RegisteredNodeIds to a temporary variable
                var tempNodesToRegisterLength = tempNodesToRegister.length;
                var tempRegisteredNodeIdsLength = tempRegisteredNodeIds.length;
                for( var i=0; i < this.Request.NodesToRegister.length; i++ ) tempNodesToRegister[tempNodesToRegisterLength+i] = this.Request.NodesToRegister[i].clone();
                for( var i=0; i < this.Response.RegisteredNodeIds.length; i++ ) tempRegisteredNodeIds[tempRegisteredNodeIdsLength+i] = this.Response.RegisteredNodeIds[i].clone();
            }
            // set the reassembled requests NodesToRegister and responses RegisteredNodeIds
            this.Request.NodesToRegister = new UaNodeIds(tempNodesToRegister.length);
            this.Response.RegisteredNodeIds = new UaNodeIds(tempRegisteredNodeIds.length);
            for( var i=0; i < tempNodesToRegister.length; i++ ) this.Request.NodesToRegister[i] = tempNodesToRegister[i].clone();
            for( var i=0; i < tempRegisteredNodeIds.length; i++ ) this.Response.RegisteredNodeIds[i] = tempRegisteredNodeIds[i].clone();
            
            CheckResourceError();
            if( isDefined( args.PostHook ) ) args.PostHook();
            CheckUserStop();
        }
        else {
            return (this.ExecuteExt(args));
        }
        return (result);
    }//this.Execute = function( args )
    
    /**
     * Invokes the call to RegisterNodes.
     * 
     * @param {object} args An object containing all parameter
     * @param {MonitoredItem[] | NodeId[]} args.NodesToRegister - A NodeID/MonitoredItem or an array of one to register.
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
    this.ExecuteExt = function( args ) {
        var result = true;
        // check the parameters
        if( !isDefined( args ) ) args = new Object();
        if( !isDefined( args.SuppressMessaging ) ) args.SuppressMessaging = false;
        if( args.NodesToRegister.length == 0 ) args.NodesToRegister = undefined;
        // prepare the request/response headers
        this.Request = new UaRegisterNodesRequest();
        this.Response = new UaRegisterNodesResponse();
        var session = isDefined( this.Session.Session )? this.Session.Session : this.Session;
        this.Request.RequestHeader = UaRequestHeader.New( { Session: session, ReturnDiagnostics: args.ReturnDiagnostics } );
        // add the nodes to register
        if( isDefined( args ) && isDefined( args.NodesToRegister ) ) {
            if( !isDefined( args.NodesToRegister.length ) ) args.NodesToRegister = [ args.NodesToRegister ];
            // is the NodesToRegister a collection of NodeIds or MonitoredItem objects?
            if( isDefined( args.NodesToRegister[0].NodeId ) ) {
                for( var n=0; n<args.NodesToRegister.length; n++ ) this.Request.NodesToRegister[n] = args.NodesToRegister[n].NodeId;
            }
            else {
                for( var n=0; n<args.NodesToRegister.length; n++ ) this.Request.NodesToRegister[n] = args.NodesToRegister[n];
            }
        }
        // update the timestamp in the RequestHeader before sending it out
        this.Request.RequestHeader.Timestamp = UaDateTime.utcNow();

        // invoke the call
        if( isDefined( args.PreHook ) && ( !isDefined( args.SkipHooks ) || !args.SkipHooks ) ) args.PreHook();
        this.UaStatus = session.registerNodes( this.Request, this.Response );
        CheckResourceError();
        if( isDefined( args.PostHook ) && ( !isDefined( args.SkipHooks ) || !args.SkipHooks ) ) args.PostHook();
        CheckUserStop();
        if( !args.SkipValidation ) {
            if( this.UaStatus.isGood() ) {
                result = UaResponseHeader.IsValid( { Service: this, ServiceResult: args.ServiceResult, SuppressMessaging: args.SuppressMessaging, SuppressErrors: args.SuppressErrors, ServiceInfo: "NodesToRegister #" + this.Request.NodesToRegister.length } );
                if( result ) result = this.checkRegisterNodesValidParameter( this.Request, this.Response, args.SuppressMessaging );
                else {
                    // check to make sure other parameters are not specified whenever there is a Bad service result. See UA Part 4 7.30 ServiceFault.
                    if( this.Response.ResponseHeader.ServiceResult.isBad() ) Assert.Equal( 0, this.Response.RegisteredNodeIds.length, this.Name + ".Response.RegisteredNodeIds are not needed when a ServiceFault is returned." );
                }
            }
            else {
                Assert.StatusCodeIsOneOf( args.ServiceResult, this.UaStatus, this.Name + " the ErrorCode in the Error Message received doesn't match the expectation." );
                result = false;
            }
        }
        return( result );
    };

    this.checkRegisterNodesValidParameter = function( SuppressMessaging ) {
        if( !isDefined( this.Request ) || !isDefined( this.Response ) ) throw( "RegisterNodes::check_registerNodes_valid:Request/Response not specified." );
        if( this.Response.ResponseHeader.ServiceResult.isBad() ) return( false ); // no need to check response if overall call failed
        var bSucceeded = true;
        if( !isDefined( SuppressMessaging ) ) SuppressMessaging = false;
        // check number of results
        if( this.Response.RegisteredNodeIds.length !== this.Request.NodesToRegister.length ) {
            if( !SuppressMessaging ) addError( "The number of RegisteredNodeIds does not match the number of NodesToRegister." );
            if( !SuppressMessaging ) addError( "NodesToRegister.length = " + this.Request.NodesToRegister.length + "; RegisteredNodeIds.length = " + this.Response.RegisteredNodeIds.length );
            bSucceeded = false;
        }
        return bSucceeded;
    }

}