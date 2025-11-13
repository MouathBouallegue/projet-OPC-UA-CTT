/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        1	Find an condition that is for an AcknowledgeableConditionType 
        2	Invoke acknowledge method passing eventId as received and empty ("") comment
        3	Evaluate acknowledged condition notification


    Expectation:
        1   Confirmable condition notification is received where confirmedState=FALSE
        2    Call is successful.  A second acknowledgeable condition notification is received 
        3    confirmedState=TRUE.  Comment property contains empty text. The retain=FALSE. 
            If the server exposes condition instances,  read confirmedState and comment

    
    How this test works:
*/

function Test_003 () {

    this.TestName = "Test_003";

    this.States = {
        Initial: "Initial",
        WaitingForAcknowledgedEvent: "WaitingForAcknowledgedEvent",
        UnableToConfirm: "UnableToConfirm",
        WaitingForConfirmedEvent: "WaitingForConfirmedEvent",
        Skipped: "Skipped",
        Completed: "Completed"
    }

    this.TestCaseMap = new KeyPairCollection();

    this.Initialize = function(){
        debugger;
    }
    
    this.TestEvent = function ( eventFields, testCase, collector ) {

        if ( !CUVariables.Confirm.CanRunTest( this.TestName, eventFields, testCase, collector ) ) {
            return;
        }

        var conditionId = collector.GetConditionId( eventFields );
        var conditionIdString = conditionId.toString();
        var eventId = collector.GetSelectField( eventFields, "EventId" );

        if ( !this.TestCaseMap.Contains( conditionIdString ) ) {
            this.TestCaseMap.Set( conditionIdString, {
                State: this.States.Initial,
                AcknowledgedTime: null,
                ConfirmedTime: null
            } );
        }

        var localTestCase = this.TestCaseMap.Get( conditionIdString );

        if ( isDefined( localTestCase ) ) {

            if ( localTestCase.State == this.States.Initial ) {
                if ( collector.ShouldAcknowledge( eventFields )) {
                    print(this.TestName + ":" + conditionIdString + " Acknowledging" );

                    var acknowledgeResult = collector.AcknowledgeAlarm( eventFields,
                        this.TestName + " Acknowledging Alarm",
                        gServerCapabilities.DefaultLocaleId );

                    localTestCase.AcknowledgedTime = collector.GetCallResponseTime();

                    if ( acknowledgeResult.isGood() ) {
                        localTestCase.State = this.States.WaitingForAcknowledgedEvent;
                    } else {
                        collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
                            " Unable to Acknowledge Alarm " + acknowledgeResult.toString() );
                        localTestCase.State = this.States.UnableToConfirm;
                        testCase.TestsFailed++;
                        collector.TestCompleted( conditionId, this.TestName );
                    }
                }else{
                    collector.AddMessage( testCase, collector.Categories.Activity, conditionIdString +
                        " Waiting for acknowledgeable state");
                }
            }else if ( localTestCase.State == this.States.WaitingForAcknowledgedEvent){
                if ( CUVariables.Confirm.IgnoreConfirmByTime( eventFields, collector, "Acknowledge",
                    localTestCase.AcknowledgedTime ) ) {
                        collector.AddMessage( testCase, collector.Categories.Activity, conditionIdString +
                            " Skipping Confirm due to new event" );
    
                        localTestCase.TestsSkipped++;
                        localTestCase.State = this.States.Initial;
                        return;
                }

                if ( collector.ShouldConfirm(eventFields)){
                    // Empty comment with a locale should reset
                    var result = collector.ConfirmAlarm( eventFields, "",
                        gServerCapabilities.DefaultLocaleId );

                    if ( result.isGood() ) {
                        localTestCase.State = this.States.WaitingForConfirmedEvent;
                        localTestCase.ConfirmedTime = collector.GetCallResponseTime();
                    } else {
                        collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
                            " Unable to Confirm Alarm " + result.toString() );
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
                            " Skipping Validation due to new event" );
                            localTestCase.TestsSkipped++;
                        localTestCase.State = this.States.Initial;
                        return;
                }

                if ( CUVariables.Confirm.Validate( eventFields, testCase, collector,
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