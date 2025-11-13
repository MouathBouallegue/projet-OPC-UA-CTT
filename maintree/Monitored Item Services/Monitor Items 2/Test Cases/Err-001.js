/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Request more than 2 items in a subscription, e.g. 6. */

function tooManyItems2() {
    var items2 = []
    var expectedResults = [];
    for( var i=0; i<6; i++ ) {
        if ( !isDefined( items[i] ) ) items2.push( items2[i-1] );
        else items2.push( items[i] );
        var er = new ExpectedAndAcceptedResults( StatusCode.Good );
        if( i >= 2 ) er.addExpectedResult( StatusCode.BadTooManyMonitoredItems );
        expectedResults.push( er );
    }
    CreateMonitoredItemsHelper.Execute( { ItemsToCreate: items2, TimestampsToReturn: TimestampsToReturn.Server, SubscriptionId: defaultSubscription, OperationResults: expectedResults } );
    // Since we are cloning the items, MonitoredItemsId will be same which returns error when we use Items2 in DeleteMonitoredItems method. 
    var items3 = [];
    if( !isDefined( CreateMonitoredItemsHelper.Response.length ) ) {
        items3 = CreateMonitoredItemsHelper.Response.Results;
    }
    else { // if CreateMonitoredItems calls were split up, reassemble Results
        for( var i=0; i < CreateMonitoredItemsHelper.Response.length; i++ ) {
            for( var j=0; j < CreateMonitoredItemsHelper.Response[i].Results.length; j++ ) {
                items3.push( CreateMonitoredItemsHelper.Response[i].Results[j] );
            }
        }
    }
    for( var i=0; i<6; i++ ) {
        var er = new ExpectedAndAcceptedResults( StatusCode.Good );
        if( i >= 2 ) er.addExpectedResult( StatusCode.BadMonitoredItemIdInvalid );
    }
    DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: items3, SubscriptionId: defaultSubscription } );
    return( true );
}


Test.Execute( { Procedure: tooManyItems2 } );