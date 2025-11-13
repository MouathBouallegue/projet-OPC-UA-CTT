/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description:    Within an existing session, create 2 subscriptions with each monitoring an item (reporting mode).
                    Call Publish() twice (calls #1 and #2).
                    Create a 2nd session and transfer 1 valid SubscriptionId, and one invalid SubscriptionId to the new session (SendInitialValues=TRUE).
                    Call Publish() twice on the old session (calls #3, #4).
                    Call Publish() twice on the new session (calls #5, #6).
    Expectation:    All service results and operation-level results are Good, except where stated otherwise.
                    Publish #1 and #2 yield the initial data values.
                    TransferSubscription service result Good; operation-level results are Good and Bad_SubscriptionIdInvalid, respectively.
                    Publish #3 service result Good_SubscriptionTransferred and a StatusChangeNotification is received.
                    Publish #4 receives a KeepAlive.
                    Publish #5 receives a dataChange (for the subscription that was transferred).
                    Publish #6 receives a KeepAlive.
*/

function subscriptionTransfer013() {
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
    var subscription013a = new Subscription();
    if ( !CreateSubscriptionHelper.Execute( { Subscription: subscription013a } ) ) {
        CloseSessionHelper.Execute( { Session: Test.Session, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );
        addError( " Creation of the subscription failed. Abort test." );
        return ( false );
    }

    // and a second one
    var subscription013b = new Subscription();
    if ( !CreateSubscriptionHelper.Execute( { Subscription: subscription013b } ) ) {
        CloseSessionHelper.Execute( { Session: Test.Session, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );
        addError( " Creation of the subscription failed. Abort test." );
        return ( false );
    }

    // and create a third one to get a subscriptionId. Close it immediately.
    var subscription013c = new Subscription();
    if ( !CreateSubscriptionHelper.Execute( { Subscription: subscription013c } ) ) {
        CloseSessionHelper.Execute( { Session: Test.Session, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );
        addError( " Creation of the subscription failed. Abort test." );
        return ( false );
    }
    else {
        DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription013c } );
    }

    // add a MonitoredItem to subscription #1
    if ( !CreateMonitoredItemsHelper.Execute( { ItemsToCreate: items[0], TimestampsToReturn: TimestampsToReturn.Neither, SubscriptionId: subscription013a } ) ) {
        CloseSessionHelper.Execute( { Session: Test.Session, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );
        addError( "Creation of the MonitoredItems failed. Abort test." );
        return ( false );
    }

    // add a MonitoredItem to subscription #2
    if ( !CreateMonitoredItemsHelper.Execute( { ItemsToCreate: items[1], TimestampsToReturn: TimestampsToReturn.Neither, SubscriptionId: subscription013b } ) ) {
        CloseSessionHelper.Execute( { Session: Test.Session, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );
        addError( "Creation of the MonitoredItems failed. Abort test." );
        return ( false );
    }

    // First publish. Expecting initial Data.
    PublishHelper.WaitInterval( { Items: items[0], Subscription: subscription013a } );
    PublishHelper.Execute();
    if ( !PublishHelper.CurrentlyContainsData() ) {
        addError( "Publish #1: Expected to receive the initial Data in the first Publish, but no data has been received." );
        result = false;
    }

    // Second publish. Expecting initial Data.
    PublishHelper.Execute();
    if ( !PublishHelper.CurrentlyContainsData() ) {
        addError( "Publish #2: Expected to receive the initial Data in the first Publish, but no data has been received." );
        result = false;
    }

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
    if ( !TransferSubscriptionsHelper.Execute( { SubscriptionIds: [subscription013b, subscription013c], OperationResults: [new ExpectedAndAcceptedResults( StatusCode.Good ), new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid )], SourceSession: Test.Session, DestinationSession: session2, SendInitialValues: true } ) ) {
        SessionCreator.Disconnect( channel2 );
        CloseSessionHelper.Execute( { Session: Test.Session, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );
        return ( false );
    }

    // Call Publish twice in session #1
    PublishHelper.Clear();
    PublishHelper.WaitInterval( { Items: items[0], Subscription: subscription013a } );
    PublishHelper.Execute();
    if ( !isDefined( PublishHelper.CurrentStatusChanges ) || PublishHelper.CurrentStatusChanges == 0 ) {
        addError( "Publish #3: Expected to receive a StatusChange notification." );
        result = false;
    }
    PublishHelper.WaitInterval( { Items: items[0], Subscription: subscription013a } );
    PublishHelper.Execute();
    if ( PublishHelper.CurrentlyContainsData() ) {
        addError( "Publish #4: Expected to receive a KeepAlive." );
        result = false;
    }


    // Call Publish twice in Session2
    var publishHelperSession2 = new PublishService( { Session: session2 } );
    publishHelperSession2.Execute();
    if ( !publishHelperSession2.CurrentlyContainsData() ) {
        addError( "Publish #5: Expected to receive the initial Data, but no data has been received." );
        result = false;
    }
    publishHelperSession2.WaitInterval( { Items: items[1], Subscription: subscription013b } );
    publishHelperSession2.Execute();
    if ( publishHelperSession2.CurrentlyContainsData() ) {
        addError( "Publish #6: Expected to receive a KeepAlive." );
        result = false;
    }

    // cleanup
    SessionCreator.Disconnect( channel2 );
    CloseSessionHelper.Execute( { Session: Test.Session, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );

    return ( result );
}

Test.Execute( { Procedure: subscriptionTransfer013 } );