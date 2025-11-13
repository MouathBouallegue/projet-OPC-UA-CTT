/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:  
        1.) Check that an alarm that supports shelving appears 
        2.) Call TimedShelve with a  durration that is longer then the realarm interval and 
            then check if an update on the condition is received
        3.) After the Alarm realarm interval (i.e. alarm realarms)

    Requirements:
        An alarm that returns to normal and realarms at a steady interval

    Expectation:
        1.) Publish receives the event and verify ShelvingState is not shelved.
        2.) Event received and the ShelvingState=TimedShelved and the  LastTransition is from Unshelved to TimedShelved. 
            SuppressedOrShelved is TRUE. UnshelveTime property is set to provided durration.
        3.) the alarm shall stay shelved even while not active and when it returns to active 
            (i.e. ShelvingState=TimedShelved & SuppressedOrShelved is TRUE). UnshelveTime property counting down.

*/

function Test_006 () {

    this.TestName = "Test_006";
    this.States = {
        Initial: "Initial",
        WaitingToAnalyze: "WaitingToAnalyze",
        Shelved: "Shelved",
        UnableToShelve: "UnableToShelve",
        WaitingForTransition: "WaitingForTransition",
        WaitingForReAlarm: "WaitingForReAlarm",
        Skipped: "Skipped",
        Failed: "Failed",
        Completed: "Completed"
    };

    // For each ConditionId, store when it was disabled, and when it should be enabled again
    this.TestCaseMap = new KeyPairCollection();
    this.TypeTestCompletedMap = new KeyPairCollection();
    this.MinimumCountForAnalyze = 5;
    this.DifferenceTolerance = 100;

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
        collector.DebugPrint( "DEBUG " + this.TestName + ":" + conditionIdString + " State " + localTestCase.State + " active " + isActive + " shelved " + isShelved );
        collector.DebugPrint( "DEBUG " + this.TestName + ":" + conditionIdString + " Actual Alarm Time " + eventTime.toString() );

        if ( localTestCase.State == this.States.Initial ) {
            CUVariables.Shelve.GetAverageInterval( this.TestName, eventFields, collector, localTestCase );
            localTestCase.State = this.States.WaitingToAnalyze;
        } else if ( localTestCase.State == this.States.WaitingToAnalyze ) {
            var averageInterval = CUVariables.Shelve.GetAverageInterval( this.TestName, eventFields, collector, localTestCase );
            // GetAverageInterval will calculate on IsActive
            if ( averageInterval > 0 ) {
                // Need to call TimedShelve Here.
                localTestCase.InitialEventTime = eventTime;
                var realarmTime = averageInterval * 2;
                localTestCase.TimedShelveTime = Math.floor( realarmTime + averageInterval / 2 );
                localTestCase.AverageInterval = averageInterval;

                var maxTimeShelved = collector.GetSelectField( eventFields, "MaxTimeShelved" );
                if ( collector.ValidateDataType( maxTimeShelved, BuiltInType.Double ) ) {
                    if ( maxTimeShelved.toDouble() < localTestCase.TimedShelveTime ) {
                        addWarning( conditionIdString + " MaxTimeShelved " + maxTimeShelved.toString() +
                            " is less than test case timed shelve " + localTestCase.TimedShelveTime + " Skipping" );
                        localTestCase.State = this.States.Skipped;
                        collector.TestCompleted( conditionId, this.TestName );
                        localTestCase.TestCase.TestsSkipped++;
                        return;
                    }
                }

                localTestCase.ShelveTime = UaDateTime.utcNow();

                var result = CUVariables.Shelve.CallShelve( eventFields, collector,
                    CUVariables.Shelve.TimedShelveMethod,
                    "TimedShelve", localTestCase.TimedShelveTime );
                localTestCase.EndShelveTime = UaDateTime.utcNow();

                if ( result.isGood() ) {
                    collector.DebugPrint( conditionId + " Shelved " + localTestCase.ShelveTime.toString() + ":" + localTestCase.EndShelveTime.toString() );
                    localTestCase.LastActiveState = isActive;
                    localTestCase.RequiresUnshelve = true;
                    localTestCase.ExpectedShelvingState = CUVariables.Shelve.TimedShelved;
                    localTestCase.State = this.States.Shelved;
                } else {
                    collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
                        " Unable to Shelve " + result.toString() );

                    localTestCase.State = this.States.UnableToShelve;
                    localTestCase.TestCase.TestsFailed++;
                    collector.TestCompleted( conditionId, this.TestName );
                }
            }
        } else if ( localTestCase.State == this.States.Shelved ) {
            // There should be an immediate event for shelved
            if ( isActive == localTestCase.LastActiveState ) {
                localTestCase.ShelvedEventTime = eventTime;
                localTestCase.InitialTimeToShelvedEventTime =
                    localTestCase.InitialEventTime.msecsTo( localTestCase.ShelvedEventTime );
                var transitionResult = CUVariables.Shelve.ValidateShelveTransition(
                    eventFields, collector, localTestCase,
                    new UaNodeId( Identifier.ShelvedStateMachineType_UnshelvedToTimedShelved ) );
                var shelvedStateResult = CUVariables.Shelve.ValidateShelveStates(
                    eventFields, collector, localTestCase, CUVariables.Shelve.TimedShelved, true );

                collector.DebugPrint( this.TestName + ":" + conditionIdString + " Shelved TimeShelved " + localTestCase.TimedShelveTime +
                    " Average " + localTestCase.AverageInterval )

                var unshelveTimeResult = CUVariables.Shelve.ValidateImmediateUnshelveTime(
                    eventFields, collector, localTestCase );

                if ( !transitionResult || !shelvedStateResult || !unshelveTimeResult ) {
                    localTestCase.TestCase.TestsFailed++;
                    collector.TestCompleted( conditionId, this.TestName );
                    localTestCase.State = this.States.Failed;
                    return;
                }
                localTestCase.State = this.States.WaitingForTransition;
            } else {
                addWarning( conditionIdString + " ShelvedState event at unexpected Active state - Skipping Test" );
                localTestCase.State = this.States.Skipped;
                collector.TestCompleted( conditionId, this.TestName );
                localTestCase.TestCase.TestsSkipped++;
                return;
            }
        } else if ( localTestCase.State == this.States.WaitingForTransition ) {
            // There should be an update, and the item should still be shelved for half the Average interval remaining
            localTestCase.TransitionEventTime = eventTime;

            var expectedTime = new UaDateTime( localTestCase.InitialEventTime );
            expectedTime.addMilliSeconds( localTestCase.AverageInterval );

            var closeToInterval = Math.abs( expectedTime.msecsTo( localTestCase.TransitionEventTime ) );

            if ( closeToInterval <= this.DifferenceTolerance ) {
                if ( isActive != localTestCase.LastActiveState ) {

                    localTestCase.LastActiveState = isActive;

                    var transitionResult = CUVariables.Shelve.ValidateShelveTransition(
                        eventFields, collector, localTestCase,
                        new UaNodeId( Identifier.ShelvedStateMachineType_UnshelvedToTimedShelved ) );
                    var shelvedStateResult = CUVariables.Shelve.ValidateShelveStates(
                        eventFields, collector, localTestCase, CUVariables.Shelve.TimedShelved, true );

                    var expectedElapsedTime = localTestCase.AverageInterval - localTestCase.InitialTimeToShelvedEventTime;
                    var expectedUnshelveTimeMs = localTestCase.TimedShelveTime - expectedElapsedTime;

                    collector.DebugPrint( this.TestName + " WaitingForTransition TimeShelved " + localTestCase.TimedShelveTime +
                        " Average " + localTestCase.AverageInterval + " Remaining " + expectedUnshelveTimeMs )

                    var unshelveTimeResult = CUVariables.Shelve.ValidateUnshelveTime(
                        eventFields, collector, localTestCase, expectedUnshelveTimeMs );
                    if ( !transitionResult || !shelvedStateResult || !unshelveTimeResult ) {
                        localTestCase.TestCase.TestsFailed++;
                        collector.TestCompleted( conditionId, this.TestName );
                        localTestCase.State = this.States.Failed;
                        return;
                    }
                    localTestCase.State = this.States.WaitingForReAlarm;
                } else {
                    addWarning( conditionIdString + " ShelvedState event at unexpected Active state - Skipping Test" );
                    localTestCase.State = this.States.Skipped;
                    collector.TestCompleted( conditionId, this.TestName );
                    localTestCase.TestCase.TestsSkipped++;
                    return;
                }
            } else {
                addWarning( conditionIdString + " ShelvedState event at unexpected interval, expected " + localTestCase.AverageInterval + " actual " + interval );
                localTestCase.State = this.States.Skipped;
                collector.TestCompleted( conditionId, this.TestName );
                localTestCase.TestCase.TestsSkipped++;
                return;
            }
        } else if ( localTestCase.State == this.States.WaitingForReAlarm ) {
            localTestCase.FinalTransitionTime = eventTime;
            var interval = localTestCase.InitialEventTime.msecsTo( localTestCase.FinalTransitionTime );
            var twoIntervalTime = localTestCase.AverageInterval * 2;
            var closeToInterval = Math.abs( interval - twoIntervalTime );
            if ( closeToInterval <= this.DifferenceTolerance ) {
                if ( isActive != localTestCase.LastActiveState ) {
                    var transitionResult = CUVariables.Shelve.ValidateShelveTransition(
                        eventFields, collector, localTestCase,
                        new UaNodeId( Identifier.ShelvedStateMachineType_UnshelvedToTimedShelved ) );
                    var shelvedStateResult = CUVariables.Shelve.ValidateShelveStates(
                        eventFields, collector, localTestCase, CUVariables.Shelve.TimedShelved, true );

                    var expectedElapsedTime = ( localTestCase.AverageInterval * 2 ) - localTestCase.InitialTimeToShelvedEventTime;
                    var expectedUnshelveTimeMs = localTestCase.TimedShelveTime - expectedElapsedTime;

                    var unshelveTimeResult = CUVariables.Shelve.ValidateUnshelveTime(
                        eventFields, collector, localTestCase, expectedUnshelveTimeMs );
                    if ( !transitionResult || !shelvedStateResult || !unshelveTimeResult ) {
                        localTestCase.TestCase.TestsFailed++;
                        collector.TestCompleted( conditionId, this.TestName );
                        localTestCase.State = this.States.Failed;
                        return;
                    }
                    localTestCase.State = this.States.Completed;
                    localTestCase.TestCase.TestsPassed++;
                    var eventTypeString = eventFields[ collector.EventTypeIndex ].toString();
                    if ( !this.TypeTestCompletedMap.Contains( eventTypeString ) ) {
                        this.TypeTestCompletedMap.Set( eventTypeString, eventTypeString );
                    }
                } else {
                    addWarning( conditionIdString + " ShelvedState event at unexpected Active state - Skipping Test" );
                    localTestCase.State = this.States.Skipped;
                    collector.TestCompleted( conditionId, this.TestName );
                    localTestCase.TestCase.TestsSkipped++;
                    return;
                }
            } else {
                addWarning( conditionIdString + " ShelvedState event at unexpected interval, expected " + twoIntervalTime + " actual " + interval );
                localTestCase.State = this.States.Skipped;
                collector.TestCompleted( conditionId, this.TestName );
                localTestCase.TestCase.TestsSkipped++;
                return;
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
        Test.Execute( { Procedure: Test_006 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Test_006 } );
    }
}