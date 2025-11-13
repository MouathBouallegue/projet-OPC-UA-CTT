/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:  
        1.) Check that an alarm that supports shelving appears 
        2.) Call TimedShelve with a ShelvingTime that is greater than the MaxTimeShelved 

    Requirements:
        an Alarm that just stays in Alarm and has a MaxTimeShelved property

    Expectation:
        1.) Publish receives the event and verify ShelvingState is not shelved.
        2.) Service result is Bad_ShelvingTimeOutOfRange
*/

function Err_004 () {

    this.TestName = "Err_004";
    this.States = {
        Initial: "Initial",
        Failed: "Failed",
        Completed: "Completed"
    };

    // For each ConditionId, store when it was disabled, and when it should be enabled again
    this.TestCaseMap = new KeyPairCollection();
    this.TypeTestCompletedMap = new KeyPairCollection();
    this.TimedShelveTime = 20000;

    this.Initialize = function( collector ){
        collector.AddIgnoreSkipsForSpecificTypes( 
            [ new UaNodeId( Identifier.AcknowledgeableConditionType ).toString() ], this.TestName );
    }

    this.CanRunTest = function ( eventFields, collector ) {
        var canRun = false;
        var eventTypeString = eventFields[ collector.EventTypeIndex ];

        if ( !this.TypeTestCompletedMap.Contains( eventTypeString ) ) {
            if ( CUVariables.Shelve.AlarmSupportsShelving( eventFields, collector ) ) {
                if ( CUVariables.Shelve.GetMaximumShelveTime(
                    eventFields, collector, { TimedShelveTime: null } ) < Number.MAX_VALUE ) {
                    var conditionId = collector.GetConditionId( eventFields );
                    if ( collector.CanRunTest( conditionId, this.TestName ) ) {
                        canRun = true;
                    }
                }
            }
        }

        return canRun;
    }

    this.TestEvent = function ( eventFields, testCase, collector ) {

        if ( !this.CanRunTest( eventFields, collector ) ) {
            return;
        }

        var conditionId = collector.GetConditionId( eventFields );
        var conditionIdString = conditionId.toString();


        var isActive = collector.IsActive( eventFields );
        var isShelved = CUVariables.Shelve.AlarmIsShelved( eventFields, collector );
        var eventTime = collector.GetSelectField( eventFields, "Time" ).toDateTime();

        collector.DebugPrint( "Debug: " + conditionIdString + " isActive " + isActive + " isShelved " + isShelved );

        if ( isActive && !isShelved ) {

            var result = CUVariables.Shelve.CallShelve( eventFields, collector,
                CUVariables.Shelve.TimedShelveMethod,
                "TimedShelve", Number.MAX_VALUE );

            if ( result.StatusCode != StatusCode.BadShelvingTimeOutOfRange ) {
                collector.AddMessage( testCase, collector.Categories.Error,
                    conditionIdString + " Unexpected result when calling TimedShelve with maximum time " + result.toString() );
                testCase.TestsFailed++;
            } else {
                collector.DebugPrint( conditionIdString + " Test Completed " );
                testCase.TestsPassed++;
                // Let Post Loop deal with the TestCompleted, as this needs to be unshelved
                var eventTypeString = eventFields[ collector.EventTypeIndex ].toString();
                if ( !this.TypeTestCompletedMap.Contains( eventTypeString ) ) {
                    this.TypeTestCompletedMap.Set( eventTypeString, eventTypeString );
                }
            }
            collector.TestCompleted( conditionId, this.TestName );
        }
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