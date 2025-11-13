/*    This class object is responsible for calling the ExecuteAggregateQueryCached() service and for also
      performing any validation etc.*/


function ExecuteAggregateQueryCachedService( args ) {
    this.Name = "ExecuteAggregateQueryCached";
    this.Session = null;
    this.Request = null;
    this.Response = null;
    this.UaStatus = null;

    if( !isDefined( args ) ) throw( this.Name + " CTOR, arguments not specified." );
    if( !isDefined( args.Session ) ) throw( this.Name + " CTOR, session not specified." );
    else this.Session = args.Session;

    /* ExecuteAggregateQueryCached values.
        Parameters are:
            RawDataId       Id of the cached UaHistoryReadResults to perform the aggregate query against 
            AggregateRequest  Aggregate Query to test.
            Stepped         Command to use stepped interpolation
            PreHook         function to invoke immediately before the Service call
            PostHook        function to invoke immediately after the Server call
    */
    this.Execute = function( args ) {
        // parameter validation
        if( !isDefined( args ) ) throw(  this.Name + "::Execute() args not specified." );
        if( !isDefined( args.RawDataId ) ) throw( this.Name + " RawDataId not specified." );
        if( !isDefined( args.AggregateRequest ) ) throw( this.Name + " AggregateRequest not specified." );
        if( !isDefined( args.Stepped ) ) args.Stepped = false;

        ServiceRegister.Register( { Service: ServiceRegister.UaService( { Name: this.Name, Available: true, Tested: true } ) } );

        var result = { status : false, results : null };

        var session = isDefined( this.Session.Session )? this.Session.Session : this.Session;

        this.Request  = new UaExecuteAggregateQueryCachedRequest();
        this.Response = new UaExecuteAggregateQueryCachedResponse();
        this.Request.RawDataId = args.RawDataId;
        this.Request.AggregateRequest = args.AggregateRequest;
        this.Request.Stepped = args.Stepped;

        // issue the command while processing any hooks before/after
        if( isDefined( args.PreHook ) ) args.PreHook();
        this.UaStatus = session.executeAggregateQueryCached( this.Request, this.Response );
        CheckResourceError();
        if( isDefined( args.PostHook ) ) args.PostHook();
        CheckUserStop();

        // check result
        if( this.UaStatus.isGood() ) {
            result.status = true;
            result.rawDataId = this.Response.RawDataId;
            result.results = this.Response.Results;
            print("ExecuteAggregateQueryCached succeeded");
        }
        else {
            print("ExecuteAggregateQueryCached Failed");
        }
        // if the call failed then register that 
        if( !result.status ) ServiceRegister.SetFailed( { Name: this.Name } )
        return( result );
    }; //ExecuteAggregateQueryCached
}
