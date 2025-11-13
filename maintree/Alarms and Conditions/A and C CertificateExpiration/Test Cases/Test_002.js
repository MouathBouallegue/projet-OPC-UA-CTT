/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        1	Load an certificate that is already within the expirationlimit
        2	Acknowledge the event
        3	Confirm the event 
        4	Clear the event state (no alarm) by updating the certificate
        5	Read the RETAIN bit

    Test Requirements:
        Test step is skipped if certificate can not be updated without a restart (next step also)

    Expectation:
        1   Each event type is received as expected.
        4   Verify the current state indicates a value outside the range of ExpirationLimit (or 2 weeks if ExpirationLimit is not provided).
        5   Retain bit is FALSE


    How this test works:
*/

function Test_002 () {

    this.TestName = "Test_002";

    if ( !isDefined( CUVariables.AlarmCollector ) || !isDefined( CUVariables.AlarmTester ) ) {
        addError( "Initialization Failed, unable to proceed" );
        return false;
    }

    var collector = CUVariables.AlarmCollector;
    // Call Refresh
    var refreshResult = collector.Refresh();
    if ( refreshResult.isBad() ) {
        addError( "Refresh2 Failed" );
        return false;
    }

    wait( 1000 );

    // Iterate all alarms looking for test case
    var events = CUVariables.AlarmTester.WaitForEvents( collector.GetIntervalTime() );
    if ( !( isDefined( events ) && isDefined( events.length ) && events.length > 0 ) ) {
        addSkipped( "No events found.  Unable to continue" );
        return true;
    }

    var certificateEvents = [];
    for ( var eventIndex = 0; eventIndex < events.length; eventIndex++ ) {
        var event = events[ eventIndex ];
        if ( isDefined( event.EventFieldList ) && isDefined( event.EventFieldList.EventFields ) ) {
            var eventFields = event.EventFieldList.EventFields;
            var eventTypeVariant = eventFields[ collector.EventTypeIndex ];
            if ( collector.ValidateDataType( eventTypeVariant, BuiltInType.NodeId ) ) {
                var eventType = eventTypeVariant.toNodeId();
                print( "Index " + eventIndex + " EventType " + eventType.toString() );
                if ( eventType.equals( CUVariables.CertificateExpiration.NodeId ) ) {
                    certificateEvents.push( eventFields );
                }
            } else {
                addError( "Unable to get event type" );
            }
        }
    }

    print( "There are " + certificateEvents.length + " certificate Events to be analyzed" );

    var applicableEvents = [];

    for ( var index = 0; index < certificateEvents.length; index++ ) {
        var eventFields = certificateEvents[ index ];
        var active = collector.IsActive( eventFields );
        // Load an certificate that is already within the expirationlimit
        // Alarm must be active
        // Expiration time must be in the future
        // Alarm time must be in the past
        if ( active ) {
            var currentTime = UaDateTime.utcNow();
            var conditionId = collector.GetConditionId( eventFields );
            var expiryTime = CUVariables.CertificateExpiration.GetExpirationTime(
                this.TestName, conditionId, eventFields, null, null, collector );
            var alarmTime = CUVariables.CertificateExpiration.GetAlarmTime(
                this.TestName, conditionId, eventFields, null, null, collector );
            print( collector.GetConditionId( eventFields ).toString() + ": CurrentTime " +
                currentTime.toString() + " expiryTime " + expiryTime.toString() + " alarmTime " + alarmTime.toString() );
            if ( isDefined( expiryTime ) && isDefined( alarmTime ) ) {
                var currentToExpiry = currentTime.msecsTo( expiryTime );
                var alarmToCurrent = alarmTime.msecsTo( currentTime );
                print( collector.GetConditionId( eventFields ).toString() + ": current to expiry " + currentToExpiry +
                    " alarm to current " + alarmToCurrent );
                if ( currentTime.msecsTo( expiryTime ) > 0 &&
                    alarmTime.msecsTo( currentTime ) > 0 ) {
                    applicableEvents.push( eventFields );
                }
            } else {
                addError( conditionId.toString() + " Does not have mandary ExpirationTime field" );
            }
        }
    }

    // Clear all known entries
    CUVariables.AlarmTester.RemoveEntry( events );

    print( "There are " + applicableEvents.length + " applicable Events after analyze" );
    applicableEvents.forEach( function ( event ) {
        var conditionId = collector.GetConditionId( event );
        print( conditionId.toString() + " applicable event to be acknowledged" );
    } );


    var ackedEvent = null;
    var ackedConditionIdString = null;
    var acknowledgeError = false;
    if ( applicableEvents.length > 0 ) {

        // if found Ack
        // Don't understand what is going on.
        for ( var index = 0; index < applicableEvents.length; index++ ) {
            var eventFields = applicableEvents[ index ];
            if ( collector.ShouldAcknowledge( eventFields ) &&
                !collector.IsConfirmed( eventFields ) ) {
                var conditionIdString = collector.GetConditionId( eventFields ).toString();
                print( "Acknowledging " + conditionIdString );
                if ( collector.AcknowledgeAlarm( eventFields,
                    this.TestName + ":" + conditionIdString + " Acknowledging",
                    gServerCapabilities.DefaultLocaleId ).isGood() ) {
                    ackedEvent = eventFields;
                    ackedConditionIdString = conditionIdString;
                    break;
                } else {
                    addError( "Unable to acknowledge " + conditionIdString );
                    acknowledgeError = true;
                }
            }
        }
    } else {
        addSkipped( "No events found to acknowledge.  Unable to continue" );
        return true;
    }

    if ( acknowledgeError ) {
        return false;
    }

    var alarmTypes = CUVariables.AlarmTester.GetSupportedAlarmTypes();

    var shouldValidateConfirm = false;

    if ( isDefined( ackedEvent ) ) {
        // Wait for the next event
        wait( 1000 );

        var ackedSuccess = false;
        print( "Wait for acknowledged event" );

        var ackedEvents = CUVariables.AlarmTester.WaitForEvents( collector.GetIntervalTime() );
        if ( isDefined( ackedEvents ) && isDefined( ackedEvents.length ) && ackedEvents.length > 0 ) {
            print( "Wait for acknowledged got " + ackedEvents.length + " events" );
            for ( var eventIndex = 0; eventIndex < ackedEvents.length; eventIndex++ ) {
                var eventFields = ackedEvents[ eventIndex ].EventFieldList.EventFields;
                var eventType = eventFields[ collector.EventTypeIndex ].toString();
                if ( alarmTypes.Contains( eventType ) ) {
                    var conditionId = collector.GetConditionId( eventFields );
                    var conditionIdString = conditionId.toString();
                    print( "Wait for acknowledged got " + conditionIdString + " looking for " + ackedConditionIdString );
                    if ( conditionIdString == ackedConditionIdString ) {
                        print( "Wait for acknowledged found it" );
                        if ( collector.IsAcknowledged( eventFields ) ) {
                            print( "Is Acknowledged" );
                            if ( collector.ShouldConfirm( eventFields ) ) {
                                print( "Should Confirm" );
                                if ( collector.ConfirmAlarm( eventFields,
                                    this.TestName + ":" + conditionIdString + " Confirming ",
                                    gServerCapabilities.DefaultLocaleId ).isGood() ) {
                                    print( "Confirmed" );
                                    shouldValidateConfirm = true;
                                    ackedSuccess = true;
                                } else {
                                    addError( "Unable to confirm " + conditionIdString );
                                }
                            } else {
                                print( "Acked Success" );
                                ackedSuccess = true;
                            }
                        } else {
                            addError( ackedConditionIdString + " should have been acknowledged" );
                        }
                    }
                }
            }
            CUVariables.AlarmTester.RemoveEntry( ackedEvents );
        } else {
            addError( "No event for Acknowledged Alarm " + ackedConditionIdString );
        }

        if ( !ackedSuccess ) {
            print( "Failed acked" );
            return false;
        }
    }


    if ( shouldValidateConfirm ) {
        print( "Wait for confirmed" );
        // Wait for the next event
        wait( 1000 );
        var confirmedSuccess = false;
        var confirmedEvents = CUVariables.AlarmTester.WaitForEvents( collector.GetIntervalTime() );
        if ( isDefined( confirmedEvents ) && isDefined( confirmedEvents.length ) && confirmedEvents.length > 0 ) {
            print( "Wait for confirmed got " + confirmedEvents.length + " events" );
            for ( var eventIndex = 0; eventIndex < confirmedEvents.length; eventIndex++ ) {
                var eventFields = confirmedEvents[ index ].EventFieldList.EventFields;
                var eventType = eventFields[ collector.EventTypeIndex ].toString();
                if ( alarmTypes.Contains( eventType ) ) {
                    var conditionId = collector.GetConditionId( eventFields );
                    var conditionIdString = conditionId.toString();
                    print( "Wait for confirmed got " + conditionIdString + " looking for " + ackedConditionIdString );
                    if ( conditionIdString == ackedConditionIdString ) {
                        if ( collector.IsConfirmed( eventFields ) ) {
                            print( "Confirmed" )
                            confirmedSuccess = true;
                        } else {
                            addError( ackedConditionIdString + " should have been confirmed" );
                        }
                    }
                }
            }
            CUVariables.AlarmTester.RemoveEntry( confirmedEvents );
        } else {
            addError( "No event for Confirmed Alarm " + ackedConditionIdString );
        }

        if ( !confirmedSuccess ) {
            return false;
        }
    }

    // Wait for inactive
    var endTime = UaDateTime.utcNow();
    endTime.addMilliSeconds( collector.GetMaximumTestTime() );
    var keepGoing = true;

    // Not sure this will work
    var success = false;
    while ( keepGoing && UaDateTime.utcNow().msecsTo( endTime ) > 0 ) {
        wait( 1000 );
        print( "Waiting for inactive events" )
        var waitEvents = CUVariables.AlarmTester.WaitForEvents( collector.GetIntervalTime() );
        if ( isDefined( waitEvents ) && isDefined( waitEvents.length ) && waitEvents.length > 0 ) {
            for ( var index = 0; index < waitEvents.length; index++ ) {
                var eventFields = waitEvents[ index ].EventFieldList.EventFields;
                var eventType = eventFields[ collector.EventTypeIndex ].toString();
                if ( alarmTypes.Contains( eventType ) ) {

                    var conditionId = collector.GetConditionId( eventFields );
                    var conditionIdString = conditionId.toString();

                    print( "Waiting event " + conditionIdString + " [" + index + "] out of " + waitEvents.length );
                    if ( conditionIdString == ackedConditionIdString ) {
                        if ( !collector.IsActive( eventFields ) ) {
                            if ( collector.ValidateRetain( eventFields ) ) {
                                success = true;
                            } else {
                                addError( conditionIdString + " Has Invalid Retain state" );
                            }
                        } else {
                            // Certificate Errored a second time.
                            addError( conditionIdString + " Sent another error event" );
                        }
                        keepGoing = false;
                        break;
                    }
                }
            }
            CUVariables.AlarmTester.RemoveEntry( waitEvents );
        }
    }

    if ( keepGoing ) {
        addSkipped( ackedConditionIdString + " did not go inactive" );
    }

    return success;
}

Test.Execute( { Procedure: Test_002 } );