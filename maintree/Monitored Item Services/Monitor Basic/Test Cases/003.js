/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Modifies a single monitoredItem setting: TIMESTAMPS = TimestampsToReturn.Source;
        subscription is created and deleted in initialize and cleanup scripts */

Test.Execute( { Procedure: function test() {
    if( !MonitorBasicSubscription.SubscriptionCreated ) addError( "Subscription for MonitoredItemsServiceSet was not created." );
    else {
        var item1 = MonitoredItem.GetRequiredNodes({ Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings, Number: 1, Writable: true, SkipCreateSession: true })[0];
        if( item1 === undefined || item1 === null ) {
            addSkipped( "Static Scalar (numeric)" );
            return( false );
        }
        item1.QueueSize = 1;
        item1.DiscardOldest = true;
        item1.SamplingInterval = 0;
        if( !ReadHelper.Execute( { NodesToRead: item1 } ) ) return( false );
        UaVariant.SetValueMin( { Item: item1 } );
        if( !WriteHelper.Execute( { NodesToWrite: item1, ReadVerification: false } ) ) return( false );
        if( CreateMonitoredItemsHelper.Execute( { SubscriptionId: MonitorBasicSubscription, ItemsToCreate: item1 } ) ) {
            PublishHelper.WaitInterval( { Items: item1, Subscription: MonitorBasicSubscription } );
            PublishHelper.Execute( { FirstPublish: true } );
            if( Assert.Equal( true, PublishHelper.CurrentlyContainsData(), "Expected the initial DataChange notifications but did not receive any." ) ) {
                PublishHelper.ValidateTimestampsInAllDataChanges( item1.TimestampsToReturn );
                item1.Value = PublishHelper.CurrentDataChanges[0].MonitoredItems[0].Value;
            }

            // modify a single monitored item
            item1.TimestampsToReturn = TimestampsToReturn.Source;
            ModifyMonitoredItemsHelper.Execute( { SubscriptionId: MonitorBasicSubscription, ItemsToModify: item1 } );

            // write a value to the nodes
            print( "Prior value of item1: " + item1.Value.Value.toString() );
            UaVariant.Increment( { Item: item1 } );
            WriteHelper.Execute( { NodesToWrite: item1, ReadVerification: false } );

            addLog( "Waiting " + MonitorBasicSubscription.RevisedPublishingInterval + "ms" );
            PublishHelper.WaitInterval( { Items: item1, Subscription: MonitorBasicSubscription } );
            PublishHelper.Execute();
            if( Assert.Equal( true, PublishHelper.CurrentlyContainsData(), "Expected a DataChange but did not receive one. The node was updated prior to being updated with ModifyMonitoredItems." ) ) {
                PublishHelper.ValidateTimestampsInDataChange( PublishHelper.CurrentDataChanges[0], ModifyMonitoredItemsHelper.Request.TimestampsToReturn );
            }

            // delete the items we added in this test
            var monitoredItemsIdsToDelete = new UaUInt32s();
            for( i = 0; i< CreateMonitoredItemsHelper.Response.Results.length; i++ ) monitoredItemsIdsToDelete[i] = CreateMonitoredItemsHelper.Response.Results[i].MonitoredItemId;
            DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: monitoredItemsIdsToDelete, SubscriptionId: MonitorBasicSubscription } );
        }
    }
    return( true );
} } );