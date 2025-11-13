/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        1	create event subscription and find condition in subscription
        2	Invoke acknowledge method passing eventId as received and NULL comment
        3	Invoke acknowledge method passing the same eventId and comment
        4	Repeat for multiple events


    Expectation:
        1   Confirmable condition notification is received where confirmedState=FALSE
        2   Call is successful.  A acknowledgeable condition notification is received 
        3   Bad_ConditionBranchAlreadyAcked
        4   Bad_ConditionBranchAlreadyAcked

    
    How this test works:
*/

function Err_005 () {

    this.TestName = "Err_005";

    this.States = {
        Initial: "Initial",
        UnableToConfirm: "UnableToConfirm",
        WaitingForConfirmedEvent: "WaitingForConfirmedEvent",
        Completed: "Completed",
        Skipped: "Skipped",
        Unexpected: "Unexpected"
    }

    this.TestCaseMap = new KeyPairCollection();
    this.MultipleTestTime = null;
    this.MultipleTestComplete = false;

    this.Initialize = function ( collector ) {
        // Set up a timer for a chance to call acknowledge on multiple events
        this.MultipleTestTime = CUVariables.Confirm.GetRunMultipleTestTime( collector );
    }

    this.TestEvent = function ( eventFields, testCase, collector ) {

        if ( !CUVariables.Confirm.CanRunTest( this.TestName, eventFields, testCase, collector ) ) {
            return;
        }

        var conditionId = collector.GetConditionId( eventFields );
        var conditionIdString = conditionId.toString();
        var confirmedState = collector.GetSelectField( eventFields, "ConfirmedState.Id" );

        if ( !this.TestCaseMap.Contains( conditionIdString ) ) {
            if ( collector.ShouldAcknowledge( eventFields ) ) {
                this.TestCaseMap.Set( conditionIdString, {
                    ConditionId: conditionId,
                    TestCase: testCase,
                    State: this.States.Initial,
                    EventId: null,
                    ConfirmedTime: null
                } );
            }
        }

        var localTestCase = this.TestCaseMap.Get( conditionIdString );

        if ( isDefined( localTestCase ) ) {

            if ( localTestCase.State == this.States.Initial ) {
                if ( collector.ShouldAcknowledge( eventFields )) {
                    print(this.TestName + ":" + conditionIdString + " Acknowledging" );

                    addCommentResult = collector.AcknowledgeAlarm( eventFields,
                        this.TestName + " Acknowledging Alarm",
                        gServerCapabilities.DefaultLocaleId );
                    collector.AddMessage( testCase, collector.Categories.Activity, conditionIdString +
                        " Acknowledge Alarm " +  addCommentResult.toString());
    
                    return;
                }

                // Empty comment with a locale should reset
                var result = collector.ConfirmAlarm( eventFields, "", "" );

                if ( result.isGood() ) {
                    localTestCase.EventId = eventFields[ collector.EventIdIndex ];
                    localTestCase.ConfirmedTime = collector.GetCallResponseTime();
                    localTestCase.State = this.States.WaitingForConfirmedEvent;
                } else {
                    collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
                        " Unable to Confirm Alarm" );
                    localTestCase.State = this.States.UnableToConfirm;
                    testCase.TestsFailed++;
                    collector.TestCompleted( conditionId, this.TestName );
                }
            } else if ( localTestCase.State == this.States.WaitingForConfirmedEvent ) {
                if ( CUVariables.Confirm.IgnoreConfirmByTime( eventFields, collector, "Confirm",
                    localTestCase.ConfirmedTime ) ) {
                    collector.Skip( this.TestName, conditionId, localTestCase, this.States.Skipped );
                    return;
                }
                var status = collector.CommentCallEx( localTestCase.ConditionId,
                    localTestCase.EventId, "Confirm Should Fail", gServerCapabilities.DefaultLocaleId,
                    Identifier.AcknowledgeableConditionType_Confirm );

                if ( this.CheckBadStatusCode( status ) ) {
                    testCase.TestsPassed++;
                } else {
                    collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
                        " Unexpected status doing second Confirm: " + status.toString() );
                    testCase.TestsFailed++;
                }

                localTestCase.State = this.States.Completed;
                collector.TestCompleted( conditionId, this.TestName );
            } else if ( localTestCase.State == this.States.Completed ) {
                localTestCase.State = this.States.Unexpected;
            }
        }
    }

    this.NonEventCheck = function ( collector ) {
        CUVariables.Confirm.MultipleTest( collector, this );
    }

    // Callback for Multiple Test
    this.CreateMethod = function ( key, testCase ) {
        return {
            MethodId: CUVariables.Confirm.MethodId,
            ObjectId: testCase.ConditionId,
            InputArguments: [ testCase.EventId, new UaLocalizedText() ]
        };
    }

    this.CheckBadStatusCode = function ( statusCode ) {
        var expectedStatusCode = false;

        if ( statusCode.StatusCode == StatusCode.BadConditionBranchAlreadyConfirmed ||
            statusCode.StatusCode == StatusCode.BadEventIdUnknown ) {
            expectedStatusCode = true;
        }

        return expectedStatusCode;
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
        Test.Execute( { Procedure: Err_005 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Err_005 } );
    }
}