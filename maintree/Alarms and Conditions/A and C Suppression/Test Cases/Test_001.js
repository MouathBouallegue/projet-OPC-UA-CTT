/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        1	check that an Alarm appears and is supressed
        2	Acknowledge and/or Confirm the event and call Publish.
        3	check that an alarm becomes unsuppressed 
        4	Check that the alarm returns to normal 
    
    Test Requirements:
        1
        2   Note: if alarm is already acknowledged and /or confirmed this step is skipped
        3   Note: this may require wait
        4

    Expectation:
        1   Event received and alarm ActiveState is TRUE, SuppressedOrShelved is TRUE
        2   Event received, alarm ActiveState is TRUE, Retain bit is TRUE, SuppressedOrShelved is TRUE
        3   Event received and alarm ActiveState is TRUE, Retain bit is TRUE, SuppressedOrShelved is FALSE
        4   Event received, alarm ActiveState is FALSE, Retain bit is FALSE, SuppressedOrSlelved is FALSE

    How this test works:
        This test requires specific operations, namely AlarmCondition type (or derived) alarms 
        that are automatically suppressed and unsuppressed without interaction with the CTT. 
        The alarm also needs to go in and out of active state.
        It can also difficult to tell whether or not the alarm is suppressed without 
        extra information, including SuppressedState, ShelvingState.CurrentState, and OutOfServiceState.
*/

function Test_001 () {

    this.TestName = "Test_001";

    this.States = {
        Initial: "Initial",
        WaitingForSuppressed: "WaitingForSuppressed",
        Suppressed: "Suppressed",
        WaitingforAcknowledged: "WaitingforAcknowledged",
        Acknowledged: "Acknowledged",
        WaitingForConfirmed: "WaitingForConfirmed", 
        Confirmed: "Confirmed",
        WaitingForUnsuppressed: "WaitingForUnsuppressed",
        WaitingForNormal: "WaitingForNormal",
        Skipped: "Skipped",
        Failed: "Failed",
        Complete: "Complete" 
    };

    this.TestCaseMap = new KeyPairCollection();

    this.TestEvent = function ( eventFields, testCase, collector ) {

        var conditionId = collector.GetConditionId( eventFields );
        var conditionIdString = conditionId.toString();

        if ( !collector.CanRunTest( conditionId, this.TestName ) ){
            return;
        }

        if ( !CUVariables.Suppress.IsAlarmCondition( eventFields, collector ) ){
            testCase.TestsSkipped++;
            collector.TestCompleted( conditionId, this.TestName );            
            return;
        }

        if ( !this.TestCaseMap.Contains( conditionIdString ) ) {
            collector.AddMessage( testCase, collector.Categories.Activity, conditionIdString + ": Creation of Test Case" );
            this.TestCaseMap.Set( conditionIdString, {
                ConditionId: conditionId,
                State: this.States.Initial,
                TestCase: testCase,
                CommentTime: null,
                Acknowledge: null,
                Confirm: null
            } );
        }

        var localTestCase = this.TestCaseMap.Get( conditionIdString );

        var suppressed = CUVariables.Suppress.IsSuppressed( eventFields, collector );
        if ( !suppressed.Valid ){
            // Server does not support suppression for this alarm
            collector.Skip( this.TestName, conditionId, localTestCase, this.States.Skipped );
            return;
        } 

        var suppressedOrShelved = CUVariables.Suppress.IsSuppressedOrShelved( 
            eventFields, testCase, collector, conditionId, this.TestName );

        if ( !suppressedOrShelved.Valid ){
            // SuppressedOrShelved is mandatory
            collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed, 
                "Unable to get mandatory SuppressedOrShelved event field" );
            return;
        }

        if ( !collector.ValidateSuppressedOrShelvedFull( eventFields ) ){
            collector.ValidateSuppressedOrShelvedFull( eventFields );
            var shelvingState = collector.GetSelectField( eventFields, "ShelvingState.CurrentState.Id" );
            var outOfService = collector.GetBooleanValue( eventFields, "OutOfServiceState.Id" );

            var  message = "SuppressedOrShelved Error SuppressedOrShelved [" + suppressedOrShelved.Value.toString() +
                "] Suppressed [" + suppressed.Value.toString() +
                "] ShelvingState [" + shelvingState.toString() +
                "] OutOfServiceState [" + outOfService.toString() + "]";

            collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed, message );
            return;
        }

        var active = collector.GetSelectField( eventFields, "ActiveState.Id").toBoolean();

        if ( localTestCase.State == this.States.Initial ) {
            // can only proceed if Active.
            if ( active ){
                localTestCase.State = this.States.WaitingForSuppressed;
            }else{
                return;
            }
        }

        if ( !collector.ValidateRetain( eventFields ) ){
            var retain = collector.GetSelectField( eventFields, "Retain" );
            var acked =  collector.GetSelectField( eventFields, "AckedState.Id" );
            var confirmed =  collector.GetSelectField( eventFields, "ConfirmedState.Id" );
            var nulVal = null;
            collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed, 
                "Retain error: retain [" + retain.toString() + "] ActiveState [" + active.toString() + 
                "] AckedState.Id [" + acked.toString() + "] ConfirmedState.Id [" + confirmed.toString() +
                "] " + nulVal.toString() );
            return;
        }

        print( this.TestName + ":" + conditionIdString + " State " + localTestCase.State );

        if ( localTestCase.State == this.States.WaitingForSuppressed ) {
            if ( active ){
                if ( suppressed.Value ){
                    if ( !suppressedOrShelved.Value ){
                        collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed, 
                            "SuppressedOrShelved should be true if suppressed" );
                    }else if( CUVariables.Suppress.ShouldAck( active, eventFields, collector ) ){
                        if ( collector.AcknowledgeAlarm( 
                            eventFields, 
                            this.TestName + ":" + conditionIdString + " Acknowledge",
                            gServerCapabilities.DefaultLocaleId ).isGood() ){
                            localTestCase.State = this.States.WaitingforAcknowledged;
                            // Must return here to keep the integrity of the state table
                            return;
                        }else{
                            collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed, 
                                "Unable to Acknowledge" );
                        }
                    }else if( CUVariables.Suppress.ShouldConfirm( active, eventFields, collector ) ){
                        localTestCase.State == this.States.Acknowledged;
                    }else{
                        // Can't do the test
                        collector.Skip( this.TestName, conditionId, localTestCase, this.States.Skipped );
                    }
                }
            }else{
                collector.Skip( this.TestName, conditionId, localTestCase, this.States.Skipped );
            }
        }

        if ( localTestCase.State == this.States.WaitingforAcknowledged ) {
            localTestCase.State = this.States.Acknowledged;
        }

        if ( localTestCase.State == this.States.Acknowledged ) {
            if ( active && suppressed.Value ){
                if( CUVariables.Suppress.ShouldConfirm( active, eventFields, collector ) ){
                    if ( collector.ConfirmAlarm( 
                        eventFields, 
                        this.TestName + ":" + conditionIdString + " Confirm",
                        gServerCapabilities.DefaultLocaleId ).isGood() ){
                        localTestCase.State = this.States.WaitingForConfirmed;
                        // Must return here to keep the integrity of the state table
                        return;
                    }else{
                        collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed, 
                            "Unable to Confirm" );
                    }
                }else{
                    localTestCase.State = this.States.WaitingForUnsuppressed;
                }
            }else{
                collector.Skip( this.TestName, conditionId, localTestCase, this.States.Skipped );
            }
        }

        if ( localTestCase.State == this.States.WaitingForConfirmed ) {
            localTestCase.State = this.States.WaitingForUnsuppressed;
        }

        if ( localTestCase.State == this.States.WaitingForUnsuppressed ) {
            if ( active ){
                if ( !suppressed.Value ){
                    localTestCase.State = this.States.WaitingForNormal;
                }
            }else{
                collector.Skip( this.TestName, conditionId, localTestCase, this.States.Skipped );
            }
        }else if ( localTestCase.State == this.States.WaitingForNormal ) {
            if ( !active ){
                print( conditionIdString + " Complete")
                localTestCase.State = this.States.Complete;
                testCase.TestsPassed++;
                collector.TestCompleted( conditionId, this.TestName  );
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