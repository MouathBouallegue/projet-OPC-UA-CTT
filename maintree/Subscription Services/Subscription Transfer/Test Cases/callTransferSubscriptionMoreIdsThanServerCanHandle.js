/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description:    Call TransferSubscriptions() while specifying more SubscriptionIds than the server can handle.
    Expectation:    ServiceResult is Bad_TooManyOperations.
*/

function subscriptionTransferErr006() {
    var result = true;

    // Create a session and activate it.
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

    // Create a second session and activate it.
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

    // Try to transfer 10,000 (not existing) subscriptions
    var subscriptions = new UaUInt32s();
    var opResults = [];
    for ( var i = 0; i < 10000; i++ ) {
        subscriptions[i] = i;
        opResults.push( new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid, [StatusCode.Good, StatusCode.BadUserAccessDenied] ) );
    }
    TransferSubscriptionsHelper.Execute( { SubscriptionIds: subscriptions, SourceSession: session2, DestinationSession: Test.Session, SendInitialValues: false, ServiceResult: new ExpectedAndAcceptedResults( StatusCode.BadTooManyOperations, StatusCode.Good ), OperationResults: opResults } );
    if ( TransferSubscriptionsHelper.Response.ResponseHeader.ServiceResult.isGood() ) addWarning( "Test was limited to 10000 subscriptions in the TransferSubscription service. It looks like the server is supporting a bigger number." );
    SessionCreator.Disconnect( channel2 );
    CloseSessionHelper.Execute( { Session: Test.Session, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );
    result = false;
    return ( result );
}

Test.Execute( { Procedure: subscriptionTransferErr006 } );