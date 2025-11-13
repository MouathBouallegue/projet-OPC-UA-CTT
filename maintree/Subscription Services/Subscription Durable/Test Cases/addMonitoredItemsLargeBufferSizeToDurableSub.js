/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description: Add monitored items with large (i.e. 10,000) buffer size to a Durable subscription.
    Expectation: Data is returned for the Publish call. The number of values received might match the number of values written; if not, then the MoreNotifications flag is set and subsequent Publish calls are made to obtain the remaining data.
*/

function subscriptionDurable005() {
    var result = true;
    // Step 1:
    // we need a subscription to continue
    var subscription005 = new Subscription();
    if ( !CreateSubscriptionHelper.Execute( { Subscription: subscription005 } ) ) return ( false );

    // call the method
    var subscriptionId = UaVariant.New( { Type: BuiltInType.UInt32, Value: subscription005.SubscriptionId } );
    var lifeTimeInHours = UaVariant.New( { Type: BuiltInType.UInt32, Value: 1 } );
    if ( isDefined( subscriptionId ) && isDefined( lifeTimeInHours ) ) {
        if ( CallHelper.Execute( { MethodsToCall: [{ MethodId: setSubscriptionDurableNodeId, ObjectId: serverObjectNodeId, InputArguments: [subscriptionId, lifeTimeInHours] }] } ) ) {
            // ready to add MonitoredItems to the durable subscription
            var items = MonitoredItem.GetRequiredNodes( { Number: 1, Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings } );
            if ( isDefined( items ) && items.length > 0 ) {
                items[0].QueueSize = 10000;
                if ( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: items, TimestampsToReturn: TimestampsToReturn.Both, SubscriptionId: subscription005 } ) ) {
                    // call Publish to get the initial data and to verify that all is set up well
                    PublishHelper.WaitInterval( { Items: items, Subscription: subscription005 } );
                    PublishHelper.Execute();
                    if ( !PublishHelper.CurrentlyContainsData() ) {
                        addError( "Didn't receive the initial data." );
                        result = false;
                    }
                    else {
                        PublishHelper.SetItemValuesFromDataChange( items );
                        // Step 2:
                        var valuesWritten = 0;
                        var endTime = new UaDateTime.Now.Add( { Seconds: 30 } );
                        var actualTime = new UaDateTime.Now();
                        while ( actualTime < endTime ) {
                            UaVariant.Increment( { Item: items[0] } );
                            WriteHelper.Execute( { NodesToWrite: items, ReadVerification: false } );
                            UaDateTime.CountDown( { Msecs: items[0].RevisedSamplingInterval * 1.5, Message: "Waiting the RevisedSamplingInterval." } );
                            valuesWritten++;
                            actualTime = new UaDateTime.Now();
                        }
                        // Step 5:
                        PublishHelper.Execute();
                        if ( !PublishHelper.CurrentlyContainsData() ) {
                            addError( "Didn't receive any data after writing to the item." );
                            result = false;
                        }
                        else {
                            var maxPublishCount = 0;
                            var valuesReceived = PublishHelper.CurrentDataChanges[0].MonitoredItems.length;
                            while ( PublishHelper.Response.MoreNotifications && maxPublishCount < 100 ) {
                                PublishHelper.Execute();
                                valuesReceived = valuesReceived + PublishHelper.CurrentDataChanges[0].MonitoredItems.length;
                                maxPublishCount++;
                            }
                            if ( maxPublishCount == 100 ) addWarning( "Called Publish 100 times and MoreNotifications is still set to true. Aborting." );
                            else {
                                if ( valuesReceived < valuesWritten && valuesReceived < items[0].RevisedQueueSize ) addError( "Received less DataChanges (" + valuesReceived + ") than values written (" + valuesWritten + ") and less than the QueueSize of the MonitoredItem (" + items[0].RevisedQueueSize + ")." ); result = false;
                                if ( valuesReceived < valuesWritten && valuesReceived >= items[0].RevisedQueueSize ) addError( "Received less DataChanges (" + valuesReceived + ") than values written (" + valuesWritten + ") but more than the RevisedQueueSize of the MonitoredItem (" + items[0].RevisedQueueSize + ")." ); result = false;
                            }
                        }
                    }
                }
            }
            else {
                addSkipped( "Not enough scalar items defined." );
                result = false;
            }
        }
    }

    // cleanup
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription005 } );

    return ( result );
}

Test.Execute( { Procedure: subscriptionDurable005 } );