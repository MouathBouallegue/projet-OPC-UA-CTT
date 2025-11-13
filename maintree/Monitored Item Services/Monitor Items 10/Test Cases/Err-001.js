/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Request more than 10 items in a subscription, e.g. 15. */

function tooManyItems10() {
// create too many items
    var tooManyItems = [];
    for( var i=0; i<5; i++ ) tooManyItems.push( MonitoredItem.Clone( items[i] ) );
    tooManyItems = tooManyItems.concat( items );
    var expectedResults = [];
    for( var i=0; i<tooManyItems.length; i++) {
        if( i < items.length ) {
            expectedResults.push(new ExpectedAndAcceptedResults( [ StatusCode.Good ] ) );
        }
        else {
            expectedResults.push(new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadTooManyMonitoredItems, StatusCode.BadMonitoredItemIdInvalid ] ) );
        }
    }
    if( !CreateMonitoredItemsHelper.Execute( { ItemsToCreate: tooManyItems, TimestampsToReturn: TimestampsToReturn.Server, SubscriptionId: defaultSubscription, ServiceResult: expectedResults[0], OperationResults: expectedResults, SuppressMessaging: false } ) ) return( false );

    if( CreateMonitoredItemsHelper.Response.length < 1 ) {
        // did we get an error? if so, proceed to step 2
        if( CreateMonitoredItemsHelper.Response.ResponseHeader.ServiceResult.isGood() ) {
            // iterate thru all results, we expected Good for the first 10 items, and the rest can be good or Bad_TooManyMonitoredItems
            for( var i = 0; i < CreateMonitoredItemsHelper.Response.Results.length; i++ ) {
                var currResult = CreateMonitoredItemsHelper.Response.Results[i].StatusCode.StatusCode;
                if( i < 10 ) Assert.Equal( StatusCode.Good, currResult, "CreateMonitoredItems.Response.Results[" + i + "].StatusCode was expected to be Good, since it is within the first 10 items that are required to be supported by this Conformance unit." );
                else {
                    if( !( currResult === StatusCode.Good || currResult === StatusCode.BadTooManyMonitoredItems ) ) {
                        addError( "CreateMonitoredItems().Response.Results[" + i + "].StatusCode is " + currResult + ". Expected Good or Bad_TooManyMonitoredItems." );
                    }
                }
            }// for i
        }
    }
    else {
        var checkedMonitoredItems = 0;
        for( var j=0; j<CreateMonitoredItemsHelper.Response.length; j++ ) {
            // did we get an error? if so, proceed to step 2
            if( CreateMonitoredItemsHelper.Response[j].ResponseHeader.ServiceResult.isGood() ) {
                // iterate thru all results, we expected Good for the first 10 items, and the rest can be good or Bad_TooManyMonitoredItems
                for( var i = 0; i < CreateMonitoredItemsHelper.Response[j].Results.length; i++ ) {
                    var currResult = CreateMonitoredItemsHelper.Response[j].Results[i].StatusCode.StatusCode;
                    if( checkedMonitoredItems < 10 ) Assert.Equal( StatusCode.Good, currResult, "CreateMonitoredItems.Response[" + j + "].Results[" + i + "].StatusCode was expected to be Good, since it is within the first 10 items that are required to be supported by this Conformance unit." );
                    else {
                        if( !( currResult === StatusCode.Good || currResult === StatusCode.BadTooManyMonitoredItems ) ) {
                            addError( "CreateMonitoredItems().Response[" + i + ".Results[" + j + "].StatusCode is " + currResult + ". Expected Good or Bad_TooManyMonitoredItems." );
                        }
                    }
                    checkedMonitoredItems++;
                }// for i
            }
        }
    }
    // clean-up
    DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: tooManyItems, SubscriptionId: defaultSubscription, MaxItemsPerCall: gServerCapabilities.OperationLimits.MaxMonitoredItemsPerCall, SuppressMessaging: true, OperationResults: expectedResults } );
    return( true );
}// function tooManyItems10()

Test.Execute( { Procedure: tooManyItems10 } );