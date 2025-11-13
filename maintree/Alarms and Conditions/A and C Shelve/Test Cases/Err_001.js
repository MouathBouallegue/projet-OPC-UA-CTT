/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:  
        1.) Check that an alarm that supports shelving appears 
        2.) Call TimedShelve and then check if an update on the condition is received
        3.) Call TimedShelve Again

    Requirements:
        an Alarm that just stays in Alarm

    Expectation:
        1.) Publish receives the event and verify ShelvingState is not shelved.
        2.) Event received and the ShelvingState=TimedShelved and the  LastTransition is from Unshelved to TimedShelved. 
            SuppressedOrShelved is TRUE. UnshelveTime property is set the provided duration 
        3.) Service result is BadConditionAlreadyShelved.

*/

function Err_001 () {

    this.TestName = "Err_001";
    this.States = {
        Initial: "Initial",
        TimedShelved: "TimedShelved",
        Skipped: "Skipped",
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
                var conditionId = collector.GetConditionId( eventFields );
                if ( collector.CanRunTest( conditionId, this.TestName ) ) {
                    canRun = true;
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

        if ( !this.TestCaseMap.Contains( conditionIdString ) ) {
            this.TestCaseMap.Set( conditionIdString,
                CUVariables.Shelve.InitializeTestCase(
                    conditionId,
                    eventFields[ collector.EventTypeIndex ],
                    testCase ) );
        }

        var localTestCase = this.TestCaseMap.Get( conditionIdString );
        var isActive = collector.IsActive( eventFields );
        var isShelved = CUVariables.Shelve.AlarmIsShelved( eventFields, collector );
        var eventTime = collector.GetSelectField( eventFields, "Time" ).toDateTime();

        collector.DebugPrint( "Debug: " + conditionIdString + " state " + localTestCase.State + " isActive " + isActive + " isShelved " + isShelved );

        if ( localTestCase.State == this.States.Initial ) {
            if ( isActive && !isShelved ) {

                localTestCase.TimedShelveTime = this.TimedShelveTime;
                localTestCase.ShelveTime = UaDateTime.utcNow();

                var result = CUVariables.Shelve.CallShelve( eventFields, collector,
                    CUVariables.Shelve.TimedShelveMethod,
                    "TimedShelve", localTestCase.TimedShelveTime );

                if ( result.isGood() ) {
                    localTestCase.LastActiveState = isActive;
                    localTestCase.RequiresUnshelve = true;
                    localTestCase.ExpectedShelvingState = CUVariables.Shelve.TimedShelved;
                    localTestCase.State = this.States.TimedShelved;
                } else {
                    collector.AddMessage( localTestCase.TestCase, collector.Categories.Error,
                        conditionIdString + " Unable to Shelve " + result.toString() );
                    localTestCase.State = this.States.UnableToShelve;
                    localTestCase.TestCase.TestsFailed++;
                    collector.TestCompleted( conditionId, this.TestName );
                }
            }
        } else if ( localTestCase.State == this.States.TimedShelved ) {
            if ( isActive ) {
                localTestCase.ShelvedEventTime = eventTime;

                var transitionResult = CUVariables.Shelve.ValidateShelveTransition(
                    eventFields, collector, localTestCase,
                    new UaNodeId( Identifier.ShelvedStateMachineType_UnshelvedToTimedShelved ) );
                var shelvedStateResult = CUVariables.Shelve.ValidateShelveStates(
                    eventFields, collector, localTestCase, CUVariables.Shelve.TimedShelved, true );

                var unshelveTimeResult = CUVariables.Shelve.ValidateImmediateUnshelveTime(
                    eventFields, collector, localTestCase );

                var result = CUVariables.Shelve.CallShelve( eventFields, collector,
                    CUVariables.Shelve.TimedShelveMethod,
                    "TimedShelve", localTestCase.TimedShelveTime );

                var resultValue = true;
                if ( result.StatusCode != StatusCode.BadConditionAlreadyShelved ) {
                    resultValue = false;
                    collector.AddMessage( localTestCase.TestCase, collector.Categories.Error,
                        conditionIdString + " Unexpected result on second TimedShelve Request " + result.toString() );
                }

                if ( !transitionResult || !shelvedStateResult || !unshelveTimeResult || !resultValue ) {
                    localTestCase.TestCase.TestsFailed++;
                    collector.TestCompleted( conditionId, this.TestName );
                    localTestCase.State = this.States.Failed;
                    return;
                } else {
                    collector.DebugPrint( conditionIdString + " Test Completed" );
                    localTestCase.State = this.States.Completed;
                    localTestCase.TestCase.TestsPassed++;
                    // Let Post Loop deal with the TestCompleted, as this needs to be unshelved
                    var eventTypeString = eventFields[ collector.EventTypeIndex ].toString();
                    if ( !this.TypeTestCompletedMap.Contains( eventTypeString ) ) {
                        this.TypeTestCompletedMap.Set( eventTypeString, eventTypeString );
                    }
                }
            } else {
                addWarning( conditionIdString + " Changed States to inactive, Skipping" );
                localTestCase.State = this.States.Skipped;
                collector.TestCompleted( conditionId, this.TestName );
                localTestCase.TestCase.TestsSkipped++;
            }
        }
    }

    this.PostLoopAction = function ( collector ) {
        if ( this.TypeTestCompletedMap.Length() > 0 ) {
            collector.DebugPrint( this.TestName + " PostLoopAction for " + this.TypeTestCompletedMap.Length() + " types" );
            var unshelveMap = new KeyPairCollection();
            var typeKeys = this.TypeTestCompletedMap.Keys();
            for ( var typeIndex = 0; typeIndex < typeKeys.length; typeIndex++ ) {
                var eventType = typeKeys[ typeIndex ];
                var conditionKeys = this.TestCaseMap.Keys();
                for ( var index = 0; index < conditionKeys.length; index++ ) {
                    var conditionId = conditionKeys[ index ];
                    var localTestCase = this.TestCaseMap.Get( conditionId );
                    collector.DebugPrint( this.TestName + " PostLoopAction checking  " + conditionId + " RequiresUnshelve " + localTestCase.RequiresUnshelve );
                    if ( localTestCase.EventType.toString() == eventType &&
                        localTestCase.RequiresUnshelve ) {
                        unshelveMap.Set( conditionId, localTestCase );
                        collector.TestCompleted( conditionId, this.TestName );
                    }
                }
            }
            if ( unshelveMap.Length() > 0 ) {
                collector.DebugPrint( this.TestName + " Unshelving at PostLoopAction" );
                CUVariables.Shelve.UnshelveAll( unshelveMap );
            }
        }
    }

    this.Shutdown = function () {
        CUVariables.Shelve.UnshelveAll( this.TestCaseMap );
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
        Test.Execute( { Procedure: Err_001 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Err_001 } );
    }
}