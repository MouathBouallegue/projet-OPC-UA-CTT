/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description:    Create a new subscription and multiple monitored items.
                    Call Publish() (call #1) on the first Session.
                    Create a 2nd session and transfer the existing subscription to the new session: SendInitialValues=TRUE.
                    Call Publish() twice (call #2 and #3) on the first Session.
                    Call Publish() (call #4) on the second Session.
    Expectation:    All service results and operation-level results are Good, except where stated otherwise.
                    Publish #1 receives a DataChange.
                    Publish #2 service result Good_SubscriptionTransferred and a StatusChangeNotification is received.
                    Publish #3 service result Bad_NoSubscription.
                    Publish #4 receives a DataChange.
*/

function subscriptionTransfer009() {
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
    var subscription009 = new Subscription();
    if ( !CreateSubscriptionHelper.Execute( { Subscription: subscription009 } ) ) {
        CloseSessionHelper.Execute( { Session: Test.Session, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );
        addError( " Creation of the subscription failed. Abort test." );
        return ( false );
    }

    // add MonitoredItems
    if ( !CreateMonitoredItemsHelper.Execute( { ItemsToCreate: items, TimestampsToReturn: TimestampsToReturn.Neither, SubscriptionId: subscription009 } ) ) {
        CloseSessionHelper.Execute( { Session: Test.Session, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );
        addError( "Creation of the MonitoredItems failed. Abort test." );
        return ( false );
    }

    // First publish. Expecting initial Data.
    var publishHelperSession1 = PublishHelper;
    publishHelperSession1.WaitInterval( { Items: items, Subscription: subscription009 } );
    publishHelperSession1.Execute();
    if ( !publishHelperSession1.CurrentlyContainsData() ) addError( "Publish #1: Expected to receive the initial Data in the first Publish, but no data has been received." ); result = false;

    // Create the second session
    var channel2 = SessionCreator.Connect( { OpenSecureChannel: { RequestedSecurityPolicyUri: epGeneralChU.SecurityPolicyUri, MessageSecurityMode: epGeneralChU.SecurityMode }, SkipActivateSession: true } );
    if( channel2.result ) {
        var session2 = channel2.session;
    }
    if ( !channel2.result || !ActivateSessionHelper.Execute( {
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
    if ( !TransferSubscriptionsHelper.Execute( { SubscriptionIds: subscription009, SourceSession: Test.Session, DestinationSession: session2, SendInitialValues: true } ) ) {
        SessionCreator.Disconnect( channel2 );
        CloseSessionHelper.Execute( { Session: Test.Session, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );
        return ( false );
    }

    // Call Publish twice in Test.Session
    publishHelperSession1.Clear();
    publishHelperSession1.WaitInterval( { Items: items, Subscription: subscription009 } );
    publishHelperSession1.Execute();
    if ( !isDefined( publishHelperSession1.CurrentStatusChanges ) || publishHelperSession1.CurrentStatusChanges == 0 ) {
        addError( "Publish #2: Expected to receive a StatusChange notification." );
        result = false;
    }
    publishHelperSession1.WaitInterval( { Items: items, Subscription: subscription009 } );
    publishHelperSession1.Execute( { ServiceResult: new ExpectedAndAcceptedResults( StatusCode.BadNoSubscription ) } );

    // Call Publish in Session2
    var publishHelperSession2 = new PublishService( { Session: session2 } );
    publishHelperSession2.Execute();
    if ( !publishHelperSession2.CurrentlyContainsData() ) addError( "Publish #3: Expected to receive the initial Data in the first Publish in Session # 2, but no data has been received." ); result = false;

    // cleanup
    SessionCreator.Disconnect( channel2 );
    CloseSessionHelper.Execute( { Session: Test.Session, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );

    return ( result );
}

Test.Execute( { Procedure: subscriptionTransfer009 } );