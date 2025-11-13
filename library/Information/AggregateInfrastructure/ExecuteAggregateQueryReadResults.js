/*    This class object is responsible for calling the ExecuteAggregateQueryReadResults() service and for also
      performing any validation etc.
      This function assumes the raw data has already been read by the javascript
*/


function ExecuteAggregateQueryReadResultsService( args ) {
    this.Name = "ExecuteAggregateQueryReadResults";
    this.Session = null;
    this.Request = null;
    this.Response = null;
    this.UaStatus = null;

    if( !isDefined( args ) ) throw( this.Name + " CTOR, arguments not specified." );
    if( !isDefined( args.Session ) ) throw( this.Name + " CTOR, session not specified." );
    else this.Session = args.Session;

    /* ExecuteAggregateQueryReadResults values.
        Parameters are: 
            RawResults          Raw Results that has already been retrieved by script 
            AggregateRequest    Aggregate Query to test.
            Stepped             Command to use stepped interpolation
            PreHook             function to invoke immediately before the Service call
            PostHook            function to invoke immediately after the Server call
    */
    this.Execute = function( args ) {

        // parameter validation
        if( !isDefined( args ) ) throw(  this.Name + "::Execute() args not specified." );
        if( !isDefined( args.RawRequest ) ) throw( this.Name + " RawRequest not specified." );
        if( !isDefined( args.RawResults ) ) throw( this.Name + " RawResults not specified." );
        if( !isDefined( args.AggregateRequest ) ) throw( this.Name + " AggregateRequest not specified." );
        if( !isDefined( args.Stepped ) ) args.Stepped = false;
        if( !isDefined( args.Cache ) ) args.Cache = true;

        ServiceRegister.Register( { Service: ServiceRegister.UaService( { Name: this.Name, Available: true, Tested: true } ) } );

        var result = { status : false };

        var session = isDefined( this.Session.Session )? this.Session.Session : this.Session;

        this.Request  = new UaExecuteAggregateQueryReadResultsRequest();
        this.Request.RawRequest = args.RawRequest;
        this.Request.RawResults = args.RawResults;
        this.Request.AggregateRequest = args.AggregateRequest;
        this.Request.Stepped = args.Stepped;
        this.Request.Cache = args.Cache;
        this.Response = new UaExecuteAggregateQueryReadResultsResponse();

        // issue the command while processing any hooks before/after
        if( isDefined( args.PreHook ) ) args.PreHook();
        this.UaStatus = session.executeAggregateQueryReadResults( this.Request, this.Response );
        CheckResourceError();
        if( isDefined( args.PostHook ) ) args.PostHook();
        CheckUserStop();
        // check result
        
        if( this.UaStatus.isGood() ) {
            result.status = true;
            result.rawDataId = this.Response.RawDataId;
            result.results = this.Response.Results;

            print("ExecuteAggregateQueryReadResults succeeded");
        }
        else {
            print( "ExecuteAggregateQueryReadResults() failed, status " + this.UaStatus );
        }
        // if the call failed then register that 
        if( !result.status ) ServiceRegister.SetFailed( { Name: this.Name } )

        return( result );
    }; //ExecuteAggregateQueryReadResults
}
