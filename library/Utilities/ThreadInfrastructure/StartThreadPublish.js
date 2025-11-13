/*    This class object is responsible for calling the StartThreadPublish() service and for also
      performing any validation etc.*/

function StartThreadPublishService( args ) {
    this.Name = "StartThreadPublish";
    this.Session = null;
    this.Request = null;
    this.Response = null;
    this.UaStatus = null;

    if( !isDefined( args ) ) throw( this.Name + " CTOR, arguments not specified." );
    if( !isDefined( args.Session ) ) throw( this.Name + " CTOR, session not specified." );
    else this.Session = args.Session;


    /* StartThreadPublish values.
          Parameters are: 
              SuppressMessaging  = do not log messages
              SuppressWarnings   = do not long warnings
              PreHook            = function to invoke immediately before the Service call
              PostHook           = function to invoke immediately after the Server call
              */
    this.Execute = function( args ) {
        // parameter validation
        if( !isDefined( args ) ) throw( this.Name + " args not specified." );
        if( !isDefined( args.ThreadId ) ) throw( this.Name + " ThreadId not specified." );
        if( !isDefined( args.SamplingInterval ) ) args.SamplingInterval = Settings.ServerTest.Capabilities.FastestSamplingIntervalSupported;
        if( !isDefined( args.PublishDuration ) ) args.PublishDuration = 0;
        if( !isDefined( args.MaximumPublishCalls ) ) args.MaximumPublishCount = 0;
        if( !isDefined( args.MaximumOutstandingCalls ) ) args.MaximumOutstandingCount = 1;
        if( isDefined ( args.SuppressMessages ) ) args.SuppressMessaging = args.SuppressMessages;
        if( !isDefined( args.SuppressMessaging ) ) args.SuppressMessaging = false;
        if( !isDefined( args.SuppressWarnings ) )  args.SuppressWarnings = false;

        ServiceRegister.Register( { Service: ServiceRegister.UaService( { Name: this.Name, Available: true, Tested: true } ) } );

        var result = false;

        this.Request = new UaStartThreadPublishRequest();
        this.Request.ThreadId = args.ThreadId;
        this.Request.SamplingInterval = args.SamplingInterval;
        this.Request.PublishDuration = args.PublishDuration;
        this.Request.MaximumPublishCalls = args.MaximumPublishCalls;
        this.Request.MaximumOutstandingCalls = args.MaximumOutstandingCalls;
        
        var session = isDefined( this.Session.Session )? this.Session.Session : this.Session;

        // issue the command while processing any hooks before/after
        if( isDefined( args.PreHook ) ) args.PreHook();
        this.UaStatus = session.startThreadPublish( this.Request );
        CheckResourceError();
        if( isDefined( args.PostHook ) ) args.PostHook();
        CheckUserStop();
        // check result
        if( this.UaStatus.isGood() ) {
            result = true;
        }
        else {
            addError( "StartThreadPublish() failed, status " + this.UaStatus, this.UaStatus );
        }
        // if the call failed then register that 
        if( !result ) ServiceRegister.SetFailed( { Name: this.Name } )
        return( result );
    };//StartThreadPublish
  
    // prints the values received in the last Read call.
    this.ValuesToString = function( ) {
        var value = "StartThreadPublish - Unable to create session publish thread"
        if ( this.UaStatus.isGood() ){
            value = "StartThreadPublish successful"; 
        }
        
        return value;
    };
}