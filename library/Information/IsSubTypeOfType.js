/*    This class object is responsible for calling the ReadType() service and for also
      performing any validation etc. This is a quick-use class. */

function IsSubTypeOfTypeService( args ) {
    this.Name = "IsSubTypeOfType";
    this.Session = null;
    this.Request = null;
    this.Response = null;
    this.settingNames = [];
    this.UaStatus = null;
    this.CallCount = 0;

    if( !isDefined( args ) ) throw( this.Name + " CTOR, arguments not specified." );
    if( !isDefined( args.Session ) ) throw( this.Name + " CTOR, session not specified." );
    else this.Session = args.Session;


    /* Reads values.
          Parameters are: 
              ItemNodeId         = a single Node id, to check against the provided type.
              TypeNodeId         = a single Node id, to check the provided Item node id 
              ServiceResult      = an array of ExpectedAndAcceptedErrors objects.
              OperationResults   = an array of ExpectedAndAcceptedErrors objects.
              SuppressMessaging  = do not log messages
              SuppressWarnings   = do not long warnings
              PreHook            = function to invoke immediately before the Service call
              PostHook           = function to invoke immediately after the Server call
              */
    this.Execute = function( args ) {
        // parameter validation
        if( !isDefined( args ) ) throw( "IsSubTypeOfType.js::Execute() args not specified." );
        if( !isDefined( args.ItemNodeId ) ) throw( "IsSubTypeOfType.js::Execute() args.ItemNodeId is not specified." );
        if( !isDefined( args.TypeNodeId ) ) throw( "IsSubTypeOfType.js::Execute() args.TypeNodeId is not specified." );
        if( isDefined ( args.OperationResults ) && !isDefined( args.OperationResults.length ) ) args.OperationResults = [ args.OperationResults ];
        if( isDefined ( args.SuppressMessages ) ) args.SuppressMessaging = args.SuppressMessages;
        if( !isDefined( args.SuppressMessaging ) ) args.SuppressMessaging = false;
        if( !isDefined( args.SuppressWarnings ) )  args.SuppressWarnings = false;
        if ( !isDefined( args.SuppressErrors ) ) args.SuppressErrors = false;

        ServiceRegister.Register( { Service: ServiceRegister.UaService( { Name: this.Name, Available: true, Tested: true } ) } );

        var result = true;

        // define the write headers
        this.Request  = new UaIsSubTypeOfTypeRequest();
        this.Response = new UaIsSubTypeOfTypeResponse();
        var session = isDefined( this.Session.Session ) ? this.Session.Session : this.Session;
        if( !isDefined( args.ItemNodeId.NamespaceIndex ) ) args.ItemNodeId = UaNodeId.fromString( args.ItemNodeId.toString() );
        if( !isDefined( args.TypeNodeId.NamespaceIndex ) ) args.TypeNodeId = UaNodeId.fromString( args.TypeNodeId.toString() );
        this.Request.ItemNodeId[0] = args.ItemNodeId;
        this.Request.TypeNodeId[0] = args.TypeNodeId;

        // issue the command while processing any hooks before/after
        if( isDefined( args.PreHook ) ) args.PreHook();
        this.UaStatus = session.isSubTypeOfTypeCached( this.Request, this.Response );
        CheckResourceError();
        if( isDefined( args.PostHook ) ) args.PostHook();
        CheckUserStop();
        if( this.UaStatus.isGood() ) {
            return ( result );
        }
        else {
            result = false;
            if ( args.SuppressErrors != true ) {
                addError( this.Name + " failed, status " + this.UaStatus, this.UaStatus );
            }
        }
        // if the call failed then register that 
        if ( !result ) ServiceRegister.SetFailed( { Name: this.Name } );
        return ( result );
    };//IsSubTypeOfType

    // prints the values received in the last Read call.
    this.ValuesToString = function( ) {
        var value;
        if( this.Response !== undefined && this.Request !== undefined && 
            this.UaStatus.isGood() ) {
                var isSubTypeString = this.Response.IsSubTypeOf ? "" : "not ";

                value = "Item " + this.Request.ItemNodeId[0].toString() + " is " + isSubTypeString + 
                    "a subtype of " + this.Request.TypeNodeId[0].toString(); 
        }
        else{
            value = "Unable to determine if " + this.Request.ItemNodeId[0].toString() + " is a subtype of " +
             this.Request.TypeNodeId[0].toString();
        }
        return( value );
    };

    this.testCondition = function(itemId,typeId,shouldFinish,shouldPass){
        var result = this.Execute(  
            { ItemNodeId : UaNodeId.fromString(itemId),
              TypeNodeId : UaNodeId.fromString(typeId)});
        print(this.ValuesToString());

        var shouldFinishText = shouldFinish ? "": "not ";
        var shouldPassText = shouldPass ? "": "not ";

        if ( shouldFinish != result.result )
        {
            throw("Test should " + shouldFinishText + " have finished, but result not equal");
        }

        if ( shouldFinish && (shouldPass != result.isSubTypeOf) ){
            throw("Test should " + shouldPassText + " have passed, but result.IsSubTypeOf not equal");
        }
    };

    this.test = function() {

        this.testCondition("ns=3;i=2000","ns=0;i=58",true, true);


        // Just a type.
        // AirconditionerControllerType/ControllerType
        this.testCondition("ns=3;i=2000","ns=3;i=1000",true, true);
        // ControllerType/AirconditionerControllerType
        this.testCondition("ns=3;i=1000","ns=3;i=2000",true, false);
        
        // AirConditionerControllerType
        this.testCondition("ns=3;s=AirConditioner_2","ns=3;i=2000",true, true);
        // ControllerType 
        this.testCondition("ns=3;s=AirConditioner_2","ns=3;i=1000",true, true);

        this.testCondition("ns=3;s=AirConditioner_2","ns=12;s=ohno",false, true);
        this.testCondition("ns=12;s=ohno","ns=3;i=1000",false, true);
        this.testCondition("ns=3;i=1000","ns=3;i=1000",true, false);

        this.testCondition("ns=3;s=AirConditioner_2","ns=3;s=AirConditioner_2",true, false);
    }
 
}




