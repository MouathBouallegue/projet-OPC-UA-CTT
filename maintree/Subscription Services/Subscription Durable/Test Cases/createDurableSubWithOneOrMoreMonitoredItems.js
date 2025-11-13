/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description: Create a Durable subscription with 1 or more monitored items.
    Expectation: All calls are successful. Data changes are received for each of the writes/loops in step #2 in as less PublishResponses as possible. The last call to Publish is a keep-alive.
*/

function subscriptionDurable008() {
    var result = true;
    const LOOPCOUNT = 10;
    // Step 1:
    // we need a subscription to continue
    var subscription008 = new Subscription();
    if ( !CreateSubscriptionHelper.Execute( { Subscription: subscription008 } ) ) return ( false );

    // call the method
    var subscriptionId = UaVariant.New( { Type: BuiltInType.UInt32, Value: subscription008.SubscriptionId } );
    var lifeTimeInHours = UaVariant.New( { Type: BuiltInType.UInt32, Value: 1 } );
    if ( isDefined( subscriptionId ) && isDefined( lifeTimeInHours ) ) {
        if ( CallHelper.Execute( { MethodsToCall: [{ MethodId: setSubscriptionDurableNodeId, ObjectId: serverObjectNodeId, InputArguments: [subscriptionId, lifeTimeInHours] }] } ) ) {
            // ready to add MonitoredItems to the durable subscription
            var items = MonitoredItem.fromSettingsExt( { Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings, Writable: true, SkipCreateSession: true } );
            if ( items.length > 0 ) {
                for ( var i = 0; i < items.length; i++ ) {
                    items[i].QueueSize = LOOPCOUNT;
                }
                if ( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: items, TimestampsToReturn: TimestampsToReturn.Both, SubscriptionId: subscription008 } ) ) {
                    // call Publish to get the initial data and to verify that all is set up well
                    PublishHelper.WaitInterval( { Items: items, Subscription: subscription008 } );
                    PublishHelper.Execute();
                    if ( !PublishHelper.CurrentlyContainsData() ) {
                        addError( "Didn't receive the initial data." );
                        result = false;
                    }
                    else {
                        PublishHelper.SetItemValuesFromDataChange( items );
                        while( PublishHelper.Response.MoreNotifications ) {
                            PublishHelper.Execute();
                            PublishHelper.SetItemValuesFromDataChange( items );
                        }
                        PublishHelper.Clear();
                        // Step 2: Close the session without deleting the subscription
                        var session = Test.Session;
                        Test.Disconnect( { DeleteSubscriptions: false } );
                        // Step 3: Create a new Session and write to all items
                        if( Test.Connect() ) {
                            for( var j = 0; j < LOOPCOUNT; j++ ) {
                                for( i = 0; i < items.length; i++ ) {
                                    UaVariant.Increment( { Item: items[i] } );
                                }
                                WriteHelper.Execute( { NodesToWrite: items, ReadVerification: false } );
                                UaDateTime.CountDown( { Msecs: items[0].RevisedSamplingInterval * 1.5, Message: "Waiting the RevisedSamplingInterval." } );
                            }
                        }
                        else {
                            Test.Disconnect();
                            addError( "Connection to the server failed. Abort CU. Note, that a durable subscription is still active in the server that might affect the result of other test cases." );
                            stopCurrentUnit();
                            return ( false );
                        }
                        // Step 4: Open a new session using the same user as previously and transfer the subscription
                        Test.Disconnect();
                        UaDateTime.CountDown( { Msecs: 1000, Message: "Wait a second before reconnecting to the server." } );
                        if( Test.Channel.Execute( { RequestedSecurityPolicyUri: epgeneralChNone.SecurityPolicyUri, MessageSecurityMode: epgeneralChNone.SecurityMode } ) ) {
                            Test.Session = new CreateSessionService( { Channel: Test.Channel } );
                            if( Test.Session.Execute() ) {
                                if( ActivateSessionHelper.Execute( {
                                    Session: Test.Session,
                                    UserIdentityToken: UaUserIdentityToken.FromUserCredentials( {
                                        Session: Test.Session,
                                        UserCredentials: UserCredentials.createFromSettings( PresetCredentials.AccessGranted1, UserTokenType.UserName )
                                    } )
                                } ) ) {
                                    InstanciateHelpers( { Session: Test.Session } );
                                }
                                else {
                                    Test.Disconnect();
                                    addError( "Connection to the server failed. Abort CU. Note, that a durable subscription is still active in the server that might affect the result of other test cases." );
                                    stopCurrentUnit();
                                    return ( false );
                                }
                            }
                            else {
                                Test.Disconnect( { SkipCloseSession: true } );
                                addError( "Connection to the server failed. Abort CU. Note, that a durable subscription is still active in the server that might affect the result of other test cases." );
                                stopCurrentUnit();
                                return ( false );
                            }
                        }
                        else {
                            addError( "Connection to the server failed. Note, that a durable subscription is still active in the server that might affect the result of other test cases." );
                            stopCurrentUnit();
                            return ( false );
                        }
                        // Step 4:
                        if ( !TransferSubscriptionsHelper.Execute( { SubscriptionIds: subscription008, SourceSession: session, DestinationSession: Test.Session, SendInitialValues: false } ) ) {
                            addError( "Transfering the subscription to the new Session failed." );
                            result = false;
                        }
                        else {
                            // Step 5:
                            PublishHelper.Execute();
                            while( PublishHelper.Response.MoreNotifcations ) {
                                PublishHelper.Execute();
                            }
                            for ( j = 1; j < PublishHelper.ReceivedDataChanges.length; j++ ) {
                                if( PublishHelper.GetNumberOfReceivedMonitoredItems() != items.length * LOOPCOUNT ) addError( "Expected to receive " + items.length * LOOPCOUNT + " DataChanges, but received: " + PublishHelper.GetNumberOfReceivedMonitoredItems() + "." ); result = false;
                            }
                            PublishHelper.Execute();
                            if( PublishHelper.CurrentlyContainsData() ) addError( "Expected to receive no NotificationMessage in the last Publish because we already have received all of the triggered DataChanges." ); result = false;
                        }
                    }
                }
            }
            else {
                addSkipped( "Not enough scalar items defined." );
                result = false;
            }
        }
    }

    // cleanup
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription008 } );

    return ( result );
}

Test.Execute( { Procedure: subscriptionDurable008 } );