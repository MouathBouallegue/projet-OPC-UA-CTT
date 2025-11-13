/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description: 
        Disable an already-disabled condition instance.    
    
    Expectation:
        Server rejects request - BadConditionalAlreadyDisabled

    How this test works:
        For every Event received, Disable the Event.
        If it can be disabled, do it again an ensure the correct error code.
        Finally renable the event.
*/

function Err_004() {

    this.TestName = "Err_004";

    this.TestEvent = function ( eventFields, testCase, collector ) {
        if ( !CUVariables.IsTestComplete( collector, "Test_008" ) ) {
            return;
        }

        var conditionId = collector.GetConditionId( eventFields );
        var conditionIdString = conditionId.toString();

        if ( !collector.CanRunTest( conditionId, this.TestName ) ) {
            return;
        }

        // Disable
        var initialDisableResult = collector.DisableAlarm( conditionId );

        if ( initialDisableResult.isGood() ) {
            // Disable Again
            var secondDisableResult = collector.DisableAlarm( conditionId );
            if ( secondDisableResult.StatusCode !=
                StatusCode.BadConditionAlreadyDisabled ) {
                collector.AddMessage( testCase, collector.Categories.Error,
                    "Unexpected Error " + secondDisableResult.toString() +
                    " while attempting second disable for alarm " + conditionIdString );
                testCase.TestsFailed++;
            }

            // Enable
            collector.EnableAlarm( conditionId );
            testCase.TestsPassed++;

        } else if ( initialDisableResult.StatusCode == StatusCode.BadUserAccessDenied ) {
            testCase.TestsSkipped++;
        } else {
            collector.AddMessage( testCase, collector.Categories.Error,
                "Unexpected Error " + initialDisableResult.toString() +
                " while disabling alarm " + conditionIdString );
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
        Test.Execute( { Procedure: Err_004 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Err_004 } );
    }
}
