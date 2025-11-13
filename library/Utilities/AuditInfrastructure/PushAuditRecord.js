/*    This class object is responsible for calling the PushAuditRecord() service and for also
      performing any validation etc.*/


function PushAuditRecordService( args ) {
    this.Name = "PushAuditRecord";
    this.Session = null;
    this.Request = null;
    this.Response = null;
    this.UaStatus = null;

    if( !isDefined( args ) ) throw( this.Name + " CTOR, arguments not specified." );
    if( !isDefined( args.Session ) ) throw( this.Name + " CTOR, session not specified." );
    else this.Session = args.Session;


    /* PushAuditRecord values.
          Parameters are: 
              SuppressMessaging  = do not log messages
              SuppressWarnings   = do not long warnings
              PreHook            = function to invoke immediately before the Service call
              PostHook           = function to invoke immediately after the Server call
              */
    this.Execute = function( args ) {
        // parameter validation
        if( !isDefined( args ) ) throw(  this.Name + "::Execute() args not specified." );
        if( !isDefined( args.ThreadId ) ) throw( this.Name + " ThreadId not specified." );
        if( !isDefined( args.SubscriptionId ) ) throw( this.Name + " SubscriptionId not specified." );
        if( !isDefined( args.ClientId ) ) throw( this.Name + " ClientId not specified." );
        if( !isDefined( args.AuditEventType ) ) throw( this.Name + " AuditEventType not specified." );
        if( !isDefined( args.AuditEntryId ) ) throw( this.Name + " AuditEntryId not specified." );
        if( !isDefined( args.PropertyNames ) ) throw( this.Name + " PropertyNames not specified." );
        if( !isDefined( args.PropertyValues ) ) throw( this.Name + " PropertyValues not specified." );
        if ( !isDefined(args.PropertyNames.length) || !isDefined(args.PropertyValues.length)) {throw( this.Name + " Properties must be an array." );}
        if ( args.PropertyNames.length != args.PropertyValues.length ){throw( this.Name + " Property names and values must be arrays of the same length." );}
        if( isDefined ( args.SuppressMessages ) ) args.SuppressMessaging = args.SuppressMessages;
        if( !isDefined( args.SuppressMessaging ) ) args.SuppressMessaging = false;
        if( !isDefined( args.SuppressWarnings ) )  args.SuppressWarnings = false;

        ServiceRegister.Register( { Service: ServiceRegister.UaService( { Name: this.Name, Available: true, Tested: true } ) } );

        var result = { status : false, identifier : null };

        var session = isDefined( this.Session.Session )? this.Session.Session : this.Session;

        // define the write headers
        var auditParameters = new UaAuditEventParams();
        auditParameters.ThreadId = args.ThreadId;
        auditParameters.SubscriptionId = args.SubscriptionId;
        auditParameters.ClientId = args.ClientId;
        auditParameters.AuditEventType = args.AuditEventType;
        auditParameters.AuditEntryId = args.AuditEntryId;
        auditParameters.PropertyNames = args.PropertyNames;
        auditParameters.PropertyValues = args.PropertyValues;
        
        this.Request  = new UaPushAuditRecordRequest();
        this.Response = new UaPushAuditRecordResponse();

        this.Request.Parameters = auditParameters;

        // issue the command while processing any hooks before/after
        if( isDefined( args.PreHook ) ) args.PreHook();
        if( isDefined( this.Session.Session ) ) this.UaStatus = this.Session.Session.pushAuditRecord( this.Request, this.Response );
        else this.UaStatus = session.pushAuditRecord( this.Request, this.Response );
        CheckResourceError();
        if( isDefined( args.PostHook ) ) args.PostHook();
        CheckUserStop();
        // check result
        if( this.UaStatus.isGood() ) {
            result.status = true;
            var identifier = { ThreadId :       this.Response.ThreadId,
                               SubscriptionId : this.Response.SubscriptionId,
                               EventId :        this.Response.EventId,
                               ClientId :       this.Response.ClientId };
            
            result.identifier = identifier;

            print( "PushAuditRecord succeeded" );
            print( this.PrintLastAuditRecord().join("\r\n"));
        }
        else {
            addError( "PushAuditRecord() failed, status " + this.UaStatus, this.UaStatus );
        }


        // if the call failed then register that 
        if( !result.status ) ServiceRegister.SetFailed( { Name: this.Name } )
        return( result.status );
    }; //PushAuditRecord



  
    // prints the values received in the last Push Audit Record call.
    this.PrintLastAuditRecord = function( ) {
        var lines = [];

        var eventLine = null;
        if (this.UaStatus.isGood()){
            lines.push( "Push Audit Record Succeeded" );
            eventLine = "EventId = " + this.Response.EventId;
        }else{
            lines.push( "Push Audit Record Failed" );
        }
        
        lines.push( "ThreadId " + this.Request.Parameters.ThreadId );
        lines.push( "SubscriptionId " + this.Request.Parameters.SubscriptionId );
        lines.push( "ClientId " + this.Request.Parameters.ClientId );

        for ( var index = 0; index < this.Request.Parameters.PropertyNames.length; index++ ){
            lines.push( "Property " + this.Request.Parameters.PropertyNames[index].toString() + " = " + this.Request.Parameters.PropertyValues[index].toString())
        }

        if ( eventLine != null ){
            lines.push(eventLine);
        }

        return lines;
    };

    this.testCondition = function( ){
        var result = this.Execute();
    };

    this.test = function() {
        this.testCondition();
    };
}
