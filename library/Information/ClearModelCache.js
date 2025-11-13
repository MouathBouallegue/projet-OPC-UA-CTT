/*    This class object is responsible for calling the ClearModelCache() service and for also
      performing any validation etc.  */

function ClearModelCacheService( args ) {
    this.Name = "ClearModelCache";
    this.Session = null;
    this.UaStatus = null;

    if( !isDefined( args ) ) throw( this.Name + " CTOR, arguments not specified." );
    if( !isDefined( args.Session ) ) throw( this.Name + " CTOR, session not specified." );
    else this.Session = args.Session;


    this.Execute = function( args ) {
        // parameter validation
        if( !isDefined( args ) ) args = new Object();

        ServiceRegister.Register( { Service: ServiceRegister.UaService( { Name: this.Name, Available: true, Tested: true } ) } );

        var result = false;
     
        // define the write headers
        var session = isDefined( this.Session.Session )? this.Session.Session : this.Session;

        // issue the command while processing any hooks before/after
        if( isDefined( args.PreHook ) ) args.PreHook();
        this.UaStatus = session.clearModelCache( );
        CheckResourceError();
        if( isDefined( args.PostHook ) ) args.PostHook();
        CheckUserStop();
        // check result
        if( this.UaStatus.isGood() ) {
            // check the response header is good
            result = true;
        }
        else {
            addError( "ClearModelCache() failed, status " + this.UaStatus, this.UaStatus );
        }
        // if the call failed then register that 
        if( !result ) ServiceRegister.SetFailed( { Name: this.Name } )
        return( result );
    };

    this.test = function (){
        // This test requires a manual check that the buildObjectModel is only built twice.
        this.Execute();

        IsSubTypeOfTypeHelper.Execute(  
            { ItemNodeId : UaNodeId.fromString("ns=12;s=ohno"),
              TypeNodeId : UaNodeId.fromString("ns=3;i=1000")});

        IsSubTypeOfTypeHelper.Execute(  
            { ItemNodeId : UaNodeId.fromString("ns=12;s=ohno"),
              TypeNodeId : UaNodeId.fromString("ns=3;i=1000")});

        this.Execute();

        IsSubTypeOfTypeHelper.Execute(  
            { ItemNodeId : UaNodeId.fromString("ns=12;s=ohno"),
              TypeNodeId : UaNodeId.fromString("ns=3;i=1000")});
    };

 
}




