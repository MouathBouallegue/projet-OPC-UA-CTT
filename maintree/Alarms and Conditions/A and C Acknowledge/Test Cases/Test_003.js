/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        1	Find an condition that is for an AcknowledgeableConditionType 
        2	Invoke acknowledge method passing eventId as received and empty ("") comment
        3	Evaluate acknowledged condition notification


    Expectation:
        1   Acknowledgeable condition notification is received where AckedState=FALSE
        2    Call is successful.  A second acknowledgeable condition notification is received 
        3    AckedState=TRUE.  Comment property contains empty text. The retain=FALSE. 
            If the server exposes condition instances,  read AckedState and comment

    
    How this test works:
*/

function Test_003 () {

    this.TestName = "Test_003";

    this.States = {
        Initial: "Initial",
        UnableToAcknowledge: "UnableToAcknowledge",
        WaitingForAcknowledgedEvent: "WaitingForAcknowledgedEvent",
        Completed: "Completed"
    }

    this.TestCaseMap = new KeyPairCollection();

    this.TestEvent = function ( eventFields, testCase, collector ) {

        if ( !CUVariables.Acknowledge.CanRunTest( this.TestName, eventFields, testCase, collector ) ) {
            return;
        }

        var conditionId = collector.GetConditionId( eventFields );
        var conditionIdString = conditionId.toString();

        if ( !this.TestCaseMap.Contains( conditionIdString ) ) {
            if ( collector.ShouldAcknowledge( eventFields ) ) {
                this.TestCaseMap.Set( conditionIdString, {
                    State: this.States.Initial,
                    AcknowledgementTime: null
                } );
            }
        }

        var localTestCase = this.TestCaseMap.Get( conditionIdString );

        if ( isDefined( localTestCase ) ) {

            if ( localTestCase.State == this.States.Initial ) {
                if ( collector.ShouldAcknowledge( eventFields ) ) {

                    // Empty comment with a locale should reset
                    var localeId = "en";
                    if ( gServerCapabilities.DefaultLocaleId.length > 0 ) {
                        localeId = gServerCapabilities.DefaultLocaleId;
                    }
                    var result = collector.AcknowledgeAlarm( eventFields, "", localeId );

                    if ( result.isGood() ) {
                        localTestCase.AcknowledgementTime = collector.GetCallResponseTime();
                        localTestCase.State = this.States.WaitingForAcknowledgedEvent;
                    } else {
                        collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
                            " Unable to Acknowledge Alarm " + result.toString() );
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
                    "", true ) ) {
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
        Test.Execute( { Procedure: Test_003 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Test_003 } );
    }
}