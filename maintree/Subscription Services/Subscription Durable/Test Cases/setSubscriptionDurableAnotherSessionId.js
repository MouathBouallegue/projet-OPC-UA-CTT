/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description: Create a subscription and add one or more monitored items to it. Then invoke SetSubscriptionDurable on the subscription.
    Expectation: Service result good; operation result: badInvalidState
*/

function subscriptionDurableErr006() {
    var result = true;
    // we need a subscription to continue
    var subscriptionErr006 = new Subscription();
    if ( !CreateSubscriptionHelper.Execute( { Subscription: subscriptionErr006 } ) ) return ( false );
    var session = SessionCreator.Connect( {
        OpenSecureChannel: {
            RequestedSecurityPolicyUri: epgeneralChNone.SecurityPolicyUri, MessageSecurityMode: epgeneralChNone.SecurityMode
        },
        SkipActivateSession: true
    } );

    if( session.result ) {
        ActivateSessionHelper.Execute( {
            Session: session.session,
            UserIdentityToken: UaUserIdentityToken.FromUserCredentials( {
                Session: session.session,
                UserCredentials: UserCredentials.createFromSettings( PresetCredentials.AccessGranted1, UserTokenType.UserName )
            } )
        } );
        InstanciateHelpers( { Session: session.session } );
        // call the method
        var subscriptionId = UaVariant.New( { Type: BuiltInType.UInt32, Value: subscriptionErr006.SubscriptionId } );
        var lifeTimeInHours = UaVariant.New( { Type: BuiltInType.UInt32, Value: 5 } );
        CallHelper.Execute( { MethodsToCall: [{ MethodId: setSubscriptionDurableNodeId, ObjectId: serverObjectNodeId, InputArguments: [subscriptionId, lifeTimeInHours] }], OperationResults: [new ExpectedAndAcceptedResults( StatusCode.BadUserAccessDenied )] } );
        SessionCreator.Disconnect( session );
        InstanciateHelpers( Test.Session );
    }
    // cleanup
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscriptionErr006 } );

    return ( result );
}

Test.Execute( { Procedure: subscriptionDurableErr006 } );