/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description: Create a subscription with parameters that will cause the subscription to have a short lifespan, i.e. requestedLifetimeCount=3; requestedPublishingInterval=500; requestedMaxKeepAliveCount=3.
    Expectation: ModifySubscription will reset the values set in SetSubscriptionDurable
*/

function subscriptionDurable012() {
    var result = true;
    // we need a subscription to continue
    var subscription012 = new Subscription( 500, true, 3, 3 );
    if ( !CreateSubscriptionHelper.Execute( { Subscription: subscription012 } ) ) return ( false );

    // Step 2: call the method
    var subscriptionId = UaVariant.New( { Type: BuiltInType.UInt32, Value: subscription012.SubscriptionId } );
    var lifeTimeInHours = UaVariant.New( { Type: BuiltInType.UInt32, Value: 1 } );
    if ( CallHelper.Execute( { MethodsToCall: [{ MethodId: setSubscriptionDurableNodeId, ObjectId: serverObjectNodeId, InputArguments: [subscriptionId, lifeTimeInHours] }] } ) ) {
        // now our subscription has become a durable subscription with a long lifetime
        // Step 3: Now lets check if diagnostics are supported to get the revised values 
        var enabledFlag = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerDiagnostics_EnabledFlag ) );
        ReadHelper.Execute( { NodesToRead: enabledFlag } );
        if ( enabledFlag[0].Value.Value == true ) {
            // diagnostics are supported so lets get the revised values
            var subDiagnostics = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerDiagnostics_SubscriptionDiagnosticsArray ) );
            BrowseHelper.Execute( { NodesToBrowse: subDiagnostics } );
            var subscriptionIdProperties = [];
            for ( var i = 0; i < BrowseHelper.Response.Results[0].References.length; i++ ) {
                if ( BrowseHelper.Response.Results[0].References[i].NodeId.NodeId.NamespaceIndex != 0 ) {
                    subscriptionIdProperties.push( MonitoredItem.fromNodeIds( BrowseHelper.Response.Results[0].References[i].NodeId.NodeId )[0] );
                }
            }
            if ( ReadHelper.Execute( { NodesToRead: subscriptionIdProperties } ) ) {
                for ( i = 0; i < subscriptionIdProperties.length; i++ ) {
                    if ( subscriptionIdProperties[i].Value.StatusCode.isGood() ) {
                        var diagsObject = subscriptionIdProperties[i].Value.Value.toExtensionObject().toSubscriptionDiagnosticsDataType();
                        if ( diagsObject.SubscriptionId == subscription012.SubscriptionId ) break;
                    }
                }
                if ( diagsObject.MaxLifetimeCount == subscription012.RevisedLifetimeCount ) addError( "MaxLifetimeCount didn't change after calling SetSubscriptionDurable." ); result = false;
            }
        }
        else {
            addSkipped( "Diagnostics are disabled. Verification of Step 3 is skipped." );
        }
        // Step 4: Now lets check if the server honors the new lifetimeInHours or if the subscription times out after the initially used values
        UaDateTime.CountDown( { Seconds: subscription012.RevisedLifetimeCount + 5 } );
        PublishHelper.Execute();
        if ( !PublishHelper.CurrentlyContainsData() && ( !isDefined( PublishHelper.CurrentStatusChanges ) || PublishHelper.CurrentStatusChanges == 0 ) ) {
            // Step 5: Now lets reset the subscription to the originally used parameters for the subscription with a ModifySubscription service call
            ModifySubscriptionHelper.Execute( { SubscriptionId: subscription012, RequestedLifetimeCount: 3 } );
            // Step 6: Now lets see if the server applied the parameters used in the ModifySubscription as required by the spec
            UaDateTime.CountDown( { Seconds: subscription012.RevisedLifetimeCount + 5 } );
            PublishHelper.Execute( { ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadNoSubscription ] ), SuppressErrors: true } );
            // as we set the lifetime of the subscription to be short again and waited for the subscription to expire, the subscription should be gone.
            if ( PublishHelper.Response.ResponseHeader.ServiceResult.isGood() ) {
                if ( Assert.Equal( 1, PublishHelper.CurrentStatusChanges.length, "Number of StatusChangeNotifications was incorrect (StatusChange is not the same as a DataChange)." ) ) {
                    Assert.StatusCodeIs( StatusCode.BadTimeout, PublishHelper.CurrentStatusChanges[0].Status, "Expected the Subscription to be expired after calling ModifySubscription with RequestedLifetimeCount: 3 and waiting RevisedLifetimeCount seconds. But the received StatusChangeNotification was not BadTimeout" );
                }
            }
        }
        else {
            addError( "Expected to receive a KeepAlive after calling SetSubscriptionDurable with LifetimeInHours: 1 and waiting RevisedLifetimeCount of CreateSubscription seconds." );
            result = false;
        }
    }

    if ( PublishHelper.ReceivedStatusChanges == 0 ) {
        // cleanup
        DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription012, ServiceResult: new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid, StatusCode.Good ) } );
    }

    return ( result );
}

Test.Execute( { Procedure: subscriptionDurable012 } );