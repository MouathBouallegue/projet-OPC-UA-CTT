/**
 * The Discrete alarm tests have similarities
 * @param {} args.AlarmType 
 */

function DiscreteHelper ( args ) {

    if ( !isDefined( args ) ) { throw ( "DiscreteHelper must have arguments" ); }
    if ( !isDefined( args.AlarmType ) ) { throw ( "DiscreteHelper must have AlarmType argument" ); }
    print("DiscreteHelper Created");

    this.Initialized = false;

    this.AlarmType = args.AlarmType;
    this.AlarmTypeString = this.AlarmType.toString();

    /**
     * The Autorun functionality of the test is such that each test cannot depend on the 'this', 
     * but the discrete helper is unique to the Conformance unit, so the variable can be stored here.
     */

    this.Test_002_Initialized = false;

    this.Set_Test_002_Initialized = function(){
        this.Test_002_Initialized = true;
    }

    this.Get_Test_002_Initialized = function(){
        return this.Test_002_Initialized;
    }
}