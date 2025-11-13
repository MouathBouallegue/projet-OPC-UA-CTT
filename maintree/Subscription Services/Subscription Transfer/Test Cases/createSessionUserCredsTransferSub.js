/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description:    Create a session using a set of user credentials other than anonymous.
                    Create a subscription that is monitoring at least 1 item.
                    Create another session using anonymous login credentials.
                    Transfer the subscription.
    Expectation:    TransferSubscription fails with error Bad_UserAccessDenied.
*/

function subscriptionTransferErr009() {

    // check if we have found the desired endpoint during the initialize
    if ( !isDefined( epGeneralChA ) ) {
        addSkipped( "This script requires an endpoint supporting the anonymous user token to run. As during the initialize we weren't able to find an endpoint providing this user token, this test case is being skipped." );
        return ( true );
    }

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
    var subscriptionErr009a = new Subscription();
    if ( !CreateSubscriptionHelper.Execute( { Subscription: subscriptionErr009a } ) ) {
        CloseSessionHelper.Execute( { Session: Test.Session, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );
        addError( " Creation of the subscription failed. Abort test." );
        return ( false );
    }

    // add a MonitoredItem to subscription #1
    if ( !CreateMonitoredItemsHelper.Execute( { ItemsToCreate: items[0], TimestampsToReturn: TimestampsToReturn.Neither, SubscriptionId: subscriptionErr009a } ) ) {
        CloseSessionHelper.Execute( { Session: Test.Session, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );
        addError( "Creation of the MonitoredItems failed. Abort test." );
        return ( false );
    }

    // Create the second session
    var channel2 = new OpenSecureChannelService();
    if ( !channel2.Execute( { RequestedSecurityPolicyUri: epGeneralChA.SecurityPolicyUri, MessageSecurityMode: epGeneralChA.SecurityMode }) ) {
        CloseSessionHelper.Execute( { Session: Test.Session, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );
        addError( " Creation of session # 2 failed. Abort test." );
        return ( false );
    }
    var session2 = new CreateSessionService( { Channel: channel2 } );
    if ( !session2.Execute() ) {
        CloseSessionHelper.Execute( { Session: Test.Session, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );
        addError( " Creation of session # 2 failed. Abort test." );
        return ( false );
    }

    if ( !ActivateSessionHelper.Execute( {
        Session: session2,
        UserIdentityToken: UaUserIdentityToken.FromUserCredentials( {
            Session: session2,
            UserCredentials: new UserCredentials( { Policy: UserTokenType.Anonymous } )
        } )
    } ) ) {
        CloseSessionHelper.Execute( { Session: session2, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );
        CloseSessionHelper.Execute( { Session: Test.Session, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );
        addError( " Activation of session # 2 failed. Abort test." );
        return ( false );
    }

    // Transfer subscription
    if ( !TransferSubscriptionsHelper.Execute( { SubscriptionIds: subscriptionErr009a, OperationResults: [new ExpectedAndAcceptedResults( StatusCode.BadUserAccessDenied )], SourceSession: Test.Session, DestinationSession: session2, SendInitialValues: true } ) ) {
        CloseSessionHelper.Execute( { Session: session2, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );
        CloseSessionHelper.Execute( { Session: Test.Session, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );
        return ( false );
    }

    // cleanup
    CloseSessionHelper.Execute( { Session: session2, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );
    CloseSessionHelper.Execute( { Session: Test.Session, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );
    CloseSecureChannelHelper.Execute( { Channel: channel2 } );

    return ( result );
}

Test.Execute( { Procedure: subscriptionTransferErr009 } );