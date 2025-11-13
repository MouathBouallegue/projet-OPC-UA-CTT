/*  Test prepared by Alexander Allmendinger; compliance@opcfoundation.org
    Description: Specify the same user credentials on a session that the user already owns, using the same channel. */

function sessionChangeUser002() {
    var session = new CreateSessionService( { Channel: Test.Channel } );
    if ( session.Execute() ) {
        if ( ActivateSessionHelper.Execute( { Session: session, UserIdentityToken: UaUserIdentityToken.FromUserCredentials( { Session: session, UserCredentials: UserCredentials.createFromSettings( PresetCredentials.AccessGranted1, UserTokenType.UserName ) } ) } ) ) {
            // create a subscription
            var monitoredItem = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerStatus_CurrentTime ) ) [0];
            var monitoredItemReady = false;
            InstanciateHelpers( { Session: session } );
            var ChangeUserSubscription = new Subscription( 1000 );
            if ( CreateSubscriptionHelper.Execute( { Subscription: ChangeUserSubscription, ServiceResult: new ExpectedResults( { Expected: [ StatusCode.Good, StatusCode.BadServiceUnsupported ], Accepted: [ StatusCode.BadNotImplemented ] } ) } ) ) {
                if ( ChangeUserSubscription.SubscriptionCreated ) {
                    // add a MonitoredItem to the subscription
                    if ( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: monitoredItem, TimestampsToReturn: TimestampsToReturn.Both, SubscriptionId: ChangeUserSubscription } ) ) {
                        // wait one publishing cycle before calling publish
                        PublishHelper.WaitInterval( { Items: monitoredItem, Subscription: ChangeUserSubscription } );
                        PublishHelper.Execute( { FirstPublish: true } );
                        if ( Assert.True( PublishHelper.CurrentlyContainsData(), "Expected to receive a dataChange." ) ) monitoredItemReady = true;
                    }
                }
            }

            // activate the session again with another user credential.
            ActivateSessionHelper.Execute( { Session: session, UserIdentityToken: UaUserIdentityToken.FromUserCredentials( { Session: session, UserCredentials: UserCredentials.createFromSettings( PresetCredentials.AccessGranted1, UserTokenType.UserName ) } ) } );

            // check if we still get updates
            if ( monitoredItemReady ) {
                // wait one publishing cycle before calling publish
                PublishHelper.WaitInterval( { Items: monitoredItem, Subscription: ChangeUserSubscription } );
                PublishHelper.Execute();
                Assert.True( PublishHelper.CurrentlyContainsData(), "Expected to receive a dataChange." );

                DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: monitoredItem, SubscriptionId: ChangeUserSubscription } );
                DeleteSubscriptionsHelper.Execute( { SubscriptionIds: ChangeUserSubscription } );
            }
            else {
                if (ReadHelper.Execute( { NodesToRead: monitoredItem } ) ) addLog( "The server doesn't support subscriptions but we were able to change the UserIdentity and read the CurrentTime of the server afterwards." );
            }
        }
        CloseSessionHelper.Execute( { Session: session } );
        // its possible that our channel has timed out too; so kill it and create a new one
        Test.Disconnect( { SkipCloseSession: true } );
        Test.Connect( { SkipCreateSession: true } );
    }
    return (true);
}

Test.Execute( { Procedure: sessionChangeUser002 } );