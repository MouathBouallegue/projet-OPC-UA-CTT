/*    This class object is responsible for calling the FindEntry() service and for also
      performing any validation etc.*/

include( "./library/Utilities/AuditInfrastructure/AuditBufferHelper.js" );

function FindEntryService( args ) {
    this.Name = "FindEntry";
    this.Session = null;
    this.Request = null;
    this.Response = null;
    this.UaStatus = null;

    if( !isDefined( args ) ) throw( this.Name + " CTOR, arguments not specified." );
    if( !isDefined( args.Session ) ) throw( this.Name + " CTOR, session not specified." );
    else this.Session = args.Session;

    /* FindEntry values.
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
        if( !isDefined( args.EventFilter ) ) throw( this.Name + " EventFilter not specified." );
        if( isDefined ( args.SuppressMessages ) ) args.SuppressMessaging = args.SuppressMessages;
        if( !isDefined( args.SuppressMessaging ) ) args.SuppressMessaging = false;
        if( !isDefined( args.SuppressWarnings ) )  args.SuppressWarnings = false;

        ServiceRegister.Register( { Service: ServiceRegister.UaService( { Name: this.Name, Available: true, Tested: true } ) } );

        var result = { status : false, events : null};

        // define the write headers
        this.Request  = new UaFindEntryRequest();
        this.Response = new UaFindEntryResponse();
        var session = isDefined( this.Session.Session )? this.Session.Session : this.Session;
        this.Request.ThreadId = args.ThreadId;
        this.Request.SubscriptionId = args.SubscriptionId;
        this.Request.ClientId = args.ClientId;
        this.Request.Filter = args.EventFilter;

        // issue the command while processing any hooks before/after
        if( isDefined( args.PreHook ) ) args.PreHook();
        this.UaStatus = session.findEntry( this.Request, this.Response );
        CheckResourceError();
        if( isDefined( args.PostHook ) ) args.PostHook();
        CheckUserStop();
        // check result
        if( this.UaStatus.isGood() ) {
            print( "FindEntry succeeded" );
            result = { status : true, events : this.Response.EventBuffers };
        }
        else {
            addError( "FindEntry() failed, status " + this.UaStatus, this.UaStatus );
        }
        // if the call failed then register that 
        if( !result.status ) ServiceRegister.SetFailed( { Name: this.Name } )
        return( result );
    };//FindEntry
  
    // prints the values received in the last Read call.
    this.ValuesToString = function( results, selectClauses ) {
        return AuditBufferHelper.ValuesToString( this.Name, results, selectClauses );
    };
}