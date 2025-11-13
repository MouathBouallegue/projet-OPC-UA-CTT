/*    This class object is responsible for calling the StartThreadSession() service and for also
      performing any validation etc.*/

function StartThreadSessionService( args ) {
    this.Name = "StartThreadSession";
    this.Session = null;
    this.Request = null;
    this.Response = null;
    this.UaStatus = null;

    if( !isDefined( args ) ) throw( this.Name + " CTOR, arguments not specified." );
    if( !isDefined( args.Session ) ) throw( this.Name + " CTOR, session not specified." );
    else this.Session = args.Session;

    /* StartThreadSession values.
          Parameters are: 
              SuppressMessaging  = do not log messages
              SuppressWarnings   = do not long warnings
              PreHook            = function to invoke immediately before the Service call
              PostHook           = function to invoke immediately after the Server call
              */
    this.Execute = function( args ) {
        // parameter validation
        if( !isDefined( args ) ) args = new Object();
        if( isDefined ( args.SuppressMessages ) ) args.SuppressMessaging = args.SuppressMessages;
        if( !isDefined( args.SuppressMessaging ) ) args.SuppressMessaging = false;
        if( !isDefined( args.SuppressWarnings ) )  args.SuppressWarnings = false;

        ServiceRegister.Register( { Service: ServiceRegister.UaService( { Name: this.Name, Available: true, Tested: true } ) } );

        var result = { status: false, threadId : 0 };

        // define the write headers
        this.Response = new UaStartThreadSessionResponse();
        var session = isDefined( this.Session.Session )? this.Session.Session : this.Session;

        // issue the command while processing any hooks before/after
        if( isDefined( args.PreHook ) ) args.PreHook();
        this.UaStatus = session.startThreadSession( this.Response );
        CheckResourceError();
        if( isDefined( args.PostHook ) ) args.PostHook();
        CheckUserStop();
        // check result
        if( this.UaStatus.isGood() ) {
            print( "StartThreadSession succeeded" );
            result.status = true;
            result.threadId = this.Response.ThreadId;
        }
        else {
            addError( "StartThreadSession() failed, status " + this.UaStatus, this.UaStatus );
        }
        // if the call failed then register that 
        if( !result.status ) ServiceRegister.SetFailed( { Name: this.Name } )
        return( result );
    };//StartThreadSession
}