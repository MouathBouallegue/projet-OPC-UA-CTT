/**
 * This class object is responsible for calling ClearPublishData() on a session with a thread
 * @param {Object} args - Standard Javascript argument object holder
 * @param {Object} args.Session - Session
 */
function ClearPublishDataService( args ) {
    this.Name = "ClearPublishData";
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
     * @returns 
     */
    this.Execute = function( args ) {
        // parameter validation
        if( !isDefined( args ) ) throw( "ClearThreadData.js::Execute() args not specified." );
        if( !isDefined( args.ThreadId ) ) throw( this.Name + " ThreadId not specified." );
        if( isNaN(args.ThreadId ) ) throw( this.Name + " ThreadId invalid." );

        ServiceRegister.Register( { Service: ServiceRegister.UaService( { Name: this.Name, Available: true, Tested: true } ) } );

        var result = false;

        var session = isDefined( this.Session.Session )? this.Session.Session : this.Session;

        this.UaStatus = session.clearPublishData( args.ThreadId );
        CheckResourceError();
        CheckUserStop();
        // check result
        if( this.UaStatus.isGood() ) {
            result = true;
        }
        // if the call failed then register that 
        if( !result ) ServiceRegister.SetFailed( { Name: this.Name } )
        return( result );
    };//ClearPublishData
 }