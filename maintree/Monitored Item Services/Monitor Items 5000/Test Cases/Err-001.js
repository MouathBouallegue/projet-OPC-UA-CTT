/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description:
        Request more than 5000 items in a subscription.
        Try to add 6000 items into a single CreateMonitoredItems call. We expect 5000 having a Good OperationResult and 1000 having BadToManyMonitoredItems.
*/

function createMonitoredItems5000() {
    // create too many items
    var tooManyItems = MonitoredItem.Clone(originalItems5000);
    var expectedOperationResults = [];
    for (var i = 0; i < tooManyItems.length; i++)  expectedOperationResults.push(new ExpectedAndAcceptedResults(StatusCode.Good));
    for (var i = 0; i < 1000; i++) {
        tooManyItems.push(MonitoredItem.Clone(originalItems5000[i]));
        expectedOperationResults.push( new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadTooManyMonitoredItems, StatusCode.BadMonitoredItemIdInvalid] ) );
    }
    var expectedServiceResults = new ExpectedAndAcceptedResults(StatusCode.Good);
    

    if( !CreateMonitoredItemsHelper.Execute( {
            ItemsToCreate: tooManyItems, 
            TimestampsToReturn: TimestampsToReturn.Server,
            SubscriptionId: defaultSubscription,
            ServiceResult: expectedServiceResults,
            OperationResults: expectedOperationResults,
            SuppressMessaging: false
            } ) ) return( false );

    // clean-up
    DeleteMonitoredItemsHelper.Execute( {
        ItemsToDelete: tooManyItems,
        SubscriptionId: defaultSubscription,
        MaxItemsPerCall: gServerCapabilities.OperationLimits.MaxMonitoredItemsPerCall,
        SuppressMessaging: true,
        OperationResults: expectedOperationResults
    } );

    return( true );
}// function createMonitoredItems5000()

Test.Execute( { Procedure: createMonitoredItems5000 } );