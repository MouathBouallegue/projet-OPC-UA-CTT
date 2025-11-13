/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        1	Find an condition that is for an AcknowledgeableConditionType 
        2	Call AddComment() and pass a unique comment.
        3	Invoke Confirm() method passing eventId as received and NULL comment (both locale and text)
        4	Evaluate acknowledged condition notification

    Requirements:
        If AddComment() is not supported then this whole test must be skipped.

    Expectation:
        1   Confirmable condition notification is received where confirmedState=FALSE
        2   Success.
        3   Call is successful.  A second acknowledgeable condition notification is received 
        4   confirmedState=TRUE.  Comment property contains text of comment argument previously passed 
            (i.e., existing comment is unchanged).  The retain=FALSE. If the server exposes condition 
            instances, read confirmedState and comment

    
    How this test works:
        For every Event: Determine if it supports Confirmment
        Initialize the event with a unique comment, containing the current time
        Confirm the event with a null comment, note the time of acknowledgement
        If the same ConditionId comes back, and if the acked.TransitionTime is after the time of acknowledgement
        Ensure that the event has the initialized comment and the Acked.Id is true.
*/

function Test_002 () {

    this.TestName = "Test_002";

    this.States = {
        Initial: "Initial",
        UnableToComment: "UnableToComment",
        WaitToConfirm: "WaitToConfirm",
        UnableToConfirm: "UnableToConfirm",
        WaitingForConfirmedEvent: "WaitingForConfirmedEvent",
        Completed: "Completed"
    }

    this.TestCaseMap = new KeyPairCollection();

    this.TestEvent = function ( eventFields, testCase, collector ) {

        var conditionId = collector.GetConditionId( eventFields );
        var conditionIdString = conditionId.toString();
        var eventId = collector.GetSelectField( eventFields, "EventId" );
        var activeState = collector.GetSelectField( eventFields, "ActiveState" ).toString();
        print(this.TestName + ":" + conditionIdString + " Active State " + activeState + " Message " + collector.GetSelectField( eventFields, "Message").toString() + " Event id " + eventId.toString());

        if ( !CUVariables.Confirm.CanRunTest( this.TestName, eventFields, testCase, collector ) ) {
            return;
        }

        var eventId = collector.GetSelectField( eventFields, "EventId" );

        if ( !this.TestCaseMap.Contains( conditionIdString ) ) {
            this.TestCaseMap.Set( conditionIdString, {
                OriginalComment: "Test_002 Initializing Comment at " + UaDateTime.utcNow().toString(),
                EventId: null,
                State: this.States.Initial,
                ConfirmedTime: null
            } );
        }

        var localTestCase = this.TestCaseMap.Get( conditionIdString );

        if ( isDefined( localTestCase ) ) {
            if ( localTestCase.State == this.States.Initial ) {

                if ( collector.ShouldAcknowledge(eventFields)){
                    var acknowledgeResult = collector.AcknowledgeAlarm( eventFields,
                        localTestCase.OriginalComment,
                        gServerCapabilities.DefaultLocaleId );

                    localTestCase.AcknowledgeTime = collector.GetCallResponseTime();

                    if ( acknowledgeResult.isGood() ) {
                        collector.AddMessage( testCase, collector.Categories.Activity, conditionIdString +
                            " Initialized with comment " + localTestCase.OriginalComment );

                        localTestCase.State = this.States.WaitToConfirm;

                    } else {
                        collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
                            " Unable to Initialize comment on Alarm - Error " + acknowledgeResult.toString() );
                        localTestCase.State = this.States.Completed;
                        testCase.TestsFailed++;
                        collector.TestCompleted( conditionId, this.TestName );
                    }
                }else{
                    collector.AddMessage( testCase, collector.Categories.Activity, conditionIdString +
                        " Waiting for acknowledgeable state");
                }
            } else if ( localTestCase.State == this.States.WaitToConfirm ) {

                if ( CUVariables.Confirm.IgnoreConfirmByTime( eventFields, collector, "Acknowledge",
                    localTestCase.AcknowledgeTime ) ) {
                    collector.AddMessage( testCase, collector.Categories.Activity, conditionIdString +
                        " Skipping Confirm due to new event" );

                    localTestCase.TestsSkipped++;
                    localTestCase.State = this.States.Initial;
                    return;
                }


                if ( collector.ShouldConfirm( eventFields ) ) {
                    var ackResult = collector.ConfirmAlarm( eventFields, "" );
                    localTestCase.ConfirmedTime = collector.GetCallResponseTime();
                    if ( ackResult.isGood() ) {
                        collector.AddMessage( testCase, collector.Categories.Activity, conditionIdString +
                            " Confirmed Alarm with no comment " );
                        localTestCase.State = this.States.WaitingForConfirmedEvent;
                    } else {
                        collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
                            " Unable to Confirm with null comment " + ackResult.toString() );
                        localTestCase.State = this.States.UnableToConfirm;
                        testCase.TestsFailed++;
                        collector.TestCompleted( conditionId, this.TestName );
                    }
                }else{
                    collector.AddMessage( testCase, collector.Categories.Activity, conditionIdString +
                        " Unable to Confirm due to confirmed State" );
                    localTestCase.State = this.States.UnableToConfirm;
                    testCase.Skipped++;
                    collector.TestCompleted( conditionId, this.TestName );
                }
            } else if ( localTestCase.State == this.States.WaitingForConfirmedEvent ) {

                if ( CUVariables.Confirm.IgnoreConfirmByTime( eventFields, collector, "Confirm",
                    localTestCase.ConfirmedTime ) ) {
                        collector.AddMessage( testCase, collector.Categories.Activity, conditionIdString +
                            " New event before confirmation happed - Skipping " );
                        localTestCase.State = this.States.Initial;
                        testCase.Skipped++;
                        return;
                }

                print(this.TestName + " Validating " + conditionIdString );

                if ( CUVariables.Confirm.Validate( eventFields, testCase, collector,
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