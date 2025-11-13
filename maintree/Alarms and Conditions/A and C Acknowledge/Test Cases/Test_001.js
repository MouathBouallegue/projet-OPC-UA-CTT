/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        1	Find an condition that is for an AcknowledgeableConditionType 
        2	Invoke Acknowledge method passing eventId as received and  a unique comment
        3	Evaluate acknowledged condition notification

    Requirements: 
        This requires an instance (event) of an AcknowledgeableConditionType 
        (sub type will have other states - and thus behavior that will be different)

    
    Expectation:
        1   This requires an instance (event) of an AcknowledgeableConditionType (sub type will have other states - and thus behavior that will be different)	Acknowledgeable condition notification is received where AckedState=FALSE
        2   Call is successful.  A second acknowledgeable condition notification is received 
        3   "AckedState=TRUE.  Comment property contains text of comment argument previously passed.  The retain=FALSE. 
            If the server exposes condition instances, read AckedState and comment"

    How this test works:
        For every Event: Determine if it supports Acknowledgement
        Acknowledge the event with a unique comment, note the time of acknowledgement
        If the same ConditionId comes back, and if the acked.TransitionTime is after the time of acknowledgement
        Ensure that the event has the unique comment and the Acked.Id is true.
*/

function Test_001 () {

    this.TestName = "Test_001";

    this.States = {
        Initial: "Initial",
        UnableToAcknowledge: "UnableToAcknowledge",
        WaitingForAcknowledgedEvent: "WaitingForAcknowledgedEvent",
        Completed: "Completed"
    }

    this.TestCaseMap = new KeyPairCollection();

    this.TestEvent = function ( eventFields, testCase, collector ) {

        var conditionId = collector.GetConditionId( eventFields );

        if ( !CUVariables.Acknowledge.CanRunTest( this.TestName, eventFields, testCase, collector ) ) {
            return;
        }

        var conditionIdString = conditionId.toString();
        var eventId = collector.GetSelectField( eventFields, "EventId" );

        if ( !this.TestCaseMap.Contains( conditionIdString ) ) {
            if ( collector.ShouldAcknowledge( eventFields ) ) {
                this.TestCaseMap.Set( conditionIdString, {
                    Comment: "Test_001 Acknowledging EventId " + eventId.toByteString().toHexString(),
                    EventId: eventId,
                    State: this.States.Initial,
                    AcknowledgementTime: null
                } );
            }
        }

        var localTestCase = this.TestCaseMap.Get( conditionIdString );

        if ( isDefined( localTestCase ) ) {
            if ( localTestCase.State == this.States.Initial ) {
                if ( collector.ShouldAcknowledge( eventFields ) ) {
                    var result = collector.AcknowledgeAlarm( eventFields, localTestCase.Comment, gServerCapabilities.DefaultLocaleId );

                    if ( result.isGood() ) {
                        collector.AddMessage( testCase, collector.Categories.Activity, conditionIdString +
                            " Acknowledged Alarm with comment " + localTestCase.Comment );
                        localTestCase.State = this.States.WaitingForAcknowledgedEvent;
                        localTestCase.AcknowledgementTime = collector.GetCallResponseTime();
                    } else {
                        collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
                            " Unable to Acknowledge Alarm Result = " + result.toString() );
                        localTestCase.State = this.States.UnableToAcknowledge;
                        testCase.TestsFailed++;
                        collector.TestCompleted( conditionId, this.TestName );
                    }
                } else {
                    collector.AddMessage( testCase, collector.Categories.Activity, conditionIdString +
                        " Waiting in Initial State due to not able to acknowledge" );
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

                var passed = false;
                if ( CUVariables.Acknowledge.Validate( eventFields, testCase, collector,
                    localTestCase.Comment, true ) ) {
                    if ( collector.ValidateRetain( eventFields ) ) {
                        testCase.TestsPassed++;
                        passed = true;
                    } else {
                        print( conditionIdString + " Failed Retain" );
                        testCase.TestsFailed++;
                    }
                } else {
                    print( conditionIdString + " Failed Validate" );
                }


                collector.AddMessage( testCase, collector.Categories.Activity, conditionIdString +
                    " Verification passed = " + passed );


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
        Test.Execute( { Procedure: Test_001 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Test_001 } );
    }
}