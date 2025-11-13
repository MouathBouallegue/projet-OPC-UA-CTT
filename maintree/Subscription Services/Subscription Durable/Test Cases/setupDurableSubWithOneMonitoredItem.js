/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description: Setup a durable subscription with one monitored item (system time). Make sure the subscription is working via a call to Publish().
    Expectation: Server responds to the client with the current data values along with the values that were captured and buffered while the client was offline.
*/

function subscriptionDurable004() {
    var result = true;
    // Step 1:
    // we need a subscription to continue
    var subscription004 = new Subscription();
    if ( !CreateSubscriptionHelper.Execute( { Subscription: subscription004 } ) ) return ( false );

    // call the method
    var subscriptionId = UaVariant.New( { Type: BuiltInType.UInt32, Value: subscription004.SubscriptionId } );
    var lifeTimeInHours = UaVariant.New( { Type: BuiltInType.UInt32, Value: 1 } );
    if ( isDefined( subscriptionId ) && isDefined( lifeTimeInHours ) ) {
        if ( CallHelper.Execute( { MethodsToCall: [{ MethodId: setSubscriptionDurableNodeId, ObjectId: serverObjectNodeId, InputArguments: [subscriptionId, lifeTimeInHours] }] } ) ) {
            // ready to add MonitoredItems to the durable subscription
            var systemTime = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerStatus_CurrentTime ) );
            if ( isDefined( systemTime ) && systemTime.length > 0 ) {
                systemTime[0].QueueSize = 1000;
                if ( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: systemTime, TimestampsToReturn: TimestampsToReturn.Both, SubscriptionId: subscription004 } ) ) {
                    // call Publish to get the initial data and to verify that all is set up well
                    PublishHelper.WaitInterval( { Items: systemTime, Subscription: subscription004 } );
                    PublishHelper.Execute();
                    if ( !PublishHelper.CurrentlyContainsData() ) {
                        addError( "Didn't receive the initial data." );
                        result = false;
                    }
                    else {
                        var lastValueReceived = PublishHelper.CurrentDataChanges[0].MonitoredItems[PublishHelper.CurrentDataChanges[0].MonitoredItems.length - 1].Value.ServerTimestamp;
                        // Step 2:
                        var session = Test.Session;
                        Test.Disconnect( { DeleteSubscriptions: false } );
                        // Step 3:
                        UaDateTime.CountDown( { Msecs: 10000, Message: "Wait a few seconds before reconnecting to the server." } );
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
                        if ( !TransferSubscriptionsHelper.Execute( { SubscriptionIds: subscription004, SourceSession: session, DestinationSession: Test.Session, SendInitialValues: false } ) ) {
                            addError( "Transfering the subscription to the new Session failed." );
                            result = false;
                        }
                        // Step 5:
                        else {
                            PublishHelper.Execute();
                            if ( !PublishHelper.CurrentlyContainsData() ) {
                                addError( "Didn't receive the data from the transferred subscription." );
                                result = false;
                            }
                            else {
                                var firstValueReceivedAfterTransfer = PublishHelper.CurrentDataChanges[0].MonitoredItems[0].Value.ServerTimestamp;
                                if ( firstValueReceivedAfterTransfer < lastValueReceived ) addError( "The ServerTimestamp of the first value received is older than the ServerTimestamp of the value received before disconnecting." ); result = false;
                                var maxPublishCount = 0;
                                while ( PublishHelper.Response.MoreNotifications && maxPublishCount < 100 ) {
                                    PublishHelper.Execute();
                                    maxPublishCount++;
                                }
                                if ( maxPublishCount == 100 ) addWarning( "Called Publish 100 times and MoreNotifications is still set. Aborting." );
                                else {
                                    if( PublishHelper.CurrentDataChanges[0].MonitoredItems[PublishHelper.CurrentDataChanges[0].MonitoredItems.length - 1].Value.ServerTimestamp.msecsTo( PublishHelper.Response.NotificationMessage.PublishTime ) > systemTime[0].RevisedSamplingInterval * 1.5 ) addError( "The ServerTimestamp of the last value received is older than expected due to the SamplingRate of the MonitoredItem." + PublishHelper.CurrentDataChanges[0].MonitoredItems[PublishHelper.CurrentDataChanges[0].MonitoredItems.length - 1].Value.ServerTimestamp.msecsTo( PublishHelper.Response.NotificationMessage.PublishTime ) ); result = false;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // cleanup
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription004 } );

    return ( result );
}

Test.Execute( { Procedure: subscriptionDurable004 } );