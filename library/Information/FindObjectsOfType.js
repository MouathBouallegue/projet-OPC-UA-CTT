/*    This class object is responsible for calling the ReadType() service and for also
      performing any validation etc. This is a quick-use class. */

function FindObjectsOfTypeService( args ) {
    this.Name = "FindObjectsOfType";
    this.Session = null;
    this.Request = null;
    this.Response = null;
    this.Success = false;
    this.UaStatus = null;
    this.CallCount = 0;

    if( !isDefined( args ) ) throw( this.Name + " CTOR, arguments not specified." );
    if( !isDefined( args.Session ) ) throw( this.Name + " CTOR, session not specified." );
    else this.Session = args.Session;


    /* Reads values.
          Parameters are: 
              TypeToFind         = a single Node id, to read the type definition history.
              IncludeSubTypes    = Boolean to indicate whether objects of subtypes should be returned as well
              MaxNodesToReturn   = the maximum nodes to return. Tested to XXXX
              OperationResults   = an array of ExpectedAndAcceptedErrors objects.
              SuppressMessaging  = do not log messages
              SuppressWarnings   = do not long warnings
              PreHook            = function to invoke immediately before the Service call
              PostHook           = function to invoke immediately after the Server call
              */
    this.Execute = function( args ) {
        // parameter validation
        if( !isDefined( args ) ) throw( "FindObjectsOfType.js::Execute() args not specified." );
        if( !isDefined( args.TypeToFind ) ) throw( "FindObjectsOfType.js::Execute() args.TypeToFind is not specified." );
        if( !isDefined( args.IncludeSubTypes ) ) args.IncludeSubTypes = false;
        if( !isDefined( args.MaxNodesToReturn ) ) args.MaxNodesToReturn = 100;
        if( isDefined ( args.OperationResults ) && !isDefined( args.OperationResults.length ) ) args.OperationResults = [ args.OperationResults ];
        if( isDefined ( args.SuppressMessages ) ) args.SuppressMessaging = args.SuppressMessages;
        if( !isDefined( args.SuppressMessaging ) ) args.SuppressMessaging = false;
        if( !isDefined( args.SuppressWarnings ) )  args.SuppressWarnings = false;

        ServiceRegister.Register( { Service: ServiceRegister.UaService( { Name: this.Name, Available: true, Tested: true } ) } );

        var returnResult = { result : false, nodes : null };

        // define the write headers
        this.Request  = new UaFindObjectsOfTypeRequest();
        this.Response = new UaFindObjectsOfTypeResponse();
        var session = isDefined( this.Session.Session )? this.Session.Session : this.Session;
        this.Request.TypeToFind[0] = args.TypeToFind;
        this.Request.IncludeSubTypes = args.IncludeSubTypes;
        this.Request.MaxNodesToReturn = args.MaxNodesToReturn;

        // issue the command while processing any hooks before/after
        if( isDefined( args.PreHook ) ) args.PreHook();
        this.UaStatus = session.findObjectsOfTypeCached( this.Request, this.Response );
        CheckResourceError();
        if( isDefined( args.PostHook ) ) args.PostHook();
        CheckUserStop();
        // check result
        this.Success = this.UaStatus.isGood();
        if( this.UaStatus.isGood() ) {
            returnResult = { result : true, nodes : this.Response.Nodes };
        }
        else {
            addError( "FindObjectsOfType() failed, status " + this.UaStatus, this.UaStatus );
        }
        // if the call failed then register that 
        if( !returnResult.result ) ServiceRegister.SetFailed( { Name: this.Name } )
        return( returnResult );
    };//FindObjectsOfType



  
    // prints the values received in the last Read call.
    this.ValuesToString = function( ) {
        var values = [];
        var subTypeText = this.Request.IncludeSubTypes ? "or sub type " : "";

        if( this.Response !== undefined && this.Request !== undefined && 
            this.Response.Nodes && this.Response.Nodes.length > 0 ) {
            var nodeIndex;
            for( nodeIndex=0; nodeIndex<this.Response.Nodes.length; nodeIndex++ ) { 
                var stringValue = "Result [" + nodeIndex.toString() + 
                    "] Node Id " + this.Response.Nodes[nodeIndex].toString() + 
                    " is a type " + subTypeText + " of " + this.Request.TypeToFind[0].toString();
                values[nodeIndex] = stringValue;
            }
        }
        return( values );
    };

    this.testCondition = function( typeToFind, includeSubTypes, maxNodesToReturn, shouldPass, expectedResults ){
        var findResult = this.Execute(
                { TypeToFind : UaNodeId.fromString(typeToFind),
                  IncludeSubTypes : includeSubTypes,
                  MaxNodesToReturn : maxNodesToReturn  });

        print(this.ValuesToString());

        var shouldPassText = shouldPass ? "": "not ";

        if ( shouldPass != findResult.result )
        {
            throw("Test should " + shouldPassText + " have passed, but result not equal");
        }

        if (shouldPass){
            if ( findResult.nodes.length != expectedResults )
            {
                throw( "Text expected " + expectedResults + " objects but got " + findResult.nodes.length );
            }
        }
    };

    this.test = function() {
        this.testCondition("ns=3;s=AirConditionerControllerType", false, 100, false, 0);
        this.testCondition("ns=3;i=2000", false, 100, true, 10);
        this.testCondition("ns=3;i=1000", false, 100, true, 0);
        this.testCondition("ns=3;i=1000", true, 100, true, 20);
        this.testCondition("ns=3;i=2000", false, 9, true, 9);
    };
}




