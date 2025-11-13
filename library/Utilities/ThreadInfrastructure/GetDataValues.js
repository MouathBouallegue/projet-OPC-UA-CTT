/*    This class object is responsible for calling the GetDataValues() service and for also
      performing any validation etc.*/

include( "./library/Utilities/AuditInfrastructure/AuditBufferHelper.js" );

function GetDataValuesService( args ) {
    this.Name = "GetDataValues";
    this.Session = null;
    this.Request = null;
    this.Response = null;
    this.UaStatus = null;

    if( !isDefined( args ) ) throw( this.Name + " CTOR, arguments not specified." );
    if( !isDefined( args.Session ) ) throw( this.Name + " CTOR, session not specified." );
    else this.Session = args.Session;


    /* GetDataValues values.
          Parameters are: 
              ThreadId           = ThreadId to make the request against
              SubscriptionId     = Subscription to make the request against
              ClientId           = Id for the Data Monitored Item   
              Clear              = Delete all existing values for the specified Data Monitored Item
              SuppressMessaging  = do not log messages
              SuppressWarnings   = do not long warnings
              PreHook            = function to invoke immediately before the Service call
              PostHook           = function to invoke immediately after the Server call
    */
    this.Execute = function( args ) {
        // parameter validation
        if( !isDefined( args ) ) throw( "GetDataValues.js::Execute() args not specified." );
        if( !isDefined( args.ThreadId ) ) throw( this.Name + " ThreadId not specified." );
        if( !isDefined( args.SubscriptionId ) ) throw( this.Name + " SubscriptionId not specified." );
        if( !isDefined( args.ClientId ) ) throw( this.Name + " ClientId not specified." );
        if ( !isDefined( args.Clear)) { args.Clear = false; }
        if( isDefined ( args.SuppressMessages ) ) args.SuppressMessaging = args.SuppressMessages;
        if( !isDefined( args.SuppressMessaging ) ) args.SuppressMessaging = false;
        if( !isDefined( args.SuppressWarnings ) )  args.SuppressWarnings = false;

        ServiceRegister.Register( { Service: ServiceRegister.UaService( { Name: this.Name, Available: true, Tested: true } ) } );

        var result = { status : false, values : null };

        // define the write headers
        this.Request  = new UaGetDataValuesRequest();
        this.Response = new UaGetDataValuesResponse();
        var session = isDefined( this.Session.Session )? this.Session.Session : this.Session;
        this.Request.ThreadId = args.ThreadId;
        this.Request.SubscriptionId = args.SubscriptionId;
        this.Request.ClientId = args.ClientId;
        this.Request.Clear = args.Clear;

        // issue the command while processing any hooks before/after
        if( isDefined( args.PreHook ) ) args.PreHook();
        this.UaStatus = session.getDataValues( this.Request, this.Response );
        CheckResourceError();
        if( isDefined( args.PostHook ) ) args.PostHook();
        CheckUserStop();
        // check result
        if( this.UaStatus.isGood() ) {
            result = { status : true, values : this.Response.DataValues };
        }
        // if the call failed then register that 
        if( !result.status ) ServiceRegister.SetFailed( { Name: this.Name } )
        return( result );
    };//GetDataValues

   
    this.ValuesToString = function() {
        var lines = [];
        if ( this.UaStatus.isGood() ){
            if ( this.Response.DataValues.length > 0 ){
                lines.push( "GetDataValues for clientId " + this.Request.ClientId + 
                    " has " + this.Response.DataValues.length + " updates" );
                for ( var index = 0; index < this.Response.DataValues.length; index++ ){
                    var dataValue = this.Response.DataValues[index];
                    lines.push("Update " + index + " Value = [" + dataValue.Value.toString() + 
                        "] Status = " + dataValue.StatusCode.toString() + 
                        " Source Timestamp = " + dataValue.SourceTimestamp + 
                        " Server Timestamp = " + dataValue.ServerTimestamp );
                }
            }else{
                lines.push( "GetDataValues has no data" );
            }

        }else{
            lines.push( 'GetDataValues was unsuccessful' );
        }

        return lines;
    };
}