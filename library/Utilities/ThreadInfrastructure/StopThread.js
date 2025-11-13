/*    This class object is responsible for calling the StopThread() service and for also
      performing any validation etc.*/

function StopThreadService( args ) {
    this.Name = "StopThread";
    this.Session = null;
    this.Request = null;
    this.Response = null;
    this.UaStatus = null;

    if( !isDefined( args ) ) throw( this.Name + " CTOR, arguments not specified." );
    if( !isDefined( args.Session ) ) throw( this.Name + " CTOR, session not specified." );
    else this.Session = args.Session;


    /* StopThread values.
          Parameters are: 
              ThreadId           = The thread id to shut down for the current session.
              SuppressMessaging  = do not log messages
              SuppressWarnings   = do not long warnings
              PreHook            = function to invoke immediately before the Service call
              PostHook           = function to invoke immediately after the Server call
              */
    this.Execute = function( args ) {
        // parameter validation
        if( !isDefined( args ) ) throw( "StopThread.js::Execute() args not specified." );
        if( !isDefined( args.ThreadId ) ) throw( "StopThread.js::Execute() args.ThreadId not specified." );
        if( isDefined ( args.SuppressMessages ) ) args.SuppressMessaging = args.SuppressMessages;
        if( !isDefined( args.SuppressMessaging ) ) args.SuppressMessaging = false;
        if( !isDefined( args.SuppressWarnings ) )  args.SuppressWarnings = false;

        ServiceRegister.Register( { Service: ServiceRegister.UaService( { Name: this.Name, Available: true, Tested: true } ) } );

        var result = true;

        // define the write headers
        this.Request  = new UaStopThreadRequest();
        this.Request.ThreadId = args.ThreadId;

        var session = isDefined( this.Session.Session )? this.Session.Session : this.Session;

        // issue the command while processing any hooks before/after
        if( isDefined( args.PreHook ) ) args.PreHook();
        this.UaStatus = session.stopThread( this.Request );
        CheckResourceError();
        if( isDefined( args.PostHook ) ) args.PostHook();
        CheckUserStop();
        // check result
        if( this.UaStatus.isGood() ) {
            print( "StopThread of thread [" + args.ThreadId + "]succeeded" );
        }
        else {
            result = false;
            addError( "StopThread() failed, status " + this.UaStatus, this.UaStatus );
        }
        // if the call failed then register that 
        if( !result ) ServiceRegister.SetFailed( { Name: this.Name } )
        return( result );
    };//StopThread
  
    // prints the values received in the last Read call.
    this.ValuesToString = function( ) {
        return "StopThread - Unable to stop thread id [" + this.Request.ThreadId + "] session publish thread";
    };

    this.testCondition = function( badId ){
        var result = this.Execute({Session: this.Session, ThreadId : badId});

        if ( result !== false ){
            throw("StopThread test should not have been able to shut down bad thread id [" + badId + "]");
        }
    };

    this.test = function() {
        // The normal test case is tested in StartThreadPublish.js
        // This test condition should always return a bad response.
        this.testCondition( 0 );
        this.testCondition( 1 );
    };
}