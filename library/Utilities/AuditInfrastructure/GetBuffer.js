/*    This class object is responsible for calling the GetBuffer() service and for also
      performing any validation etc.*/

include( "./library/Utilities/AuditInfrastructure/AuditBufferHelper.js" );

function GetBufferService( args ) {
    this.Name = "GetBuffer";
    this.Session = null;
    this.Request = null;
    this.Response = null;
    this.UaStatus = null;

    if( !isDefined( args ) ) throw( this.Name + " CTOR, arguments not specified." );
    if( !isDefined( args.Session ) ) throw( this.Name + " CTOR, session not specified." );
    else this.Session = args.Session;


    /* GetBuffer values.
          Parameters are: 
              ThreadId - ThreadId to make the request against
              SubscriptionId - Subscription to make the request against
              ClientId - ClientId of the event monitoredItem
              SuppressMessaging  = do not log messages
              SuppressWarnings   = do not long warnings
              PreHook            = function to invoke immediately before the Service call
              PostHook           = function to invoke immediately after the Server call
              */
    this.Execute = function( args ) {
        // parameter validation
        if( !isDefined( args ) ) throw( "GetBuffer.js::Execute() args not specified." );
        if( !isDefined( args.ThreadId ) ) throw( this.Name + " ThreadId not specified." );
        if( !isDefined( args.SubscriptionId ) ) throw( this.Name + " SubscriptionId not specified." );
        if( !isDefined( args.ClientId ) ) throw( this.Name + " ClientId not specified." );
        if( isDefined ( args.SuppressMessages ) ) args.SuppressMessaging = args.SuppressMessages;
        if( !isDefined( args.SuppressMessaging ) ) args.SuppressMessaging = false;
        if( !isDefined( args.SuppressWarnings ) )  args.SuppressWarnings = false;

        ServiceRegister.Register( { Service: ServiceRegister.UaService( { Name: this.Name, Available: true, Tested: true } ) } );

        var result = { status : false, events : null};

        // define the write headers
        this.Request  = new UaGetBufferRequest();
        this.Response = new UaGetBufferResponse();
        var session = isDefined( this.Session.Session )? this.Session.Session : this.Session;
        this.Request.ThreadId = args.ThreadId;
        this.Request.SubscriptionId = args.SubscriptionId;
        this.Request.ClientId = args.ClientId;

        // issue the command while processing any hooks before/after
        if( isDefined( args.PreHook ) ) args.PreHook();
        this.UaStatus = session.getBuffer( this.Request, this.Response );
        CheckResourceError();
        if( isDefined( args.PostHook ) ) args.PostHook();
        CheckUserStop();
        // check result
        if( this.UaStatus.isGood() ) {
            result = { status : true, events : this.Response.EventBuffers };
        }
        // if the call failed then register that 
        if( !result.status ) ServiceRegister.SetFailed( { Name: this.Name } )
        return( result );
    };//GetBuffer

   
    this.ValuesToString = function( results, selectClauses ) {
        return AuditBufferHelper.ValuesToString( this.Name, results, selectClauses );
    };
}