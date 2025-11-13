/*  Test prepared by Alexander Allmendinger; compliance@opcfoundation.org
    Description:  Use non-numeric nodes to create a trigger and linked items (Mode=Sampling). Write to the triggering item and check the linked items are returned as appropriate. */
function SetTriggering025() { 
    var AllItems = MonitoredItem.fromSettingsExt( { Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings, Writable: true, SkipCreateSession: true } );
    var NumericItems = MonitoredItem.fromSettingsExt( { Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.NumericSettings, Writable: true, SkipCreateSession: true } );
    var nonNumericItems = [];
    var found = false;
    for (var i = 0; i < AllItems.length; i++) {
        found = false;
        for (var j = 0; j < NumericItems.length; j++) {
            if (AllItems[i].NodeSetting === NumericItems[j].NodeSetting || AllItems[i].NodeSetting === "/Server Test/NodeIds/Static/All Profiles/Scalar/Bool") {
                found = true;
                break;
            }
        }
        if (found != true) nonNumericItems.push(AllItems[i]);
    }
    if (nonNumericItems.length < 2) {
        addSkipped("Not enough writable Scalar non Numerics are defined. Skipping test case.");
        return (false);
    }
    var triggeringItem = MonitoredItem.Clone(nonNumericItems[0] );
    var linkedItem = MonitoredItem.Clone(nonNumericItems[1] );
    addLog( "TriggeringItem=" + triggeringItem.NodeSetting + " | LinkedItem=" + linkedItem.NodeSetting);
    linkedItem.MonitoringMode = MonitoringMode.Sampling;
    // Read both items, to get their current values 
    ReadHelper.Execute( { NodesToRead: [ triggeringItem, linkedItem ] } );
    // add both items to a subscription and setup the triggering
    if (!CreateMonitoredItemsHelper.Execute({ ItemsToCreate: [triggeringItem, linkedItem], SubscriptionId: MonitorTriggeringSubscription })) return (false);
    // wait one publishing cycle before calling publish
    addLog("Waiting '" + MonitorTriggeringSubscription.RevisedPublishingInterval + " msecs' before calling Publish (first time).");
    PublishHelper.WaitInterval({ Items: triggeringItem, Subscription: MonitorTriggeringSubscription });
    PublishHelper.Execute({ FirstPublish: true });
    if (Assert.True(PublishHelper.CurrentlyContainsData(), "Expected First Publish to have data-changes for the triggeringItem.")) { 
        Assert.Equal(1, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected to receive 1 DataChangeNotifications (triggering item).");
        Assert.True(PublishHelper.HandleIsInCurrentDataChanges(triggeringItem.ClientHandle), "Did not find triggering item '" + triggeringItem.NodeSetting + "' in Publish response (mode=Reporting).");
    }
    if( SetTriggeringHelper.Execute( { TriggeringItemId: triggeringItem, LinksToAdd: linkedItem, SubscriptionId: MonitorTriggeringSubscription } ) ) { 
        // Publish #2 - write to linked item which is set to sampling
        UaVariant.Increment( { Item: linkedItem } );
        if (WriteHelper.Execute({ NodesToWrite: linkedItem, ReadVerification: false })) {
            // wait one publishing cycle before calling publish
            addLog("Waiting '" + MonitorTriggeringSubscription.RevisedPublishingInterval + "' msecs before calling Publish #2.");
            PublishHelper.WaitInterval({ Items: triggeringItem, Subscription: MonitorTriggeringSubscription });
            // call Publish()() and see what we receive....
            PublishHelper.Execute();
            if (Assert.False(PublishHelper.CurrentlyContainsData(), "Expected to do not receive a data change for any of the 2 items.")) {
                Assert.False(PublishHelper.HandleIsInCurrentDataChanges(linkedItem.ClientHandle), "Did find LINKED item '" + linkedItem.NodeSetting + "' in Publish response but we shouldn't have (mode=Sampling).");
            }
        }// write.Execute()

        // Publish #3 - write to trigger first
        UaVariant.Increment( { Item: triggeringItem } );
        if (WriteHelper.Execute({ NodesToWrite: triggeringItem, ReadVerification: false })) {
            // wait one publishing cycle before calling publish
            addLog("Waiting '" + MonitorTriggeringSubscription.RevisedPublishingInterval + "' msecs before calling Publish #2.");
            PublishHelper.WaitInterval({ Items: triggeringItem, Subscription: MonitorTriggeringSubscription });
            // call Publish()() and see what we receive....
            PublishHelper.Execute();
            if (Assert.True(PublishHelper.CurrentlyContainsData(), "Expected to receive a data change for the linked item (because we wrote to the triggering item).")) {
                Assert.Equal(2, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected to receive 2 DataChangeNotifications (linked and triggering item).");
                Assert.True(PublishHelper.HandleIsInCurrentDataChanges(triggeringItem.ClientHandle), "Did not find triggering item '" + triggeringItem.NodeSetting + "' in Publish response (mode=Reporting).");
                Assert.True(PublishHelper.HandleIsInCurrentDataChanges(linkedItem.ClientHandle), "Did not find linked item '" + linkedItem.NodeSetting + "' in Publish response (mode=Sampling).");
            }
        }// write.Execute()
        //==========================================
    }//if SetTriggering
    // clean-up
    DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: [triggeringItem, linkedItem], SubscriptionId: MonitorTriggeringSubscription } );
    return( true );
}//func

Test.Execute( { Procedure: SetTriggering025 } );