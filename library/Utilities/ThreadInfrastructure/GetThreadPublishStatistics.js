/*    This class object is responsible for calling the GetThreadPublishStatistics() service and for also
      performing any validation etc.*/


function GetThreadPublishStatisticsService( args ) {
    this.Name = "GetThreadPublishStatistics";
    this.Session = null;
    this.Request = null;
    this.Response = null;
    this.UaStatus = null;

    if( !isDefined( args ) ) throw( this.Name + " CTOR, arguments not specified." );
    if( !isDefined( args.Session ) ) throw( this.Name + " CTOR, session not specified." );
    else this.Session = args.Session;


    /* GetThreadPublishStatistics values.
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
        if( !isDefined( args ) ) throw( "GetThreadPublishStatistics.js::Execute() args not specified." );
        if( !isDefined( args.ThreadId ) ) throw( this.Name + " ThreadId not specified." );
        if( isDefined ( args.SuppressMessages ) ) args.SuppressMessaging = args.SuppressMessages;
        if( !isDefined( args.SuppressMessaging ) ) args.SuppressMessaging = false;
        if( !isDefined( args.SuppressWarnings ) )  args.SuppressWarnings = false;

        ServiceRegister.Register( { Service: ServiceRegister.UaService( { Name: this.Name, Available: true, Tested: true } ) } );

        var result = { status : false, statistics : null};

        // define the write headers
        this.Request  = new UaGetThreadPublishStatisticsRequest();
        this.Response = new UaGetThreadPublishStatisticsResponse();
        var session = isDefined( this.Session.Session )? this.Session.Session : this.Session;
        this.Request.ThreadId = args.ThreadId;

        // issue the command while processing any hooks before/after
        if( isDefined( args.PreHook ) ) args.PreHook();
        this.UaStatus = session.getThreadPublishStatistics( this.Request, this.Response );
        CheckResourceError();
        if( isDefined( args.PostHook ) ) args.PostHook();
        CheckUserStop();
        // check result
        if( this.UaStatus.isGood() ) {
            result = { status : true, statistics : this.Response };
        }
        // if the call failed then register that 
        if( !result.status ) ServiceRegister.SetFailed( { Name: this.Name } )
        return( result );
    };//GetThreadPublishStatistics

   
    this.ValuesToString = function( results ) {
        var lines = [];

        if ( results.status === true ){
            lines.push( "Publish Call count = "+ results.statistics.CallCount );
            lines.push( "Good Response count = "+ results.statistics.GoodCount );
            lines.push( "Bad Response count = "+ results.statistics.BadCount );
            lines.push( "Service Result Good count = "+ results.statistics.ServiceResultGoodCount );
            lines.push( "Service Result Bad count = "+ results.statistics.ServiceResultBadCount );
            lines.push( "Add Data Count = "+ results.statistics.AddDataCount );
            lines.push( "Add Event Count = "+ results.statistics.AdEventCount );
        }else{
            lines.push( "Call to Get Thread Publish Statistics failed" );
        }
        
        return lines;
    };
}




