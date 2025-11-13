/* Nathan Pocock (compliance@opcfoundation.org)
    UA Service: Call

    Description: This class contains all functionality to quickly and easily invoke a Call method
                 and managing the response etc. */

UaCallMethodRequest.New = function( args ) {
    var x = new UaCallMethodRequest();
    if( isDefined( args ) ) {
        if( isDefined( args.InputArguments ) ) {
            if( !isDefined( args.InputArguments.length ) ) x.InputArguments[0] = args.InputArguments;
            else for( var i=0; i<args.InputArguments.length; i++ ) x.InputArguments[i] = args.InputArguments[i];
        }
        if( !isDefined( args.MethodId ) ) throw( "UaCallMethodRequest.New::args.MethodId not specified." );
        else {
            if( args.MethodId.NodeId == undefined ) x.MethodId = args.MethodId;
            else x.MethodId = args.MethodId.NodeId;
        }
        if( !isDefined( args.ObjectId ) ) throw( "UaCallMethodRequest.New::args.ObjectId not specified." );
        else {
            if( args.ObjectId.NodeId == undefined ) x.ObjectId = args.ObjectId;
            else x.ObjectId = args.ObjectId.NodeId;
        }
    }
    return( x );
}

function CallService( args ) {
    this.Name = "Call";
    this.Session = null;
    this.Request = null;
    this.Response = null;
    this.UaStatus = null;
    this.CallCount = 0;

    if( !isDefined( args ) ) throw( this.Name + " CTOR, arguments not specified." );
    if( !isDefined( args.Session ) ) throw( this.Name + " CTOR, session not specified." );
    else this.Session = args.Session;


    /* args, parameters include: 
            ServiceResult: 
            OperationResults: 
            InputArgumentResults: 
            MethodsToCall: */
    this.Execute = function( args ) { 
        if( !isDefined( args ) ) args = new Object();
        if( isDefined( args.OperationResults ) && ( args.OperationResults.length !== args.MethodsToCall.length ) ) throw( "CallService.Execute::args.MethodsToCall.length (" + args.MethodsToCall.length + ") does not match args.OperationResults.length (" + args.OperationResults.length + ")." );
        if( !isDefined( args.SuppressMessaging ) ) args.SuppressMessaging = false;
        // are we working with one method, or multiple? always use multiples though!
        if( !isDefined( args.MethodsToCall ) ) throw( "CallService.Execute::args.MethodsToCall not specified." );
        if ( !isDefined( args.MethodsToCall.length ) ) args.MethodsToCall = [args.MethodsToCall];
        if ( !isDefined( args.ProhibitSplitting ) ) args.ProhibitSplitting = false;
        var MaxNodesPerMethodCall = 65535;
        var NumberOfAlreadyCalledMethods = 0;
        var AllMethodsToCall = args.MethodsToCall;

        if ( gServerCapabilities.OperationLimits !== null && gServerCapabilities.OperationLimits !== undefined ) {
            if ( gServerCapabilities.OperationLimits.MaxNodesPerMethodCall != 0 ) MaxNodesPerMethodCall = gServerCapabilities.OperationLimits.MaxNodesPerMethodCall;
        }
        if ( ( MaxNodesPerMethodCall < args.MethodsToCall.length ) && ( args.ProhibitSplitting == false ) ) {
            if ( isDefined( args.OperationResults ) && isDefined( args.OperationResults.length ) ) var AllOperationResults = args.OperationResults;
            addLog( "=== Call.Execute > Exceeding the limit MaxNodesPerMethodCall on the server, splitting the call into multiple Requests." );
            while ( NumberOfAlreadyCalledMethods < AllMethodsToCall.length ) {
                var innerResult = true;
                var currentListOfMethods = [];
                var currentListOfOperationResults = [];
                for ( var i = 0; ( i < MaxNodesPerMethodCall ) && ( AllMethodsToCall.length > NumberOfAlreadyCalledMethods + i ); i++ ) {
                    currentListOfMethods.push( AllMethodsToCall[NumberOfAlreadyCalledMethods + i] );
                    if ( isDefined( args.OperationResults ) && isDefined( args.OperationResults.length ) ) currentListOfOperationResults.push( AllOperationResults[NumberOfAlreadyCalledMethods + i] );
                }
                if ( currentListOfMethods.length == 0 ) break;
                args.MethodsToCall = currentListOfMethods;
                if ( isDefined( args.OperationResults ) && isDefined( args.OperationResults.length ) ) args.OperationResults = currentListOfOperationResults;
                innerResult = this.ExecuteExt( args );
                result = result && innerResult ? true : false;  // validation failed, so override *this* result
                NumberOfAlreadyCalledMethods += currentListOfMethods.length;
            }

        }
        else {
            return ( this.ExecuteExt( args ) );
        }        
        return( result );
    }// Execute();

    this.ExecuteExt = function ( args ) {
        if ( !isDefined( args ) ) args = new Object();
        if ( isDefined( args.OperationResults ) && ( args.OperationResults.length !== args.MethodsToCall.length ) ) throw ( "CallService.Execute::args.MethodsToCall.length (" + args.MethodsToCall.length + ") does not match args.OperationResults.length (" + args.OperationResults.length + ")." );
        if ( !isDefined( args.SuppressMessaging ) ) args.SuppressMessaging = false;
        // are we working with one method, or multiple? always use multiples though!
        if ( !isDefined( args.MethodsToCall ) ) throw ( "CallService.Execute::args.MethodsToCall not specified." );
        if ( !isDefined( args.MethodsToCall.length ) ) args.MethodsToCall = [args.MethodsToCall];

        this.Request = new UaCallRequest();
        this.Response = new UaCallResponse();
        var session = isDefined( this.Session.Session ) ? this.Session.Session : this.Session;
        this.Request.RequestHeader = UaRequestHeader.New( { Session: session, ReturnDiagnostics: args.ReturnDiagnostics } );
        for ( var i = 0; i < args.MethodsToCall.length; i++ ) this.Request.MethodsToCall[i] = UaCallMethodRequest.New( args.MethodsToCall[i] );

        // register that this service is tested
        ServiceRegister.Register( { Service: ServiceRegister.UaService( { Name: this.Name, Available: false, Tested: false } ) } );

        // update the timestamp in the RequestHeader before sending it out
        this.Request.RequestHeader.Timestamp = UaDateTime.utcNow();

        // invoke the call to the UA Server 
        if ( isDefined( args.PreHook ) ) args.PreHook();
        this.GetUniqueAuditEntryId( session, this.Request );
        this.UaStatus = session.call( this.Request, this.Response );
        CheckResourceError();
        for ( var i = 0; i < args.MethodsToCall.length; i++ ) {
            this.PushAuditRecord( session, this.Request, this.Response, args.MethodsToCall[i] );
        }
        if ( isDefined( args.PostHook ) ) args.PostHook();
        CheckUserStop();
        // if the call failed then register that
        if ( this.UaStatus.isBad() ) ServiceRegister.SetFailed( { Name: this.Name } )
        // Check Service Result 
        if ( this.UaStatus.isGood() ) {
            result = UaResponseHeader.IsValid( { Service: this, ServiceResult: args.ServiceResult, SuppressMessaging: args.SuppressMessaging, ServiceInfo: " MethodsToCall #: " + this.Request.MethodsToCall.length } );
            if ( !result ) {
                // check to make sure other parameters are not specified whenever there is a Bad service result. See UA Part 4 7.30 ServiceFault.
                Assert.Equal( 0, this.Response.Results.length, this.Name + ".Response.Results are not needed when a ServiceFault is returned." );
            }
            // Check the Operation results
            if ( isDefined( args.OperationResults ) ) {
                for ( var i = 0; i < args.OperationResults.length; i++ )
                    if ( !Assert.StatusCodeIs( args.OperationResults[i], this.Response.Results[i].StatusCode, "Call.Results[" + i + "].StatusCode incorrect.", "\tResponse.Results[" + i + "].StatusCode = " + this.Response.Results[i].StatusCode ) ) result = false;
            }

            // Check the input argument results
            if ( isDefined( args.InputArgumentResults ) ) {
                for ( var i = 0; i < args.InputArgumentResults.length; i++ )
                    if ( !Assert.StatusCodeIs( args.InputArgumentResults[i], this.Response.Results[i].InputArgumentResults[i].StatusCode, "Call.Results[" + i + "].InputArgumentResults incorrect.", "\tResponse.Results[" + i + "].InputArgumentResults = " + this.Response.Results[i].InputArgumentResults ) ) result = false;
            }
            // Alternatively a set of Methods has been used
            if ( args.MethodsToCall.length > 1 ) {
                for ( var j = 0; j < args.MethodsToCall.length; j++ ) {
                    if ( isDefined( args.MethodsToCall[j].OperationResults ) ) {
                        if ( !isDefined( args.MethodsToCall[j].OperationResults.length ) ) args.MethodsToCall[j].OperationResults = [args.MethodsToCall[j].OperationResults];
                        for ( var i = 0; i < args.MethodsToCall[j].OperationResults.length; i++ )
                            if ( !Assert.StatusCodeIs( args.MethodsToCall[j].OperationResults[i], this.Response.Results[j].StatusCode, "Call.Results[" + j + "].StatusCode incorrect.", "\tResponse.Results[" + j + "].StatusCode = " + this.Response.Results[j].StatusCode ) ) result = false;
                    }
                    if ( isDefined( args.MethodsToCall[j].InputArgumentResults ) ) {
                        if ( !isDefined( args.MethodsToCall[j].InputArgumentResults.length ) ) args.MethodsToCall[j].InputArgumentResults = [args.MethodsToCall[j].InputArgumentResults];
                        for ( var i = 0; i < args.MethodsToCall[j].InputArgumentResults.length; i++ )
                            if ( !Assert.StatusCodeIs( args.MethodsToCall[j].InputArgumentResults[i], this.Response.Results[j].InputArgumentResults[i].StatusCode, "Call.Results[" + j + "].InputArgumentResults incorrect.", "\tResponse.Results[" + j + "].InputArgumentResults = " + this.Response.Results[j].InputArgumentResults ) ) result = false;
                    }
                }
            }
        }
        else {
            Assert.StatusCodeIsOneOf( args.ServiceResult, this.UaStatus, this.Name + " the ErrorCode in the Error Message received doesn't match the expectation." );
            result = false;
        }

        return ( result );
    }// ExecuteExt();

    this.GetUniqueAuditEntryId = function ( session, request ) {
        var newEntry = session.getUniqueAuditEntry();
        request.RequestHeader.AuditEntryId = newEntry;
    }

    this.PushAuditRecord = function ( session, request, response, method ) {

        var count = 13;

        var index = 0;
        var names = new UaQualifiedNames( count );
        var values = new UaVariants( count );

        var eventType = new UaNodeId( Identifier.AuditUpdateMethodEventType );
        names[index].Name = "EventType";
        values[index].setNodeId( eventType );

        index++;
        // There does seem to be a way to get an audit entry id
        var auditEntryId = request.RequestHeader.AuditEntryId;
        names[index].Name = "ClientAuditEntryId";
        values[index].setString( auditEntryId );

        index++;
        names[index].Name = "Status";
        values[index].setBoolean( response.ResponseHeader.ServiceResult.isGood() );

        index++;
        names[index].Name = "Time";
        values[index].setDateTime( UaDateTime.utcNow() );

        index++;
        names[index].Name = "SessionId";
        values[index].setNodeId( session.SessionId );

        index++;
        names[index].Name = "UserIdentityToken";
        values[index] = null;

        index++;
        names[index].Name = "ClientCertificate";
        values[index] = null;

        index++;
        names[index].Name = "RevisedSessionTimeout";
        values[index] = null;

        index++;
        names[index].Name = "SecurityPolicyUri";
        values[index] = null;

        index++;
        names[index].Name = "SecurityPolicyMode";
        values[index] = null;

        index++;
        names[index].Name = "RequestedLifetime";
        values[index] = null;

        names[11].Name = "MethodId";
        values[11] = method.MethodId;

        if ( isDefined( method.InputArguments ) && method.InputArguments.length > 0 ) {
            var input = true;
        }
        names[12].Name = "InputArguments";
        values[12].setBoolean( input );



        Test.PushAuditRecord(
            {
                AuditEventType: eventType,
                AuditEntryId: auditEntryId,
                PropertyNames: names,
                PropertyValues: values
            }
        );
    }

}//CallService