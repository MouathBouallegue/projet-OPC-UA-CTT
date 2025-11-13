/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        1	Find an condition that is for an AcknowledgeableConditionType 
        2	Invoke Confirm method passing eventId as received and  a unique comment
        3	Evaluate acknowledged condition notification

    Requirements: 
        This requires an instance (event) of an AcknowledgeableConditionType 
        (sub type will have other states - and thus behavior that will be different)
    
    Expectation:
        1   This requires an instance (event) of an AcknowledgeableConditionType (sub type will have other states - and thus behavior that will be different)	Confirmable condition notification is received where confirmedState=FALSE
	    2   Call is successful.  A second acknowledgeable condition notification is received 
	    3   confirmedState=TRUE.  Comment property contains text of comment argument previously passed.  The retain=FALSE. 
            If the server exposes condition instances, read confirmedState and comment"

    How this test works:
        For every Event: Determine if it supports Confirmment
        Confirm the event with a unique comment, note the time of acknowledgement
        If the same ConditionId comes back, and if the acked.TransitionTime is after the time of acknowledgement
        Ensure that the event has the unique comment and the Acked.Id is true.
*/

function Test_001 () {

    this.TestName = "Test_001";

    this.States = {
        Initial: "Initial",
        UnableToConfirm: "UnableToConfirm",
        WaitingForConfirmedEvent: "WaitingForConfirmedEvent",
        Completed: "Completed"
    }

    this.TestCaseMap = new KeyPairCollection();

    this.TestEvent = function ( eventFields, testCase, collector ) {
        var conditionId = collector.GetConditionId( eventFields );

        if ( !CUVariables.Confirm.CanRunTest( this.TestName, eventFields, testCase, collector ) ) {
            return;
        }

        print(this.TestName + " not ignoring condition Id " + conditionId.toString());
        var conditionIdString = conditionId.toString();
        var eventId = collector.GetSelectField( eventFields, "EventId" );

        if ( !this.TestCaseMap.Contains( conditionIdString ) ) {

            if ( collector.ShouldAcknowledge( eventFields ) ){
                collector.AcknowledgeAlarm( eventFields, 
                    "Test_001 Confirming EventId " + eventId.toByteString().toHexString(), gServerCapabilities.DefaultLocaleId );
                    return;
            }

            var confirmedState = collector.GetSelectField( eventFields, "ConfirmedState.Id" );
            var state = collector.GetSelectField( eventFields, "ConfirmedState" ).toLocalizedText();

            if ( confirmedState.toBoolean() == false ) {
                this.TestCaseMap.Set( conditionIdString, {
                    Comment: "Test_001 Confirming EventId " + eventId.toByteString().toHexString(),
                    EventId: eventId,
                    State: this.States.Initial,
                    ConfirmedTime: null
                } );
            }
        }

        var localTestCase = this.TestCaseMap.Get( conditionIdString );

        if ( isDefined( localTestCase ) ) {
            if ( localTestCase.State == this.States.Initial ) {

                print(this.TestName + " Confirming " + conditionIdString );
                var result = collector.ConfirmAlarm( eventFields, localTestCase.Comment, gServerCapabilities.DefaultLocaleId );

                localTestCase.ConfirmedTime = collector.GetCallResponseTime();

                if ( result.isGood() ) {
                    collector.AddMessage( testCase, collector.Categories.Activity, conditionIdString +
                        " Confirmed Alarm with comment " + localTestCase.Comment );
                    localTestCase.State = this.States.WaitingForConfirmedEvent;
                } else {
                    collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
                        " Unable to Confirm Alarm" );
                    localTestCase.State = this.States.UnableToConfirm;
                    testCase.TestsFailed++;
                    collector.TestCompleted( conditionId, this.TestName );
                }
            } else if ( localTestCase.State == this.States.WaitingForConfirmedEvent ) {

                print(this.TestName + " Validating " + conditionIdString );

                var passed = false;
                if ( CUVariables.Confirm.Validate( eventFields, testCase, collector,
                    localTestCase.Comment, true ) ) {
                    if ( collector.ValidateRetain( eventFields ) ) {
                        testCase.TestsPassed++;
                        passed = true;
                    } else {
                        testCase.TestsFailed++;
                    }
                }
                else
                {
                    testCase.TestsFailed++;
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