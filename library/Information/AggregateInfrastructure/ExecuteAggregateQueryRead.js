/*    This class object is responsible for calling the ExecuteAggregateQueryRead() service and for also
      performing any validation etc.
      This function request that the raw data be queried by the CTT
*/


function ExecuteAggregateQueryReadService( args ) {
    this.Name = "ExecuteAggregateQueryRead";
    this.Session = null;
    this.Request = null;
    this.Response = null;
    this.UaStatus = null;

    if( !isDefined( args ) ) throw( this.Name + " CTOR, arguments not specified." );
    if( !isDefined( args.Session ) ) throw( this.Name + " CTOR, session not specified." );
    else this.Session = args.Session;

    /* ExecuteAggregateQueryRead values.
        Parameters are: 
            Request             HistoryReadRequest
            Cache               Cache a raw data query immediately
            PreHook             function to invoke immediately before the Service call
            PostHook            function to invoke immediately after the Server call
    */
    this.Execute = function( args ) {

        // parameter validation
        if( !isDefined( args.Request ) ) throw( this.Name + " History Read Request not specified." );
        if( !isDefined( args.Cache ) ) args.Cache = false;

        ServiceRegister.Register( { Service: ServiceRegister.UaService( { Name: this.Name, Available: true, Tested: true } ) } );

        var result = { status : false };

        var session = isDefined( this.Session.Session )? this.Session.Session : this.Session;

        this.Request  = new UaExecuteAggregateQueryReadRequest();
        this.Request.Request = new UaHistoryReadRequest.New(  args.Request );
        this.Request.Cache = args.Cache;
        this.Response = new UaExecuteAggregateQueryReadResponse();

        // issue the command while processing any hooks before/after
        if( isDefined( args.PreHook ) ) args.PreHook();

        this.UaStatus = session.executeAggregateQueryRead( this.Request, this.Response );
        CheckResourceError();
        if( isDefined( args.PostHook ) ) args.PostHook();
        CheckUserStop();
        // check result
        if( this.UaStatus.isGood() ) {
            result.status = true;
            result.rawDataId = this.Response.RawDataId;
            result.results = this.Response.Results;

            print("ExecuteAggregateQueryRead succeeded");
        }
        else {
            print( "ExecuteAggregateQueryRead() failed, status " + this.UaStatus );
        }
        // if the call failed then register that 
        if( !result.status ) ServiceRegister.SetFailed( { Name: this.Name } )

        return( result );
    }; //ExecuteAggregateQueryRead
}


