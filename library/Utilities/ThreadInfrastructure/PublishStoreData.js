/**
 * This class object is responsible for calling PublishStoreData() on a session with a thread
 * @param {Object} args - Standard Javascript argument object holder
 * @param {Object} args.Session - Session
 */
function PublishStoreDataService ( args ) {
    this.Name = "PublishStoreData";
    this.Session = null;
    this.Request = null;
    this.Response = null;
    this.UaStatus = null;

    if ( !isDefined( args ) ) throw ( this.Name + " CTOR, arguments not specified." );
    if ( !isDefined( args.Session ) ) throw ( this.Name + " CTOR, session not specified." );
    else this.Session = args.Session;

    /**
     * @param {Object} args - Standard Javascript argument object holder 
     * @param {uinteger} args.ThreadId - ThreadId to make the request against
     * @param {boolean} args.Publish - Publish/Stop Publishing
     * @returns 
     */
    this.Execute = function ( args ) {
        // parameter validation
        if ( !isDefined( args ) ) throw ( this.Name + "::Execute() args not specified." );
        if ( !isDefined( args.ThreadId ) ) throw ( this.Name + "::Execute() args.ThreadId not specified." );
        if ( isNaN( args.ThreadId ) ) throw ( this.Name + " ThreadId invalid." );
        if ( !isDefined( args.Publish ) ) throw ( this.Name + "::Execute() args.Publish not specified." );

        ServiceRegister.Register( { Service: ServiceRegister.UaService( { Name: this.Name, Available: true, Tested: true } ) } );

        var result = false;

        var session = isDefined( this.Session.Session ) ? this.Session.Session : this.Session;

        this.UaStatus = session.publishStoreData( args.ThreadId, args.Publish );
        CheckResourceError();
        CheckUserStop();
        // check result
        if ( this.UaStatus.isGood() ) {
            print( "PublishStoreData succeeded" );
            result = true;
        }
        else {
            addError( "PublishStoreData() failed, status " + this.UaStatus, this.UaStatus );
        }
        // if the call failed then register that 
        if ( !result ) ServiceRegister.SetFailed( { Name: this.Name } )
        return ( result );
    };//PublishStoreData
}