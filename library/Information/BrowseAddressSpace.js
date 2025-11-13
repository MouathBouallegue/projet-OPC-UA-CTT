/*    This class object is responsible for calling the ReadType() service and for also
      performing any validation etc. This is a quick-use class. */

function BrowseAddressSpaceService( args ) {
    this.Name = "BrowseAddressSpace";
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
        if( !isDefined( args ) ) throw( "BrowseAddressSpace.js::Execute() args not specified." );
        if( !isDefined( args.NodeToRead ) ) throw( "BrowseAddressSpace.js::Execute() args.NodeToRead is not specified." );
        if( isDefined ( args.OperationResults ) && !isDefined( args.OperationResults.length ) ) args.OperationResults = [ args.OperationResults ];
        if( isDefined ( args.SuppressMessages ) ) args.SuppressMessaging = args.SuppressMessages;
        if( !isDefined( args.SuppressMessaging ) ) args.SuppressMessaging = false;
        if( !isDefined( args.SuppressWarnings ) )  args.SuppressWarnings = false;

        ServiceRegister.Register( { Service: ServiceRegister.UaService( { Name: this.Name, Available: true, Tested: true } ) } );

        var result = true;
        var returnResult = { result : false, statistics : null };

        // define the write headers
        this.Request  = new UaBrowseAddressSpaceRequest();
        this.Response = new UaBrowseAddressSpaceResponse();
        var session = isDefined( this.Session.Session )? this.Session.Session : this.Session;
        this.Request.NodeToRead[0] = args.NodeToRead;

        // issue the command while processing any hooks before/after
        if( isDefined( args.PreHook ) ) args.PreHook();
        this.UaStatus = session.browseAddressSpace( this.Request, this.Response );
        CheckResourceError();
        if( isDefined( args.PostHook ) ) args.PostHook();
        CheckUserStop();
        // check result
        this.readSuccess = this.UaStatus.isGood();
        if( this.UaStatus.isGood() ) {
                returnResult = { result : true, statistics : this.Response };
        }
        else {
            Assert.StatusCodeIsOneOf( args.ServiceResult, this.UaStatus, this.Name + " the ErrorCode in the Error Message received doesn't match the expectation." );
        }
        // if the call failed then register that 
        if( !returnResult.result ) ServiceRegister.SetFailed( { Name: this.Name } )
        return( returnResult );
    };//BrowseAddressSpace



  
    // prints the values received in the last Read call.
    this.ValuesToString = function( ) {
        var value = "";
        if( this.Response !== undefined && this.Request !== undefined && 
            this.UaStatus.isGood() ) {
            value = "Browse Statistics for node " + this.Request.NodeToRead + "\r\n" +
                "ObjectCount = " + this.Response.ObjectCount +  "\r\n" +
                "VariableCount = " + this.Response.VariableCount +  "\r\n" +
                "PropertyCount = " + this.Response.PropertyCount +  "\r\n" +
                "MethodCount = " + this.Response.MethodCount +  "\r\n" +
                "BrowseCalls = " + this.Response.BrowseCalls +  "\r\n" +
                "ContinuationPoints = " + this.Response.ContinuationPoints +  "\r\n" +
                "BrowseNextCalls = " + this.Response.BrowseNextCalls +  "\r\n" +
                "AverageItemsPassedInBrowseCall = " + this.Response.AverageItemsPassedInBrowseCall +  "\r\n" +
                "AverageItemsReturnedOnBrowseCall = " + this.Response.AverageItemsReturnedOnBrowseCall +  "\r\n" +
                "AverageReferencesReturnedOnCall = " + this.Response.AverageReferencesReturnedOnCall +  "\r\n" +
                "MaximumBrowseItemsOnCall = " + this.Response.MaximumBrowseItemsOnCall +  "\r\n" +
                "MaximumReferencesOnCall = " + this.Response.MaximumReferencesOnCall +  "\r\n" +
                "TotalNodes = " + this.Response.TotalNodes +  "\r\n" +
                "TotalReferences = " + this.Response.TotalReferences +  "\r\n" +
                "TotalOfflineReferences = " + this.Response.TotalOfflineReferences +  "\r\n" +
                "AverageBrowseCallTime = " + this.Response.AverageBrowseCallTime +  "\r\n" +
                "AverageBrowseNextCallTime = " + this.Response.AverageBrowseNextCallTime +  "\r\n" +
                "MinimumBrowseCallTime = " + this.Response.MinimumBrowseCallTime +  "\r\n" +
                "MinimumBrowseNextCallTime = " + this.Response.MinimumBrowseNextCallTime +  "\r\n" +
                "MaximumBrowseCallTime = " + this.Response.MaximumBrowseCallTime +  "\r\n" +
                "MaximumBrowseNextCallTime = " + this.Response.MaximumBrowseNextCallTime +  "\r\n" +
                "TotalTimeOfBrowse = " + this.Response.TotalTimeOfBrowse +  "\r\n" +
                "TotalErrors = " + this.Response.TotalErrors;
        }
        return( value );
    };

    this.testCondition = function(startBrowseNode,objects,variables,properties,methods){
        var browseResults = this.Execute(
            { NodeToRead : UaNodeId.fromString(startBrowseNode)});
        print(this.ValuesToString());
        
        if ( browseResults.statistics.ObjectCount != objects ){
            throw("Browse counted " + browseResults.statistics.ObjectCount + "objects but " + objects + " expected");
        }
        if ( browseResults.statistics.VariableCount != variables ){
            throw("Browse counted " + browseResults.statistics.VariableCount + "variables but " + variables + " expected");
        }
        if ( browseResults.statistics.PropertyCount != properties ){
            throw("Browse counted " + browseResults.statistics.PropertyCount + "properties but " + properties + " expected");
        }
        if ( browseResults.statistics.MethodCount != methods ){
            throw("Browse counted " + browseResults.statistics.MethodCount + "methods but " + methods + " expected");
        }

    };

    this.test = function (){
        var ObjectCount = 3;
        var VariableCount = 12;
        var PropertyCount = 44;
        var MethodCount = 8;
        this.testCondition("ns=3;s=AirConditioner_2",ObjectCount, VariableCount, PropertyCount, MethodCount);
        this.testCondition("ns=2;s=Demo.Massfolder_Static",0, 1000, 1, 1);
        this.testCondition("ns=12;s=ohno",0,0,0,0);
        this.testCondition("ns=2;s=Demo.Dynamic.Scalar.Boolean",0,0,0,0);

        
    };

 
}




