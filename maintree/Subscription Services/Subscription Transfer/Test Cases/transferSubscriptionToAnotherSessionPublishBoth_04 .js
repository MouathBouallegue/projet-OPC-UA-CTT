/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description:    Within an existing session, create 2 subscriptions with each monitoring an item (reporting mode).
                    Call Publish() twice (calls #1 and #2).
                    Create a 2nd session and transfer the 2nd subscription to the new session (SendInitialValues=FALSE).
                    Call Publish() on the first session (#3).
                    Call Publish() on the second session (#4).
                    Write a new value to the item in each subscription.
                    Call Publish() twice for each session.
    Expectation:    All service results and operation-level results are Good.
                    Publish #1 and #2 receives the initial data, per subscription.
                    Publish #3 service result Good_SubscriptionTransferred and a StatusChangeNotification is received.
                    Publish #4 receives a keep-alive.
                    The 2 publish calls for Session #1 will return a data change and a keep-alive, respectively.
                    The 2 publish calls for Session #2 will return a data change and a keep-alive, respectively.
*/

function subscriptionTransfer012() {
    
    // check if at least 2 writable items are defined
    if( !isDefined( WritableItems ) || WritableItems.length < 2 ) {
        addSkipped( "Not enough writable scalar nodes defined - at least 2 needed. Check settings: /Server Test/NodeIds/Static/All Profiles/Scalar." );
        return( false );
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
    var subscription012a = new Subscription();
    if ( !CreateSubscriptionHelper.Execute( { Subscription: subscription012a } ) ) {
        CloseSessionHelper.Execute( { Session: Test.Session, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );
        addError( " Creation of the subscription failed. Abort test." );
        return ( false );
    }

    // and a second one
    var subscription012b = new Subscription();
    if ( !CreateSubscriptionHelper.Execute( { Subscription: subscription012b } ) ) {
        CloseSessionHelper.Execute( { Session: Test.Session, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );
        addError( " Creation of the subscription failed. Abort test." );
        return ( false );
    }

    // add a MonitoredItem to subscription #1
    if ( !CreateMonitoredItemsHelper.Execute( { ItemsToCreate: WritableItems[0], TimestampsToReturn: TimestampsToReturn.Neither, SubscriptionId: subscription012a } ) ) {
        CloseSessionHelper.Execute( { Session: Test.Session, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );
        addError( "Creation of the MonitoredItems failed. Abort test." );
        return ( false );
    }
    // add a MonitoredItem to subscription #2
    if ( !CreateMonitoredItemsHelper.Execute( { ItemsToCreate: WritableItems[1], TimestampsToReturn: TimestampsToReturn.Neither, SubscriptionId: subscription012b } ) ) {
        CloseSessionHelper.Execute( { Session: Test.Session, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );
        addError( "Creation of the MonitoredItems failed. Abort test." );
        return ( false );
    }

    // First publish. Expecting initial Data.
    PublishHelper.WaitInterval( { Items: WritableItems[0], Subscription: subscription012a } );
    PublishHelper.Execute();
    if ( !PublishHelper.CurrentlyContainsData() ) {
        addError( "Publish #1: Expected to receive the initial Data in the first Publish, but no data has been received." );
        result = false;
    }
    else {
        PublishHelper.SetItemValuesFromDataChange( WritableItems );
    }
    // Second publish. Expecting initial Data.
    PublishHelper.Execute();
    if ( !PublishHelper.CurrentlyContainsData() ) {
        addError( "Publish #2: Expected to receive the initial Data in the first Publish, but no data has been received." );
        result = false;
    }
    else {
        PublishHelper.SetItemValuesFromDataChange( WritableItems );
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
    if ( !TransferSubscriptionsHelper.Execute( { SubscriptionIds: subscription012b, SourceSession: Test.Session, DestinationSession: session2, SendInitialValues: false } ) ) {
        SessionCreator.Disconnect( channel2 );
        CloseSessionHelper.Execute( { Session: Test.Session, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );
        return ( false );
    }

    // Call Publish in session #1
    PublishHelper.Clear();
    PublishHelper.WaitInterval( { Items: WritableItems[0], Subscription: subscription012a } );
    PublishHelper.Execute();
    if ( !isDefined( PublishHelper.CurrentStatusChanges ) || PublishHelper.CurrentStatusChanges == 0 ) {
        addError( "Publish #3: Expected to receive a StatusChange notification in Publish #3." );
        result = false;
    }

    // Call Publish in Session2
    var publishHelperSession2 = new PublishService( { Session: session2 } );
    publishHelperSession2.Execute();
    publishHelperSession2.WaitInterval( { Items: WritableItems[0], Subscription: subscription012b } );
    publishHelperSession2.Execute();
    if ( publishHelperSession2.CurrentlyContainsData() ) {
        addError( "Publish #4: Expected to receive a KeepAlive." );
        result = false;
    }

    // Write the values
    UaVariant.Increment( { Item: WritableItems[0] } );
    UaVariant.Increment( { Item: WritableItems[1] } );
    WriteHelper.Execute( { NodesToWrite: WritableItems, ReadVerification: false } );

    // Call publish twice on session #1
    PublishHelper.Clear();
    PublishHelper.WaitInterval( { Items: WritableItems[0], Subscription: subscription012a } );
    PublishHelper.Execute();
    if ( !PublishHelper.CurrentlyContainsData() ) {
        addError( "Publish #5: Expected to receive the Data previously written, but no data has been received." );
        result = false;
    }
    PublishHelper.WaitInterval( { Items: WritableItems[0], Subscription: subscription012a } );
    PublishHelper.Execute();
    if ( PublishHelper.CurrentlyContainsData() ) {
        addError( "Publish #6: Expected to receive a KeepAlive." );
        result = false;
    }

    // Call publish twice on session #2
    publishHelperSession2.Clear();
    publishHelperSession2.WaitInterval( { Items: WritableItems[1], Subscription: subscription012b } );
    publishHelperSession2.Execute();
    if ( !publishHelperSession2.CurrentlyContainsData() ) {
        addError( "Publish #7: Expected to receive the Data previously written, but no data has been received." );
        result = false;
    }
    publishHelperSession2.WaitInterval( { Items: WritableItems[1], Subscription: subscription012b } );
    publishHelperSession2.Execute();
    if ( publishHelperSession2.CurrentlyContainsData() ) {
        addError( "Publish #8: Expected to receive a KeepAlive." );
        result = false;
    }

    // cleanup
    SessionCreator.Disconnect( channel2 );
    CloseSessionHelper.Execute( { Session: Test.Session, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );

    return ( result );
}

Test.Execute( { Procedure: subscriptionTransfer012 } );