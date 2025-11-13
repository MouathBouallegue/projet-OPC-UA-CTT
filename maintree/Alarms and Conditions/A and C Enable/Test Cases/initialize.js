include( "./library/Base/safeInvoke.js" );
include( "./library/AlarmsAndConditions/AlarmCollector.js" );
include( "./library/Information/BuildObjectCacheMap.js" );

var CUVariables = new Object();
CUVariables.Debug = gServerCapabilities.Debug;
CUVariables.Enable = new Object();
CUVariables.Enable.AccessDeniedCount = 0;
CUVariables.Test002Complete = false;
CUVariables.Test003Complete = false;
CUVariables.Test008Complete = false;

CUVariables.IsTestComplete = function( collector, testName ){
    
    var isComplete = true;

    if ( isDefined( collector ) && isDefined( collector.TestCases ) ){

        var test002Name = "Test_002";
        var test003Name = "Test_003";
        var test008Name = "Test_008";

        if ( testName == test002Name ){
            if ( isDefined( collector.TestCases.Get( test002Name ) ) ){
                isComplete = CUVariables.Test002Complete;
            }
        }else if ( testName == test003Name ){
            if ( isDefined( collector.TestCases.Get( test003Name ) ) ){
                isComplete = CUVariables.Test003Complete;
            }else if ( isDefined( collector.TestCases.Get( test002Name ) ) ){
                isComplete = CUVariables.Test002Complete;
            }
        }else if( testName == test008Name ){
            if ( isDefined( collector.TestCases.Get( test008Name ) ) ){
                isComplete = CUVariables.Test008Complete;
            }else if ( isDefined( collector.TestCases.Get( test003Name ) ) ){
                isComplete = CUVariables.Test003Complete;
            }else if ( isDefined( collector.TestCases.Get( test002Name ) ) ){
                isComplete = CUVariables.Test002Complete;
            }
        }
    }

    return isComplete;
}

print( "Initializations" );
// Autorun test cases
include( "./maintree/Alarms and Conditions/A and C Enable/Test Cases/Test_002.js" );
include( "./maintree/Alarms and Conditions/A and C Enable/Test Cases/Test_003.js" );
include( "./maintree/Alarms and Conditions/A and C Enable/Test Cases/Test_008.js" );
include( "./maintree/Alarms and Conditions/A and C Enable/Test Cases/Err_004.js" );
include( "./maintree/Alarms and Conditions/A and C Enable/Test Cases/Err_005.js" );

var builder = new BuildCacheMapService();
builder.Execute();

if ( !Test.Connect() ) {
    addError( "Unable to connect to Server. Aborting tests." );
    stopCurrentUnit();
} else {
    CUVariables.AutoTestMap = new KeyPairCollection();
    CUVariables.AutoTestMap.Set( "Test_002", new Test_002() );
    CUVariables.AutoTestMap.Set( "Test_003", new Test_003() );
    CUVariables.AutoTestMap.Set( "Test_008", new Test_008() );
    CUVariables.AutoTestMap.Set( "Err_004", new Err_004() );
    CUVariables.AutoTestMap.Set( "Err_005", new Err_005() );
    CUVariables.AlarmCollector = new AlarmCollector( CUVariables );

    CUVariables.PrintResults = [ "Error" ];
}


