/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: CreateMonitoredItems, deadband requested when not supported. */

function CreateMonitoredItemsErr005() { 
    // create our invalid NodeId 
    var item = MonitoredItem.fromSettings(Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.NumericSettings)[0];
    if (item === undefined || item === null) {
        addSkipped("No Static Scalar (numeric) node is defined. Skipping test case.");
        return (false);
    }
    if (!MonitorBasicSubscription.SubscriptionCreated) addError("Subscription for Monitor Basic was not created.");
    else {
        item.Filter = Event.GetDataChangeFilter(DeadbandType.Absolute, 10, DataChangeTrigger.StatusValue);

        CreateMonitoredItemsHelper.Execute({
            ItemsToCreate: item,
            SubscriptionId: MonitorBasicSubscription,
            OperationResults: new ExpectedAndAcceptedResults([StatusCode.Good, StatusCode.BadMonitoredItemFilterUnsupported])
        });
        if (CreateMonitoredItemsHelper.Response.Results[0].StatusCode.isGood()) DeleteMonitoredItemsHelper.Execute({ ItemsToDelete: item, SubscriptionId: MonitorBasicSubscription });
    }
    return( true );
}//func

Test.Execute( { Procedure: CreateMonitoredItemsErr005 } );