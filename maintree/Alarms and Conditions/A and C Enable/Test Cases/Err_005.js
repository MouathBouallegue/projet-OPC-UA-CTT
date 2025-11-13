/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description: 
        Enable an already-enabled condition instance.
    
    Expectation:
        Server rejects request - BadConditionalAlreadyDisabled

    How this test works:
        For every Event received, Enable the Event, and ensure the correct error code.
*/


function Err_005() {

    this.TestName = "Err_005";

    this.TestEvent = function ( eventFields, testCase, collector ) {
        if ( !CUVariables.IsTestComplete( collector, "Test_008" ) ) {
            return;
        }

        var conditionId = collector.GetConditionId( eventFields );
        var conditionIdString = conditionId.toString();

        if ( !collector.CanRunTest( conditionId, this.TestName ) ) {
            return;
        }

        // Enable
        var enableResult = collector.EnableAlarm( conditionId );

        if ( enableResult.StatusCode == StatusCode.BadConditionAlreadyEnabled ) {
            testCase.TestsPassed++;
        }else{
            collector.AddMessage( testCase, collector.Categories.Error,
                "Unexpected Result " + enableResult.toString() +
                " while attempting Enable for alarm " + conditionIdString );
            testCase.TestsFailed++;
        }

        collector.TestCompleted( conditionId, this.TestName );
    }

    this.CheckResults = function () {

        return CUVariables.AlarmCollector.CheckResults( this.TestName, CUVariables.PrintResults );
    }

    if ( isDefined( CUVariables.AutoRun ) ) {
        if ( !CUVariables.AutoRun ) {
            CUVariables.AlarmCollector.RunSingleTest( CUVariables, this.TestName, this );
            return this.CheckResults();
        } else if ( CUVariables.CheckResults ) {
            return this.CheckResults();
        }
    }
}

if ( isDefined( CUVariables.AutoRun ) ) {
    if ( !CUVariables.AutoRun ) {
        Test.Execute( { Procedure: Err_005 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Err_005 } );
    }
}
