/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Validate the server keeps operating when calling ResendData while specifying an empty Subscription.
*/

function test() {
    var TC_Variables = new Object();

    TC_Variables.TestResult = false;
    TC_Variables.TestSubscription = new Subscription();

    CreateSubscriptionHelper.Execute( { Subscription: TC_Variables.TestSubscription } );

    if( Assert.True( TC_Variables.TestSubscription.SubscriptionCreated, "Unable to create a subscription. Abort test." ) ) {
        PublishHelper.RegisterSubscription( TC_Variables.TestSubscription );
        PublishHelper.Execute( { FirstPublish: true, GetAllNotifications: true, AllNotificationsInCurrentArray: true } );

        if( Assert.Equal( 0, PublishHelper.CurrentDataChanges.length, "Expected to receive a KeepAlive notification. Abort test." ) ) {

            if( CallHelper.Execute( {
                MethodsToCall: [{
                    MethodId: CU_Variables.ResendData.InstanceNode.NodeId,
                    ObjectId: new UaNodeId( Identifier.Server ),
                    InputArguments: UaVariant.New( { Value: TC_Variables.TestSubscription.SubscriptionId, Type: BuiltInType.UInt32 } )
                }]
            } ) ) {
                if( CallHelper.Response.Results[0].StatusCode.StatusCode !== StatusCode.BadNotImplemented ) {
                    if( Assert.True( CallHelper.Response.Results[0].StatusCode.isGood(), "Calling ResendData failed with StatusCode: " + CallHelper.Response.Results[0].StatusCode + ". Abort test." ) ) {
                        PublishHelper.Execute( { GetAllNotifications: true, AllNotificationsInCurrentArray: true } );

                        if( Assert.Equal( 0, PublishHelper.CurrentDataChanges.length, "Expected to receive a KeepAlive notification after calling ResendData method. Abort test." ) ) {
                            TC_Variables.TestResult = true;
                        }
                    }
                }
                else {
                    addNotSupported( "The ResendData method is available in the address space of the server returned BadNotImplemented when calling it.\nPlease verify that this CU is optional in the desired target profile. Aborting Conformance Unit." );
                    stopCurrentUnit();
                }
            }
        }
        DeleteSubscriptionsHelper.Execute( { SubscriptionIds: TC_Variables.TestSubscription } );
    }

    PublishHelper.Clear();

    return ( TC_Variables.TestResult );
}

Test.Execute( { Procedure: test } );
