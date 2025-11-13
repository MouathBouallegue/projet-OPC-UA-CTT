/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Multiple items; Specify an invalid subscriptionId in CreateMonitoredItems */

function CreateMonitoredItemsErr002() { 
    var invalidSubscription = new Subscription();
    invalidSubscription.SubscriptionId = 0xffff;
    return( CreateMonitoredItemsHelper.Execute( { 
            ItemsToCreate: scalarItems,
            SubscriptionId: invalidSubscription,
            ServiceResult: new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid )
            } ) );
}//func

Test.Execute( { Procedure: CreateMonitoredItemsErr002 } );