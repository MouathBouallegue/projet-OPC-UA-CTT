/**
 * This class object is responsible for calling GetPublishDataService() on a session with a thread
 * @param {Object} args - Standard Javascript argument object holder
 * @param {Object} args.Session - Session
 */
function GetPublishDataService( args ) {
    this.Name = "GetPublishData";
    this.Session = null;
    this.Request = null;
    this.Response = null;
    this.UaStatus = null;

    if( !isDefined( args ) ) throw( this.Name + " CTOR, arguments not specified." );
    if( !isDefined( args.Session ) ) throw( this.Name + " CTOR, session not specified." );
    else this.Session = args.Session;

    /**
     * @param {Object} args - Standard Javascript argument object holder 
     * @param {uinteger} args.ThreadId - ThreadId to make the request against
     * @param {boolean} args.Clear - Delete all existing values for the specified thread
     * @returns {Object} status - status of call, pass or fail,  
     *  values - Array of ThreadPublishResponse including a handle, publish request and response
     */
    this.Execute = function( args ) {
        // parameter validation
        if( !isDefined( args ) ) throw( "GetDataValues.js::Execute() args not specified." );
        if( !isDefined( args.ThreadId ) ) throw( this.Name + " ThreadId not specified." );
        if ( typeof(args.ThreadId) != "number" ) throw( this.Name + " ThreadId invalid. " + typeof(args.ThreadId) );
        if( !isDefined( args.Clear)) { args.Clear = false; }
        if ( typeof(args.Clear) != "boolean" ) throw( this.Name + " Clear value invalid." );

        ServiceRegister.Register( { Service: ServiceRegister.UaService( { Name: this.Name, Available: true, Tested: true } ) } );

        var result = { status : false, values : null };

        // define the write headers
        this.Response = new ThreadPublishResponses();
        var session = isDefined( this.Session.Session )? this.Session.Session : this.Session;

        this.UaStatus = session.getPublishData( args.ThreadId, args.Clear, this.Response );
        CheckResourceError();
        CheckUserStop();
        // check result
        if( this.UaStatus.isGood() ) {
            result = { status : true, values : this.Response };
        }
        // if the call failed then register that 
        if( !result.status ) ServiceRegister.SetFailed( { Name: this.Name } )
        return( result );
    };//GetPublishData
}