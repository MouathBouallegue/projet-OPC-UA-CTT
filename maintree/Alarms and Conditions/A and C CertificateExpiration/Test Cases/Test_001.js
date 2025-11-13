/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        1	Invoke an event of each instance of CertificateExpirationAlarmType 
            alarm by advancing the system clock to a time that falls within the 
            range of ExpirationLimit (or 2 weeks if ExpirationLimit is not provided).
        2	Acknowledge the event
        3	Confirm the event 
        4	Clear the event state (no alarm) by updating the certificate
        5	Read the RETAIN bit

    Test Requirements:
        That it is possible to adjust the clock on the server - as an 
            alternate the server can be started with a certificate that is near the exipration limit 
            (i.e. couple minutes and it will expire during normal operation)
        Test step is skipped if certificate can not be updated without a restart (next step also)

    
    Expectation:
        1   Each event type is received as expected.
        4   Verify the current state indicates a value outside the range of ExpirationLimit (or 2 weeks if ExpirationLimit is not provided).
        5   Retain bit is FALSE

    How this test works:
*/

function Test_001() {

    this.TestName = "Test_001";
    this.States = {
        Initial: "Initial",
        WaitingForAcknowledge: "WaitingForAcknowledge",
        WaitingForConfirm: "WaitingForConfirm",
        WaitingForInactive: "WaitingForInactive",
        Skipped: "Skipped",
        Failed: "Failed",
        Completed: "Completed"
    };

    this.StartTime = null;

    this.AlarmTimeTolerance = 120000; // Two minute Tolerance
    this.TestCaseMap = new KeyPairCollection();

    this.Initialize = function( collector ){
        this.StartTime = UaDateTime.utcNow();
        var supportedAlarmTypes = CUVariables.CertificateExpiration.GetSupportedAlarmTypes( collector );
        collector.AddIgnoreSkips( supportedAlarmTypes, this.TestName );
    }

    this.TestEvent = function ( eventFields, testCase, collector ) {

        var conditionId = collector.GetConditionId( eventFields );
        var conditionIdString = conditionId.toString();

        if ( !CUVariables.CertificateExpiration.CanRunTest( this.TestName, conditionId, eventFields, testCase, collector ) ) {
            return;
        }

        if ( !this.TestCaseMap.Contains( conditionIdString ) ) {
            collector.AddMessage( testCase, collector.Categories.Activity, conditionIdString + ": Creation of Test Case" );
            this.TestCaseMap.Set( conditionIdString, {
                ConditionId: conditionId,
                State: this.States.Initial,
                TestCase: testCase
            } );
        }

        var localTestCase = this.TestCaseMap.Get( conditionIdString );
        var active = collector.GetBooleanValue( eventFields, "ActiveState.Id" );
        var time = collector.GetSelectField( eventFields, "Time" ).toDateTime();

        print( this.TestName + ":" + conditionIdString + " State " + localTestCase.State + " Active " + active );

        if ( localTestCase.State == this.States.Initial ) {
            if ( active ){
                var alarmTime = CUVariables.CertificateExpiration.GetAlarmTime( this.TestName, 
                    conditionId, eventFields, testCase, this.States.Failed, collector );
                // alarm time needs to be after the start time
                var startToAlarm = this.StartTime.msecsTo( alarmTime );
                if ( startToAlarm > 0 ){
                    // can proceed
                    if ( collector.ShouldAcknowledge( eventFields ) ) {
                        if ( collector.AcknowledgeAlarm( eventFields,
                            this.TestName + ":" + conditionIdString + "Acknowledging",
                            gServerCapabilities.DefaultLocaleId ).isGood() ) {
                            localTestCase.State = this.States.WaitingForAcknowledge;
                        } else {
                            collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed, "Failed to Acknowledge" );
                        }
                    }else{
                        collector.Skip( this.TestName, conditionId, localTestCase, this.States.Skipped );
                    }
                }else{
                    collector.Skip( this.TestName, conditionId, localTestCase, this.States.Skipped );
                }
            }
        } else if ( localTestCase.State == this.States.WaitingForAcknowledge ) {
            if ( active ) {
                if ( !collector.IsAcknowledged( eventFields ) ) {
                    collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed, "Event should have been Acknowledged" );
                } else if ( collector.ShouldConfirm( eventFields ) ) {
                    if ( collector.ConfirmAlarm( eventFields,
                        this.TestName + ":" + conditionIdString + "Confirming",
                        gServerCapabilities.DefaultLocaleId ).isGood() ) {
                        localTestCase.State = this.States.WaitingForConfirm;
                    } else {
                        collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed, "Failed to Confirm" );
                    }
                } else {
                    collector.AddMessage( testCase, collector.Categories.Activity, conditionIdString + " Skipping Confirm Step" );
                    localTestCase.State = this.States.WaitingForInactive;
                }
            } else {
                collector.Skip( this.TestName, conditionId, localTestCase, this.States.Skipped );
            }
        } else if ( localTestCase.State == this.States.WaitingForConfirm ) {
            if ( active ) {
                if ( collector.IsConfirmed( eventFields ) ) {
                    localTestCase.State = this.States.WaitingForInactive;
                } else {
                    collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed, "Event should have been Confirmed" );
                }
            } else {
                collector.Skip( this.TestName, conditionId, localTestCase, this.States.Skipped );
            }
        } else if ( localTestCase.State == this.States.WaitingForInactive ) {
            if ( !active ) {
                if ( collector.ValidateRetain( eventFields ) ){
                    testCase.TestsPassed++;
                    localTestCase.State = this.States.Completed;
                    collector.TestCompleted( conditionId, this.TestName );
                }else{
                    var retain = collector.GetSelectField( eventFields, "Retain" );
                    collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed, "Retain [" + retain.toString() + "] in unexpected state" );
                }
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