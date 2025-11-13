/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        1   Check that an Alarm appear and returns to normal 
        2   Call acknowledge and/or confirm on the alarm (that has returned to normal)

    Expectation:
        1   Event received and alarm ActiveState is TRUE
        2   Event received, alarm ActiveState is FALSE, Retain bit is FALSE (and it is Acknowledge and/or Confirmed)
    
    How this test works:
        For every Event: Determine if it supports AlarmConditionType
        Track alarms that go active.
        Track same alarms that go non active
        Acknowledge and Confirm
*/

function Test_002 () {

    this.TestName = "Test_002";

    this.States = {
        Initial: "Initial",
        WaitingToAcknowledge: "WaitingToAcknowledge",
        FailedToAcknowledge: "FailedToAcknowledge",
        AcknowledgeConfirmation: "AcknowledgeConfirmation",
        WaitingToConfirm: "WaitingToConfirm",
        FailedToConfirm: "FailedToConfirm",
        ConfirmConfirmation: "ConfirmConfirmation",
        CompletedNoConfirm: "CompletedNoConfirm",
        Completed: "Completed"
    }

    this.TestCaseMap = new KeyPairCollection();

    this.TestEvent = function ( eventFields, testCase, collector ) {

        if ( !CUVariables.Alarm.CanRunTest( this.TestName, eventFields, collector ) ) {
            return;
        }

        var conditionId = collector.GetConditionId( eventFields );
        var conditionIdString = conditionId.toString();

        if ( !this.TestCaseMap.Contains( conditionIdString ) ) {
            this.TestCaseMap.Set( conditionIdString, {
                State: this.States.Initial,
                SupportsConfirm: false,
                AcknowledgementTime: null
            } );
        }

        var localTestCase = this.TestCaseMap.Get( conditionIdString );

        var activeState = collector.GetSelectField( eventFields, "ActiveState.Id" ).toBoolean();

        if ( localTestCase.State == this.States.Initial ) {
            if ( activeState ) {
                print( conditionIdString + " should move to WaitingToAcknowledge " );
                var confirmedState = collector.GetSelectField( eventFields, "ConfirmedState.Id" );
                if ( confirmedState.DataType == BuiltInType.Boolean ) {
                    localTestCase.SupportsConfirm = true;
                }
                localTestCase.State = this.States.WaitingToAcknowledge;
            }
        } else if ( localTestCase.State == this.States.WaitingToAcknowledge ) {
            if ( !activeState && !collector.IsAcknowledged( eventFields ) ) {
                var result = collector.AcknowledgeAlarm( eventFields, "Acknowledging", 
                    gServerCapabilities.DefaultLocaleId );
                if ( result.isGood() ) {
                    localTestCase.State = this.States.AcknowledgeConfirmation;
                } else {
                    localTestCase.State = this.States.FailedToAcknowledge;
                    collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
                        " Acknowledge failed " + result.toString() );
                    testCase.TestsFailed++;
                    collector.TestCompleted( conditionId, this.TestName );
                }
            }
        } else if ( localTestCase.State == this.States.AcknowledgeConfirmation ) {
            if ( activeState ) {
                // reset
                localTestCase.State = this.States.WaitingToAcknowledge;
                return;
            }

            var ackedState = collector.GetSelectField( eventFields, "AckedState.Id" ).toBoolean();

            if ( ackedState ) {
                var validRetain = CUVariables.Alarm.ValidateRetain( conditionIdString, eventFields, testCase, collector );

                if ( localTestCase.SupportsConfirm ) {
                    var result = collector.ConfirmAlarm( eventFields, "Confirming", gServerCapabilities.DefaultLocaleId );
                    if ( result.isGood() ) {
                        localTestCase.State = this.States.ConfirmConfirmation;
                    } else {
                        localTestCase.State = this.States.FailedToConfirm;
                        collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
                            " Confirm failed " + result.toString() );
                        testCase.TestsFailed++;
                        collector.TestCompleted( conditionId, this.TestName );
                    }
                } else {
                    if ( validRetain ) {
                        testCase.TestsPassed++;
                    }
                    localTestCase.State = this.States.CompletedNoConfirm;
                    collector.TestCompleted( conditionId, this.TestName );
                }
            } else {
                localTestCase.State = this.States.FailedToAcknowledge;
                collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
                    " AckedState is false" );
                testCase.TestsFailed++;
                collector.TestCompleted( conditionId, this.TestName );
            }
        } else if ( localTestCase.State == this.States.ConfirmConfirmation ) {
            if ( activeState ) {
                // reset
                localTestCase.State = this.States.WaitingToAcknowledge;
                return;
            }

            var confirmedState = collector.GetSelectField( eventFields, "ConfirmedState.Id" ).toBoolean();
            if ( confirmedState ) {
                var validRetain = CUVariables.Alarm.ValidateRetain( conditionIdString, eventFields, testCase, collector );
                if ( validRetain ) {
                    testCase.TestsPassed++;
                }
                localTestCase.State = this.States.Completed;
                collector.TestCompleted( conditionId, this.TestName );
            } else {
                localTestCase.State = this.States.FailedToConfirm;
                collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
                    " ConfirmedState is false" );
                testCase.TestsFailed++;
                collector.TestCompleted( conditionId, this.TestName );
            }
        }
    }

    this.CheckResults = function () {

        CUVariables.AlarmCollector.DebugFinalState( this.TestName, this.TestCaseMap );

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
