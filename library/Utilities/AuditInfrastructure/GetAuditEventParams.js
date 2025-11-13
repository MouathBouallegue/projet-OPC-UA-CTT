/*    This class object is responsible for calling the GetAuditEventParams() service and for also
      performing any validation etc.*/

function GetAuditEventParamsService( args ) {
    this.Name = "GetAuditEventParams";
    this.Session = null;
    this.Request = null;
    this.Response = null;
    this.UaStatus = null;

    if( !isDefined( args ) ) throw( this.Name + " CTOR, arguments not specified." );
    if( !isDefined( args.Session ) ) throw( this.Name + " CTOR, session not specified." );
    else this.Session = args.Session;


    /* GetAuditEventParams values.
          Parameters are: 
              SuppressMessaging  = do not log messages
              SuppressWarnings   = do not long warnings
              PreHook            = function to invoke immediately before the Service call
              PostHook           = function to invoke immediately after the Server call
              */
    this.Execute = function( args ) {
        // parameter validation
        if( !isDefined( args ) ) throw( "GetAuditEventParams.js::Execute() args not specified." );
        if( !isDefined( args.ThreadId ) ) throw( "GetAuditEventParams.js::Execute() args not specified." );
        if( !isDefined( args.SubscriptionId ) ) throw( "GetAuditEventParams.js::Execute() args not specified." );
        if( !isDefined( args.ClientId ) ) throw( this.Name + " ClientId not specified." );
        if( !isDefined( args.AuditEventType ) ) throw( "GetAuditEventParams.js::Execute() args not specified." );
        if( !isDefined( args.AuditEntryIds ) ) args.AuditEntryIds = new UaStrings();
        if( isDefined ( args.SuppressMessages ) ) args.SuppressMessaging = args.SuppressMessages;
        if( !isDefined( args.SuppressMessaging ) ) args.SuppressMessaging = false;
        if( !isDefined( args.SuppressWarnings ) )  args.SuppressWarnings = false;

        ServiceRegister.Register( { Service: ServiceRegister.UaService( { Name: this.Name, Available: true, Tested: true } ) } );

        var result = { status: false, events: null };

        // define the write headers
        this.Request  = new UaGetAuditEventParamsRequest();
        this.Request.ThreadId = args.ThreadId;
        this.Request.SubscriptionId = args.SubscriptionId;
        this.Request.ClientId = args.ClientId;
        this.Request.AuditEventType = args.AuditEventType;

        for( var index=0; index < args.AuditEntryIds.length; index++ ) {
            this.Request.AuditEntryIds[index] = args.AuditEntryIds[index];
        }

        this.Response = new UaGetAuditEventParamsResponse();
        var session = isDefined( this.Session.Session )? this.Session.Session : this.Session;

        // issue the command while processing any hooks before/after
        if( isDefined( args.PreHook ) ) args.PreHook();
        this.UaStatus = session.getAuditEventParams( this.Request, this.Response );
        CheckResourceError();
        if( isDefined( args.PostHook ) ) args.PostHook();
        CheckUserStop();
        // check result
        if( this.UaStatus.isGood() ) {
            result.status = true;
            if (isDefined(this.Response.AuditEvents)){
                result.events = this.Response.AuditEvents;
            }
        }
        else {
            addError( "GetAuditEventParams() failed, status " + this.UaStatus, this.UaStatus );
        }
        // if the call failed then register that 
        if( !result ) ServiceRegister.SetFailed( { Name: this.Name } )
        return( result );
    };//GetAuditEventParams
  
    // prints the values received in the last Read call.
    this.ValuesToString = function( result ) {
        // Is there a simple way to do this?
        var lines = [];
        if ( result.status == false ){
            lines.push("GetAuditEventParams call failed");
        }else{
            if( isDefined( result.events ) && isDefined( result.events )){
                lines.push("GetAuditEventParams request for " +
                    GetAuditEventName( this.Request.AuditEventType ) + " returned " + 
                    result.events.length + " Expected Audit Results");

                for ( var index = 0; index < result.events.length; index++ ){
                    var auditEvent = result.events[index];
                    lines.push( "Expected Audit Event " + index );
                    lines.push( "ThreadId "+ auditEvent.ThreadId );
                    lines.push( "SubscriptionId "+ auditEvent.SubscriptionId );
                    lines.push( "Event Id = " + auditEvent.EventId );
                    lines.push( "Audit Event Type = "+ GetAuditEventName( auditEvent.AuditEventType ) );
                    lines.push( "Audit Client Id = "+ auditEvent.AuditEntryId );
                    lines.push( "Expected Audit Event Properties" );
                    for ( var propertyIndex = 0; propertyIndex < auditEvent.PropertyNames.length; propertyIndex++ ){
                        lines.push( "Property Name " + auditEvent.PropertyNames[propertyIndex].Name + " Value = " + auditEvent.PropertyValues[propertyIndex] );
                    }
                }
            }else{
                lines.push( "GetAuditEventParams succeeded, but no data" );
            }

        }        
        return lines;
    };
}