/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: CreateMonitoredItems: TimestampsToReturn = a value not in the enum. */

function CreateMonitoredItemsErr018() { 
    return( CreateMonitoredItemsHelper.Execute( { 
            ItemsToCreate: scalarItems,
            TimestampsToReturn: 0x99,
            SubscriptionId: MonitorBasicSubscription,
            ServiceResult: new ExpectedAndAcceptedResults( StatusCode.BadTimestampsToReturnInvalid )
            } ) );
}//func

Test.Execute( { Procedure: CreateMonitoredItemsErr018 } );