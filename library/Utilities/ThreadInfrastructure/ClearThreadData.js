/*    This class object is responsible for calling the ClearThreadData() service and for also
      performing any validation etc.*/


function ClearThreadDataService( args ) {
    this.Name = "ClearThreadData";
    this.Session = null;
    this.Request = null;
    this.Response = null;
    this.UaStatus = null;

    if( !isDefined( args ) ) throw( this.Name + " CTOR, arguments not specified." );
    if( !isDefined( args.Session ) ) throw( this.Name + " CTOR, session not specified." );
    else this.Session = args.Session;


    /* ClearThreadData values.
          Parameters are: 
              ThreadId - ThreadId to make the request against
              SubscriptionId - Subscription to make the request against
              SuppressMessaging  = do not log messages
              SuppressWarnings   = do not long warnings
              PreHook            = function to invoke immediately before the Service call
              PostHook           = function to invoke immediately after the Server call
              */
    this.Execute = function( args ) {
        // parameter validation
        if( !isDefined( args ) ) throw( "ClearThreadData.js::Execute() args not specified." );
        if( !isDefined( args.ThreadId ) ) throw( this.Name + " ThreadId not specified." );
        if( !isDefined( args.SubscriptionId ) ) args.SubscriptionId = 0;
        if( !isDefined( args.ClearEvents ) ) args.ClearEvents = false;
        if( !isDefined( args.ClearExpectedEvents ) ) args.ClearExpectedEvents = false;
        if( !isDefined( args.ClearData ) ) args.ClearData = false;
        if( !isDefined( args.ClientId ) ) args.ClientId = 0;
        if( !isDefined( args.ClearStatistics ) ) args.ClearStatistics = 0;
        if( isDefined ( args.SuppressMessages ) ) args.SuppressMessaging = args.SuppressMessages;
        if( !isDefined( args.SuppressMessaging ) ) args.SuppressMessaging = false;
        if( !isDefined( args.SuppressWarnings ) )  args.SuppressWarnings = false;

        ServiceRegister.Register( { Service: ServiceRegister.UaService( { Name: this.Name, Available: true, Tested: true } ) } );

        var result = false;

        // define the write headers
        this.Request  = new UaClearThreadDataRequest();
        var session = isDefined( this.Session.Session )? this.Session.Session : this.Session;
        this.Request.ThreadId = args.ThreadId;
        this.Request.SubscriptionId = args.SubscriptionId;
        this.Request.ClearEvents = args.ClearEvents;
        this.Request.ClearExpectedEvents = args.ClearExpectedEvents;
        this.Request.ClearData = args.ClearData;
        this.Request.ClientId = args.ClientId;
        this.Request.ClearStatistics = args.ClearStatistics;

        // issue the command while processing any hooks before/after
        if( isDefined( args.PreHook ) ) args.PreHook();
        this.UaStatus = session.clearThreadData( this.Request );
        CheckResourceError();
        if( isDefined( args.PostHook ) ) args.PostHook();
        CheckUserStop();
        // check result
        if( this.UaStatus.isGood() ) {
            result = true;
        }
        // if the call failed then register that 
        if( !result ) ServiceRegister.SetFailed( { Name: this.Name } )
        return( result );
    };//ClearThreadData
 }