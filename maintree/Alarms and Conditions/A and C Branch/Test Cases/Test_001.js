/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.online

    File
        ./maintree/Alarms and Conditions/A and C Branch/Level/Test Cases/Test_001.js

    Description: 
        1. Find an condition that is for an AcknowledgeableConditionType (or subtype) that supports branching
        2. Invoke Acknowledge method passing eventId as received (for branch 0)
        3. Evaluate acknowledged condition notification
   
    Test Requirements:
        This requires an event of an AcknowledgeableConditionType that has branches and does not require confirmation


    Expectation:
        1. Acknowledgeable condition notification is received where AckedState=FALSE, BranchId is not 0
        2. Call is successful.  A second acknowledgeable condition notification is received 
        3. AckedState=TRUE.     Branches still exist and are reported without a change of the AckedState.
*/

function Test_001 () {


    this.TestName = "Test_001";

    this.States = {
        Initial: "Initial",
        Acknowledged: "Acknowledged",
        ReadyForCheck: "ReadyForCheck",
        Failed: "Failed",
        Completed: "Completed",
    }

    this.TestCaseMap = new KeyPairCollection();
    this.ModelMapHelper = null;
    this.DelayBeforeCheckInSeconds = 5;

    this.Initialize = function ( collector ) {
        collector.AddIgnoreSkipsForSpecificTypes(
            [ new UaNodeId( Identifier.ConditionType ).toString() ], this.TestName );
    }

    this.TestEvent = function ( eventFields, testCase, collector ) {

        if ( !this.CanRunTest( eventFields, collector ) ) {
            return;
        }

        var conditionId = collector.GetConditionId( eventFields );
        var conditionIdString = conditionId.toString();
        var eventId = eventFields[ collector.EventIdIndex ].toByteString();

        if ( !this.TestCaseMap.Contains( conditionIdString ) ) {
            this.TestCaseMap.Set( conditionIdString, {
                State: this.States.Initial,
                TestCase: testCase,
                ConditionEventMap: collector.GetConditionFromStore( eventFields ),
                AcknowledgeTime: null,
                AcknowledgeEvent: null,
                Comment: this.TestName + " Acknowledging event Id " + eventId.toString(),
                PostLoopCheckLocalTime: null
            } );
        }

        var localTestCase = this.TestCaseMap.Get( conditionIdString );

        collector.DebugPrint( this.TestName + ":" + conditionIdString +
            " State " + localTestCase.State +
            " ActiveState [" + collector.GetSelectField( eventFields, "ActiveState" ) + "] " +
            " AckedState [" + collector.GetSelectField( eventFields, "AckedState" ) + "] " +
            " BranchId [" + collector.GetSelectField( eventFields, "BranchId" ) + "] " +
            " Message [" + collector.GetSelectField( eventFields, "Message" ) + "] " +
            " Comment [" + collector.GetSelectField( eventFields, "Comment" ) + "] " );

        if ( localTestCase.State == this.States.Initial ) {
            if ( collector.ShouldAcknowledge( eventFields ) ) {
                var result = collector.AcknowledgeAlarm( eventFields, localTestCase.Comment, gServerCapabilities.DefaultLocaleId );
                localTestCase.AcknowledgeTime = collector.GetCallResponseTime();

                if ( result.isGood() ) {
                    localTestCase.State = this.States.Acknowledged;
                } else {
                    collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                        "Unable to Acknowledge Branch 0 Alarm [" + result.toString() + "]" );
                }
            }
        } else if ( localTestCase.State == this.States.Acknowledged ) {
            // Validate acked states
            var ackedState = collector.GetBooleanValue( eventFields, "AckedState.Id" );
            if ( ackedState ) {
                var time = collector.GetSelectField( eventFields, "Time" ).toDateTime();
                localTestCase.PostLoopCheckLocalTime = collector.GetAlarmTester().GetLocalTimeFromDeviceTime( time );
                localTestCase.PostLoopCheckLocalTime.addSeconds( this.DelayBeforeCheckInSeconds );
                localTestCase.State = this.States.ReadyForCheck;
                localTestCase.AcknowledgeEvent = eventFields
            } else {
                collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed, "Invalid state after acknowledge to Branch 0 Alarm" );
            }
        }
    }

    this.PostLoopAction = function ( collector ) {
        // Better readability
        var testName = this.TestName;
        var states = this.States;

        var now = UaDateTime.utcNow();

        this.TestCaseMap.Iterate( function ( conditionIdString, localTestCase, args ) {
            if ( localTestCase.State == states.ReadyForCheck ) {
                if ( now.msecsTo( localTestCase.PostLoopCheckLocalTime ) < 0 ) {
                    if ( isDefined( localTestCase.ConditionEventMap ) ) {
                        // Walk through all events, and ensure the acknowledge did not affect existing branches
                        localTestCase.ConditionEventMap.Iterate( function ( key, eventMap ) {
                            var branch = UaNodeId.fromString( key );
                            if ( !UaNodeId.IsEmpty( branch ) ) {
                                // Just check events that came after the Acknowledge time
                                eventMap.Iterate( function ( time, event ) {
                                    // event is after acknowledge time. - should not be acknowledged
                                    collector.DebugPrint( "\t" + testName + " ActiveState " + collector.GetSelectField( localTestCase.AcknowledgeEvent, "ActiveState" ) +
                                        " AckedState " + collector.GetSelectField( localTestCase.AcknowledgeEvent, "AckedState" ) +
                                        " BranchId " + collector.GetSelectField( localTestCase.AcknowledgeEvent, "BranchId" ) +
                                        " Message " + collector.GetSelectField( localTestCase.AcknowledgeEvent, "Message" ) +
                                        " Comment " + collector.GetSelectField( localTestCase.AcknowledgeEvent, "Comment" ) );
                                    var time = collector.GetSelectField( event, "Time" ).toDateTime();
                                    if ( time.msecsTo( localTestCase.AcknowledgeTime ) <= 0 ) {
                                        collector.AddMessage( localTestCase.TestCase, collector.Categories.Activity,
                                            conditionIdString + " checking event with branch " + key );
                                        var branchedAck = collector.GetSelectField( event, "AckedState.Id" ).toBoolean();
                                        if ( branchedAck ) {
                                            collector.Error( testName, conditionIdString, localTestCase, states.Failed,
                                                "Acknowledge affected branch " + key + " Comment = " +
                                                collector.GetSelectField( event, "Comment" ).toString() );
                                        }
                                    }
                                } );
                            }
                        } );
                    }

                    if ( localTestCase.State != states.Failed ) {
                        localTestCase.State = states.Completed;
                        localTestCase.TestCase.TestsPassed++;
                        collector.TestCompleted( conditionIdString, testName );
                    }
                }
            }
        } );
    }

    this.CanRunTest = function ( eventFields, collector ) {

        var canRunTest = false;

        if ( collector.IsAcknowledgeable( eventFields, true ) && collector.ConditionHasBranch( eventFields ) ) {
            if ( !collector.IsBranch( eventFields ) ) {
                if ( collector.CanRunTest( collector.GetConditionId( eventFields ), this.TestName ) ) {
                    canRunTest = true;
                }
            }
        }

        return canRunTest;
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
        Test.Execute( { Procedure: Test_001 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Test_001 } );
    }
}



