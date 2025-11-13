/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description:    Create 2 sessions.
                    Create 1 subscription monitoring 1 or more items.
                    Call Publish() (#1) on session #1.
                    Transfer the subscription to the other session (SendInitialValues=TRUE).
                    Call Publish() (#2) on session #2.
                    Transfer the subscription to the other session (SendInitialValues=TRUE).
                    Call Publish() (#3) on session #1.
    Expectation:    Session created successfully.
                    Subscription setup without error.
                    Publish #1 receives the initial data change.
                    Transfer is successful.
                    Publish #2 yields the initial data change.
                    Transfer is successful.
                    Publish #3 yields the initial data change.
                    Note: We assume that the server purges the prior StatusChange notification message that was in the queue.
*/

function subscriptionTransfer015() {
    var result = true;
    // create a session using the already established SecureChannel
    Test.Session = new CreateSessionService( { Channel: Test.Channel } );
    if ( !Test.Session.Execute() ) return ( false );
    if ( !ActivateSessionHelper.Execute( {
        Session: Test.Session,
        UserIdentityToken: UaUserIdentityToken.FromUserCredentials( {
            Session: Test.Session,
            UserCredentials: UserCredentials.createFromSettings( PresetCredentials.AccessGranted1, UserTokenType.UserName )
        } )
    } ) ) {
        CloseSessionHelper.Execute( { Session: Test.Session, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );
        addError( " Activation of session # 1 failed. Abort test." );
        return ( false );
    }
    InstanciateHelpers( { Session: Test.Session } );

    // we need a subscription to continue
    var subscription015a = new Subscription();
    if ( !CreateSubscriptionHelper.Execute( { Subscription: subscription015a } ) ) {
        CloseSessionHelper.Execute( { Session: Test.Session, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );
        addError( " Creation of the subscription failed. Abort test." );
        return ( false );
    }

    // add a MonitoredItem to subscription #1
    if ( !CreateMonitoredItemsHelper.Execute( { ItemsToCreate: items[0], TimestampsToReturn: TimestampsToReturn.Neither, SubscriptionId: subscription015a } ) ) {
        CloseSessionHelper.Execute( { Session: Test.Session, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );
        addError( "Creation of the MonitoredItems failed. Abort test." );
        return ( false );
    }

    // First publish. Expecting initial Data.
    PublishHelper.WaitInterval( { Items: items[0], Subscription: subscription015a } );
    PublishHelper.Execute();
    if ( !PublishHelper.CurrentlyContainsData() ) {
        addError( "Publish #1: Expected to receive the initial Data in the first Publish, but no data has been received." );
        result = false;
    }

    // Create the second session
    var channel2 = SessionCreator.Connect( { OpenSecureChannel: { RequestedSecurityPolicyUri: epGeneralChU.SecurityPolicyUri, MessageSecurityMode: epGeneralChU.SecurityMode }, SkipActivateSession: true } );
    if( channel2.result ) {
        var session2 = channel2.session;
    }
    if( !channel2.result || !ActivateSessionHelper.Execute( {
        Session: session2,
        UserIdentityToken: UaUserIdentityToken.FromUserCredentials( {
            Session: session2,
            UserCredentials: UserCredentials.createFromSettings( PresetCredentials.AccessGranted1, UserTokenType.UserName )
        } )
    } ) ) {
        SessionCreator.Disconnect( channel2 );
        CloseSessionHelper.Execute( { Session: Test.Session, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );
        addError( " Activation of session # 2 failed. Abort test." );
        return ( false );
    }

    // Transfer subscription
    if ( !TransferSubscriptionsHelper.Execute( { SubscriptionIds: subscription015a, SourceSession: Test.Session, DestinationSession: session2, SendInitialValues: true } ) ) {
        SessionCreator.Disconnect( channel2 );
        CloseSessionHelper.Execute( { Session: Test.Session, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );
        return ( false );
    }

    // publish. Expecting StatusChangeNotification.
    PublishHelper.WaitInterval( { Items: items[0], Subscription: subscription015a } );
    PublishHelper.Execute( { NoAcks: true } );
    if ( Assert.Equal( 1, PublishHelper.CurrentStatusChanges.length, "Expected to receive a StatusChangeNotification." ) ) {
            Assert.StatusCodeIs( StatusCode.GoodSubscriptionTransferred, PublishHelper.CurrentStatusChanges[0].Status, "Expected the Subscription to be transfered. But the received StatusChangeNotification was " + PublishHelper.CurrentStatusChanges[0].Status );
    }
    Assert.NotEqual( true, PublishHelper.CurrentlyContainsData(), "Did not expect further data changes." )
    
    // Call Publish in Session2
    var publishHelperSession2 = new PublishService( { Session: session2 } );
    publishHelperSession2.WaitInterval( { Items: items[0], Subscription: subscription015a } );
    publishHelperSession2.Execute();
    if ( !publishHelperSession2.CurrentlyContainsData() ) {
        addError( "Publish #2: Expected to receive the initial data after transfering the subscription to session #2." );
        result = false;
    }

    // Transfer subscription
    if ( !TransferSubscriptionsHelper.Execute( { SubscriptionIds: subscription015a, SourceSession: session2, DestinationSession: Test.Session, SendInitialValues: true } ) ) {
        SessionCreator.Disconnect( channel2 );
        CloseSessionHelper.Execute( { Session: Test.Session, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );
        return ( false );
    }

    // Call Publish in session #1
    PublishHelper.Clear();
    PublishHelper.WaitInterval( { Items: items[0], Subscription: subscription015a } );
    PublishHelper.Execute();
    if ( !PublishHelper.CurrentlyContainsData() ) {
        addError( "Publish #3: Expected to receive the initial data after transfering the subscription back to session #1." );
        result = false;
    }

    // cleanup
    SessionCreator.Disconnect( channel2 );
    CloseSessionHelper.Execute( { Session: Test.Session, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );

    return ( result );
}

Test.Execute( { Procedure: subscriptionTransfer015 } );