/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        1	Find an condition that is for an AcknowledgeableConditionType 
        2	Call AddComment() and pass a unique comment.
        3	Invoke Acknowledge() method passing eventId as received and NULL comment (both locale and text)
        4	Evaluate acknowledged condition notification

    Requirements:
        If AddComment() is not supported then this whole test must be skipped.

    Expectation:
        1   Acknowledgeable condition notification is received where AckedState=FALSE
        2   Success.
        3   Call is successful.  A second acknowledgeable condition notification is received 
        4   AckedState=TRUE.  Comment property contains text of comment argument previously passed 
            (i.e., existing comment is unchanged).  The retain=FALSE. If the server exposes condition 
            instances, read AckedState and comment

    
    How this test works:
        For every Event: Determine if it supports Acknowledgement
        Initialize the event with a unique comment, containing the current time
        Acknowledge the event with a null comment, note the time of acknowledgement
        If the same ConditionId comes back, and if the acked.TransitionTime is after the time of acknowledgement
        Ensure that the event has the initialized comment and the Acked.Id is true.
*/

function Test_002 () {

    this.TestName = "Test_002";

    this.States = {
        Initial: "Initial",
        UnableToComment: "UnableToComment",
        WaitToAcknowledge: "WaitToAcknowledge",
        UnableToAcknowledge: "UnableToAcknowledge",
        WaitingForAcknowledgedEvent: "WaitingForAcknowledgedEvent",
        Completed: "Completed"
    }

    this.TestCaseMap = new KeyPairCollection();

    this.first = true;

    this.TestEvent = function ( eventFields, testCase, collector ) {

        if ( this.first ) {
            var alarms = Test.Alarm;
            var types = alarms.Types;
            var acknowledgeable = types.Get( "i=2881" );

            this.first = false;
        }
        if ( !CUVariables.Acknowledge.CanRunTest( this.TestName, eventFields, testCase, collector ) ) {
            return;
        }

        var conditionId = collector.GetConditionId( eventFields );
        var conditionIdString = conditionId.toString();
        var eventId = collector.GetSelectField( eventFields, "EventId" );
        var commentTime = UaDateTime.utcNow();

        if ( !this.TestCaseMap.Contains( conditionIdString ) ) {
            if ( collector.ShouldAcknowledge( eventFields ) ) {
                this.TestCaseMap.Set( conditionIdString, {
                    OriginalComment: "Test_002 Initializing Comment at " + commentTime.toString(),
                    EventId: null,
                    State: this.States.Initial,
                    AcknowledgementTime: null
                } );
            }
        }

        var localTestCase = this.TestCaseMap.Get( conditionIdString );

        if ( isDefined( localTestCase ) ) {
            if ( localTestCase.State == this.States.Initial ) {
                // Just Add a comment here.
                var addCommentResult = collector.AddComment( eventFields, localTestCase.OriginalComment );

                if ( addCommentResult.isGood() ) {
                    collector.AddMessage( testCase, collector.Categories.Activity, conditionIdString +
                        " Initialized with comment " + localTestCase.OriginalComment );

                    localTestCase.State = this.States.WaitToAcknowledge;

                } else {
                    collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
                        " Unable to Initialize comment on Alarm " + addCommentResult.toString() );
                    localTestCase.State = this.States.UnableToComment;
                    testCase.TestsFailed++;
                    collector.TestCompleted( conditionId, this.TestName );
                }
            } else if ( localTestCase.State == this.States.WaitToAcknowledge ) {
                if ( collector.ShouldAcknowledge( eventFields ) ) {
                    var ackResult = collector.AcknowledgeAlarm( eventFields, "" );
                    if ( ackResult.isGood() ) {
                        collector.AddMessage( testCase, collector.Categories.Activity, conditionIdString +
                            " Acknowledged Alarm with no comment " );
                        localTestCase.AcknowledgementTime = collector.GetCallResponseTime();
                        localTestCase.State = this.States.WaitingForAcknowledgedEvent;
                    } else {
                        collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
                            " Unable to Acknowledge with null comment " + ackResult.toString() );
                        localTestCase.State = this.States.UnableToAcknowledge;
                        testCase.TestsFailed++;
                        collector.TestCompleted( conditionId, this.TestName );
                    }
                } else {
                    collector.AddMessage( testCase, collector.Categories.Activity, conditionIdString +
                        " Waiting in WaitToAcknowledge State due to not able to acknowledge" );
                }
            } else if ( localTestCase.State == this.States.WaitingForAcknowledgedEvent ) {

                if ( CUVariables.Acknowledge.IgnoreAcknowledgeByTime( eventFields, collector,
                    localTestCase.AcknowledgementTime ) ) {
                    collector.AddMessage( testCase, collector.Categories.Activity, conditionIdString +
                        " Skipping due to new event" );

                    localTestCase.TestsSkipped++;
                    localTestCase.State = this.States.Initial;
                    return;
                }

                if ( CUVariables.Acknowledge.Validate( eventFields, testCase, collector,
                    localTestCase.OriginalComment, true ) ) {
                    if ( collector.ValidateRetain( eventFields ) ) {
                        testCase.TestsPassed++;
                    }
                }

                localTestCase.State = this.States.Completed;
                collector.TestCompleted( conditionId, this.TestName );
            }
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
        Test.Execute( { Procedure: Test_002 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Test_002 } );
    }
}