/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:  
        1.) Check that an alarm that supports shelving appears 
        2.) Call TimedShelve with a 20 second durration and then check if an update on the condition is received
        3.) After 20 seconds

    Requirements:
        An alarm that just stays in alarm

    Expectation:
        1.) Publish receives the event and verify ShelvingState is not shelved.
        2.) Event received and the ShelvingState=TimedShelved and the  LastTransition is from Unshelved to TimedShelved. 
            SuppressedOrShelved is TRUE. UnshelveTime property is initially set to a 20 seconds.
        3.) Event received and the ShelvingState=Unshelved and the  LastTransition is from TimedShelved to Unshelved. 
            SuppressedOrShelved is FALSE. UnshelveTime property is 0.
*/

function Test_005 () {

    this.TestName = "Test_005";
    this.States = {
        Initial: "Initial",
        Shelved: "Shelved",
        UnableToShelve: "UnableToShelve",
        WaitingForTransition: "WaitingForTransition",
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
                // If the maxTime shelved is longer that the test running time, this test cannot proceed
                if ( CUVariables.Shelve.CanRunTimeShelved( eventFields, collector, this.TimedShelveTime ) ) {
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

        if ( !this.TestCaseMap.Contains( conditionIdString ) ) {
            this.TestCaseMap.Set( conditionIdString,
                CUVariables.Shelve.InitializeTestCase(
                    conditionId,
                    eventFields[ collector.EventTypeIndex ],
                    testCase ) );
        }

        var currentState = collector.GetSelectField( eventFields, "ShelvingState.CurrentState" );
        var currentStateId = collector.GetSelectField( eventFields, "ShelvingState.CurrentState.Id" );
        var isShelved = CUVariables.Shelve.AlarmIsShelved( eventFields, collector );
        var shelvedOrSuppressed = collector.GetSelectField( eventFields, "SuppressedOrShelved" );
        if ( shelvedOrSuppressed.DataType == 0 ) {
            collector.AddMessage( localTestCase.TestCase, collector.Categories.Error,
                conditionIdString + " Has Invalid data for ShelvedOrSuppressed " +
                shelvedOrSuppressed.toString() );
        }
        var isActive = collector.IsActive( eventFields );

        var localTestCase = this.TestCaseMap.Get( conditionIdString );
        print( "DEBUG " + this.TestName + ":" + conditionIdString + " State " + localTestCase.State + " active " + isActive + " shelved " + isShelved );

        if ( localTestCase.State == this.States.Initial ) {
            if ( isActive && !isShelved ) {
                var maxTimeShelved = collector.GetSelectField( eventFields, "MaxTimeShelved" );
                if ( maxTimeShelved.DataType > 0 ) {
                    localTestCase.MaxTimeShelved = maxTimeShelved.toDouble();
                    collector.AddMessage( localTestCase.TestCase, collector.Categories.Activity,
                        conditionIdString + " Has MaxTimeShelved value of " + maxTimeShelved.toString() );
                } else {
                    addWarning( conditionIdString + " supports shelving but not MaxTimeShelved" );
                }

                localTestCase.ShelveTime = UaDateTime.utcNow();

                var result = CUVariables.Shelve.CallShelve( eventFields, collector,
                    CUVariables.Shelve.TimedShelveMethod,
                    "TimedShelve", this.TimedShelveTime );

                if ( result.isGood() ) {
                    print( conditionId + " Shelved" );
                    localTestCase.RequiresUnshelve = true;
                    localTestCase.ExpectedShelvingState = CUVariables.Shelve.TimedShelved;
                    localTestCase.State = this.States.Shelved;
                    localTestCase.TimedShelveTime = this.TimedShelveTime;
                } else {
                    print( conditionId + " Unable to Shelve " + result.toString() );

                    localTestCase.State = this.States.UnableToShelve;
                    localTestCase.TestCase.TestsFailed++;
                    collector.TestCompleted( conditionId, this.TestName );
                }
            }
        } else if ( localTestCase.State == this.States.Shelved ) {
            if ( CUVariables.Shelve.ShouldBeShelved( eventFields, collector, localTestCase ) ) {
                if ( currentStateId.toNodeId().equals( CUVariables.Shelve.TimedShelved ) ) {
                    if ( !CUVariables.Shelve.ValidateImmediateUnshelveTime( eventFields, collector, localTestCase ) ) {
                        localTestCase.TestCase.TestsFailed++;
                        collector.TestCompleted( conditionId, this.TestName );
                        localTestCase.State = this.States.Failed;
                    }

                    if ( !CUVariables.Shelve.ValidateShelveTransition( eventFields, collector, localTestCase,
                        new UaNodeId( Identifier.ShelvedStateMachineType_UnshelvedToTimedShelved ) ) ) {
                        localTestCase.TestCase.TestsFailed++;
                        collector.TestCompleted( conditionId, this.TestName );
                        localTestCase.State = this.States.Failed;
                    }

                    if ( collector.ValidateSuppressedOrShelved( eventFields, true ) ) {
                        localTestCase.State = this.States.WaitingForTransition;
                    } else {
                        collector.AddMessage( localTestCase.TestCase, collector.Categories.Error,
                            conditionIdString + " Has Invalid data for ShelvedOrSuppressed " +
                            shelvedOrSuppressed.toString() + " should be true" );
                        localTestCase.TestCase.TestsFailed++;
                        collector.TestCompleted( conditionId, this.TestName );
                        localTestCase.State = this.States.Failed;
                    }
                } else {
                    collector.AddMessage( localTestCase.TestCase, collector.Categories.Error,
                        conditionIdString + " Has Current State of " + currentState.toString() +
                        " (" + currentStateId.toString() + ") " +
                        "when should be OneShotShelved" );
                    localTestCase.State = this.States.Failed;
                    localTestCase.TestCase.TestsFailed++;
                    collector.TestCompleted( conditionId, this.TestName );
                }
            } else {
                // Alarm condition gone, start over
                print( conditionId + " Resetting state to initial from " + this.States.Shelved );

                localTestCase.State = this.States.Initial;
                localTestCase.RequiresUnshelve = false;
            }
        } else if ( localTestCase.State == this.States.WaitingForTransition ) {

            // Test requirement is for alarms that stay between Hi and HiHi and always active
            if ( isActive ) {
                // When should the transistion back to Unshelved take place?
                var shelveExpired = new UaDateTime( localTestCase.ShelveTime );
                shelveExpired.addMilliSeconds( localTestCase.MaxTimeShelved );
                if ( shelveExpired < UaDateTime.utcNow() ) {

                    if ( !CUVariables.Shelve.ValidateShelveTransition( eventFields, collector, localTestCase,
                        new UaNodeId( Identifier.ShelvedStateMachineType_TimedShelvedToUnshelved ) ) ) {
                        localTestCase.TestCase.TestsFailed++;
                        collector.TestCompleted( conditionId, this.TestName );
                        localTestCase.State = this.States.Failed;
                    }

                    // Should be unshelved due to MaxTimeShelved
                    if ( CUVariables.Shelve.ValidateShelveStates( eventFields,
                        collector, localTestCase, CUVariables.Shelve.Unshelved, false ) ) {
                        localTestCase.TestCase.TestsPassed++;
                        var eventTypeString = eventFields[ collector.EventTypeIndex ].toString();
                        if ( !this.TypeTestCompletedMap.Contains( eventTypeString ) ) {
                            this.TypeTestCompletedMap.Set( eventTypeString, eventTypeString );
                        }
                        localTestCase.State = this.States.Completed;
                        print( conditionId + " Test Completed" );
                    } else {
                        localTestCase.TestCase.TestsFailed++;
                        collector.TestCompleted( conditionId, this.TestName );
                        localTestCase.State = this.States.Failed;
                    }
                } else {
                    // This alarm doesn't meet conditions
                    localTestCase.TestCase.TestsSkipped++;
                    collector.TestCompleted( conditionId, this.TestName );
                    localTestCase.State = this.States.Skipped;
                }
            }
        }
    }

    this.PostLoopAction = function ( collector ) {
        if ( this.TypeTestCompletedMap.Length() > 0 ) {
            print( this.TestName + " PostLoopAction for " + this.TypeTestCompletedMap.Length() + " types" );
            var unshelveMap = new KeyPairCollection();
            var typeKeys = this.TypeTestCompletedMap.Keys();
            for ( var typeIndex = 0; typeIndex < typeKeys.length; typeIndex++ ) {
                var eventType = typeKeys[ typeIndex ];
                var conditionKeys = this.TestCaseMap.Keys();
                for ( var index = 0; index < conditionKeys.length; index++ ) {
                    var conditionId = conditionKeys[ index ];
                    var localTestCase = this.TestCaseMap.Get( conditionId );
                    print( this.TestName + " PostLoopAction checking  " + conditionId + " RequiresUnshelve " + localTestCase.RequiresUnshelve );
                    if ( localTestCase.EventType.toString() == eventType &&
                        localTestCase.RequiresUnshelve ) {
                        unshelveMap.Set( conditionId, localTestCase );
                        collector.TestCompleted( conditionId, this.TestName );
                    }
                }
            }
            if ( unshelveMap.Length() > 0 ) {
                print( this.TestName + " Unshelving at PostLoopAction" );
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
        Test.Execute( { Procedure: Test_005 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Test_005 } );
    }
}