function AddNodeIdsService( args ) { 
    this.Name = "AddNodes";
    this.Session = null;       // session object reference
    this.Request = null;       // copy of the last/current call request header
    this.Response = null;      // copy of the last/current call server response header
    this.Success  = false;     // simple flag indicating if the last/current call succeeded or not.
    this.InvocationCount = 0;  // simple counter of how many times the service has been called
    this.PostServiceCallFunction = null; // function pointer to invoke when all processing is done

    if( !isDefined( args ) ) throw( this.Name + " CTOR, arguments not specified." );
    if( !isDefined( args.Session ) ) throw( this.Name + " CTOR, session not specified." );
    else this.Session = args.Session;


    /**
     * Execute method - Calls the ExecuteExt method with the given arguments either once or
     * split up into multiple calls if needed, depending on the OperationLimits of the server
     * 
     * @param {object} args An object containing all parameter
     * @param {UaAddNodesItem[]} args.NodesToAdd - An array of UaAddNodesItem objects to add.
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
        if (!isDefined(args)) throw ("AddNodes.js::Execute() args not specified.");
        if (!isDefined(args.NodesToAdd)) args.NodesToAdd = [];
        if (!isDefined(args.NodesToAdd.length)) args.NodesToAdd = [args.NodesToAdd];
        var result = true;
        var MaxNodesPerNodeManagement = 65535;
        var NumberOfAlreadyAddedNodes = 0;
        var AllNodesToAdd = args.NodesToAdd;

        if (isDefined(args.OperationResults) && isDefined(args.OperationResults.length))   var AllOperationResults = args.OperationResults;
        if (gServerCapabilities.OperationLimits !== null && gServerCapabilities.OperationLimits !== undefined) {
            if (gServerCapabilities.OperationLimits.MaxNodesPerNodeManagement != 0) MaxNodesPerNodeManagement = gServerCapabilities.OperationLimits.MaxNodesPerNodeManagement;
        }
        if ((MaxNodesPerNodeManagement < args.NodesToAdd.length) && (args.ProhibitSplitting == false)) {
            if( isDefined( args.PreHook ) ) args.PreHook();
            args.SkipHooks = true;
            addLog("=== AddNodes.Execute > Exceeding the limit MaxNodesPerNodeManagement on the server, splitting the AddNodes into multiple Requests.");
            // temporary variables to collect and reassemble the split requests and responses
            var tempNodesToAdd = new UaAddNodesItems();
            var tempResults = new UaAddNodesResults();
            while (NumberOfAlreadyAddedNodes < AllNodesToAdd.length) {
                var innerResult = true;
                var currentListOfNodes = [];
                var currentListOfOperationResults = [];
                for (var i = 0; (i < MaxNodesPerNodeManagement) && (AllNodesToAdd.length > NumberOfAlreadyAddedNodes + i); i++) {
                    currentListOfNodes.push(AllNodesToAdd[NumberOfAlreadyAddedNodes + i]);
                    if (isDefined(args.OperationResults) && isDefined(args.OperationResults.length))   currentListOfOperationResults.push(AllOperationResults[NumberOfAlreadyAddedNodes + i]);
                }
                if (currentListOfNodes.length == 0) break;
                args.NodesToAdd = currentListOfNodes;
                if (isDefined(args.OperationResults) && isDefined(args.OperationResults.length)) args.OperationResults = currentListOfOperationResults;
                innerResult = this.ExecuteExt(args);
                result = result && innerResult ? true : false;  // validation failed, so override *this* result
                NumberOfAlreadyAddedNodes += currentListOfNodes.length;
                // append the split requests NodesToAdd and the responses Results to a temporary variable
                var tempNodesToAddLength = tempNodesToAdd.length;
                var tempResultsLength = tempResults.length;
                for( var i=0; i < this.Request.NodesToAdd.length; i++ ) tempNodesToAdd[tempNodesToAddLength+i] = this.Request.NodesToAdd[i].clone();
                for( var i=0; i < this.Response.Results.length; i++ ) tempResults[tempResultsLength+i] = this.Response.Results[i].clone();
            }
            // set the reassembled requests NodesToAdd and responses Results
            this.Request.NodesToAdd = new UaAddNodesItems(tempNodesToAdd.length);
            this.Response.Results = new UaAddNodesResults(tempResults.length);
            for( var i=0; i < tempNodesToAdd.length; i++ ) this.Request.NodesToAdd[i] = tempNodesToAdd[i].clone();
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
     * Invokes the call to AddNodes.
     * 
     * @param {object} args An object containing all parameter
     * @param {UaAddNodesItem[]} args.NodesToAdd - An array of UaAddNodesItem objects to add.
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
        if( !isDefined( args.NodesToAdd ) ) args.NodesToAdd = [];
        if( !isDefined( args.NodesToAdd.length ) ) args.NodesToAdd = [ args.NodesToAdd ];
        if( !isDefined( args.Debug ) ) args.Debug = false;

        // register that this service is tested
        ServiceRegister.Register( { Service: ServiceRegister.UaService( { Name: this.Name, Available: true, Tested: true } ) } );

        // prepare our return value
        var result = true;

        // prepare the actual call
        this.Request  = new UaAddNodesRequest();
        this.Response = new UaAddNodesResponse();
        var session = isDefined( this.Session.Session )? this.Session.Session : this.Session;
        this.Request.RequestHeader = UaRequestHeader.New( { Session: session, ReturnDiagnostics: args.ReturnDiagnostics } );

        // specify the nodes to add
        for( var i=0; i<args.NodesToAdd.length; i++ ) this.Request.NodesToAdd[i] = args.NodesToAdd[i];

        // update the timestamp in the RequestHeader before sending it out
        this.Request.RequestHeader.Timestamp = UaDateTime.utcNow();

        if( isDefined( args.PreHook ) && ( !isDefined( args.SkipHooks ) || !args.SkipHooks ) ) args.PreHook();
        var uaStatus = session.addNodes( this.Request, this.Response );
        CheckResourceError();
        if( isDefined( args.PostHook ) && ( !isDefined( args.SkipHooks ) || !args.SkipHooks ) ) args.PostHook();
        CheckUserStop();
        // check the results
        this.Success = uaStatus.isGood();
        if( uaStatus.isGood() ) {
            result = UaResponseHeader.IsValid( { Service: this, ServiceResult: args.ServiceResult, SuppressMessaging: args.SuppressMessaging, SuppressErrors: args.SuppressErrors, ServiceInfo: "NodesToAdd #" + this.Request.NodesToAdd.length } );
            if( result ) result = this.CheckAddNodesResponse( {
                    Request: this.Request, 
                    Response: this.Response, 
                    ServiceResult: args.ServiceResult,
                    OperationResults: args.OperationResults } );
        }
        else {
            addError( this.Name + "() status: " + uaStatus, uaStatus );
            result = false;
        }

        return( result );
    };// this.ExecuteExt = function( args )

    this.CheckAddNodesResponse = function( args ) { 
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
            if( !Assert.Equal( args.Request.NodesToAdd.length, args.Response.Results.length, "The number of NodesToAdd does not match the number of results." ) ) result = false;
            else {
                // do we need to check each result?
                // check each result
                if( isDefined( args.OperationResults ) ) 
                    for( var i=0; i<args.Response.Results.length; i++ )  {
                        Assert.StatusCodeIsOneOf( args.OperationResults[i], args.Response.Results[i].StatusCode, "AddNodes.Response.Results[" + i + "] StatusCode mismatch.", "AddNodes.Response.Results[" + i + "] complies: " + args.OperationResults[i] );
                        if( args.Response.Results[i].StatusCode.isGood() ) 
                            if (UaNodeId.IsEmpty(args.Response.Results[i].AddedNodeId)) {
                                addError("AddNodes[" + i + "].AddedNodeId " + args.Response.Results[i].AddedNodeId + " is empty, although the returned status code indicates success.");
                                result = false;
                            }
                    }
                }
        }
        return result;
    };// this.CheckAddNodesResponse = function( args )

}// function AddNodesService( session )


/* Returns a unique browse name. Examples: 
        BrowseName.New( { Name: "name1" } )
        BrowseName.New( { NodeClass: NodeClass.Unspecified } ) */
var BrowseName = {
    DataTypeNo:      0,
    MethodNo:        0,
    ObjectNo:        0,
    ObjectTypeNo:    0,
    ReferenceTypeNo: 0,
    UnspecifiedNo:   0,
    VariableNo:      0,
    VariableTypeNo:  0,
    ViewNo:          0,

    /* Parameters include: 
            - Name: (optional) user-specified string for the browse name
            - NodeClass: (required) the type of node to create */
    New: function( args ) {
        var b = "";
        if( isDefined( args ) ) {
            if( isDefined( args.Name ) ) b += args.Name;
            if( !isDefined( args.NodeClass ) ) args.NodeClass = BuiltInType.Unspecified;
            if( !isDefined( args.Name ) ) b += NodeClass.toString( args.NodeClass );
            var num;
            switch( args.NodeClass ) {
                case NodeClass.DataType:   num = "".padDigits( ( ++this.DataTypeNo ), 3 ); break;
                case NodeClass.Method:     num = "".padDigits( ( ++this.MethodNo ), 3 ); break;
                case NodeClass.Object:     num = "".padDigits( ( ++this.ObjectNo ), 3 ); break;
                case NodeClass.ObjectType: num = "".padDigits( ( ++this.ObjectTypeNo ), 3 ); break;
                case NodeClass.ReferenceType: num = "".padDigits( ( ++this.ReferenceTypeNo ), 3 ); break;
                case NodeClass.Unspecified:   num = "".padDigits( ( ++this.UnspecifiedNo ), 3 ); break;
                case NodeClass.Variable:      num = "".padDigits( ( ++this.VariableNo ), 3 ); break;
                case NodeClass.VariableType:  num = "".padDigits( ( ++this.VariableTypeNo ), 3 ); break;
                case NodeClass.View:          num = "".padDigits( ( ++this.ViewNo ), 3 ); break;
                default: num = "".padDigits( ( ++this.UnspecifiedNo ), 3 ); break;
            }
            b += num;
        }
        return( b );
    }
};