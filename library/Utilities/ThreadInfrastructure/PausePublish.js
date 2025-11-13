/*    This class object is responsible for calling the PausePublish() service and for also
      performing any validation etc.*/

function PausePublishService( args ) {
    this.Name = "PausePublish";
    this.Session = null;
    this.Request = null;
    this.Response = null;
    this.UaStatus = null;

    if( !isDefined( args ) ) throw( this.Name + " CTOR, arguments not specified." );
    if( !isDefined( args.Session ) ) throw( this.Name + " CTOR, session not specified." );
    else this.Session = args.Session;


    /* PausePublish values.
          Parameters are: 
              SuppressMessaging  = do not log messages
              SuppressWarnings   = do not long warnings
              PreHook            = function to invoke immediately before the Service call
              PostHook           = function to invoke immediately after the Server call
              */
    this.Execute = function( args ) {
        // parameter validation
        if( !isDefined( args ) ) throw( this.Name + "::Execute() args not specified." );
        if( !isDefined( args.ThreadId ) ) throw( this.Name + "::Execute() args.ThreadId not specified." );
        if( !isDefined( args.Pause ) ) throw( this.Name + "::Execute() args.Pause not specified." );
        if( isDefined ( args.SuppressMessages ) ) args.SuppressMessaging = args.SuppressMessages;
        if( !isDefined( args.SuppressMessaging ) ) args.SuppressMessaging = false;
        if( !isDefined( args.SuppressWarnings ) )  args.SuppressWarnings = false;

        ServiceRegister.Register( { Service: ServiceRegister.UaService( { Name: this.Name, Available: true, Tested: true } ) } );

        var result = false;

        // define the write headers
        this.Request  = new UaPausePublishRequest();
        this.Request.ThreadId = args.ThreadId;
        this.Request.Pause = args.Pause;
        
        var session = isDefined( this.Session.Session )? this.Session.Session : this.Session;

        // issue the command while processing any hooks before/after
        if( isDefined( args.PreHook ) ) args.PreHook();
        this.UaStatus = session.pausePublish( this.Request );
        CheckResourceError();
        if( isDefined( args.PostHook ) ) args.PostHook();
        CheckUserStop();
        // check result
        if( this.UaStatus.isGood() ) {
            print( "PausePublish succeeded" );
            result = true;
        }
        else {
            addError( "PausePublish() failed, status " + this.UaStatus, this.UaStatus );
        }
        // if the call failed then register that 
        if( !result ) ServiceRegister.SetFailed( { Name: this.Name } )
        return( result );
    };//PausePublish
}