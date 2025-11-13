/*    Test prepared by Nathan Pocock; compliance@opcfoundation.org
      Description: Specify a valid SubscriptionId (subscription created with default parameters), TriggeringItemId
            (MonitoringMode is disabled) and one valid LinksToAdd (mode is sampling).
            Write a value to the triggeringItem. call Publish().
            Write another value to the all items and then call Publish().
      Expected Results: All service and operation level results are Good. ALL Publish calls yield a Keep alive. */

function setTriggering594016() {
    const TRIGGERINGITEM_SETTING = "/Server Test/NodeIds/Static/All Profiles/Scalar/Int32";
    const TRIGGEREDITEM1_SETTING = "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt32";
    // create the monitoredItems
    var triggeringItem = MonitoredItem.fromSettingsExt( { Settings: [ TRIGGERINGITEM_SETTING ], ClientHandle: 0, AttributeId: Attribute.Value, IndexRange: "", MonitorMode: MonitoringMode.Disabled, DiscardOldest: true, Filter: undefined, Queue: undefined, Interval: SAMPLING_RATE_FASTEST, TimestampsToReturn: TimestampsToReturn.Both, Writable: true, SkipCreateSession: true } )[0];
    var addLinkedItem  = MonitoredItem.fromSettingsExt( { Settings: [ TRIGGEREDITEM1_SETTING ], ClientHandle: 1, AttributeId: Attribute.Value, IndexRange: "", MonitorMode: MonitoringMode.Sampling, DiscardOldest: true, Filter: undefined, Queue: undefined, Interval: SAMPLING_RATE_FASTEST, TimestampsToReturn: TimestampsToReturn.Both, Writable: true, SkipCreateSession: true } )[0];
    if( triggeringItem == null || addLinkedItem == null ) {
        _dataTypeUnavailable.store( [ "Int32", "UInt32" ] );
        addSkipped( "Static Scalar (Int32, UInt32)" );
        return( false );
    }
    if( !MonitorTriggeringSubscription.SubscriptionCreated ) {
        addError( "Subscription for conformance unit Monitor Value Change was not created." );
        return( false );
    }
    // add the monitored items to the subscription
    if( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: [ triggeringItem, addLinkedItem ], TimestampsToReturn: TimestampsToReturn.Both, SubscriptionId: MonitorTriggeringSubscription } ) ) {
        // set-up the triggering service call
        if( SetTriggeringHelper.Execute( { SubscriptionId: MonitorTriggeringSubscription, TriggeringItemId: triggeringItem, LinksToAdd: addLinkedItem } ) ) {
            // read the triggeringItem value, and then we'll increment it.
            if( ReadHelper.Execute( { NodesToRead: [triggeringItem, addLinkedItem] } ) ) {
                // write to the triggeringItem
                UaVariant.Increment( { Item: triggeringItem } );
                if( WriteHelper.Execute( { NodesToWrite: triggeringItem } ) ) {
                    // wait one publishing cycle before calling publish
                    addLog( "Waiting '" + MonitorTriggeringSubscription.RevisedPublishingInterval + " msecs' before calling Publish (first time)." );
                    PublishHelper.WaitInterval( { Items: triggeringItem, Subscription: MonitorTriggeringSubscription } );
                    // call Publish()() and see what we receive....
                    addLog( "Triggering is setup, a value has been written... now calling Publish." );
                    if( PublishHelper.Execute() ) {
                        addLog( "Publish called, checking if any data was received. Data Received? " + ( PublishHelper.CurrentlyContainsData() == true ? "Yes - as" : "No - not" ) + " expected!" );
                        Assert.False( PublishHelper.CurrentlyContainsData(), "Expected 0 dataChange notifications." );
                    }// PublishHelper.Execute()

                    // now to write to ALL items and call Publish(), still expecting 0 dataChange notifications 
                    UaVariant.Increment( { Item: triggeringItem } );
                    UaVariant.Increment( { Item: addLinkedItem } );
                    if( WriteHelper.Execute( { NodesToWrite: [triggeringItem, addLinkedItem] } ) ) {
                        addLog( "Waiting '" + MonitorTriggeringSubscription.RevisedPublishingInterval + " msecs' before calling Publish (2nd time)." );
                        PublishHelper.WaitInterval( { Items: triggeringItem, Subscription: MonitorTriggeringSubscription } );
                        if( PublishHelper.Execute() ) {
                            addLog( "Publish called, checking if any data was received. Data Received? " + ( PublishHelper.CurrentlyContainsData() == true ? "Yes - as" : "No - not" ) + " expected!" );
                            Assert.False( PublishHelper.CurrentlyContainsData(), "Expected 0 dataChange notifications." );
                        }// PublishHelper.Execute()
                    }
                }// write.Execute()
            }//ReadHelper.Execute()
        }// setTriggering.Execute()
    }
    // clean-up
    DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: [triggeringItem, addLinkedItem], SubscriptionId: MonitorTriggeringSubscription } );
    PublishHelper.Clear();
    return( true );
}

Test.Execute( { Procedure: setTriggering594016 } );