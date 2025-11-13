/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        1	create event subscription and find condition in subscription
        2	Invoke acknowledge method passing eventId as received and NULL comment
        3	Invoke acknowledge method passing the same eventId and comment
        4	Repeat for multiple events


    Expectation:
        1   Acknowledgeable condition notification is received where AckedState=FALSE
        2   Call is successful.  A acknowledgeable condition notification is received 
        3   Bad_ConditionBranchAlreadyAcked
        4   Bad_ConditionBranchAlreadyAcked

    
    How this test works:
*/

function Err_005 () {

    this.TestName = "Err_005";

    this.States = {
        Initial: "Initial",
        UnableToAcknowledge: "UnableToAcknowledge",
        WaitingForAcknowledgedEvent: "WaitingForAcknowledgedEvent",
        Completed: "Completed",
        Unexpected: "Unexpected"
    }

    this.TestCaseMap = new KeyPairCollection();
    this.MultipleTestTime = null;
    this.MultipleTestComplete = false;

    this.Initialize = function ( collector ) {
        // Set up a timer for a chance to call acknowledge on multiple events
        this.MultipleTestTime = CUVariables.Acknowledge.GetRunMultipleTestTime( collector );
    }

    this.TestEvent = function ( eventFields, testCase, collector ) {

        if ( !CUVariables.Acknowledge.CanRunTest( this.TestName, eventFields, testCase, collector ) ) {
            return;
        }

        var conditionId = collector.GetConditionId( eventFields );
        var conditionIdString = conditionId.toString();
        var ackedState = collector.GetSelectField( eventFields, "AckedState.Id" );

        if ( !this.TestCaseMap.Contains( conditionIdString ) ) {
            if ( collector.ShouldAcknowledge( eventFields ) ) {
                var eventIdVariant = eventFields[ collector.EventIdIndex ];
                this.TestCaseMap.Set( conditionIdString, {
                    ConditionId: conditionId,
                    TestCase: testCase,
                    State: this.States.Initial,
                    EventId: eventIdVariant,
                    AcknowledgementTime: null
                } );
            }
        }

        var localTestCase = this.TestCaseMap.Get( conditionIdString );

        if ( isDefined( localTestCase ) ) {

            if ( localTestCase.State == this.States.Initial ) {
                if ( collector.ShouldAcknowledge( eventFields ) ) {

                    // Empty comment with a locale should reset
                    var result = collector.AcknowledgeAlarm( eventFields, "", "" );

                    if ( result.isGood() ) {
                        localTestCase.State = this.States.WaitingForAcknowledgedEvent;
                        localTestCase.AcknowledgementTime = collector.GetCallResponseTime();
                    } else {
                        collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
                            " Unable to Acknowledge Alarm: Status " + result.toString() );
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
                var status = collector.CommentCallEx( localTestCase.ConditionId,
                    localTestCase.EventId, "Acknowledge Should Fail", gServerCapabilities.DefaultLocaleId,
                    Identifier.AcknowledgeableConditionType_Acknowledge );

                if ( this.CheckBadStatusCode( status ) ) {
                    testCase.TestsPassed++;
                } else {
                    collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
                        " Unexpected status doing second acknowledge: " + status.toString() );
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
        CUVariables.Acknowledge.MultipleTest( collector, this );
    }

    // Callback for Multiple Test
    this.CreateMethod = function ( key, testCase ) {
        return {
            MethodId: CUVariables.Acknowledge.MethodId,
            ObjectId: testCase.ConditionId,
            InputArguments: [ testCase.EventId, new UaLocalizedText() ]
        };
    }

    this.CheckBadStatusCode = function ( statusCode ) {
        var expectedStatusCode = false;

        if ( statusCode.StatusCode == StatusCode.BadConditionBranchAlreadyAcked ||
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