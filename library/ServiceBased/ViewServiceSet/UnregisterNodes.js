include( "./library/ServiceBased/ViewServiceSet/UnregisterNodes/check_unregisterNodes_valid.js" );

function UnregisterNodesService( args ) {
    this.Name = "UnregisterNodes";
    this.Session  = null;
    this.Request  = null;
    this.Response = null;
    this.UaStatus = null;
    this.CallCount = 0;
    if( !isDefined( args ) ) throw( "UnregisterNodes() instanciation failed, argument missing or not a Session object." );
    if( !isDefined( args.Session ) ) throw( this.Name + "() CTOR, session missing" );
    else this.Session = args.Session;
    
    /**
     * Execute method - Calls the ExecuteExt method with the given arguments either once or
     * split up into multiple calls if needed, depending on the OperationLimits of the server
     * 
     * @param {object} args An object containing all parameter
     * @param {MonitoredItem[] | NodeId[]} args.NodesToUnregister - A NodeID/MonitoredItem or an array of one to unregister.
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
        if (!isDefined(args)) throw ("UnregisterNodes.js::Execute() args not specified.");
        if (!isDefined(args.NodesToUnregister)) args.NodesToUnregister = [];
        if (!isDefined(args.NodesToUnregister.length)) args.NodesToUnregister = [args.NodesToUnregister];
        var result = true;
        var MaxNodesPerRegisterNodes = 65535;
        var NumberOfAlreadyUnregisteredNodes = 0;
        var AllNodesToUnregister = args.NodesToUnregister;

        if (isDefined(args.OperationResults) && isDefined(args.OperationResults.length))   var AllOperationResults = args.OperationResults;
        if (gServerCapabilities.OperationLimits !== null && gServerCapabilities.OperationLimits !== undefined) {
            if (gServerCapabilities.OperationLimits.MaxNodesPerRegisterNodes != 0) MaxNodesPerRegisterNodes = gServerCapabilities.OperationLimits.MaxNodesPerRegisterNodes;
        }
        if ((MaxNodesPerRegisterNodes < args.NodesToUnregister.length) && (args.ProhibitSplitting == false)) {
            if( isDefined( args.PreHook ) ) args.PreHook();
            args.SkipHooks = true;
            addLog("=== UnregisterNodes.Execute > Exceeding the limit MaxNodesPerRegisterNodes on the server, splitting the call into multiple Requests.");
            // temporary variables to collect and reassemble the split requests
            var tempNodesToUnregister = new UaNodeIds();
            while (NumberOfAlreadyUnregisteredNodes < AllNodesToUnregister.length) {
                var innerResult = true;
                var currentListOfNodes = [];
                var currentListOfOperationResults = [];
                for (var i = 0; (i < MaxNodesPerRegisterNodes) && (AllNodesToUnregister.length > NumberOfAlreadyUnregisteredNodes + i); i++) {
                    currentListOfNodes.push(AllNodesToUnregister[NumberOfAlreadyUnregisteredNodes + i]);
                    if (isDefined(args.OperationResults) && isDefined(args.OperationResults.length))   currentListOfOperationResults.push(AllOperationResults[NumberOfAlreadyUnregisteredNodes + i]);
                }
                if (currentListOfNodes.length == 0) break;
                args.NodesToUnregister = currentListOfNodes;
                if (isDefined(args.OperationResults) && isDefined(args.OperationResults.length)) args.OperationResults = currentListOfOperationResults;
                innerResult = this.ExecuteExt(args);
                result = result && innerResult ? true : false;  // validation failed, so override *this* result
                NumberOfAlreadyUnregisteredNodes += currentListOfNodes.length;
                // append the split requests NodesToUnregister to a temporary variable
                var tempNodesToUnregisterLength = tempNodesToUnregister.length;
                for( var i=0; i < this.Request.NodesToUnregister.length; i++ ) tempNodesToUnregister[tempNodesToUnregisterLength+i] = this.Request.NodesToUnregister[i].clone();
            }
            // set the reassembled requests NodesToUnregister
            this.Request.NodesToUnregister = new UaNodeIds(tempNodesToUnregister.length);
            for( var i=0; i < tempNodesToUnregister.length; i++ ) this.Request.NodesToUnregister[i] = tempNodesToUnregister[i].clone();
            
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
     * Invokes the call to UnregisterNodes.
     * 
     * @param {object} args An object containing all parameter
     * @param {MonitoredItem[] | NodeId[]} args.NodesToUnregister - A NodeID/MonitoredItem or an array of one to unregister.
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
        if( args.NodesToUnregister.length == 0 ) args.NodesToUnregister = undefined;
        // prepare the request/response headers
        this.Request = new UaUnregisterNodesRequest();
        this.Response = new UaUnregisterNodesResponse();
        var session = isDefined( this.Session.Session )? this.Session.Session : this.Session;
        this.Request.RequestHeader = UaRequestHeader.New( { Session: session, ReturnDiagnostics: args.ReturnDiagnostics } );
        // add the nodes to register
        if( isDefined( args ) && isDefined( args.NodesToUnregister ) ) {
            if( !isDefined( args.NodesToUnregister.length ) ) args.NodesToUnregister = [ args.NodesToUnregister ];
            // is the NodesToUnregister a collection of NodeIds or MonitoredItem objects?
            if( isDefined( args.NodesToUnregister[0].NodeId ) ) {
                for( var n=0; n<args.NodesToUnregister.length; n++ ) this.Request.NodesToUnregister[n] = args.NodesToUnregister[n].NodeId;
            }
            else {
                for( var n=0; n<args.NodesToUnregister.length; n++ ) this.Request.NodesToUnregister[n] = args.NodesToUnregister[n];
            }
        }

        // update the timestamp in the RequestHeader before sending it out
        this.Request.RequestHeader.Timestamp = UaDateTime.utcNow();

        // invoke the call
        if( isDefined( args.PreHook ) && ( !isDefined( args.SkipHooks ) || !args.SkipHooks ) ) args.PreHook();
        this.UaStatus = session.unregisterNodes( this.Request, this.Response );
        CheckResourceError();
        if( isDefined( args.PostHook ) && ( !isDefined( args.SkipHooks ) || !args.SkipHooks ) ) args.PostHook();
        CheckUserStop();
        if( this.UaStatus.isGood() ) {
            result = UaResponseHeader.IsValid( { Service: this, ServiceResult: args.ServiceResult, SuppressMessaging: args.SuppressMessaging, SuppressErrors: args.SuppressErrors, ServiceInfo: "NodesToUnregister #" + this.Request.NodesToUnregister.length } );
            if( result ) result = checkUnregisterNodesValidParameter( this.Session.Session, this.Request, this.Response, args.SuppressMessaging );
        }
        else {
            Assert.StatusCodeIsOneOf( args.ServiceResult, this.UaStatus, this.Name + " the ErrorCode in the Error Message received doesn't match the expectation." );
            result = false;
        }
        return( result );
    };
}