/*    This class object is responsible for calling the ReadType() service and for also
      performing any validation etc. This is a quick-use class. */

function GetTypeHierarchyService( args ) {
    this.Name = "GetTypeHierarchy";
    this.Session = null;
    this.Request = null;
    this.Response = null;
    this.UaStatus = null;
    this.CallCount = 0;

    if( !isDefined( args ) ) throw( this.Name + " CTOR, arguments not specified." );
    if( !isDefined( args.Session ) ) throw( this.Name + " CTOR, session not specified." );
    else this.Session = args.Session;


    /* Reads values.
          Parameters are: 
              NodeToRead         = a single Node id, to read the type definition history.
              ServiceResult      = an array of ExpectedAndAcceptedErrors objects.
              OperationResults   = an array of ExpectedAndAcceptedErrors objects.
              SuppressMessaging  = do not log messages
              SuppressWarnings   = do not long warnings
              PreHook            = function to invoke immediately before the Service call
              PostHook           = function to invoke immediately after the Server call
              */
    this.Execute = function( args ) {
        // parameter validation
        if( !isDefined( args ) ) throw( "GetTypeHierarchy.js::Execute() args not specified." );
        if( !isDefined( args.NodeToRead ) ) throw( "GetTypeHierarchy.js::Execute() args.NodeToRead is not specified." );
        if( isDefined ( args.OperationResults ) && !isDefined( args.OperationResults.length ) ) args.OperationResults = [ args.OperationResults ];
        if( isDefined ( args.SuppressMessages ) ) args.SuppressMessaging = args.SuppressMessages;
        if( !isDefined( args.SuppressMessaging ) ) args.SuppressMessaging = false;
        if( !isDefined( args.SuppressWarnings ) )  args.SuppressWarnings = false;

        ServiceRegister.Register( { Service: ServiceRegister.UaService( { Name: this.Name, Available: true, Tested: true } ) } );

        var result = true;
        var returnResult = { result : false, typeHierarchy : null };

        // define the write headers
        this.Request  = new UaTypeHierarchyRequest();
        this.Response = new UaTypeHierarchyResponse();
        var session = isDefined( this.Session.Session )? this.Session.Session : this.Session;
        this.Request.NodesToRead[0] = args.NodeToRead;

        // issue the command while processing any hooks before/after
        if( isDefined( args.PreHook ) ) args.PreHook();
        this.UaStatus = session.getTypeHierarchyCached( this.Request, this.Response );
        CheckResourceError();
        if( isDefined( args.PostHook ) ) args.PostHook();
        CheckUserStop();
        if( this.UaStatus.isGood() ) {
            var hierarchy = {
                NodesInHierarchy : this.Response.NodesInHierarchy,
                BrowseNamesInHierarchy : this.Response.BrowseNamesInHierarchy
            }
            returnResult = { result : true, typeHierarchy : hierarchy };
        }
        // if the call failed then register that 
        if( !returnResult.result ) ServiceRegister.SetFailed( { Name: this.Name } )
        return( returnResult );
    };

  
    // prints the values received in the last Read call.
    this.ValuesToString = function( ) {
        var values = [];
        if( this.Response !== undefined && this.Request !== undefined && 
            this.UaStatus.isGood() && this.Response.NodesInHierarchy && this.Response.NodesInHierarchy.length > 0 ) {
            var nodeIndex;
            for( nodeIndex=0; nodeIndex<this.Response.NodesInHierarchy.length; nodeIndex++ ) { 
                var browseNameObject = this.Response.BrowseNamesInHierarchy[nodeIndex];
                var browseName = browseNameObject.toString();

                var stringValue = "Type Hierarchy Index [" + nodeIndex.toString() + "] Node Id " + 
                this.Response.NodesInHierarchy[nodeIndex].toString() + " Browse Name " + 
                browseName;
                values[nodeIndex] = stringValue;
            }
        }
        return( values );
    };

    this.testCondition = function(typeNode, expectedHierarchySize) {
        var result = this.Execute( { NodeToRead : UaNodeId.fromString(typeNode) } );
        print(this.ValuesToString().join("\n"));

        if ( expectedHierarchySize == 0 ){
            if ( result.typeHierarchy ){
                throw("Received a type Hierarchy when none was expected");
            }
            
        }
        else{
            if ( result.typeHierarchy.NodesInHierarchy.length != expectedHierarchySize){
                throw("Unexpected Hierarchy Size " + expectedHierarchySize.toString() + 
                " actual " + result.typeHierarchy.NodesInHierarchy.length );
            }                
        }
    };

    this.test = function() {
        this.testCondition("ns=3;s=AirConditioner_2", 3);
        this.testCondition("ns=3;i=2000", 2);
        this.testCondition("ns=3;s=AirConditionerControllerConfiguration", 1);

        this.testCondition("ns=12;s=OhNo", 0);
        this.testCondition("ns=0;i=69", 1);
        this.testCondition("i=69", 1);
        this.testCondition("ns=0;i=62", 0);

        print("GetTypeHeirarchy test passed");
    };

 
}




