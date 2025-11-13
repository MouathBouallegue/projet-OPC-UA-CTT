/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    File
        ./maintree/Alarms and Conditions/A and C Base/Refresh/Test Cases/Test_006.js
        Test is shared between [ConditionRefresh][ConditionRefresh2]

    Description:    
        Create two sessions with a valid configuration for events. Then call ConditionRefresh on one Subscription.

    Requirements:
        Server must support 2 or more subscriptions.
    
    Expectation:
        Expect refresh events only on the session that called refresh.

    How this test works:
        Call Refresh as soon as possible.  
        Look for start/stop events 
        Verify there are events in between start/stop events
        Test uses Buffer event ids as events are gathered by CTT thread
*/

function Test_006 () {

    var testName = "Test_006";
    var extraAlarmThread = new AlarmThread();
    extraAlarmThread.Start( {
        EventNodeId: new UaNodeId( Identifier.Server ),
        SelectFields: CUVariables.AlarmThreadHolder.SelectFields
    } );

    if ( !extraAlarmThread.ItemCreated ) {
        addError( "Unable to create second thread" );
        stopCurrentUnit();
        return false;
    }

    CUVariables.Refresh.Test_006_ExtraAlarmThread = extraAlarmThread;
    CUVariables.Refresh.Test_006_ShutdownThread = true;
    extraAlarmThread.StartPublish();
    var extraData = new Object();

    CUVariables.Refresh.InitializeTestData( CUVariables.AlarmCollector, 
        extraData, "Extra", testName );
    CUVariables.Refresh.InitializeSubscription( extraData,
        CUVariables.AlarmThreadHolder.SelectFields,
        extraAlarmThread,
        extraAlarmThread.Subscription,
        extraAlarmThread.EventMonitoredItem );
    extraData.BufferCounter = 0;

    var testData = new Object();
    CUVariables.Refresh.InitializeTestData( CUVariables.AlarmCollector, 
        testData, "Main", testName );
    var mainAlarmThread = CUVariables.AlarmThreadHolder.AlarmThread;
    CUVariables.Refresh.InitializeSubscription( testData,
        CUVariables.AlarmThreadHolder.SelectFields,
        mainAlarmThread,
        mainAlarmThread.Subscription,
        mainAlarmThread.EventMonitoredItem );

    var success = false;
    var counter = 0;
    var maximumCount = 20;
    var continueTest = true;
    wait( 20000 );
    while ( continueTest ) {

        testData.RefreshTime = UaDateTime.utcNow();
        CUVariables.Refresh.CallRefresh( CUVariables );
        testData.TestState = "WaitingForStart";
        var lookForEnd = true;

        while ( lookForEnd ) {
            wait( 500 );
            CUVariables.Refresh.GetExtraBuffer( testData );
            if ( testData.Buffer.length > 0 ) {
                CUVariables.Refresh.ProcessEvents( CUVariables.AlarmCollector, testData );
                if ( testData.TestState == "ReadyToTest" ) {
                    if ( testData.SaveEvents.length > 0 ) {
                        // This should be plenty of time to get more events
                        extraData.State = "WaitingForStart";
                        extraData.RefreshTime = testData.RefreshTime;
                        CUVariables.Refresh.GetExtraBuffer( extraData );
                        extraData.BufferCounter += extraData.Buffer.length;
                        if ( extraData.Buffer.length == 0 ) {
                            addWarning( "Second session captured no events" );
                            success = true;
                        } else {
                            CUVariables.Refresh.ProcessEvents( CUVariables.AlarmCollector, extraData );
                            if ( extraData.State == "WaitingForStart" ) {
                                // No Refresh Events
                                // Should go through them all looking for eventids.
                                var map = new KeyPairCollection();
                                for ( var index = 0; index < testData.Buffer.length; index++ ) {
                                    var eventFields = testData.Buffer[ index ].EventFieldList.EventFields;
                                    var eventId = CUVariables.AlarmCollector.GetSelectField(
                                        eventFields, "EventId" ).toString();
                                    map.Set( eventId, eventFields );
                                }

                                var startTime = CUVariables.AlarmCollector.GetSelectField(
                                    testData.StartEvent.EventFieldList.EventFields,  
                                    "Time" ).toDateTime();
                                var endTime = CUVariables.AlarmCollector.GetSelectField(
                                    testData.EndEvent.EventFieldList.EventFields, 
                                    "Time" ).toDateTime();

                                var compareError = false;
                                for ( var index = 0; index < extraData.Buffer; index++ ) {
                                    var extraFields = extraData.Buffer[ index ].EventFieldList.EventFields;
                                    var extraTime = CUVariables.AlarmCollector.GetSelectField(
                                        extraFields, "Time" ).toDateTime();
                                    if ( extraTime > startTime && extraTime < endTime ) {
                                        var extraEventId = CUVariables.AlarmCollector.GetSelectField(
                                            extraFields, "EventId" ).toString();

                                        var sameEvent = map.Get( extraEventId );
                                        if ( isDefined( sameEvent ) ) {
                                            addError( "Extra session found unexpected refreshed event " +
                                                extraEventId );
                                            compareError = true;
                                        }
                                    }
                                }

                                if ( !compareError ) {
                                    success = true;
                                }
                            } else {
                                addError( "Second session received refresh data without a call to " +
                                    CUVariables.Refresh.Virtual.BrowseNameText );
                            }
                        }
                        continueTest = false;
                    } else {
                        CUVariables.Refresh.ResetTestData( testData );
                    }
                    lookForEnd = false;
                }
            }
            if ( continueTest ) {
                counter++;
                if ( counter > maximumCount ) {
                    lookForEnd = false;
                    continueTest = false;
                }
            }
            CUVariables.Refresh.PostLoopDeleteEvents( testData );
            CUVariables.Refresh.PostLoopDeleteEvents( extraData );
        }
    }

    extraAlarmThread.End();
    CUVariables.Refresh.Test_006_ShutdownThread = false;
    print( "Second session received " + extraData.BufferCounter + " events");

    return success;
}

Test.Execute( { Procedure: Test_006 } );
